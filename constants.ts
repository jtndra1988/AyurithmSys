
import { Patient, TriageLevel, InventoryItem, Hospital, UserRole, RegistryEntry, AuditLog, StaffMember } from './types';

export const MOCK_HOSPITALS: Hospital[] = [
  { id: 'H-001', name: 'AIIMS Delhi', type: 'Medical College', district: 'New Delhi', bedCapacity: 2500, activePatients: 2100 },
  { id: 'H-002', name: 'District Hospital Agra', type: 'District Hospital', district: 'Agra', bedCapacity: 500, activePatients: 420 },
  { id: 'H-003', name: 'PHC Rampur', type: 'PHC', district: 'Rampur', bedCapacity: 20, activePatients: 12 },
];

export const MOCK_STAFF: StaffMember[] = [
  { 
    id: 'S-001', 
    name: 'Dr. Anjali Gupta', 
    role: UserRole.DOCTOR, 
    department: 'Cardiology', 
    hospitalId: 'H-001', 
    status: 'Active', 
    contact: '+91-9876543210',
    email: 'anjali.gupta@gov.in',
    registrationNumber: 'MCI-23098',
    qualification: 'MBBS, MD (Cardiology)',
    experience: 12
  },
  { 
    id: 'S-002', 
    name: 'Sister Mary', 
    role: UserRole.NURSE, 
    department: 'ICU', 
    hospitalId: 'H-001', 
    status: 'Active', 
    contact: '+91-9876543211',
    email: 'mary.j@gov.in',
    registrationNumber: 'INC-8821',
    qualification: 'B.Sc Nursing',
    experience: 8
  },
  { 
    id: 'S-003', 
    name: 'Dr. Ravi Kumar', 
    role: UserRole.DOCTOR, 
    department: 'General Medicine', 
    hospitalId: 'H-002', 
    status: 'Active', 
    contact: '+91-9876543212',
    email: 'ravi.k@gov.in',
    registrationNumber: 'UPMC-4452',
    qualification: 'MBBS, MD',
    experience: 5
  },
  { 
    id: 'S-004', 
    name: 'Mr. P. Singh', 
    role: UserRole.HOSPITAL_ADMIN, 
    department: 'Administration', 
    hospitalId: 'H-002', 
    status: 'On Leave', 
    contact: '+91-9876543213',
    email: 'admin.agra@gov.in',
    qualification: 'MBA (Hospital Mgmt)',
    experience: 15
  },
];

export const MOCK_INVENTORY: InventoryItem[] = [
  { id: 'D-101', name: 'Paracetamol 650mg', batchNo: 'B2301', expiryDate: '2025-06-01', stock: 5000, unit: 'Tabs', hospitalId: 'H-001' },
  { id: 'D-102', name: 'Amoxicillin 500mg', batchNo: 'B2305', expiryDate: '2024-12-01', stock: 1200, unit: 'Caps', hospitalId: 'H-001' },
  { id: 'D-103', name: 'Insulin Glargine', batchNo: 'B2399', expiryDate: '2024-08-01', stock: 50, unit: 'Vials', hospitalId: 'H-001' },
  { id: 'D-104', name: 'Atorvastatin 10mg', batchNo: 'B2401', expiryDate: '2025-10-01', stock: 3000, unit: 'Tabs', hospitalId: 'H-001' },
];

