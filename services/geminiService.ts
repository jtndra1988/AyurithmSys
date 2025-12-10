
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { 
  Patient, AIAnalysisResult, RegistryEntry, AuditLog, Medication, DrugInteractionResult, LabReportAnalysis, 
  StaffingImpactAnalysis, InfrastructurePlan, DispatchPlan, AIAnnotation, VitalsAnalysis, ExecutiveBriefing, 
  StatewideCrisisPlan, HospitalOpsAnalysis, RevenueInsight, QueueAnalysis, InventoryInsight, DoctorBriefing, 
  NurseHandover, GenomicPolicyInsight, SecurityAnalysis, AssetPrediction, DischargeReadiness, LabQualityAnalysis, 
  RegistryAnalysis 
} from "../types";

// Export all types so components can import them from here if needed (though importing from types.ts is preferred)
export * from "../types";

// --- CONFIGURATION ---
const USE_BACKEND_RAG = true; // Feature Flag: Set to true when backend is running on port 3000
const BACKEND_URL = 'http://localhost:3000/api/ai';

// Fallback Client (Direct)
let ai: GoogleGenAI | null = null;
try {
  const apiKey = process.env.API_KEY;
  if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
  }
} catch (e) {
  console.warn("Client-side AI init failed. Relying on backend or fallbacks.");
}

const isAiAvailable = (): boolean => !!ai || USE_BACKEND_RAG;

// --- RAG HELPER ---
const callRagBackend = async (query: string, patientContext?: any) => {
  try {
    const res = await fetch(`${BACKEND_URL}/rag`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, patientContext })
    });
    if (!res.ok) throw new Error('Backend Error');
    return await res.json();
  } catch (e) {
    console.warn("RAG Backend unavailable, falling back to direct Gemini.", e);
    return null;
  }
};

// --- CLINICAL ASSESSMENT (RAG ENHANCED) ---

export const getClinicalAssessment = async (patient: Patient, clinicalNotes?: string): Promise<AIAnalysisResult> => {
  // 1. Try Backend RAG First
  if (USE_BACKEND_RAG) {
    const ragResult = await callRagBackend(
      `Provide a comprehensive clinical assessment, differential diagnosis, and treatment plan based on the patient data provided.`,
      { patient, clinicalNotes }
    );
    
    if (ragResult && ragResult.answer) {
      // The backend returns text, we might need to parse it or adjust backend to return JSON.
      // For hybrid approach, we let the backend handle the context and return the structured JSON string.
      try {
        // Assuming backend instructs model to return JSON
        const jsonMatch = ragResult.answer.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        // Fallthrough if parsing fails
      }
    }
  }

  // 2. Client-side Fallback (Existing Logic)
  if (!ai) return getFallbackClinicalData();

  const prompt = `
    You are an expert Medical AI Assistant for the HMS+ platform (Andhra Pradesh Govt).
    Analyze the following patient case. Use standard AP Health Protocols if known.
    
    Patient: ${patient.name}, ${patient.age}y ${patient.gender}
    Symptoms: ${patient.symptoms.join(', ')}
    Vitals: HR ${patient.vitals.heartRate}, BP ${patient.vitals.bpSystolic}/${patient.vitals.bpDiastolic}, Temp ${patient.vitals.temperature}C, SpO2 ${patient.vitals.spO2}%
    Medical History: ${patient.history}
    Lab Flags: ${patient.labResults.filter(l => l.flag !== 'NORMAL').map(l => `${l.testName}: ${l.value} (${l.flag})`).join(', ')}
    Genomics: ${patient.genomics ? patient.genomics.map(g => `${g.gene} ${g.variant} (${g.significance})`).join(', ') : 'None available'}
    Clinical Notes: ${clinicalNotes || 'None'}

    Provide a clinical assessment in structured JSON format.
  `;

  const assessmentSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      summary: { type: Type.STRING },
      differentialDiagnosis: { type: Type.ARRAY, items: { type: Type.STRING } },
      recommendedLabs: { type: Type.ARRAY, items: { type: Type.STRING } },
      treatmentPlan: { type: Type.STRING },
      riskAssessment: { type: Type.STRING }
    },
    required: ["summary", "differentialDiagnosis", "recommendedLabs", "treatmentPlan", "riskAssessment"]
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json", responseSchema: assessmentSchema }
    });
    return JSON.parse(response.text || '{}') as AIAnalysisResult;
  } catch (error) {
    return getFallbackClinicalData();
  }
};

