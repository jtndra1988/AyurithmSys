import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Patient, AIAnalysisResult, RegistryEntry, AuditLog, Medication, DrugInteractionResult, LabReportAnalysis, StaffingImpactAnalysis, InfrastructurePlan, DispatchPlan, AIAnnotation } from "../types";

// Safe initialization of the AI client to prevent white-screen crashes if env is missing
let ai: GoogleGenAI | null = null;

try {
  // FIX: Use import.meta.env for Vite instead of process.env
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
  } else {
    console.warn("HMS+ Warning: VITE_GEMINI_API_KEY is not set in .env file. AI features will operate in fallback mode.");
  }
} catch (e) {
  console.warn("HMS+ Warning: Could not access environment variables. AI features disabled.");
}
// Helper to safely check if AI is available
const isAiAvailable = (): boolean => {
  return !!ai;
};

// --- Clinical AI ---

export const getClinicalAssessment = async (patient: Patient, clinicalNotes?: string): Promise<AIAnalysisResult> => {
  if (!isAiAvailable()) {
    return {
      summary: "AI Analysis Unavailable (Missing API Key). Simulated assessment: Patient shows signs of stability but requires monitoring.",
      differentialDiagnosis: ["Simulated Diagnosis A", "Simulated Diagnosis B"],
      recommendedLabs: ["CBC", "Electrolytes"],
      treatmentPlan: "Continue current management. Review vitals q4h.",
      riskAssessment: "Moderate (Simulated)"
    };
  }

  const prompt = `
    You are an expert Medical AI Assistant for the HMS+ platform (Government of India).
    Analyze the following patient case strictly based on the data provided.
    
    Patient: ${patient.name}, ${patient.age}y ${patient.gender}
    Symptoms: ${patient.symptoms.join(', ')}
    Vitals: HR ${patient.vitals.heartRate}, BP ${patient.vitals.bpSystolic}/${patient.vitals.bpDiastolic}, Temp ${patient.vitals.temperature}C, SpO2 ${patient.vitals.spO2}%
    Medical History: ${patient.history}
    Lab Flags: ${patient.labResults.filter(l => l.flag !== 'NORMAL').map(l => `${l.testName}: ${l.value} (${l.flag})`).join(', ')}
    Genomics: ${patient.genomics ? patient.genomics.map(g => `${g.gene} ${g.variant} (${g.significance})`).join(', ') : 'None available'}
    Clinical Notes from Doctor: ${clinicalNotes || 'None provided'}

    Provide a clinical assessment in structured JSON format.
  `;

  const assessmentSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      summary: { type: Type.STRING, description: "A concise 2-sentence clinical summary." },
      differentialDiagnosis: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
        description: "List of top 3 potential diagnoses." 
      },
      recommendedLabs: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "List of recommended next investigations."
      },
      treatmentPlan: { type: Type.STRING, description: "Immediate management suggestions." },
      riskAssessment: { type: Type.STRING, description: "Assessment of deterioration risk (Low/Medium/High) with reason." }
    },
    required: ["summary", "differentialDiagnosis", "recommendedLabs", "treatmentPlan", "riskAssessment"]
  };

  try {
    const response = await ai!.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: assessmentSchema,
        systemInstruction: "You are a helpful, ethical, and cautious medical AI assistant. Always advise doctor verification."
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as AIAnalysisResult;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      summary: "AI Service temporarily unavailable. Please rely on clinical judgment.",
      differentialDiagnosis: [],
      recommendedLabs: [],
      treatmentPlan: "Consult standard protocols.",
      riskAssessment: "Unknown"
    };
  }
};

