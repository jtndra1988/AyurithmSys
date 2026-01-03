import { withGemini, GEMINI_AI_MODEL } from "./geminiKeyring";

// Import your app types (keep as-is if you already had these)
import type {
  Patient,
  AIAnalysisResult,
  RegistryEntry,
  AuditLog,
  Medication,
  DrugInteractionResult,
  LabReportAnalysis,
  StaffingImpactAnalysis,
  InfrastructurePlan,
  DispatchPlan,
  AIAnnotation,
} from "../types";

/* -------------------------------------------------------
   Small utilities
------------------------------------------------------- */

type JsonSchema = Record<string, any>;

function getTextFromGeminiResult(res: any): string {
  // Support multiple SDK response shapes (different Gemini SDK versions)
  try {
    if (typeof res?.text === "function") return String(res.text() ?? "");
    if (typeof res?.text === "string") return res.text;
    if (typeof res?.response?.text === "function") return String(res.response.text() ?? "");
    if (typeof res?.response?.text === "string") return res.response.text;

    const parts = res?.candidates?.[0]?.content?.parts;
    if (Array.isArray(parts)) {
      return parts.map((p: any) => p?.text).filter(Boolean).join("\n");
    }
  } catch {
    // ignore
  }
  return "";
}

function extractLikelyJson(s: string): string {
  const t = (s || "").trim();
  if (!t) return "{}";

  if ((t.startsWith("{") && t.endsWith("}")) || (t.startsWith("[") && t.endsWith("]"))) {
    return t;
  }

  const o1 = t.indexOf("{");
  const o2 = t.lastIndexOf("}");
  if (o1 !== -1 && o2 !== -1 && o2 > o1) return t.slice(o1, o2 + 1);

  const a1 = t.indexOf("[");
  const a2 = t.lastIndexOf("]");
  if (a1 !== -1 && a2 !== -1 && a2 > a1) return t.slice(a1, a2 + 1);

  return t; // will throw in JSON.parse if not JSON
}

function safeJsonParse<T>(raw: string, fallback: T): T {
  try {
    const j = JSON.parse(extractLikelyJson(raw));
    return j as T;
  } catch {
    return fallback;
  }
}

async function generateText(prompt: string, systemInstruction?: string): Promise<string> {
  const requestKey = `text:${GEMINI_AI_MODEL}:${systemInstruction ? "sys" : "nosys"}:${prompt.slice(0, 600)}`;

  const res = await withGemini(
    requestKey,
    (client) =>
      client.models.generateContent({
        model: GEMINI_AI_MODEL,
        contents: prompt,
        config: systemInstruction ? ({ systemInstruction } as any) : undefined,
      } as any),
    { maxAttempts: 3 }
  );

  return getTextFromGeminiResult(res).trim();
}


async function generateJson<T>(
  prompt: string,
  schema?: JsonSchema,
  systemInstruction?: string,
  fallback?: T
): Promise<T> {
  const requestKey = `json:${GEMINI_AI_MODEL}:${systemInstruction ? "sys" : "nosys"}:${
    schema ? "schema" : "noschema"
  }:${prompt.slice(0, 600)}`;

  const res = await withGemini(
    requestKey,
    (client) =>
      client.models.generateContent({
        model: GEMINI_AI_MODEL,
        contents: prompt,
        config: {
          ...(systemInstruction ? { systemInstruction } : {}),
          responseMimeType: "application/json",
          ...(schema ? { responseSchema: schema } : {}),
        } as any,
      } as any),
    { maxAttempts: 3 }
  );

  const raw = getTextFromGeminiResult(res);
  return safeJsonParse<T>(raw, fallback as T);
}


/* -------------------------------------------------------
   Exported APIs (keep names stable for your UI)
------------------------------------------------------- */