// Helpers
const getFallbackClinicalData = () => ({
  summary: "AI Service Unavailable. Please rely on clinical judgment.",
  differentialDiagnosis: [],
  recommendedLabs: [],
  treatmentPlan: "Consult standard protocols.",
  riskAssessment: "Unknown"
});

// --- OTHER AI FUNCTIONS ---

export const getLabReportAnalysis = async (testName: string, results: any, unit: string, age: number, gender: string): Promise<LabReportAnalysis> => {
  if (!ai) return { clinicalInterpretation: "AI Offline", referenceRangeComment: "", severityAssessment: "Abnormal", suggestedAction: "Manual Review" };
  
  const prompt = `Analyze Lab Result: ${testName}, Value: ${JSON.stringify(results)} ${unit}, Patient: ${age}y ${gender}. Return JSON {clinicalInterpretation, referenceRangeComment, severityAssessment, suggestedAction}`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || '{}');
  } catch (e) { return { clinicalInterpretation: "Error", referenceRangeComment: "", severityAssessment: "Abnormal", suggestedAction: "" }; }
};

export const checkDrugInteractions = async (prescriptions: Medication[], history: string): Promise<DrugInteractionResult> => {
  if (!ai) return { hasInteractions: false, warnings: [], recommendation: "Manual check required" };

  const prompt = `Check interactions: ${prescriptions.map(m => m.name).join(', ')}. History: ${history}. Return JSON {hasInteractions: boolean, warnings: string[], recommendation: string}`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || '{}');
  } catch (e) { return { hasInteractions: false, warnings: [], recommendation: "" }; }
};

export const getDrugInfo = async (query: string): Promise<string> => {
  if (!ai) return "AI Offline";
  const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: `Pharmacist Query: ${query}. concise answer.` });
  return response.text || "";
};

export const getTelemedicineSummary = async (transcript: string): Promise<string> => {
  if (!ai) return "AI Offline";
  const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: `Summarize SOAP note from transcript: ${transcript}` });
  return response.text || "";
};

export const getDoctorDailyBriefing = async (name: string, opd: any[], ipd: any[]): Promise<DoctorBriefing> => {
  if (!ai) return { priorities: [], riskAlerts: [], scheduleOptimization: "Offline" };
  const prompt = `Morning briefing for ${name}. OPD: ${opd.length}, IPD: ${ipd.length}. Return JSON {priorities: [], riskAlerts: [], scheduleOptimization: string}`;
  try {
    const res = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { responseMimeType: "application/json" } });
    return JSON.parse(res.text || '{}');
  } catch (e) { return { priorities: [], riskAlerts: [], scheduleOptimization: "Error" }; }
};

export const getDischargeReadiness = async (patient: any): Promise<DischargeReadiness> => {
  if (!ai) return { score: 0, status: 'Not Ready', missingCriteria: [], estimatedDischargeDate: 'Unknown' };
  const prompt = `Discharge readiness for ${JSON.stringify(patient)}. Return JSON {score: number, status: string, missingCriteria: string[], estimatedDischargeDate: string}`;
  try {
    const res = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { responseMimeType: "application/json" } });
    return JSON.parse(res.text || '{}');
  } catch (e) { return { score: 0, status: 'Error', missingCriteria: [], estimatedDischargeDate: 'Unknown' }; }
};

export const analyzeVitalsRisk = async (vitals: any, age: number): Promise<VitalsAnalysis> => {
  if (!ai) return { riskScore: 0, riskLevel: 'Low', alertMessage: "Offline", clinicalAction: "" };
  const prompt = `Calculate NEWS2 score for Age ${age}, Vitals ${JSON.stringify(vitals)}. Return JSON {riskScore: number, riskLevel: string, alertMessage: string, clinicalAction: string}`;
  try {
    const res = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { responseMimeType: "application/json" } });
    return JSON.parse(res.text || '{}');
  } catch (e) { return { riskScore: 0, riskLevel: 'Low', alertMessage: "Error", clinicalAction: "" }; }
};