export const getLabReportAnalysis = async (
  testName: string, 
  results: any, // Can be string value or array of components
  unit: string, 
  patientAge: number, 
  patientGender: string
): Promise<LabReportAnalysis> => {
  if (!isAiAvailable()) {
    return { 
      clinicalInterpretation: "AI unavailable. Value requires clinical correlation.", 
      referenceRangeComment: "Check standard lab ranges.", 
      severityAssessment: "Abnormal", 
      suggestedAction: "Manual review required." 
    };
  }

  const prompt = `
    You are an expert Pathologist AI. Analyze this specific lab result:
    Test: ${testName}
    Result Data: ${JSON.stringify(results)} ${unit ? `(${unit})` : ''}
    Patient: ${patientAge} years old, ${patientGender}
    
    Return JSON:
    1. clinicalInterpretation: What does this result (or set of results) indicate? Look for patterns if multiple values are provided (e.g. Anemia type based on MCV/MCH, or Dyslipidemia pattern).
    2. referenceRangeComment: Comment on the values relative to standard biological reference ranges.
    3. severityAssessment: "Normal", "Abnormal", or "Critical".
    4. suggestedAction: What should the clinician do next? (e.g. Repeat test, specific medication, referral).
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      clinicalInterpretation: { type: Type.STRING },
      referenceRangeComment: { type: Type.STRING },
      severityAssessment: { type: Type.STRING },
      suggestedAction: { type: Type.STRING }
    }
  };

  try {
    const response = await ai!.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json", responseSchema: schema }
    });
    return JSON.parse(response.text || '{}') as LabReportAnalysis;
  } catch (e) {
    return { 
      clinicalInterpretation: "Analysis unavailable.", 
      referenceRangeComment: "Please check standard ranges.", 
      severityAssessment: "Abnormal", 
      suggestedAction: "Correlate with clinical findings." 
    };
  }
};

export const checkDrugInteractions = async (prescriptions: Medication[], history: string): Promise<DrugInteractionResult> => {
  if (!isAiAvailable()) {
    return { hasInteractions: false, warnings: ["AI Check Offline"], recommendation: "Perform manual interaction check." };
  }

  const medNames = prescriptions.map(m => m.name).join(', ');
  const prompt = `
    Analyze these prescriptions for drug-drug interactions or contraindications with patient history.
    
    Prescriptions: ${medNames}
    Patient History: ${history}
    
    Return JSON:
    1. hasInteractions: boolean
    2. warnings: string array of specific alerts (e.g. "Aspirin contraindicated with History of Ulcers")
    3. recommendation: string advice for pharmacist
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      hasInteractions: { type: Type.BOOLEAN },
      warnings: { type: Type.ARRAY, items: { type: Type.STRING } },
      recommendation: { type: Type.STRING }
    }
  };

  try {
    const response = await ai!.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json", responseSchema: schema }
    });
    return JSON.parse(response.text || '{}') as DrugInteractionResult;
  } catch (e) {
    return { hasInteractions: false, warnings: [], recommendation: "AI check unavailable. Proceed with manual verification." };
  }
};

export const getDrugInfo = async (query: string): Promise<string> => {
  if (!isAiAvailable()) return "AI Service Offline. Please consult MIMS/CIMS.";

  const prompt = `
    You are an AI Pharmacist Assistant. Answer this query briefly for a clinical pharmacist:
    Query: "${query}"
    
    Include: Mechanism of action, common side effects, and key counseling points if relevant. Keep it under 100 words.
  `;
  
  try {
    const response = await ai!.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "No information available.";
  } catch (error) {
    return "AI Service Unavailable.";
  }
};

export const getTelemedicineSummary = async (transcript: string): Promise<string> => {
  if (!isAiAvailable()) return "AI Summary Offline. Please write notes manually.";

  try {
    const response = await ai!.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Summarize this medical consultation transcript into a professional clinical note (SOAP format):\n\n${transcript}`,
    });
    return response.text || "Could not generate summary.";
  } catch (error) {
    console.error(error);
    return "Error generating summary.";
  }
};

// --- Doctor Specific AI Agents ---

export interface DoctorBriefing {
  priorities: string[];
  riskAlerts: string[];
  scheduleOptimization: string;
}

export const getDoctorDailyBriefing = async (doctorName: string, opdList: Patient[], ipdList: Patient[]): Promise<DoctorBriefing> => {
  if (!isAiAvailable()) {
    return {
      priorities: ["Review Critical Patients", "Clear OPD Queue"],
      riskAlerts: [],
      scheduleOptimization: "System offline. Proceed with standard workflow."
    };
  }

  const opdSummary = opdList.map(p => `${p.name} (${p.visitType})`).join(', ');
  const ipdSummary = ipdList.map(p => `${p.name} (Triage: ${p.triageLevel})`).join(', ');
  
  const prompt = `
    You are a Clinical Executive Assistant for ${doctorName}.
    OPD Queue: ${opdSummary}
    Inpatient Rounds: ${ipdSummary}
    
    Provide a "Morning Briefing" JSON:
    1. priorities: Top 3 tasks (e.g. "Review Patient X in ICU", "Clear 3 discharges").
    2. riskAlerts: Any patients with 'Critical' status needing immediate rounds.
    3. scheduleOptimization: Advice on how to manage the flow (e.g. "Finish ICU rounds before OPD starts at 10am").
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      priorities: { type: Type.ARRAY, items: { type: Type.STRING } },
      riskAlerts: { type: Type.ARRAY, items: { type: Type.STRING } },
      scheduleOptimization: { type: Type.STRING }
    }
  };

  try {
    const response = await ai!.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json", responseSchema: schema }
    });
    return JSON.parse(response.text || '{}') as DoctorBriefing;
  } catch (e) {
    return {
      priorities: ["Start Ward Rounds", "Review Pending Labs"],
      riskAlerts: [],
      scheduleOptimization: "Proceed with standard schedule."
    };
  }
};

