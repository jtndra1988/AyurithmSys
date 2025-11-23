import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Patient, AIAnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getClinicalAssessment = async (patient: Patient, clinicalNotes?: string): Promise<AIAnalysisResult> => {
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

  // Schema definition for structured output
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
    const response = await ai.models.generateContent({
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
    // Fallback if AI fails
    return {
      summary: "AI Service temporarily unavailable. Please rely on clinical judgment.",
      differentialDiagnosis: [],
      recommendedLabs: [],
      treatmentPlan: "Consult standard protocols.",
      riskAssessment: "Unknown"
    };
  }
};

export const getTelemedicineSummary = async (transcript: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Summarize this medical consultation transcript into a professional clinical note (SOAP format):\n\n${transcript}`,
    });
    return response.text || "Could not generate summary.";
  } catch (error) {
    console.error(error);
    return "Error generating summary.";
  }
};