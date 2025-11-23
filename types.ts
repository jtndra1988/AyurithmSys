
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN', // Govt Authority
  HOSPITAL_ADMIN = 'HOSPITAL_ADMIN',
  DOCTOR = 'DOCTOR',
  NURSE = 'NURSE',
  PHARMACIST = 'PHARMACIST',
  LAB_TECH = 'LAB_TECH',
  RADIOLOGIST = 'RADIOLOGIST',
  RECEPTIONIST = 'RECEPTIONIST',
}

export enum TriageLevel {
  CRITICAL = 'Critical', // Red
  URGENT = 'Urgent',     // Yellow
  STANDARD = 'Standard', // Green
}

export interface Vitals {
  heartRate: number;
  bpSystolic: number;
  bpDiastolic: number;
  temperature: number;
  spO2: number;
  respRate: number;
}

export interface LabResult {
  id: string;
  testName: string;
  value: string;
  unit: string;
  flag?: 'HIGH' | 'LOW' | 'NORMAL' | 'CRITICAL';
  date: string;
  status: 'PENDING' | 'COMPLETED';
}

export interface GenomicMarker {
  gene: string;
  variant: string;
  significance: string;
  pharmacogenomics: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  status: 'ACTIVE' | 'DISCONTINUED' | 'PENDING_DISPENSE';
}

export interface Patient {
  id: string;
  abhaId: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  admissionDate: string;
  symptoms: string[];
  vitals: Vitals;
  history: string;
  labResults: LabResult[];
  medications?: Medication[];
  genomics?: GenomicMarker[];
  triageLevel: TriageLevel;
  ward: string;
  isTelemedicine: boolean;
  hospitalId: string; // To support multi-hospital scope
}

export interface AIAnalysisResult {
  summary: string;
  differentialDiagnosis: string[];
  recommendedLabs: string[];
  treatmentPlan: string;
  riskAssessment: string;
}

// Pharmacy Types
export interface InventoryItem {
  id: string;
  name: string;
  batchNo: string;
  expiryDate: string;
  stock: number;
  unit: string;
  hospitalId: string;
}

// Admin Types
export interface HospitalBedConfig {
  general: number;
  icu: number;
  hdu: number;
  emergency: number;
  maternity: number;
}

export interface Hospital {
  id: string;
  name: string;
  type: 'District Hospital' | 'PHC' | 'CHC' | 'Medical College' | 'Specialized Center';
  district: string;
  state: string;
  address: string;
  bedCapacity: number; // Total derived from bedConfig
  activePatients: number;
  
  // Detailed Configuration per BRD
  bedConfig: HospitalBedConfig;
  departments: string[]; // e.g. Cardiology, Ortho
  facilities: string[]; // e.g. Blood Bank, MRI, Telemedicine Node
  
  // Admin & Compliance
  rohiniId?: string; // Registry of Hospitals in Network of Insurance
  abdmId?: string;
  contactEmail: string;
  contactPhone: string;
  medicalSuperintendent: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: UserRole;
  department: string;
  hospitalId: string;
  status: 'Active' | 'On Leave';
  contact: string;
  email?: string;
  registrationNumber?: string; // Medical Council ID
  qualification?: string;
  experience?: number; // Years
}

// Registry Types (Super Admin)
export interface RegistryEntry {
  id: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  type: 'TB' | 'Cancer' | 'HIV' | 'Maternal' | 'Vector Borne';
  status: 'SUBMITTED' | 'PENDING' | 'FLAGGED' | 'REJECTED';
  submissionDate: string;
  hospitalId: string;
  hospitalName: string;
  diagnosis: string;
  icdCode: string;
  state: string;
  district: string;
  riskScore?: string; // AI Derived risk
}

// Audit Types (Super Admin)
export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  role: UserRole;
  action: string;
  resource: string;
  details: string;
}