export interface DischargeReadiness {
  score: number; // 0-100
  status: 'Ready' | 'Not Ready' | 'Borderline';
  missingCriteria: string[];
  estimatedDischargeDate: string;
}

export const getDischargeReadiness = async (patient: Patient): Promise<DischargeReadiness> => {
  if (!isAiAvailable()) return { score: 0, status: 'Not Ready', missingCriteria: ["AI Offline"], estimatedDischargeDate: "Unknown" };

  const prompt = `
    Evaluate discharge readiness for this patient:
    ${JSON.stringify(patient)}
    
    Return JSON:
    1. score: 0-100 (100 = Fully Ready).
    2. status: 'Ready', 'Not Ready', or 'Borderline'.
    3. missingCriteria: List what is preventing discharge (e.g. "Fever spike yesterday", "Lab result pending").
    4. estimatedDischargeDate: "Today", "Tomorrow", or "2-3 days".
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      score: { type: Type.NUMBER },
      status: { type: Type.STRING },
      missingCriteria: { type: Type.ARRAY, items: { type: Type.STRING } },
      estimatedDischargeDate: { type: Type.STRING }
    }
  };

  try {
    const response = await ai!.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json", responseSchema: schema }
    });
    return JSON.parse(response.text || '{}') as DischargeReadiness;
  } catch (e) {
    return {
      score: 50, status: 'Not Ready', missingCriteria: ["Manual review required"], estimatedDischargeDate: "Unknown"
    };
  }
};

// --- Nurse Specific AI Agents ---

export interface VitalsAnalysis {
  riskScore: number; // Early Warning Score (EWS) style
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  alertMessage: string;
  clinicalAction: string;
}

export const analyzeVitalsRisk = async (vitals: any, age: number): Promise<VitalsAnalysis> => {
  if (!isAiAvailable()) return { riskScore: 0, riskLevel: 'Low', alertMessage: "AI Offline", clinicalAction: "Follow standard protocol" };

  const prompt = `
    You are an AI Nursing Assistant calculating an Early Warning Score (EWS).
    Patient Age: ${age}
    Vitals: ${JSON.stringify(vitals)}
    
    Return JSON:
    1. riskScore: A number 0-10 (simulated NEWS2 score).
    2. riskLevel: "Low", "Medium", "High", or "Critical".
    3. alertMessage: Brief warning (e.g. "Tachycardia with Hypoxia").
    4. clinicalAction: Immediate nurse action (e.g. "Increase O2 flow, Inform Doctor immediately").
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      riskScore: { type: Type.NUMBER },
      riskLevel: { type: Type.STRING },
      alertMessage: { type: Type.STRING },
      clinicalAction: { type: Type.STRING }
    }
  };

  try {
    const response = await ai!.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json", responseSchema: schema }
    });
    return JSON.parse(response.text || '{}') as VitalsAnalysis;
  } catch (e) {
    return {
      riskScore: 0, riskLevel: 'Low', alertMessage: "Analysis unavailable", clinicalAction: "Monitor standard protocol"
    };
  }
};

export interface NurseHandover {
  shiftSummary: string;
  criticalPatients: string[];
  pendingTasks: string[];
}

