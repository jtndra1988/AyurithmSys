
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

export enum VisitType {
  OPD = 'OPD',
  IPD = 'IPD',
  EMERGENCY = 'EMERGENCY'
}

export enum PatientStatus {
  REGISTERED = 'REGISTERED',   // Just arrived, waiting for doctor
  TRIAGED = 'TRIAGED',         // Vitals taken, waiting in ER
  ADMITTED = 'ADMITTED',       // In Ward
  DISCHARGED = 'DISCHARGED'    // Process complete
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
  duration?: string;
  status: 'ACTIVE' | 'DISCONTINUED' | 'PENDING_DISPENSE' | 'COMPLETED';
  prescribedBy?: string;
  prescribedDate?: string;
}

export interface LabResultComponent {
  name: string;
  value: string;
  unit: string;
  flag: 'NORMAL' | 'HIGH' | 'LOW' | 'CRITICAL';
  referenceRange: string;
}

export interface LabOrder {
  id: string;
  testName: string;
  priority: 'ROUTINE' | 'URGENT' | 'STAT';
  status: 'ORDERED' | 'SAMPLE_COLLECTED' | 'PROCESSING' | 'COMPLETED';
  orderedBy: string;
  orderDate: string;
  // Result Fields (for Workflow)
  resultValue?: string;
  resultUnit?: string;
  resultFlag?: 'NORMAL' | 'HIGH' | 'LOW' | 'CRITICAL';
  resultComponents?: LabResultComponent[]; // For multi-parameter tests (e.g. CBC, Lipid Profile)
  resultNotes?: string;
  completedDate?: string;
}

export interface Patient {
  id: string;
  abhaId: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  admissionDate: string;
  dischargeDate?: string;
  symptoms: string[];
  vitals: Vitals;
  history: string;
  labResults: LabResult[];
  labOrders?: LabOrder[]; // New field for CPOE
  medications?: Medication[];
  genomics?: GenomicMarker[];
  
  // Lifecycle Fields
  triageLevel: TriageLevel;
  visitType: VisitType;
  status: PatientStatus;
  tokenNumber?: string; // For OPD
  
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

export interface LabReportAnalysis {
  clinicalInterpretation: string;
  referenceRangeComment: string;
  severityAssessment: 'Normal' | 'Abnormal' | 'Critical';
  suggestedAction: string;
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

export interface DrugInteractionResult {
  hasInteractions: boolean;
  warnings: string[];
  recommendation: string;
}

// Lab Inventory & Equipment
export interface LabInventory {
  id: string;
  name: string;
  type: 'Reagent' | 'Consumable' | 'Kit';
  stock: number;
  unit: string;
  expiryDate: string;
  status: 'OK' | 'LOW' | 'EXPIRED';
}

export interface LabEquipment {
  id: string;
  name: string;
  type: string;
  status: 'Operational' | 'Calibration Due' | 'Down' | 'Maintenance';
  nextMaintenance: string;
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

// Genomics Registry Types (Super Admin)
export interface GenomicRegistryEntry {
  id: string;
  patientId: string;
  patientName: string;
  age: number;
  gender: string;
  indication: string; // e.g. "Oncology Screening", "Sickle Cell Trait"
  labId: string;
  testDate: string;
  markers: GenomicMarker[];
  status: 'COMPLETED' | 'PENDING_ANALYSIS';
  riskLevel: 'HIGH' | 'MODERATE' | 'LOW';
  hospitalId: string;
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

// Billing & Insurance Types (Hospital Admin)
export interface BillableItem {
  id: string;
  category: 'Consultation' | 'Lab' | 'Radiology' | 'Pharmacy' | 'Bed Charges' | 'Procedure';
  description: string;
  cost: number;
}

export interface Invoice {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  amount: number;
  status: 'PAID' | 'PENDING' | 'INSURANCE_PENDING' | 'CANCELLED';
  paymentMethod?: 'Cash' | 'Card' | 'UPI' | 'Insurance';
  items: { description: string; cost: number }[];
  type: 'OPD' | 'IPD';
}

export interface InsuranceClaim {
  id: string;
  invoiceId: string;
  patientId: string;
  patientName: string;
  scheme: 'Ayushman Bharat' | 'Aarogyasri' | 'EHS' | 'Private';
  policyNumber: string;
  amount: number;
  status: 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'QUERY_RAISED';
  submissionDate: string;
  remarks?: string;
}

// Asset Management Types (Hospital Admin)
export interface Asset {
  id: string;
  name: string;
  type: 'Medical Equipment' | 'Infrastructure' | 'IT';
  department: string;
  status: 'Operational' | 'Maintenance' | 'Down';
  purchaseDate: string;
  lastMaintenance: string;
  nextMaintenance: string;
  serialNumber: string;
}

// --- NEW CONNECTED CARE TYPES ---

export interface Referral {
  id: string;
  patientId: string;
  patientName: string;
  fromHospital: string; // e.g. PHC Araku
  toHospital: string;   // e.g. KGH Vizag
  reason: string;
  priority: 'CRITICAL' | 'URGENT' | 'ELECTIVE';
  status: 'REQUESTED' | 'APPROVED' | 'IN_TRANSIT' | 'ADMITTED';
  transportType: '108 Ambulance' | 'Private' | 'Air Ambulance';
  requestDate: string;
}

export interface SupplyChainAlert {
  id: string;
  item: string;
  district: string;
  status: 'SURPLUS' | 'DEFICIT' | 'CRITICAL';
  quantity: number;
  recommendation: string; // e.g. "Move 500 units to Guntur"
}

// --- HR & STAFFING TYPES (New) ---

export interface LeaveRequest {
  id: string;
  staffId: string;
  staffName: string;
  role: UserRole;
  type: 'Casual' | 'Sick' | 'Conference' | 'Emergency';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface StaffingImpactAnalysis {
  approvalRisk: 'Low' | 'Medium' | 'High';
  impactSummary: string;
  recommendation: string;
}