// --- Clinical AI ---
export async function getClinicalAssessment(
  patient: Patient,
  clinicalNotes?: string
): Promise<AIAnalysisResult> {
  const prompt = `
You are an expert Medical AI Assistant for HMS+.
Analyze ONLY provided data. Be cautious and clinician-verifiable.

Return ONLY JSON with keys:
{
  "summary": string,
  "differentialDiagnosis": string[],
  "recommendedLabs": string[],
  "treatmentPlan": string,
  "riskAssessment": string
}

Patient:
${JSON.stringify({ patient, clinicalNotes: clinicalNotes || "" }, null, 2)}
`;

  const schema: JsonSchema = {
    type: "object",
    additionalProperties: false,
    properties: {
      summary: { type: "string" },
      differentialDiagnosis: { type: "array", items: { type: "string" } },
      recommendedLabs: { type: "array", items: { type: "string" } },
      treatmentPlan: { type: "string" },
      riskAssessment: { type: "string" },
    },
    required: ["summary", "differentialDiagnosis", "recommendedLabs", "treatmentPlan", "riskAssessment"],
  };

  const fallback: AIAnalysisResult = {
    summary:
      "AI Analysis Unavailable (Missing API Key). Simulated assessment: Patient shows signs of stability but requires monitoring.",
    differentialDiagnosis: [],
    recommendedLabs: [],
    treatmentPlan: "Follow standard protocol and monitor vitals.",
    riskAssessment: "Unknown",
  };

  const out = await generateJson<AIAnalysisResult>(prompt, schema, undefined, fallback);

  // UI safety hardening
  return {
    summary: out?.summary ?? fallback.summary,
    differentialDiagnosis: out?.differentialDiagnosis ?? [],
    recommendedLabs: out?.recommendedLabs ?? [],
    treatmentPlan: out?.treatmentPlan ?? fallback.treatmentPlan,
    riskAssessment: out?.riskAssessment ?? fallback.riskAssessment,
  };
}

export async function getLabReportAnalysis(
  testName: string,
  results: any,
  unit: string,
  patientAge: number,
  patientGender: string
): Promise<LabReportAnalysis> {
  const prompt = `
You are an expert Pathologist AI.
Interpret the lab result conservatively.

Return ONLY JSON with keys:
{
  "clinicalInterpretation": string,
  "referenceRangeComment": string,
  "severityAssessment": "Normal"|"Abnormal"|"Critical",
  "suggestedAction": string
}

Input:
${JSON.stringify({ testName, results, unit, patientAge, patientGender }, null, 2)}
`;

  const schema: JsonSchema = {
    type: "object",
    additionalProperties: false,
    properties: {
      clinicalInterpretation: { type: "string" },
      referenceRangeComment: { type: "string" },
      severityAssessment: { type: "string" },
      suggestedAction: { type: "string" },
    },
    required: ["clinicalInterpretation", "referenceRangeComment", "severityAssessment", "suggestedAction"],
  };

  const fallback: LabReportAnalysis = {
    clinicalInterpretation: "AI unavailable. Value requires clinical correlation.",
    referenceRangeComment: "Check standard lab reference range.",
    severityAssessment: "Abnormal" as any,
    suggestedAction: "Manual review required.",
  };

  const out = await generateJson<LabReportAnalysis>(prompt, schema, undefined, fallback);

  return {
    clinicalInterpretation: out?.clinicalInterpretation ?? fallback.clinicalInterpretation,
    referenceRangeComment: out?.referenceRangeComment ?? fallback.referenceRangeComment,
    severityAssessment: out?.severityAssessment ?? fallback.severityAssessment,
    suggestedAction: out?.suggestedAction ?? fallback.suggestedAction,
  };
}

export async function checkDrugInteractions(
  prescriptions: Medication[],
  history: string
): Promise<DrugInteractionResult> {
  const prompt = `
You are an AI Pharmacist.
Check interactions/contraindications based on provided meds + history.
Be cautious.

Return ONLY JSON with keys:
{
  "hasInteractions": boolean,
  "warnings": string[],
  "recommendation": string
}

Input:
${JSON.stringify({ prescriptions, history }, null, 2)}
`;

  const schema: JsonSchema = {
    type: "object",
    additionalProperties: false,
    properties: {
      hasInteractions: { type: "boolean" },
      warnings: { type: "array", items: { type: "string" } },
      recommendation: { type: "string" },
    },
    required: ["hasInteractions", "warnings", "recommendation"],
  };

  const fallback: DrugInteractionResult = {
    hasInteractions: false,
    warnings: [],
    recommendation: "AI check unavailable. Please verify manually.",
  };

  const out = await generateJson<DrugInteractionResult>(prompt, schema, undefined, fallback);

  return {
    hasInteractions: !!out?.hasInteractions,
    warnings: out?.warnings ?? [],
    recommendation: out?.recommendation ?? fallback.recommendation,
  };
}

