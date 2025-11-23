
import { Patient, TriageLevel, InventoryItem, Hospital, UserRole, RegistryEntry, AuditLog, StaffMember } from './types';

export const MOCK_HOSPITALS: Hospital[] = [
  { 
    id: 'H-001', 
    name: 'AIIMS Delhi', 
    type: 'Medical College', 
    district: 'New Delhi', 
    state: 'Delhi',
    address: 'Ansari Nagar, New Delhi',
    bedCapacity: 2500, 
    activePatients: 2100,
    bedConfig: { general: 1500, icu: 300, hdu: 400, emergency: 100, maternity: 200 },
    departments: ['Cardiology', 'Neurology', 'Oncology', 'Pediatrics', 'General Surgery', 'Internal Medicine'],
    facilities: ['Blood Bank', 'MRI', 'CT Scan', 'Telemedicine Node', 'Genomic Lab', 'Trauma Center'],
    rohiniId: '8922123',
    abdmId: 'IN-DL-001',
    contactEmail: 'director@aiims.edu.in',
    contactPhone: '+91-11-26588500',
    medicalSuperintendent: 'Dr. M. Srinivas'
  },
  { 
    id: 'H-002', 
    name: 'District Hospital Agra', 
    type: 'District Hospital', 
    district: 'Agra',
    state: 'Uttar Pradesh', 
    address: 'MG Road, Agra',
    bedCapacity: 500, 
    activePatients: 420,
    bedConfig: { general: 300, icu: 50, hdu: 50, emergency: 50, maternity: 50 },
    departments: ['General Medicine', 'Orthopedics', 'Gynecology', 'Pediatrics'],
    facilities: ['X-Ray', 'Pathology Lab', 'Blood Storage', 'Telemedicine Node'],
    rohiniId: 'UP-AG-882',
    abdmId: 'IN-UP-552',
    contactEmail: 'ms.dh.agra@up.gov.in',
    contactPhone: '+91-562-226001',
    medicalSuperintendent: 'Dr. A. K. Singh'
  },
  { 
    id: 'H-003', 
    name: 'PHC Rampur', 
    type: 'PHC', 
    district: 'Rampur', 
    state: 'Uttar Pradesh',
    address: 'Village Rampur, Block B',
    bedCapacity: 20, 
    activePatients: 12,
    bedConfig: { general: 10, icu: 0, hdu: 0, emergency: 4, maternity: 6 },
    departments: ['Primary Care', 'Maternal Health'],
    facilities: ['Basic Lab', 'Pharmacy', 'Vaccination Center'],
    rohiniId: 'UP-RM-102',
    abdmId: 'IN-UP-901',
    contactEmail: 'mo.phc.rampur@up.gov.in',
    contactPhone: '+91-595-233111',
    medicalSuperintendent: 'Dr. S. Khan'
  },
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
  { 
    id: 'REG-001', 
    patientId: 'P-1024', 
    patientName: 'Rajesh Kumar', 
    patientAge: 45, 
    patientGender: 'Male',
    type: 'TB', 
    status: 'SUBMITTED', 
    submissionDate: '2023-10-25', 
    hospitalId: 'H-001',
    hospitalName: 'AIIMS Delhi',
    diagnosis: 'Pulmonary Tuberculosis',
    icdCode: 'A15.0',
    state: 'Delhi',
    district: 'New Delhi',
    riskScore: 'High'
  },
  { 
    id: 'REG-002', 
    patientId: 'P-1025', 
    patientName: 'Sarah Khan', 
    patientAge: 29, 
    patientGender: 'Female',
    type: 'Vector Borne', 
    status: 'PENDING', 
    submissionDate: '2023-10-26', 
    hospitalId: 'H-001',
    hospitalName: 'AIIMS Delhi',
    diagnosis: 'Dengue Hemorrhagic Fever',
    icdCode: 'A91',
    state: 'Delhi',
    district: 'South Delhi',
    riskScore: 'Medium'
  },
  { 
    id: 'REG-003', 
    patientId: 'P-1099', 
    patientName: 'Vikram Singh', 
    patientAge: 52, 
    patientGender: 'Male',
    type: 'HIV', 
    status: 'FLAGGED', 
    submissionDate: '2023-10-24', 
    hospitalId: 'H-002',
    hospitalName: 'District Hospital Agra',
    diagnosis: 'HIV Disease resulting in other bacterial infections',
    icdCode: 'B20.1',
    state: 'Uttar Pradesh',
    district: 'Agra',
    riskScore: 'Critical'
  },
  { 
    id: 'REG-004', 
    patientId: 'P-1105', 
    patientName: 'Meera Devi', 
    patientAge: 34, 
    patientGender: 'Female',
    type: 'Cancer', 
    status: 'SUBMITTED', 
    submissionDate: '2023-10-23', 
    hospitalId: 'H-002',
    hospitalName: 'District Hospital Agra',
    diagnosis: 'Malignant neoplasm of breast',
    icdCode: 'C50.9',
    state: 'Uttar Pradesh',
    district: 'Agra',
    riskScore: 'Medium'
  },
  { 
    id: 'REG-005', 
    patientId: 'P-1200', 
    patientName: 'Baby of Sunita', 
    patientAge: 0, 
    patientGender: 'Male',
    type: 'Maternal', 
    status: 'SUBMITTED', 
    submissionDate: '2023-10-27', 
    hospitalId: 'H-003',
    hospitalName: 'PHC Rampur',
    diagnosis: 'Neonatal Sepsis',
    icdCode: 'P36.9',
    state: 'Uttar Pradesh',
    district: 'Rampur',
    riskScore: 'High'
  },
  { 
    id: 'REG-006', 
    patientId: 'P-1205', 
    patientName: 'Rohan Gupta', 
    patientAge: 22, 
    patientGender: 'Male',
    type: 'TB', 
    status: 'SUBMITTED', 
    submissionDate: '2023-10-22', 
    hospitalId: 'H-001',
    hospitalName: 'AIIMS Delhi',
    diagnosis: 'Extrapulmonary TB',
    icdCode: 'A18.0',
    state: 'Delhi',
    district: 'East Delhi',
    riskScore: 'Low'
  },
  { 
    id: 'REG-007', 
    patientId: 'P-1301', 
    patientName: 'Anita Roy', 
    patientAge: 58, 
    patientGender: 'Female',
    type: 'Cancer', 
    status: 'FLAGGED', 
    submissionDate: '2023-10-21', 
    hospitalId: 'H-001',
    hospitalName: 'AIIMS Delhi',
    diagnosis: 'Carcinoma Lung',
    icdCode: 'C34.9',
    state: 'Delhi',
    district: 'New Delhi',
    riskScore: 'High'
  },
  { 
    id: 'REG-008', 
    patientId: 'P-1402', 
    patientName: 'Kamla', 
    patientAge: 40, 
    patientGender: 'Female',
    type: 'HIV', 
    status: 'PENDING', 
    submissionDate: '2023-10-26', 
    hospitalId: 'H-003',
    hospitalName: 'PHC Rampur',
    diagnosis: 'HIV positive (Screening)',
    icdCode: 'Z21',
    state: 'Uttar Pradesh',
    district: 'Rampur',
    riskScore: 'Medium'
  }
];