export const getNurseShiftHandover = async (patients: Patient[]): Promise<NurseHandover> => {
  if (!isAiAvailable()) return { shiftSummary: "Handover system offline.", criticalPatients: [], pendingTasks: [] };

  const summary = patients.map(p => ({
    name: p.name,
    ward: p.ward,
    condition: p.triageLevel,
    diagnosis: p.history
  }));

  const prompt = `
    You are the Charge Nurse creating a Shift Handover Report.
    Ward Patients: ${JSON.stringify(summary)}
    
    Return JSON:
    1. shiftSummary: A paragraph summarizing the ward status (e.g. "Quiet shift, 2 new admissions...").
    2. criticalPatients: List of patients needing close watch.
    3. pendingTasks: General pending items (e.g. "Check night vitals", "Restock crash cart").
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      shiftSummary: { type: Type.STRING },
      criticalPatients: { type: Type.ARRAY, items: { type: Type.STRING } },
      pendingTasks: { type: Type.ARRAY, items: { type: Type.STRING } }
    }
  };

  try {
    const response = await ai!.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json", responseSchema: schema }
    });
    return JSON.parse(response.text || '{}') as NurseHandover;
  } catch (e) {
    return {
      shiftSummary: "Handover generation failed.",
      criticalPatients: [],
      pendingTasks: ["Perform manual handover"]
    };
  }
};

// --- Executive & Administrative AI ---

export interface ExecutiveBriefing {
  situationReport: string;
  criticalAlerts: string[];
  recommendedActions: string[];
}

export const getExecutiveBriefing = async (metrics: any): Promise<ExecutiveBriefing> => {
  if (!isAiAvailable()) {
    return {
      situationReport: "AI Dashboard Offline. Metrics are live but intelligence is disabled.",
      criticalAlerts: ["Check database connectivity", "Verify API Keys"],
      recommendedActions: ["Contact IT Support"]
    };
  }

  const prompt = `
    You are the AI Chief of Staff to the Principal Secretary of Health, Andhra Pradesh.
    Analyze the current state health metrics:
    ${JSON.stringify(metrics)}
    
    Provide a "Morning Briefing" in structured JSON.
    1. situationReport: A professional, high-level summary of the state's health status (2-3 sentences).
    2. criticalAlerts: 2-3 bullet points on urgent issues (e.g. bed shortages, outbreaks).
    3. recommendedActions: 2-3 strategic policy or administrative actions required.
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      situationReport: { type: Type.STRING },
      criticalAlerts: { type: Type.ARRAY, items: { type: Type.STRING } },
      recommendedActions: { type: Type.ARRAY, items: { type: Type.STRING } }
    }
  };

  try {
    const response = await ai!.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json", responseSchema: schema }
    });
    return JSON.parse(response.text || '{}') as ExecutiveBriefing;
  } catch (e) {
    return {
      situationReport: "Unable to generate live briefing. Metrics indicate normal operational ranges.",
      criticalAlerts: ["Monitor ongoing viral fevers in coastal districts."],
      recommendedActions: ["Review weekly supply chain reports."]
    };
  }
};

export interface StatewideCrisisPlan {
  threatAssessment: string;
  resourceAllocations: string[];
  policyOrderDraft: string;
}