export async function getDrugInfo(query: string): Promise<string> {
  const prompt = `
You are an AI Pharmacist. Answer briefly (<120 words):
"${query}"

Include: MOA, common side effects, key counseling points.
`;
  const text = await generateText(prompt);
  return text || "AI Service Unavailable.";
}

export async function getTelemedicineSummary(transcript: string): Promise<string> {
  const prompt = `
Summarize this medical consultation transcript into a SOAP note.
Keep it concise and structured.

Transcript:
${transcript}
`;
  const text = await generateText(prompt);
  return text || "AI Summary Unavailable.";
}

// --- Doctor Briefing ---
export interface DoctorBriefing {
  priorities: string[];
  riskAlerts: string[];
  scheduleOptimization: string;
}

export async function getDoctorDailyBriefing(
  doctorName: string,
  opdList: Patient[],
  ipdList: Patient[]
): Promise<DoctorBriefing> {
  const prompt = `
You are a clinical executive assistant for Dr. ${doctorName}.
Prepare a daily briefing.

Return ONLY JSON:
{
  "priorities": string[],
  "riskAlerts": string[],
  "scheduleOptimization": string
}

Input:
${JSON.stringify({ opdList, ipdList }, null, 2)}
`;

  const schema: JsonSchema = {
    type: "object",
    additionalProperties: false,
    properties: {
      priorities: { type: "array", items: { type: "string" } },
      riskAlerts: { type: "array", items: { type: "string" } },
      scheduleOptimization: { type: "string" },
    },
    required: ["priorities", "riskAlerts", "scheduleOptimization"],
  };

  const fallback: DoctorBriefing = {
    priorities: ["Review critical patients first", "Clear high-urgency OPD cases"],
    riskAlerts: [],
    scheduleOptimization: "Proceed with standard rounds; monitor critical vitals.",
  };

  const out = await generateJson<DoctorBriefing>(prompt, schema, undefined, fallback);

  return {
    priorities: out?.priorities ?? [],
    riskAlerts: out?.riskAlerts ?? [],
    scheduleOptimization: out?.scheduleOptimization ?? fallback.scheduleOptimization,
  };
}

// --- Discharge Readiness ---
export interface DischargeReadiness {
  score: number;
  status: "Ready" | "Not Ready" | "Borderline";
  missingCriteria: string[];
  estimatedDischargeDate: string;
}

export async function getDischargeReadiness(patient: Patient): Promise<DischargeReadiness> {
  const prompt = `
Evaluate discharge readiness conservatively.

Return ONLY JSON:
{
  "score": number,
  "status": "Ready" | "Not Ready" | "Borderline",
  "missingCriteria": string[],
  "estimatedDischargeDate": string
}

Patient:
${JSON.stringify(patient, null, 2)}
`;

  const schema: JsonSchema = {
    type: "object",
    additionalProperties: false,
    properties: {
      score: { type: "number" },
      status: { type: "string" },
      missingCriteria: { type: "array", items: { type: "string" } },
      estimatedDischargeDate: { type: "string" },
    },
    required: ["score", "status", "missingCriteria", "estimatedDischargeDate"],
  };

  const fallback: DischargeReadiness = {
    score: 50,
    status: "Borderline",
    missingCriteria: [],
    estimatedDischargeDate: "Unknown",
  };

  const out = await generateJson<DischargeReadiness>(prompt, schema, undefined, fallback);

  return {
    score: Number(out?.score ?? fallback.score),
    status: (out?.status as any) || fallback.status,
    missingCriteria: out?.missingCriteria ?? [],
    estimatedDischargeDate: out?.estimatedDischargeDate ?? fallback.estimatedDischargeDate,
  };
}

// --- Nurse: Vitals Risk ---
export interface VitalsAnalysis {
  riskScore: number;
  riskLevel: "Low" | "Medium" | "High" | "Critical";
  alertMessage: string;
  clinicalAction: string;
}