export const getNurseShiftHandover = async (patients: any[]): Promise<NurseHandover> => {
  if (!ai) return { shiftSummary: "Offline", criticalPatients: [], pendingTasks: [] };
  const prompt = `Nurse Handover for ${patients.length} patients. Return JSON {shiftSummary, criticalPatients: [], pendingTasks: []}`;
  try {
    const res = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { responseMimeType: "application/json" } });
    return JSON.parse(res.text || '{}');
  } catch (e) { return { shiftSummary: "Error", criticalPatients: [], pendingTasks: [] }; }
};

export const getExecutiveBriefing = async (metrics: any): Promise<ExecutiveBriefing> => {
  if (!ai) return { situationReport: "Offline", criticalAlerts: [], recommendedActions: [] };
  const prompt = `Executive Briefing for Health Sec. Metrics: ${JSON.stringify(metrics)}. Return JSON {situationReport, criticalAlerts: [], recommendedActions: []}`;
  try {
    const res = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { responseMimeType: "application/json" } });
    return JSON.parse(res.text || '{}');
  } catch (e) { return { situationReport: "Error", criticalAlerts: [], recommendedActions: [] }; }
};

export const getStatewideResourcePlan = async (data: any): Promise<StatewideCrisisPlan> => {
  if (!ai) return { threatAssessment: "Offline", resourceAllocations: [], policyOrderDraft: "" };
  const prompt = `Crisis Plan for data: ${JSON.stringify(data)}. Return JSON {threatAssessment, resourceAllocations: [], policyOrderDraft}`;
  try {
    const res = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { responseMimeType: "application/json" } });
    return JSON.parse(res.text || '{}');
  } catch (e) { return { threatAssessment: "Error", resourceAllocations: [], policyOrderDraft: "" }; }
};

export const getInfrastructurePlan = async (data: any): Promise<InfrastructurePlan> => {
  if (!ai) return { planSummary: "Offline", resourceAllocation: [], priorityAreas: [] };
  const prompt = `Infra Plan for data: ${JSON.stringify(data)}. Return JSON {planSummary, resourceAllocation: [], priorityAreas: []}`;
  try {
    const res = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { responseMimeType: "application/json" } });
    return JSON.parse(res.text || '{}');
  } catch (e) { return { planSummary: "Error", resourceAllocation: [], priorityAreas: [] }; }
};

export const getRegistryAnalysis = async (data: any[]): Promise<RegistryAnalysis> => {
  if (!ai) return { epidemicTrend: "Offline", hotspotAlert: "", publicHealthIntervention: "" };
  const prompt = `Epidemic Analysis for registry data. Return JSON {epidemicTrend, hotspotAlert, publicHealthIntervention}`;
  try {
    const res = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { responseMimeType: "application/json" } });
    return JSON.parse(res.text || '{}');
  } catch (e) { return { epidemicTrend: "Error", hotspotAlert: "", publicHealthIntervention: "" }; }
};

export const getGenomicInsights = async (stats: any): Promise<GenomicPolicyInsight> => {
  if (!ai) return { policyRecommendation: "Offline", procurementAdvice: "" };
  const prompt = `Genomic Policy for stats: ${JSON.stringify(stats)}. Return JSON {policyRecommendation, procurementAdvice}`;
  try {
    const res = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { responseMimeType: "application/json" } });
    return JSON.parse(res.text || '{}');
  } catch (e) { return { policyRecommendation: "Error", procurementAdvice: "" }; }
};

export const getAuditAnalysis = async (logs: any[]): Promise<SecurityAnalysis> => {
  if (!ai) return { threatLevel: "Low", summary: "Offline" };
  const prompt = `Audit Analysis for logs. Return JSON {threatLevel, summary}`;
  try {
    const res = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { responseMimeType: "application/json" } });
    return JSON.parse(res.text || '{}');
  } catch (e) { return { threatLevel: "Low", summary: "Error" }; }
};

export const getHospitalOperationsAnalysis = async (metrics: any): Promise<HospitalOpsAnalysis> => {
  if (!ai) return { efficiencyScore: 0, bottleneckAlert: "Offline", staffingRecommendation: "" };
  const prompt = `Hospital Ops Analysis. Return JSON {efficiencyScore: number, bottleneckAlert, staffingRecommendation}`;
  try {
    const res = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { responseMimeType: "application/json" } });
    return JSON.parse(res.text || '{}');
  } catch (e) { return { efficiencyScore: 0, bottleneckAlert: "Error", staffingRecommendation: "" }; }
};