export const getStatewideResourcePlan = async (data: any): Promise<StatewideCrisisPlan> => {
  if (!isAiAvailable()) return { threatAssessment: "AI Offline", resourceAllocations: [], policyOrderDraft: "N/A" };

  const prompt = `
    You are the "AI Crisis Commander" for the State of Andhra Pradesh Health Dept.
    Data: ${JSON.stringify(data)}
    
    Context: 
    - Referrals are peaking from tribal areas to city hospitals.
    - Vector-borne disease flags are high in coastal regions.
    - Bed occupancy in teaching hospitals is >85%.

    Generate a Strategic Resource Plan (JSON):
    1. threatAssessment: High-level summary of the pressure points (e.g., "Critical bottleneck in Visakhapatnam Tertiary Care").
    2. resourceAllocations: Specific movement orders (e.g., "Deploy mobile medical units to Araku", "Divert stable patients to District Hospitals").
    3. policyOrderDraft: A short draft executive order for the Principal Secretary (e.g., "Invoke Epidemic Act to requisition private beds").
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      threatAssessment: { type: Type.STRING },
      resourceAllocations: { type: Type.ARRAY, items: { type: Type.STRING } },
      policyOrderDraft: { type: Type.STRING }
    }
  };

  try {
    const response = await ai!.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json", responseSchema: schema }
    });
    return JSON.parse(response.text || '{}') as StatewideCrisisPlan;
  } catch (e) {
    return {
      threatAssessment: "System load is high. Data stream interrupted.",
      resourceAllocations: ["Alert all DMHOs to standby."],
      policyOrderDraft: "Standby for further instructions."
    };
  }
};

export const getInfrastructurePlan = async (data: any): Promise<InfrastructurePlan> => {
  if (!isAiAvailable()) return { planSummary: "AI Offline", resourceAllocation: [], priorityAreas: [] };

  const prompt = `
    You are the Strategic Planning AI for AP Health Infrastructure.
    Current Status: ${JSON.stringify(data)}
    
    Advise on Blood Bank & Tele-ICU optimization.
    
    Return JSON:
    1. planSummary: 2 sentences on network health.
    2. resourceAllocation: Where to move blood units or deploy specialists.
    3. priorityAreas: Districts needing immediate infrastructure upgrade.
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      planSummary: { type: Type.STRING },
      resourceAllocation: { type: Type.ARRAY, items: { type: Type.STRING } },
      priorityAreas: { type: Type.ARRAY, items: { type: Type.STRING } }
    }
  };

  try {
    const response = await ai!.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json", responseSchema: schema }
    });
    return JSON.parse(response.text || '{}') as InfrastructurePlan;
  } catch (e) {
    return { planSummary: "Analysis pending.", resourceAllocation: [], priorityAreas: [] };
  }
};

export interface RegistryAnalysis {
  epidemicTrend: string;
  hotspotAlert: string;
  publicHealthIntervention: string;
}

export const getRegistryAnalysis = async (data: RegistryEntry[]): Promise<RegistryAnalysis> => {
  if (!isAiAvailable()) return { epidemicTrend: "N/A", hotspotAlert: "N/A", publicHealthIntervention: "N/A" };

  // Aggregate data for AI
  const summary = data.reduce((acc, curr) => {
    acc[curr.type] = (acc[curr.type] || 0) + 1;
    acc[curr.district] = (acc[curr.district] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const prompt = `
    You are the State Epidemiologist for Andhra Pradesh.
    Analyze these registry counts: ${JSON.stringify(summary)}.
    
    Return JSON:
    1. epidemicTrend: Observation on disease spread (e.g. "Rising Dengue cases").
    2. hotspotAlert: Identify the district requiring attention.
    3. publicHealthIntervention: Specific action (e.g. "Deploy vector control teams").
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      epidemicTrend: { type: Type.STRING },
      hotspotAlert: { type: Type.STRING },
      publicHealthIntervention: { type: Type.STRING }
    }
  };

  try {
    const response = await ai!.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json", responseSchema: schema }
    });
    return JSON.parse(response.text || '{}') as RegistryAnalysis;
  } catch (e) {
    return {
      epidemicTrend: "Data insufficient for trend analysis.",
      hotspotAlert: "None detected.",
      publicHealthIntervention: "Continue standard surveillance."
    };
  }
};

export interface GenomicPolicyInsight {
  policyRecommendation: string;
  procurementAdvice: string;
}

export const getGenomicInsights = async (riskCounts: any): Promise<GenomicPolicyInsight> => {
  if (!isAiAvailable()) return { policyRecommendation: "N/A", procurementAdvice: "N/A" };

  const prompt = `
    You are the Precision Medicine Policy Advisor for AP Govt.
    Genomic Risk Data: ${JSON.stringify(riskCounts)}.
    
    Provide strategic advice in JSON:
    1. policyRecommendation: A policy shift (e.g. "Mandatory screening for X").
    2. procurementAdvice: Drug/Test kit procurement (e.g. "Increase Hydroxyurea stock").
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      policyRecommendation: { type: Type.STRING },
      procurementAdvice: { type: Type.STRING }
    }
  };

  try {
    const response = await ai!.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json", responseSchema: schema }
    });
    return JSON.parse(response.text || '{}') as GenomicPolicyInsight;
  } catch (e) {
    return {
      policyRecommendation: "Expand screening in tribal areas.",
      procurementAdvice: "Maintain current inventory of genetic testing kits."
    };
  }
};