export async function analyzeVitalsRisk(vitals: any, age: number): Promise<VitalsAnalysis> {
  const prompt = `
You are an AI Nursing Assistant. Analyze vitals conservatively.

Return ONLY JSON:
{
  "riskScore": number,
  "riskLevel": "Low" | "Medium" | "High" | "Critical",
  "alertMessage": string,
  "clinicalAction": string
}

Input:
${JSON.stringify({ vitals, age }, null, 2)}
`;

  const schema: JsonSchema = {
    type: "object",
    additionalProperties: false,
    properties: {
      riskScore: { type: "number" },
      riskLevel: { type: "string" },
      alertMessage: { type: "string" },
      clinicalAction: { type: "string" },
    },
    required: ["riskScore", "riskLevel", "alertMessage", "clinicalAction"],
  };

  const fallback: VitalsAnalysis = {
    riskScore: 0,
    riskLevel: "Low",
    alertMessage: "AI unavailable",
    clinicalAction: "Follow standard protocol",
  };

  const out = await generateJson<VitalsAnalysis>(prompt, schema, undefined, fallback);

  return {
    riskScore: Number(out?.riskScore ?? fallback.riskScore),
    riskLevel: (out?.riskLevel as any) || fallback.riskLevel,
    alertMessage: out?.alertMessage ?? fallback.alertMessage,
    clinicalAction: out?.clinicalAction ?? fallback.clinicalAction,
  };
}

// --- Nurse: Shift Handover ---
export interface NurseHandover {
  shiftSummary: string;
  criticalPatients: string[];
  pendingTasks: string[];
}

export async function getNurseShiftHandover(patients: Patient[]): Promise<NurseHandover> {
  const prompt = `
Create a nursing shift handover summary.
Be concise and clinically safe.

Return ONLY JSON:
{
  "shiftSummary": string,
  "criticalPatients": string[],
  "pendingTasks": string[]
}

Patients:
${JSON.stringify(patients, null, 2)}
`;

  const schema: JsonSchema = {
    type: "object",
    additionalProperties: false,
    properties: {
      shiftSummary: { type: "string" },
      criticalPatients: { type: "array", items: { type: "string" } },
      pendingTasks: { type: "array", items: { type: "string" } },
    },
    required: ["shiftSummary", "criticalPatients", "pendingTasks"],
  };

  const fallback: NurseHandover = {
    shiftSummary: "AI unavailable. Perform manual handover.",
    criticalPatients: [],
    pendingTasks: [],
  };

  const out = await generateJson<NurseHandover>(prompt, schema, undefined, fallback);

  return {
    shiftSummary: out?.shiftSummary ?? fallback.shiftSummary,
    criticalPatients: out?.criticalPatients ?? [],
    pendingTasks: out?.pendingTasks ?? [],
  };
}

// --- Executive Briefing ---
export interface ExecutiveBriefing {
  situationReport: string;
  criticalAlerts: string[];
  recommendedActions: string[];
}

export async function getExecutiveBriefing(metrics: any): Promise<ExecutiveBriefing> {
  const prompt = `
You are the AI Chief of Staff for a state health department.
Summarize the operational situation based on metrics.

Return ONLY JSON:
{
  "situationReport": string,
  "criticalAlerts": string[],
  "recommendedActions": string[]
}

Metrics:
${JSON.stringify(metrics, null, 2)}
`;

  const schema: JsonSchema = {
    type: "object",
    additionalProperties: false,
    properties: {
      situationReport: { type: "string" },
      criticalAlerts: { type: "array", items: { type: "string" } },
      recommendedActions: { type: "array", items: { type: "string" } },
    },
    required: ["situationReport", "criticalAlerts", "recommendedActions"],
  };

  const fallback: ExecutiveBriefing = {
    situationReport: "AI unavailable. Review metrics manually.",
    criticalAlerts: [],
    recommendedActions: [],
  };

  const out = await generateJson<ExecutiveBriefing>(prompt, schema, undefined, fallback);

  return {
    situationReport: out?.situationReport ?? fallback.situationReport,
    criticalAlerts: out?.criticalAlerts ?? [],
    recommendedActions: out?.recommendedActions ?? [],
  };
}

// --- Registry Analysis ---
export interface RegistryAnalysis {
  epidemicTrend: string;
  hotspotAlert: string;
  publicHealthIntervention: string;
}