export const MOCK_PATIENTS: Patient[] = [
  {
    id: 'P-1024',
    abhaId: '91-2345-6789-0001',
    name: 'Rajesh Kumar',
    age: 45,
    gender: 'Male',
    admissionDate: '2023-10-25',
    symptoms: ['Chest pain', 'Shortness of breath', 'Sweating'],
    vitals: {
      heartRate: 110,
      bpSystolic: 150,
      bpDiastolic: 95,
      temperature: 37.2,
      spO2: 94,
      respRate: 22
    },
    history: 'Hypertension, Smoker (10 years)',
    labResults: [
      { id: 'L-1', testName: 'Troponin I', value: '0.12', unit: 'ng/mL', flag: 'CRITICAL', date: '2023-10-25', status: 'COMPLETED' },
      { id: 'L-2', testName: 'CK-MB', value: '25', unit: 'IU/L', flag: 'HIGH', date: '2023-10-25', status: 'COMPLETED' }
    ],
    medications: [
      { id: 'M-1', name: 'Aspirin', dosage: '75mg', frequency: 'OD', status: 'ACTIVE' }
    ],
    triageLevel: TriageLevel.CRITICAL,
    ward: 'ICU-04',
    isTelemedicine: false,
    hospitalId: 'H-001'
  },
  {
    id: 'P-1025',
    abhaId: '91-8888-7777-2222',
    name: 'Sarah Khan',
    age: 29,
    gender: 'Female',
    admissionDate: '2023-10-26',
    symptoms: ['High fever', 'Joint pain', 'Rash'],
    vitals: {
      heartRate: 92,
      bpSystolic: 110,
      bpDiastolic: 70,
      temperature: 39.5,
      spO2: 98,
      respRate: 18
    },
    history: 'None',
    labResults: [
      { id: 'L-3', testName: 'Platelet Count', value: '90000', unit: '/mcL', flag: 'LOW', date: '2023-10-26', status: 'COMPLETED' },
      { id: 'L-4', testName: 'Dengue NS1', value: '', unit: '', date: '2023-10-26', status: 'PENDING' }
    ],
    genomics: [
      { gene: 'CYP2C9', variant: '*2/*3', significance: 'Reduced Metabolism', pharmacogenomics: 'Lower dose of NSAIDs required' }
    ],
    triageLevel: TriageLevel.URGENT,
    ward: 'Ward-A',
    isTelemedicine: true,
    hospitalId: 'H-001'
  },
  {
    id: 'P-1026',
    abhaId: '91-1111-2222-3333',
    name: 'Amit Patel',
    age: 62,
    gender: 'Male',
    admissionDate: '2023-10-26',
    symptoms: ['Chronic cough', 'Fatigue'],
    vitals: {
      heartRate: 78,
      bpSystolic: 130,
      bpDiastolic: 85,
      temperature: 36.8,
      spO2: 96,
      respRate: 16
    },
    history: 'Type 2 Diabetes',
    labResults: [
      { id: 'L-5', testName: 'HbA1c', value: '7.8', unit: '%', flag: 'HIGH', date: '2023-10-20', status: 'COMPLETED' }
    ],
    triageLevel: TriageLevel.STANDARD,
    ward: 'OPD-General',
    isTelemedicine: false,
    hospitalId: 'H-001'
  }
];

export const DEMO_USERS = [
  { role: UserRole.SUPER_ADMIN, name: "Dr. A. Sharma (IAS)", label: "National Health Authority" },
  { role: UserRole.HOSPITAL_ADMIN, name: "Mr. R. Verma", label: "Hospital Administrator" },
  { role: UserRole.DOCTOR, name: "Dr. Anjali Gupta", label: "Sr. Cardiologist" },
  { role: UserRole.NURSE, name: "Sister Mary", label: "Head Nurse (ICU)" },
  { role: UserRole.PHARMACIST, name: "Mr. K. Singh", label: "Chief Pharmacist" },
  { role: UserRole.LAB_TECH, name: "Ms. P. Das", label: "Lab Technician" },
];

export const MOCK_REGISTRY_DATA: RegistryEntry[] = [
  { id: 'REG-001', patientId: 'P-1024', patientName: 'Rajesh Kumar', type: 'TB', status: 'SUBMITTED', submissionDate: '2023-10-25', hospitalId: 'H-001' },
  { id: 'REG-002', patientId: 'P-1025', patientName: 'Sarah Khan', type: 'Cancer', status: 'PENDING', submissionDate: '2023-10-26', hospitalId: 'H-001' },
  { id: 'REG-003', patientId: 'P-1099', patientName: 'Vikram Singh', type: 'HIV', status: 'FLAGGED', submissionDate: '2023-10-24', hospitalId: 'H-002' },
];

export const MOCK_AUDIT_LOGS: AuditLog[] = [
  { id: 'LOG-5001', timestamp: '2023-10-26 14:30:22', userId: 'U-003', userName: 'Dr. Anjali Gupta', role: UserRole.DOCTOR, action: 'ACCESS', resource: 'Patient P-1024 Record', details: 'Viewed clinical history' },
  { id: 'LOG-5002', timestamp: '2023-10-26 14:32:10', userId: 'AI-BOT', userName: 'HMS+ AI Engine', role: UserRole.SUPER_ADMIN, action: 'ANALYSIS', resource: 'Patient P-1024', details: 'Generated Sepsis Risk Score: High' },
  { id: 'LOG-5003', timestamp: '2023-10-26 14:35:05', userId: 'U-005', userName: 'Mr. K. Singh', role: UserRole.PHARMACIST, action: 'DISPENSE', resource: 'Prescription RX-909', details: 'Dispensed Paracetamol 650mg' },
  { id: 'LOG-5004', timestamp: '2023-10-26 15:00:00', userId: 'U-001', userName: 'Dr. A. Sharma (IAS)', role: UserRole.SUPER_ADMIN, action: 'EXPORT', resource: 'National TB Registry', details: 'Exported Q3 Report' },
];