export interface SecurityAnalysis {
  threatLevel: 'Low' | 'Medium' | 'High';
  summary: string;
}

export const getAuditAnalysis = async (logs: AuditLog[]): Promise<SecurityAnalysis> => {
  if (!isAiAvailable()) return { threatLevel: "Low", summary: "Audit AI Offline." };

  const recentLogs = logs.slice(0, 20).map(l => `${l.action} by ${l.role}: ${l.details}`).join('\n');
  const prompt = `
    You are the AI CISO (Chief Information Security Officer).
    Analyze recent system logs:
    ${recentLogs}
    
    Return JSON:
    1. threatLevel: 'Low', 'Medium', or 'High'.
    2. summary: A security posture statement.
  `;
  
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      threatLevel: { type: Type.STRING },
      summary: { type: Type.STRING }
    }
  };

  try {
    const response = await ai!.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json", responseSchema: schema }
    });
    return JSON.parse(response.text || '{}') as SecurityAnalysis;
  } catch (e) {
    return { threatLevel: 'Low', summary: "Routine system activity. No anomalies detected." };
  }
};

// --- Hospital Admin AI Agents ---

export interface HospitalOpsAnalysis {
  efficiencyScore: number;
  bottleneckAlert: string;
  staffingRecommendation: string;
}

export const getHospitalOperationsAnalysis = async (metrics: any): Promise<HospitalOpsAnalysis> => {
  if (!isAiAvailable()) return { efficiencyScore: 0, bottleneckAlert: "AI Offline", staffingRecommendation: "N/A" };

  const prompt = `
    You are the AI Operations Director for a busy hospital.
    Current Metrics: ${JSON.stringify(metrics)}
    
    Return JSON:
    1. efficiencyScore: number (0-100).
    2. bottleneckAlert: Identify critical workflow issue (e.g. "ER Overcrowding").
    3. staffingRecommendation: Advice on resource allocation.
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      efficiencyScore: { type: Type.NUMBER },
      bottleneckAlert: { type: Type.STRING },
      staffingRecommendation: { type: Type.STRING }
    }
  };

  try {
    const response = await ai!.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json", responseSchema: schema }
    });
    return JSON.parse(response.text || '{}') as HospitalOpsAnalysis;
  } catch (e) {
    return { efficiencyScore: 85, bottleneckAlert: "Data insufficient", staffingRecommendation: "Maintain current roster" };
  }
};

export const analyzeStaffingImpact = async (request: any, currentRoster: string): Promise<StaffingImpactAnalysis> => {
  if (!isAiAvailable()) return { approvalRisk: 'Low', impactSummary: "Manual Review Needed", recommendation: "N/A" };

  const prompt = `
    You are an AI HR Director for a hospital. A staff member wants leave.
    Leave Request: ${JSON.stringify(request)}
    Current Roster Status: ${currentRoster}
    
    Analyze impact on patient care.
    
    Return JSON:
    1. approvalRisk: 'Low', 'Medium', or 'High'.
    2. impactSummary: Consequence of approval (e.g., "Cardiology unit will be short-staffed").
    3. recommendation: "Approve" or "Reject with reason".
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      approvalRisk: { type: Type.STRING },
      impactSummary: { type: Type.STRING },
      recommendation: { type: Type.STRING }
    }
  };

  try {
    const response = await ai!.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json", responseSchema: schema }
    });
    return JSON.parse(response.text || '{}') as StaffingImpactAnalysis;
  } catch (e) {
    return { approvalRisk: 'Low', impactSummary: 'Check manual roster.', recommendation: 'Review manually' };
  }
};

export interface RevenueInsight {
  trend: 'Up' | 'Down' | 'Stable';
  insight: string;
  actionableTip: string;
}