export async function getRegistryAnalysis(data: RegistryEntry[]): Promise<RegistryAnalysis> {
  const prompt = `
You are the State Epidemiologist.
Analyze registry entries for trend and hotspots.

Return ONLY JSON:
{
  "epidemicTrend": string,
  "hotspotAlert": string,
  "publicHealthIntervention": string
}

Data:
${JSON.stringify(data, null, 2)}
`;

  const schema: JsonSchema = {
    type: "object",
    additionalProperties: false,
    properties: {
      epidemicTrend: { type: "string" },
      hotspotAlert: { type: "string" },
      publicHealthIntervention: { type: "string" },
    },
    required: ["epidemicTrend", "hotspotAlert", "publicHealthIntervention"],
  };

  const fallback: RegistryAnalysis = {
    epidemicTrend: "Insufficient data",
    hotspotAlert: "None detected",
    publicHealthIntervention: "Continue routine surveillance",
  };

  return await generateJson<RegistryAnalysis>(prompt, schema, undefined, fallback);
}

// --- Audit Analysis ---
export interface SecurityAnalysis {
  threatLevel: "Low" | "Medium" | "High";
  summary: string;
}

export async function getAuditAnalysis(logs: AuditLog[]): Promise<SecurityAnalysis> {
  const prompt = `
You are the AI CISO.
Analyze audit logs for suspicious behavior.

Return ONLY JSON:
{
  "threatLevel": "Low" | "Medium" | "High",
  "summary": string
}

Logs:
${JSON.stringify(logs.slice(0, 50), null, 2)}
`;

  const schema: JsonSchema = {
    type: "object",
    additionalProperties: false,
    properties: {
      threatLevel: { type: "string" },
      summary: { type: "string" },
    },
    required: ["threatLevel", "summary"],
  };

  const fallback: SecurityAnalysis = {
    threatLevel: "Low",
    summary: "AI unavailable. No automated findings.",
  };

  const out = await generateJson<SecurityAnalysis>(prompt, schema, undefined, fallback);
  return {
    threatLevel: (out?.threatLevel as any) || fallback.threatLevel,
    summary: out?.summary ?? fallback.summary,
  };
}

// --- Hospital Operations ---
export interface HospitalOpsAnalysis {
  efficiencyScore: number;
  bottleneckAlert: string;
  staffingRecommendation: string;
}

export async function getHospitalOperationsAnalysis(metrics: any): Promise<HospitalOpsAnalysis> {
  const prompt = `
You are the AI Operations Director.
Analyze hospital operations metrics.

Return ONLY JSON:
{
  "efficiencyScore": number,
  "bottleneckAlert": string,
  "staffingRecommendation": string
}

Metrics:
${JSON.stringify(metrics, null, 2)}
`;

  const schema: JsonSchema = {
    type: "object",
    additionalProperties: false,
    properties: {
      efficiencyScore: { type: "number" },
      bottleneckAlert: { type: "string" },
      staffingRecommendation: { type: "string" },
    },
    required: ["efficiencyScore", "bottleneckAlert", "staffingRecommendation"],
  };

  const fallback: HospitalOpsAnalysis = {
    efficiencyScore: 0,
    bottleneckAlert: "AI unavailable",
    staffingRecommendation: "Review roster manually",
  };

  const out = await generateJson<HospitalOpsAnalysis>(prompt, schema, undefined, fallback);

  return {
    efficiencyScore: Number(out?.efficiencyScore ?? fallback.efficiencyScore),
    bottleneckAlert: out?.bottleneckAlert ?? fallback.bottleneckAlert,
    staffingRecommendation: out?.staffingRecommendation ?? fallback.staffingRecommendation,
  };
}

export async function analyzeStaffingImpact(
  request: any,
  currentRoster: string
): Promise<StaffingImpactAnalysis> {
  const prompt = `
You are the AI HR Director.
Assess staffing impact of this request.

Return ONLY JSON with the same keys as StaffingImpactAnalysis.

Input:
${JSON.stringify({ request, currentRoster }, null, 2)}
`;

  // If you know exact StaffingImpactAnalysis schema, put it here.
  // For now, no schema, but still request JSON and harden later.
  const fallback = {
    approvalRisk: "Low",
    impactSummary: "AI unavailable. Manual review required.",
    recommendation: "Review roster manually.",
  } as any;

  const out = await generateJson<StaffingImpactAnalysis>(prompt, undefined, undefined, fallback);

  return (out ?? fallback) as StaffingImpactAnalysis;
}

