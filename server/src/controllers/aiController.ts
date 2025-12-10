
import { Request, Response } from 'express';
import { retrieveContext, generateRAGResponse } from '../services/ragService';

export const handleClinicalQuery = async (req: Request, res: Response) => {
  try {
    const { query, patientContext } = (req as any).body;
    
    // 1. Retrieve Relevant Docs
    const relevantDocs = await retrieveContext(query);
    
    // 2. Construct Context String
    const contextString = relevantDocs.map(d => `[${d.category}] ${d.title}: ${d.content}`).join('\n\n');
    
    // 3. Generate Answer
    const answer = await generateRAGResponse(
      `Patient Context: ${JSON.stringify(patientContext)}. Question: ${query}`, 
      contextString
    );

    (res as any).json({
      answer,
      grounding: relevantDocs.map(d => ({ title: d.title, category: d.category }))
    });

  } catch (error) {
    console.error("RAG Controller Error:", error);
    (res as any).status(500).json({ error: "AI Service Failed" });
  }
};