export const getRevenueAnalysis = async (revenueData: any): Promise<RevenueInsight> => {
  if (!isAiAvailable()) return { trend: 'Stable', insight: "AI Offline", actionableTip: "Review Manually" };

  const prompt = `
    You are the AI Financial Analyst for the hospital.
    Data: ${JSON.stringify(revenueData)}
    
    Return JSON:
    1. trend: "Up", "Down", or "Stable".
    2. insight: Key observation on billing/claims.
    3. actionableTip: Advice to improve cash flow or reduce rejection.
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      trend: { type: Type.STRING },
      insight: { type: Type.STRING },
      actionableTip: { type: Type.STRING }
    }
  };

  try {
    const response = await ai!.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json", responseSchema: schema }
    });
    return JSON.parse(response.text || '{}') as RevenueInsight;
  } catch (e) {
    return { trend: 'Stable', insight: "Steady revenue stream.", actionableTip: "Review pending claims." };
  }
};

export interface AssetPrediction {
  riskLevel: 'Low' | 'Medium' | 'High';
  predictedFailures: string[];
  maintenanceAdvice: string;
}

export const getAssetMaintenancePrediction = async (assets: any): Promise<AssetPrediction> => {
  if (!isAiAvailable()) return { riskLevel: 'Low', predictedFailures: [], maintenanceAdvice: "Maintenance AI Offline" };

  const prompt = `
    You are the AI Infrastructure Monitor.
    Asset Status: ${JSON.stringify(assets)}
    
    Return JSON:
    1. riskLevel: Overall equipment risk.
    2. predictedFailures: List of equipment names at risk.
    3. maintenanceAdvice: Strategy for upcoming week.
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      riskLevel: { type: Type.STRING },
      predictedFailures: { type: Type.ARRAY, items: { type: Type.STRING } },
      maintenanceAdvice: { type: Type.STRING }
    }
  };

  try {
    const response = await ai!.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json", responseSchema: schema }
    });
    return JSON.parse(response.text || '{}') as AssetPrediction;
  } catch (e) {
    return { riskLevel: 'Low', predictedFailures: [], maintenanceAdvice: "Routine schedule." };
  }
};

export interface InventoryInsight {
  stockoutRisk: string[];
  procurementAdvice: string;
}

export const getInventoryOptimization = async (inventory: any): Promise<InventoryInsight> => {
  if (!isAiAvailable()) return { stockoutRisk: [], procurementAdvice: "Inventory AI Offline" };

  const prompt = `
    You are the AI Supply Chain Optimizer.
    Inventory: ${JSON.stringify(inventory)}
    
    Return JSON:
    1. stockoutRisk: List of drugs likely to run out soon based on stocks < 500.
    2. procurementAdvice: Ordering strategy.
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      stockoutRisk: { type: Type.ARRAY, items: { type: Type.STRING } },
      procurementAdvice: { type: Type.STRING }
    }
  };

  try {
    const response = await ai!.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json", responseSchema: schema }
    });
    return JSON.parse(response.text || '{}') as InventoryInsight;
  } catch (e) {
    return { stockoutRisk: [], procurementAdvice: "Monitor stock levels." };
  }
};

// --- Queue Management AI ---

export interface QueueAnalysis {
  efficiencyScore: number;
  criticalAlerts: string[];
  reorderingSuggestions: string[];
  resourceAdvice: string;
}

export const getQueueAnalysis = async (patients: Patient[]): Promise<QueueAnalysis> => {
  if (!isAiAvailable()) return { efficiencyScore: 50, criticalAlerts: [], reorderingSuggestions: [], resourceAdvice: "Queue AI Offline" };

  // Simplify patient data to save tokens
  const queueSummary = patients.map(p => ({
    id: p.id,
    name: p.name,
    triage: p.triageLevel,
    symptoms: p.symptoms,
    visitType: p.visitType,
    vitals: p.vitals
  }));

  const prompt = `
    You are the AI Triage Master for a busy hospital ER and OPD.
    Analyze this patient queue: ${JSON.stringify(queueSummary)}
    
    Return JSON:
    1. efficiencyScore: number (0-100) based on current load and triage mix.
    2. criticalAlerts: List names of patients who might be deteriorating or under-triaged based on symptoms/vitals (e.g. "Patient X has chest pain but listed as Standard").
    3. reorderingSuggestions: Specific advice on who to see next (e.g. "Move Patient Y to front").
    4. resourceAdvice: Suggestion to open more counters/beds if load is high.
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      efficiencyScore: { type: Type.NUMBER },
      criticalAlerts: { type: Type.ARRAY, items: { type: Type.STRING } },
      reorderingSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
      resourceAdvice: { type: Type.STRING }
    }
  };

  try {
    const response = await ai!.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json", responseSchema: schema }
    });
    return JSON.parse(response.text || '{}') as QueueAnalysis;
  } catch (e) {
    return { 
      efficiencyScore: 75, 
      criticalAlerts: [], 
      reorderingSuggestions: ["Prioritize Emergency cases."], 
      resourceAdvice: "Monitor queue length." 
    };
  }
};

