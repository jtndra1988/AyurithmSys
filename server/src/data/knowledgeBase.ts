
export interface KnowledgeDoc {
  id: string;
  category: 'Protocol' | 'Drug Info' | 'Policy' | 'Triage';
  title: string;
  content: string;
  tags: string[];
}

export const AP_HEALTH_KNOWLEDGE_BASE: KnowledgeDoc[] = [
  {
    id: 'PROTO-001',
    category: 'Protocol',
    title: 'Management of Severe Anemia in Pregnancy (AP-AMB)',
    content: 'In Andhra Pradesh, all pregnant women with Hemoglobin < 7 g/dL in the 3rd trimester must be referred to a District Hospital or Teaching Hospital immediately. Do not attempt to manage at PHC level unless emergency transfusion is available. IV Iron Sucrose is the first line for Hb 7-9 g/dL.',
    tags: ['maternal', 'anemia', 'pregnancy', 'referral', 'protocol']
  },
  {
    id: 'PROTO-002',
    category: 'Protocol',
    title: 'Tribal Malaria Treatment Guidelines (Araku/Paderu)',
    content: 'For P. falciparum malaria in tribal agency areas (ASR District), Artemisinin-based Combination Therapy (ACT) is mandatory. Oral Artesunate + Sulfadoxine-Pyrimethamine (AS+SP) is the first line. If the patient is unconscious (Cerebral Malaria), start IV Artesunate immediately before transport. Do not wait for confirmatory lab results if clinical suspicion is high in endemic zones.',
    tags: ['malaria', 'tribal', 'infectious', 'fever', 'protocol']
  },
  {
    id: 'PROTO-003',
    category: 'Triage',
    title: 'Dengue Fever Discharge Criteria',
    content: 'A patient with Dengue can be discharged only if: 1) Afebrile for 24 hours without antipyretics. 2) Platelet count > 20,000/mcL and rising trend observed. 3) Hematocrit stable. 4) Good oral intake. warning: Do not discharge if there is any sign of plasma leakage (Ascites/Pleural Effusion).',
    tags: ['dengue', 'discharge', 'platelets', 'protocol']
  },
  {
    id: 'PROTO-004',
    category: 'Policy',
    title: 'Sickle Cell Screening Policy (ASR/Parvathipuram)',
    content: 'All antenatal women and children presenting with unexplained joint pain or anemia in ASR and Parvathipuram Manyam districts must undergo Solubility Test. If positive, confirm with HPLC/Electrophoresis. Provide Folic Acid 5mg daily to all Sickle Cell Disease patients.',
    tags: ['sickle cell', 'genetic', 'screening', 'tribal', 'policy']
  },
  {
    id: 'DRUG-001',
    category: 'Drug Info',
    title: 'Snake Bite Protocol (Polyvalent Anti-Snake Venom)',
    content: 'Administer 10 vials of ASV immediately for neurotoxic or hemotoxic bite symptoms. Repeat dose after 6 hours if coagulation profile does not normalize. Do not perform skin sensitivity test for ASV. Epinephrine must be ready for anaphylaxis.',
    tags: ['snake bite', 'emergency', 'drug', 'asv']
  }
];