// --- Inventory / Infrastructure ---
export async function getInfrastructurePlan(data: any): Promise<InfrastructurePlan> {
  const prompt = `
You are Strategic Planning AI.
Create an infrastructure plan.

Return ONLY JSON with keys matching InfrastructurePlan.

Input:
${JSON.stringify(data, null, 2)}
`;
  const fallback = {
    planSummary: "AI unavailable",
    resourceAllocation: [],
    priorityAreas: [],
  } as any;

  const out = await generateJson<InfrastructurePlan>(prompt, undefined, undefined, fallback);

  // harden common fields if present
  return {
    ...(out as any),
    resourceAllocation: (out as any)?.resourceAllocation ?? [],
    priorityAreas: (out as any)?.priorityAreas ?? [],
  } as InfrastructurePlan;
}
export interface StatewideCrisisPlan {
  threatAssessment: string;
  resourceAllocations: string[];
  policyOrderDraft: string;
}

export async function getStatewideResourcePlan(data: any): Promise<StatewideCrisisPlan> {
  const prompt = `
You are the AI Crisis Commander for a State Health Department.
Based on the input data, create a statewide resource plan.

Return ONLY JSON:
{
  "threatAssessment": string,
  "resourceAllocations": string[],
  "policyOrderDraft": string
}

Input:
${JSON.stringify(data, null, 2)}
`;

  const schema = {
    type: "object",
    additionalProperties: false,
    properties: {
      threatAssessment: { type: "string" },
      resourceAllocations: { type: "array", items: { type: "string" } },
      policyOrderDraft: { type: "string" },
    },
    required: ["threatAssessment", "resourceAllocations", "policyOrderDraft"],
  };

  const fallback: StatewideCrisisPlan = {
    threatAssessment: "AI unavailable. Please review data manually.",
    resourceAllocations: [],
    policyOrderDraft: "AI unavailable. Draft policy manually based on SOP.",
  };

  const out = await generateJson<StatewideCrisisPlan>(prompt, schema, undefined, fallback);

  return {
    threatAssessment: out?.threatAssessment ?? fallback.threatAssessment,
    resourceAllocations: out?.resourceAllocations ?? [],
    policyOrderDraft: out?.policyOrderDraft ?? fallback.policyOrderDraft,
  };
}
export interface InventoryInsight {
  stockoutRisk: string[];
  procurementAdvice: string;
}

export async function getInventoryOptimization(inventory: any): Promise<InventoryInsight> {
  const prompt = `
You are an AI Supply Chain Optimizer for a hospital.
Identify likely stock-out risks and procurement actions.

Return ONLY JSON:
{
  "stockoutRisk": string[],
  "procurementAdvice": string
}

Inventory:
${JSON.stringify(inventory, null, 2)}
`;

  const schema = {
    type: "object",
    additionalProperties: false,
    properties: {
      stockoutRisk: { type: "array", items: { type: "string" } },
      procurementAdvice: { type: "string" },
    },
    required: ["stockoutRisk", "procurementAdvice"],
  };

  const fallback: InventoryInsight = {
    stockoutRisk: [],
    procurementAdvice: "AI unavailable. Review reorder levels manually.",
  };

  const out = await generateJson<InventoryInsight>(prompt, schema, undefined, fallback);

  return {
    stockoutRisk: out?.stockoutRisk ?? [],
    procurementAdvice: out?.procurementAdvice ?? fallback.procurementAdvice,
  };
}
export interface LabQualityAnalysis {
  tatScore: number; // 0-100
  efficiencyTrend: "Improving" | "Declining" | "Stable";
  calibrationAlert: string;
  staffingAdvice: string;
}