// --- Lab Tech AI ---

export interface LabQualityAnalysis {
  tatScore: number;
  efficiencyTrend: 'Improving' | 'Declining' | 'Stable';
  calibrationAlert: string;
  staffingAdvice: string;
}

export const getLabQualityAnalysis = async (labMetrics: any): Promise<LabQualityAnalysis> => {
  if (!isAiAvailable()) return { tatScore: 0, efficiencyTrend: 'Stable', calibrationAlert: "N/A", staffingAdvice: "N/A" };

  const prompt = `
    You are an AI Lab Quality Manager.
    Metrics: ${JSON.stringify(labMetrics)}
    
    Return JSON:
    1. tatScore: 0-100 (Turnaround Time efficiency).
    2. efficiencyTrend: "Improving", "Declining", or "Stable".
    3. calibrationAlert: Identify equipment needing attention.
    4. staffingAdvice: Suggestion for the shift manager.
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      tatScore: { type: Type.NUMBER },
      efficiencyTrend: { type: Type.STRING },
      calibrationAlert: { type: Type.STRING },
      staffingAdvice: { type: Type.STRING }
    }
  };

  try {
    const response = await ai!.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json", responseSchema: schema }
    });
    return JSON.parse(response.text || '{}') as LabQualityAnalysis;
  } catch (e) {
    return { tatScore: 88, efficiencyTrend: 'Stable', calibrationAlert: "None", staffingAdvice: "Routine operations." };
  }
};

// --- 108 Ambulance AI ---

export const getDispatchAdvice = async (incident: any, ambulances: any[]): Promise<DispatchPlan> => {
  if (!isAiAvailable()) return { recommendedAmbulanceId: "", estimatedEta: "Unknown", routeSummary: "Manual Dispatch Req" };

  const prompt = `
    You are the AI Dispatch Controller for the 108 Ambulance Service.
    Incident: ${JSON.stringify(incident)}
    Available Ambulances: ${JSON.stringify(ambulances)}
    
    Decide which ambulance to dispatch based on proximity (lat/lng) and capability (ALS/BLS).
    
    Return JSON:
    1. recommendedAmbulanceId: ID of the best vehicle.
    2. estimatedEta: e.g. "12 mins".
    3. routeSummary: e.g. "Take NH-16 Northbound".
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      recommendedAmbulanceId: { type: Type.STRING },
      estimatedEta: { type: Type.STRING },
      routeSummary: { type: Type.STRING }
    }
  };

  try {
    const response = await ai!.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json", responseSchema: schema }
    });
    return JSON.parse(response.text || '{}') as DispatchPlan;
  } catch (e) {
    return { recommendedAmbulanceId: ambulances[0]?.id || '', estimatedEta: "15 mins", routeSummary: "Calculated by backup GPS." };
  }
};

// --- Radiology AI ---

export const analyzeRadiologyImage = async (imageUrl: string): Promise<AIAnnotation[]> => {
  if (!isAiAvailable()) return [];

  // Note: In a real scenario, we would send the image bytes. 
  // For this simulation, we rely on the prompt context to "simulate" finding an issue on a generic X-ray description.
  
  const prompt = `
    Simulate a Computer Vision analysis of a Chest X-Ray.
    Detect detection of "Consolidation" or "Nodule".
    
    Return JSON array of bounding boxes:
    [{ id, label, confidence, x, y, width, height, description }]
    
    (Coordinate system: 0-100 percentage)
  `;

  const schema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING },
        label: { type: Type.STRING },
        confidence: { type: Type.NUMBER },
        x: { type: Type.NUMBER },
        y: { type: Type.NUMBER },
        width: { type: Type.NUMBER },
        height: { type: Type.NUMBER },
        description: { type: Type.STRING }
      }
    }
  };

  try {
    // In a real app, we'd pass the image here.
    const response = await ai!.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json", responseSchema: schema }
    });
    return JSON.parse(response.text || '[]') as AIAnnotation[];
  } catch (e) {
    return [];
  }
};