export const REGISTRY_TRENDS = [
  { name: 'Jan', TB: 45, Cancer: 30, HIV: 10, Vector: 5 },
  { name: 'Feb', TB: 52, Cancer: 35, HIV: 12, Vector: 8 },
  { name: 'Mar', TB: 48, Cancer: 32, HIV: 15, Vector: 15 },
  { name: 'Apr', TB: 61, Cancer: 40, HIV: 14, Vector: 25 },
  { name: 'May', TB: 55, Cancer: 45, HIV: 16, Vector: 40 },
  { name: 'Jun', TB: 67, Cancer: 42, HIV: 18, Vector: 80 },
  { name: 'Jul', TB: 70, Cancer: 48, HIV: 20, Vector: 150 },
  { name: 'Aug', TB: 65, Cancer: 50, HIV: 19, Vector: 180 },
  { name: 'Sep', TB: 60, Cancer: 52, HIV: 21, Vector: 120 },
  { name: 'Oct', TB: 58, Cancer: 55, HIV: 22, Vector: 60 },
];

export const MOCK_AUDIT_LOGS: AuditLog[] = [
  { id: 'LOG-5001', timestamp: '2023-10-26 14:30:22', userId: 'U-003', userName: 'Dr. Anjali Gupta', role: UserRole.DOCTOR, action: 'ACCESS', resource: 'Patient P-1024 Record', details: 'Viewed clinical history' },
  { id: 'LOG-5002', timestamp: '2023-10-26 14:32:10', userId: 'AI-BOT', userName: 'HMS+ AI Engine', role: UserRole.SUPER_ADMIN, action: 'ANALYSIS', resource: 'Patient P-1024', details: 'Generated Sepsis Risk Score: High' },
  { id: 'LOG-5003', timestamp: '2023-10-26 14:35:05', userId: 'U-005', userName: 'Mr. K. Singh', role: UserRole.PHARMACIST, action: 'DISPENSE', resource: 'Prescription RX-909', details: 'Dispensed Paracetamol 650mg' },
  { id: 'LOG-5004', timestamp: '2023-10-26 15:00:00', userId: 'U-001', userName: 'Dr. A. Sharma (IAS)', role: UserRole.SUPER_ADMIN, action: 'EXPORT', resource: 'National TB Registry', details: 'Exported Q3 Report' },
];