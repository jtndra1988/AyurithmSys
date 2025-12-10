
import { GoogleGenAI } from "@google/genai";
import { AP_HEALTH_KNOWLEDGE_BASE, KnowledgeDoc } from "../data/knowledgeBase";

// Initialize AI
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// In-memory cache for embeddings to avoid re-computing on every startup (in real app, use Vector DB)
let documentEmbeddings: { doc: KnowledgeDoc; embedding: number[] }[] = [];

// --- Vector Math Helpers ---
const dotProduct = (a: number[], b: number[]) => {
  return a.reduce((acc, val, i) => acc + val * b[i], 0);
};

const magnitude = (v: number[]) => {
  return Math.sqrt(v.reduce((acc, val) => acc + val * val, 0));
};

const cosineSimilarity = (a: number[], b: number[]) => {
  return dotProduct(a, b) / (magnitude(a) * magnitude(b));
};

// --- Core RAG Service ---

export const initializeKnowledgeBase = async () => {
  console.log("Initializing RAG Knowledge Base...");
  // In a real scenario, this happens once and is stored in pgvector
  for (const doc of AP_HEALTH_KNOWLEDGE_BASE) {
    try {
      const response = await ai.models.embedContent({
        model: "text-embedding-004",
        contents: doc.content,
      });
      const embedding = response.embeddings?.[0]?.values;
      if (embedding) {
        documentEmbeddings.push({ doc, embedding });
      }
    } catch (error) {
      console.error(`Failed to embed doc ${doc.id}:`, error);
    }
  }
  console.log(`RAG Ready: ${documentEmbeddings.length} documents embedded.`);
};

export const retrieveContext = async (query: string): Promise<KnowledgeDoc[]> => {
  try {
    // 1. Embed the User Query
    const response = await ai.models.embedContent({
      model: "text-embedding-004",
      contents: query,
    });
    const queryEmbedding = response.embeddings?.[0]?.values;

    if (!queryEmbedding) return [];

    // 2. Perform Vector Search (Cosine Similarity)
    const scoredDocs = documentEmbeddings.map(item => ({
      doc: item.doc,
      score: cosineSimilarity(queryEmbedding, item.embedding)
    }));

    // 3. Rank and Top-K
    scoredDocs.sort((a, b) => b.score - a.score);
    
    // Return top 3 relevant docs
    return scoredDocs.slice(0, 3).map(item => item.doc);

  } catch (error) {
    console.error("RAG Retrieval Error:", error);
    return [];
  }
};

export const generateRAGResponse = async (query: string, context: string) => {
  const prompt = `
    You are the AI Medical Officer for Andhra Pradesh Government.
    Answer the user query strictly using the provided OFFICIAL GUIDELINES.
    
    OFFICIAL GUIDELINES (CONTEXT):
    ${context}
    
    USER QUERY:
    ${query}
    
    If the answer is not in the guidelines, provide a general medical answer but state "Standard Protocol, verify with specialist".
    Keep the answer professional, concise, and actionable. Return in JSON format if the prompt asks for it.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return response.text;
};