export async function getLabQualityAnalysis(labMetrics: any): Promise<LabQualityAnalysis> {
  const prompt = `
You are an AI Lab Quality Manager.
Analyze lab metrics and provide operational quality insights.

Return ONLY JSON:
{
  "tatScore": number,
  "efficiencyTrend": "Improving" | "Declining" | "Stable",
  "calibrationAlert": string,
  "staffingAdvice": string
}

Lab Metrics:
${JSON.stringify(labMetrics, null, 2)}
`;

  const schema = {
    type: "object",
    additionalProperties: false,
    properties: {
      tatScore: { type: "number" },
      efficiencyTrend: { type: "string", enum: ["Improving", "Declining", "Stable"] },
      calibrationAlert: { type: "string" },
      staffingAdvice: { type: "string" },
    },
    required: ["tatScore", "efficiencyTrend", "calibrationAlert", "staffingAdvice"],
  };

  const fallback: LabQualityAnalysis = {
    tatScore: 0,
    efficiencyTrend: "Stable",
    calibrationAlert: "AI unavailable. Verify QC logs manually.",
    staffingAdvice: "AI unavailable. Review staffing vs workload manually.",
  };

  const out = await generateJson<LabQualityAnalysis>(prompt, schema, undefined, fallback);

  return {
    tatScore: Number(out?.tatScore ?? fallback.tatScore),
    efficiencyTrend: (out?.efficiencyTrend as any) || fallback.efficiencyTrend,
    calibrationAlert: out?.calibrationAlert ?? fallback.calibrationAlert,
    staffingAdvice: out?.staffingAdvice ?? fallback.staffingAdvice,
  };
}
export interface GenomicPolicyInsight {
  policyRecommendation: string;
  procurementAdvice: string;
}

export async function getGenomicInsights(riskCounts: any): Promise<GenomicPolicyInsight> {
  const prompt = `
You are a Precision Medicine Policy Advisor.
Based on genomic risk distribution (counts/summary), propose policy and procurement recommendations.

Return ONLY JSON:
{
  "policyRecommendation": string,
  "procurementAdvice": string
}

Input:
${JSON.stringify(riskCounts, null, 2)}
`;

  const schema = {
    type: "object",
    additionalProperties: false,
    properties: {
      policyRecommendation: { type: "string" },
      procurementAdvice: { type: "string" },
    },
    required: ["policyRecommendation", "procurementAdvice"],
  };

  const fallback: GenomicPolicyInsight = {
    policyRecommendation: "AI unavailable. Continue current screening and referral protocols.",
    procurementAdvice: "AI unavailable. Review testing kit inventory and reorder thresholds manually.",
  };

  const out = await generateJson<GenomicPolicyInsight>(prompt, schema, undefined, fallback);

  return {
    policyRecommendation: out?.policyRecommendation ?? fallback.policyRecommendation,
    procurementAdvice: out?.procurementAdvice ?? fallback.procurementAdvice,
  };
}
export interface RevenueInsight {
  trend: "Up" | "Down" | "Stable";
  insight: string;
  actionableTip: string;
}

export async function getRevenueAnalysis(revenueData: any): Promise<RevenueInsight> {
  const prompt = `
You are an AI Financial Analyst for a hospital.
Analyze revenue data and provide a short, actionable insight.

Return ONLY JSON:
{
  "trend": "Up" | "Down" | "Stable",
  "insight": string,
  "actionableTip": string
}

Revenue Data:
${JSON.stringify(revenueData, null, 2)}
`;

  const schema = {
    type: "object",
    additionalProperties: false,
    properties: {
      trend: { type: "string", enum: ["Up", "Down", "Stable"] },
      insight: { type: "string" },
      actionableTip: { type: "string" },
    },
    required: ["trend", "insight", "actionableTip"],
  };

  const fallback: RevenueInsight = {
    trend: "Stable",
    insight: "AI unavailable. Review billing and collections manually.",
    actionableTip: "Reconcile pending claims and review top unpaid invoices.",
  };

  const out = await generateJson<RevenueInsight>(prompt, schema, undefined, fallback);

  return {
    trend: (out?.trend as any) || fallback.trend,
    insight: out?.insight ?? fallback.insight,
    actionableTip: out?.actionableTip ?? fallback.actionableTip,
  };
}
export interface AssetPrediction {
  riskLevel: "Low" | "Medium" | "High";
  predictedFailures: string[];
  maintenanceAdvice: string;
}

