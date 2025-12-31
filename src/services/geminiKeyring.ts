// src/services/geminiKeyring.ts
import { GoogleGenAI } from "@google/genai";

export const GEMINI_MODEL =
  (import.meta.env.VITE_GEMINI_MODEL as string) || "gemini-2.5-flash-lite";

const GEMINI_API_KEY = (import.meta.env.VITE_GEMINI_API_KEY as string) || "";

export function assertGeminiConfigured() {
  if (!GEMINI_API_KEY || GEMINI_API_KEY.trim().length < 10) {
    throw new Error("Missing Gemini API key (VITE_GEMINI_API_KEY).");
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function getStatus(err: any): number | null {
  return err?.error?.code ?? err?.status ?? err?.response?.status ?? null;
}

function isRetryable(err: any): boolean {
  const status = getStatus(err);
  const msg = String(err?.message ?? err).toLowerCase();
  return (
    status === 429 ||
    status === 503 ||
    msg.includes("rate") ||
    msg.includes("quota") ||
    msg.includes("resource exhausted") ||
    msg.includes("temporarily unavailable") ||
    msg.includes("failed to fetch")
  );
}

// In-flight dedupe (only works when you pass a stable key)
const inflight = new Map<string, Promise<any>>();

// Overload signatures
export async function withGemini<T>(
  fn: (client: GoogleGenAI) => Promise<T>,
  opts?: { maxAttempts?: number }
): Promise<T>;
export async function withGemini<T>(
  key: string,
  fn: (client: GoogleGenAI) => Promise<T>,
  opts?: { maxAttempts?: number }
): Promise<T>;

// Implementation
export async function withGemini<T>(a: any, b?: any, c?: any): Promise<T> {
  assertGeminiConfigured();

  let key: string;
  let fn: ((client: GoogleGenAI) => Promise<T>) | undefined;
  let opts: { maxAttempts?: number } | undefined;

  if (typeof a === "function") {
    // withGemini(fn, opts)
    fn = a;
    opts = b;
    // No stable key provided => no dedupe (still works)
    key = `__nostable__:${Date.now()}:${Math.random()}`;
  } else {
    // withGemini(key, fn, opts)
    key = String(a ?? "");
    fn = b;
    opts = c;
  }

  if (typeof fn !== "function") {
    throw new TypeError("withGemini: fn is not a function. Use withGemini(key, fn) or withGemini(fn).");
  }

  // Dedup only when caller provides stable key
  const canDedup = !key.startsWith("__nostable__");
  if (canDedup) {
    const existing = inflight.get(key);
    if (existing) return existing as Promise<T>;
  }

  const p = (async () => {
    const maxAttempts = opts?.maxAttempts ?? 3;
    const client = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    let lastErr: any = null;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn!(client);
      } catch (e) {
        lastErr = e;
        if (attempt < maxAttempts && isRetryable(e)) {
          const backoff = Math.min(8000, 600 * attempt * attempt) + Math.floor(Math.random() * 400);
          await sleep(backoff);
          continue;
        }
        throw e;
      }
    }
    throw lastErr ?? new Error("Gemini request failed");
  })();

  if (canDedup) inflight.set(key, p);
  try {
    return await p;
  } finally {
    if (canDedup) inflight.delete(key);
  }
}