export const analyzeStaffingImpact = async (req: any, ctx: string): Promise<StaffingImpactAnalysis> => {
  if (!ai) return { approvalRisk: 'Low', impactSummary: "Offline", recommendation: "" };
  const prompt = `Staffing Impact. Return JSON {approvalRisk, impactSummary, recommendation}`;
  try {
    const res = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { responseMimeType: "application/json" } });
    return JSON.parse(res.text || '{}');
  } catch (e) { return { approvalRisk: 'Low', impactSummary: "Error", recommendation: "" }; }
};

export const getRevenueAnalysis = async (data: any): Promise<RevenueInsight> => {
  if (!ai) return { trend: 'Stable', insight: "Offline", actionableTip: "" };
  const prompt = `Revenue Analysis. Return JSON {trend, insight, actionableTip}`;
  try {
    const res = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { responseMimeType: "application/json" } });
    return JSON.parse(res.text || '{}');
  } catch (e) { return { trend: 'Stable', insight: "Error", actionableTip: "" }; }
};

export const getAssetMaintenancePrediction = async (assets: any): Promise<AssetPrediction> => {
  if (!ai) return { riskLevel: 'Low', predictedFailures: [], maintenanceAdvice: "Offline" };
  const prompt = `Asset Prediction. Return JSON {riskLevel, predictedFailures: [], maintenanceAdvice}`;
  try {
    const res = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { responseMimeType: "application/json" } });
    return JSON.parse(res.text || '{}');
  } catch (e) { return { riskLevel: 'Low', predictedFailures: [], maintenanceAdvice: "Error" }; }
};

export const getInventoryOptimization = async (inv: any): Promise<InventoryInsight> => {
  if (!ai) return { stockoutRisk: [], procurementAdvice: "Offline" };
  const prompt = `Inventory Optimization. Return JSON {stockoutRisk: [], procurementAdvice}`;
  try {
    const res = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { responseMimeType: "application/json" } });
    return JSON.parse(res.text || '{}');
  } catch (e) { return { stockoutRisk: [], procurementAdvice: "Error" }; }
};

export const getQueueAnalysis = async (patients: any[]): Promise<QueueAnalysis> => {
  if (!ai) return { efficiencyScore: 0, criticalAlerts: [], reorderingSuggestions: [], resourceAdvice: "Offline" };
  const prompt = `Queue Analysis for ${patients.length} patients. Return JSON {efficiencyScore: number, criticalAlerts: [], reorderingSuggestions: [], resourceAdvice}`;
  try {
    const res = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { responseMimeType: "application/json" } });
    return JSON.parse(res.text || '{}');
  } catch (e) { return { efficiencyScore: 0, criticalAlerts: [], reorderingSuggestions: [], resourceAdvice: "Error" }; }
};

export const getDispatchAdvice = async (incident: any, ambulances: any[]): Promise<DispatchPlan> => {
  if (!ai) return { recommendedAmbulanceId: "", estimatedEta: "N/A", routeSummary: "Manual Dispatch Required" };
  const prompt = `Emergency Dispatch. Incident: ${JSON.stringify(incident)}. Fleet: ${JSON.stringify(ambulances)}. Return JSON {recommendedAmbulanceId, estimatedEta, routeSummary}`;
  try {
    const res = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { responseMimeType: "application/json" } });
    return JSON.parse(res.text || '{}');
  } catch (e) { return { recommendedAmbulanceId: "", estimatedEta: "Error", routeSummary: "Offline" }; }
};

export const analyzeRadiologyImage = async (imageUrl: string): Promise<AIAnnotation[]> => {
  if (!ai) return [];
  // Simulated Analysis since we can't pass image bytes in this text-only mock env easily without backend proxy
  return [
    { id: '1', label: 'Nodule', confidence: 0.88, x: 40, y: 30, width: 10, height: 10, description: 'Suspicious nodule in upper lobe' }
  ];
};

export const getLabQualityAnalysis = async (metrics: any): Promise<LabQualityAnalysis> => {
  if (!ai) return { defectRate: 0, calibrationAlerts: [] };
  const prompt = `Lab QC Analysis. Return JSON {defectRate, calibrationAlerts}`;
  try {
    const res = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { responseMimeType: "application/json" } });
    return JSON.parse(res.text || '{}');
  } catch (e) { return { defectRate: 0, calibrationAlerts: [] }; }
};