export async function getAssetMaintenancePrediction(assets: any): Promise<AssetPrediction> {
  const prompt = `
You are the AI Infrastructure Monitor for a hospital.
Given assets and any available usage/maintenance signals, predict likely failures and recommend maintenance actions.
Be conservative and avoid fabricating unknown sensor data.

Return ONLY JSON:
{
  "riskLevel": "Low" | "Medium" | "High",
  "predictedFailures": string[],
  "maintenanceAdvice": string
}

Assets:
${JSON.stringify(assets, null, 2)}
`;

  const schema = {
    type: "object",
    additionalProperties: false,
    properties: {
      riskLevel: { type: "string", enum: ["Low", "Medium", "High"] },
      predictedFailures: { type: "array", items: { type: "string" } },
      maintenanceAdvice: { type: "string" },
    },
    required: ["riskLevel", "predictedFailures", "maintenanceAdvice"],
  };

  const fallback: AssetPrediction = {
    riskLevel: "Low",
    predictedFailures: [],
    maintenanceAdvice: "AI unavailable. Follow preventive maintenance schedule and review recent breakdown logs.",
  };

  const out = await generateJson<AssetPrediction>(prompt, schema, undefined, fallback);

  return {
    riskLevel: (out?.riskLevel as any) || fallback.riskLevel,
    predictedFailures: out?.predictedFailures ?? [],
    maintenanceAdvice: out?.maintenanceAdvice ?? fallback.maintenanceAdvice,
  };
}

// --- Queue Analysis (PatientList uses this) ---
export interface QueueAnalysis {
  efficiencyScore: number;
  criticalAlerts: string[];
  reorderingSuggestions: string[];
  resourceAdvice: string;
}

export async function getQueueAnalysis(patients: Patient[]): Promise<QueueAnalysis> {
  const prompt = `
You are the AI Triage Master.
Optimize the queue safely.

Return ONLY JSON:
{
  "efficiencyScore": number,
  "criticalAlerts": string[],
  "reorderingSuggestions": string[],
  "resourceAdvice": string
}

Queue:
${JSON.stringify(patients, null, 2)}
`;

  const schema: JsonSchema = {
    type: "object",
    additionalProperties: false,
    properties: {
      efficiencyScore: { type: "number" },
      criticalAlerts: { type: "array", items: { type: "string" } },
      reorderingSuggestions: { type: "array", items: { type: "string" } },
      resourceAdvice: { type: "string" },
    },
    required: ["efficiencyScore", "criticalAlerts", "reorderingSuggestions", "resourceAdvice"],
  };

  const fallback: QueueAnalysis = {
    efficiencyScore: 70,
    criticalAlerts: [],
    reorderingSuggestions: [],
    resourceAdvice: "AI unavailable. Follow standard triage protocol.",
  };

  const out = await generateJson<QueueAnalysis>(prompt, schema, undefined, fallback);

  return {
    efficiencyScore: Number(out?.efficiencyScore ?? fallback.efficiencyScore),
    criticalAlerts: out?.criticalAlerts ?? [],
    reorderingSuggestions: out?.reorderingSuggestions ?? [],
    resourceAdvice: out?.resourceAdvice ?? fallback.resourceAdvice,
  };
}

// --- Dispatch Advice ---
export async function getDispatchAdvice(incident: any, ambulances: any[]): Promise<DispatchPlan> {
  const prompt = `
You are the AI Dispatch Controller.
Recommend best ambulance + ETA.

Return ONLY JSON with keys matching DispatchPlan.

Input:
${JSON.stringify({ incident, ambulances }, null, 2)}
`;
  const fallback = {
    recommendedAmbulanceId: ambulances?.[0]?.id ?? "",
    estimatedEta: "Unknown",
    routeSummary: "AI unavailable. Use manual dispatch process.",
  } as any;

  return await generateJson<DispatchPlan>(prompt, undefined, undefined, fallback);
}

// --- Radiology (simulated annotations) ---
export async function analyzeRadiologyImage(_imageUrl: string): Promise<AIAnnotation[]> {
  const prompt = `
Simulate radiology annotations.
Return ONLY JSON array of:
[{ "id": string, "label": string, "confidence": number, "x": number, "y": number, "width": number, "height": number, "description": string }]
Coordinates are 0-100.
`;

  const schema: JsonSchema = {
    type: "array",
    items: {
      type: "object",
      additionalProperties: false,
      properties: {
        id: { type: "string" },
        label: { type: "string" },
        confidence: { type: "number" },
        x: { type: "number" },
        y: { type: "number" },
        width: { type: "number" },
        height: { type: "number" },
        description: { type: "string" },
      },
      required: ["id", "label", "confidence", "x", "y", "width", "height", "description"],
    },
  };

  const fallback: AIAnnotation[] = [];

  const out = await generateJson<AIAnnotation[]>(prompt, schema, undefined, fallback);
  return Array.isArray(out) ? out : [];
}
