
import { Patient, TriageLevel, InventoryItem, Hospital, UserRole, RegistryEntry, AuditLog, StaffMember, GenomicRegistryEntry, Invoice, InsuranceClaim, Asset, VisitType, PatientStatus, BillableItem, LabInventory, LabEquipment, Referral, LeaveRequest } from './types';

export const MOCK_HOSPITALS: Hospital[] = [
  { 
    id: 'H-AP-001', 
    name: 'King George Hospital (KGH)', 
    type: 'Medical College', 
    district: 'Visakhapatnam', 
    state: 'Andhra Pradesh',
    address: 'Maharanipeta, Visakhapatnam',
    bedCapacity: 1200, 
    activePatients: 1050,
    bedConfig: { general: 800, icu: 150, hdu: 150, emergency: 50, maternity: 50 },
    departments: ['Cardiology', 'Neurology', 'Gastroenterology', 'General Surgery', 'Orthopedics', 'Pediatrics'],
    facilities: ['Cath Lab', 'MRI', 'CT Scan', 'Telemedicine Hub', 'Virology Lab', 'Trauma Care'],
    rohiniId: 'AP-VZ-892',
    abdmId: 'IN-AP-001',
    contactEmail: 'superintendent.kgh@ap.gov.in',
    contactPhone: '+91-891-2564891',
    medicalSuperintendent: 'Dr. P. Ashok Kumar'
  },
  { 
    id: 'H-AP-002', 
    name: 'Govt. General Hospital (GGH)', 
    type: 'District Hospital', 
    district: 'NTR District',
    state: 'Andhra Pradesh', 
    address: 'Gunadala, Vijayawada',
    bedCapacity: 800, 
    activePatients: 720,
    bedConfig: { general: 500, icu: 100, hdu: 100, emergency: 50, maternity: 50 },
    departments: ['General Medicine', 'Pulmonology', 'Gynecology', 'Pediatrics', 'Nephrology'],
    facilities: ['Dialysis Unit', 'Blood Bank', 'Telemedicine Node', 'X-Ray'],
    rohiniId: 'AP-VJ-552',
    abdmId: 'IN-AP-552',
    contactEmail: 'ggh.vijayawada@ap.gov.in',
    contactPhone: '+91-866-2451234',
    medicalSuperintendent: 'Dr. K. Siva Shankar'
  },
  { 
    id: 'H-AP-003', 
    name: 'Tribal PHC Araku Valley', 
    type: 'PHC', 
    district: 'Alluri Sitharama Raju', 
    state: 'Andhra Pradesh',
    address: 'Araku Valley, ASR District',
    bedCapacity: 30, 
    activePatients: 18,
    bedConfig: { general: 20, icu: 0, hdu: 0, emergency: 4, maternity: 6 },
    departments: ['Primary Care', 'Maternal Health', 'Vector Borne Diseases'],
    facilities: ['Basic Lab', 'Pharmacy', 'Telemedicine Node'],
    rohiniId: 'AP-AR-102',
    abdmId: 'IN-AP-901',
    contactEmail: 'mo.phc.araku@ap.gov.in',
    contactPhone: '+91-8936-249200',
    medicalSuperintendent: 'Dr. S. Lakshmi'
  },
];

export const MOCK_STAFF: StaffMember[] = [
  { 
    id: 'S-AP-001', 
    name: 'Dr. K. Srinivas Rao', 
    role: UserRole.DOCTOR, 
    department: 'Cardiology', 
    hospitalId: 'H-AP-001', 
    status: 'Active', 
    contact: '+91-9876543210',
    email: 'srinivas.rao@ap.gov.in',
    registrationNumber: 'APMC-23098',
    qualification: 'MBBS, MD, DM (Cardiology)',
    experience: 15
  },
  { 
    id: 'S-AP-002', 
    name: 'Staff Nurse Padma', 
    role: UserRole.NURSE, 
    department: 'ICU', 
    hospitalId: 'H-AP-001', 
    status: 'Active', 
    contact: '+91-9876543211',
    email: 'padma.n@ap.gov.in',
    registrationNumber: 'APNC-8821',
    qualification: 'B.Sc Nursing',
    experience: 8
  },
  { 
    id: 'S-AP-003', 
    name: 'Dr. V. Reddy', 
    role: UserRole.DOCTOR, 
    department: 'General Medicine', 
    hospitalId: 'H-AP-002', 
    status: 'Active', 
    contact: '+91-9876543212',
    email: 'v.reddy@ap.gov.in',
    registrationNumber: 'APMC-4452',
    qualification: 'MBBS, MD',
    experience: 6
  },
  { 
    id: 'S-AP-004', 
    name: 'Mr. B. Naidu', 
    role: UserRole.HOSPITAL_ADMIN, 
    department: 'Administration', 
    hospitalId: 'H-AP-002', 
    status: 'On Leave', 
    contact: '+91-9876543213',
    email: 'admin.ggh@ap.gov.in',
    qualification: 'MBA (Hospital Mgmt)',
    experience: 12
  },
  {
    id: 'S-AP-005',
    name: 'Mrs. R. Kumari',
    role: UserRole.RECEPTIONIST,
    department: 'Front Desk',
    hospitalId: 'H-AP-001',
    status: 'Active',
    contact: '+91-9876543214',
    email: 'reception.kgh@ap.gov.in',
    qualification: 'Graduate',
    experience: 5
  },
  {
    id: 'S-AP-006',
    name: 'Dr. Anjali Gupta',
    role: UserRole.DOCTOR,
    department: 'Pediatrics',
    hospitalId: 'H-AP-001',
    status: 'Active',
    contact: '+91-9876543222',
    email: 'anjali.g@ap.gov.in',
    registrationNumber: 'APMC-5512',
    qualification: 'MBBS, MD (Pediatrics)',
    experience: 10
  },
  {
    id: 'S-AP-007',
    name: 'Nurse Raju',
    role: UserRole.NURSE,
    department: 'Emergency',
    hospitalId: 'H-AP-001',
    status: 'Active',
    contact: '+91-9876543223',
    email: 'raju.n@ap.gov.in',
    registrationNumber: 'APNC-9912',
    qualification: 'GNM',
    experience: 4
  }
];

export const MOCK_INVENTORY: InventoryItem[] = [
  { id: 'D-101', name: 'Paracetamol 650mg', batchNo: 'B2301', expiryDate: '2025-06-01', stock: 15000, unit: 'Tabs', hospitalId: 'H-AP-001' },
  { id: 'D-102', name: 'Amoxicillin 500mg', batchNo: 'B2305', expiryDate: '2024-12-01', stock: 4200, unit: 'Caps', hospitalId: 'H-AP-001' },
  { id: 'D-103', name: 'Insulin Glargine', batchNo: 'B2399', expiryDate: '2024-08-01', stock: 150, unit: 'Vials', hospitalId: 'H-AP-001' },
  { id: 'D-104', name: 'Atorvastatin 10mg', batchNo: 'B2401', expiryDate: '2025-10-01', stock: 8000, unit: 'Tabs', hospitalId: 'H-AP-001' },
  { id: 'D-105', name: 'Doxycycline 100mg', batchNo: 'B2405', expiryDate: '2025-02-01', stock: 5000, unit: 'Caps', hospitalId: 'H-AP-001' },
];

export const MOCK_LAB_INVENTORY: LabInventory[] = [
  { id: 'REG-001', name: 'CBC Diluent', type: 'Reagent', stock: 45, unit: 'Liters', expiryDate: '2024-05-20', status: 'OK' },
  { id: 'REG-002', name: 'Lipid Profile Kit', type: 'Kit', stock: 12, unit: 'Boxes', expiryDate: '2024-02-15', status: 'LOW' },
  { id: 'REG-003', name: 'Glucose Reagent', type: 'Reagent', stock: 8, unit: 'Vials', expiryDate: '2024-08-10', status: 'OK' },
  { id: 'REG-004', name: 'Dengue NS1 Cards', type: 'Kit', stock: 150, unit: 'Tests', expiryDate: '2025-01-01', status: 'OK' },
  { id: 'REG-005', name: 'Troponin T Strips', type: 'Consumable', stock: 5, unit: 'Boxes', expiryDate: '2023-12-01', status: 'LOW' },
];

export const MOCK_LAB_EQUIPMENT: LabEquipment[] = [
  { id: 'EQ-LAB-01', name: 'Roche Cobas 6000', type: 'Chemistry Analyzer', status: 'Operational', nextMaintenance: '2024-01-15' },
  { id: 'EQ-LAB-02', name: 'Beckman Coulter DxH', type: 'Hematology Analyzer', status: 'Calibration Due', nextMaintenance: '2023-11-05' },
  { id: 'EQ-LAB-03', name: 'Sysmex XN-1000', type: 'Hematology Analyzer', status: 'Operational', nextMaintenance: '2024-03-10' },
  { id: 'EQ-LAB-04', name: 'Centrifuge 5810R', type: 'Centrifuge', status: 'Maintenance', nextMaintenance: '2023-10-30' },
];

// New Lists for CPOE
export const MOCK_MEDICINES = [
  "Paracetamol 650mg", "Amoxicillin 500mg", "Azithromycin 500mg", "Ceftriaxone 1g Inj", 
  "Pantoprazole 40mg", "Ondansetron 4mg", "Diclofenac 50mg", "Metformin 500mg", 
  "Atorvastatin 10mg", "Amlodipine 5mg", "Telmisartan 40mg", "Insulin Glargine", 
  "Insulin Regular", "Heparin Inj", "Enoxaparin 40mg", "Aspirin 75mg", "Clopidogrel 75mg",
  "Furosemide 40mg", "Spironolactone 25mg", "Levothyroxine 50mcg", "Prednisolone 10mg"
];

export const MOCK_LAB_TESTS = [
  "CBC (Complete Blood Count)", "Basic Metabolic Panel", "LFT (Liver Function Test)", 
  "KFT (Kidney Function Test)", "Lipid Profile", "HbA1c", "Blood Sugar Fasting", 
  "Blood Sugar PP", "Thyroid Profile (T3, T4, TSH)", "Dengue NS1 Antigen", 
  "Malaria Smear", "Widal Test", "Urine Routine", "Stool Routine", "Blood Culture",
  "CRP (C-Reactive Protein)", "ESR", "Troponin I", "CK-MB", "D-Dimer", "Ferritin",
  "Procalcitonin", "ABG (Arterial Blood Gas)", "Electrolytes (Na, K, Cl)"
];

export const MOCK_PATIENTS: Patient[] = [
  {
    id: 'P-AP-1024',
    abhaId: '91-2345-6789-0001',
    name: 'Ramesh Babu',
    age: 48,
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
    history: 'Hypertension, Smoker (15 years)',
    labResults: [
      { id: 'L-1', testName: 'Troponin I', value: '0.12', unit: 'ng/mL', flag: 'CRITICAL', date: '2023-10-25', status: 'COMPLETED' },
      { id: 'L-2', testName: 'CK-MB', value: '25', unit: 'IU/L', flag: 'HIGH', date: '2023-10-25', status: 'COMPLETED' }
    ],
    labOrders: [
      { 
        id: 'LO-HIST-001', testName: 'Troponin I', priority: 'STAT', status: 'COMPLETED', 
        orderedBy: 'Dr. K. Srinivas Rao', orderDate: '2023-10-25', 
        resultValue: '0.12', resultUnit: 'ng/mL', resultFlag: 'CRITICAL', 
        completedDate: '2023-10-25', resultNotes: 'Elevated, likely MI.' 
      },
      { 
        id: 'LO-HIST-002', testName: 'Lipid Profile', priority: 'ROUTINE', status: 'COMPLETED', 
        orderedBy: 'Dr. K. Srinivas Rao', orderDate: '2023-10-24', 
        resultValue: 'Abnormal', resultUnit: '', resultFlag: 'HIGH', 
        completedDate: '2023-10-24',
        resultComponents: [
          { name: 'Total Cholesterol', value: '240', unit: 'mg/dL', flag: 'HIGH', referenceRange: '< 200' },
          { name: 'Triglycerides', value: '180', unit: 'mg/dL', flag: 'HIGH', referenceRange: '< 150' },
          { name: 'HDL Cholesterol', value: '35', unit: 'mg/dL', flag: 'LOW', referenceRange: '> 40' },
          { name: 'LDL Cholesterol', value: '169', unit: 'mg/dL', flag: 'HIGH', referenceRange: '< 100' },
          { name: 'VLDL', value: '36', unit: 'mg/dL', flag: 'NORMAL', referenceRange: '2-30' }
        ]
      }
    ],
    medications: [
      { id: 'M-1', name: 'Aspirin', dosage: '75mg', frequency: 'OD', status: 'ACTIVE' }
    ],
    triageLevel: TriageLevel.CRITICAL,
    visitType: VisitType.IPD,
    status: PatientStatus.ADMITTED,
    ward: 'ICU-Cardio-04',
    isTelemedicine: false,
    hospitalId: 'H-AP-001'
  },
  {
    id: 'P-AP-1025',
    abhaId: '91-8888-7777-2222',
    name: 'Lakshmi Devi',
    age: 32,
    gender: 'Female',
    admissionDate: '2023-10-26',
    symptoms: ['High fever', 'Joint pain', 'Rash'],
    vitals: {
      heartRate: 98,
      bpSystolic: 110,
      bpDiastolic: 70,
      temperature: 39.5,
      spO2: 98,
      respRate: 18
    },
    history: 'None',
    labResults: [
      { id: 'L-3', testName: 'Platelet Count', value: '85000', unit: '/mcL', flag: 'LOW', date: '2023-10-26', status: 'COMPLETED' },
      { id: 'L-4', testName: 'Dengue NS1', value: '', unit: '', date: '2023-10-26', status: 'PENDING' }
    ],
    labOrders: [
       { id: 'LO-1', testName: 'Dengue NS1', priority: 'URGENT', status: 'SAMPLE_COLLECTED', orderedBy: 'Dr. V. Reddy', orderDate: '2023-10-26' },
       { 
         id: 'LO-HIST-003', testName: 'CBC (Complete Blood Count)', priority: 'URGENT', status: 'COMPLETED', 
         orderedBy: 'Dr. V. Reddy', orderDate: '2023-10-25', 
         resultValue: 'Abnormal', resultUnit: '', resultFlag: 'LOW', 
         completedDate: '2023-10-25',
         resultComponents: [
           { name: 'Hemoglobin', value: '11.5', unit: 'g/dL', flag: 'NORMAL', referenceRange: '12.0 - 15.5' },
           { name: 'WBC Count', value: '3500', unit: '/mcL', flag: 'LOW', referenceRange: '4500 - 11000' },
           { name: 'Platelet Count', value: '85000', unit: '/mcL', flag: 'LOW', referenceRange: '150000 - 450000' },
           { name: 'RBC Count', value: '4.1', unit: 'M/mcL', flag: 'NORMAL', referenceRange: '3.90 - 5.03' },
           { name: 'Hematocrit', value: '36', unit: '%', flag: 'NORMAL', referenceRange: '36 - 46' },
           { name: 'MCV', value: '85', unit: 'fL', flag: 'NORMAL', referenceRange: '80 - 100' }
         ]
       }
    ],
    genomics: [
       { gene: 'G6PD', variant: 'Class III', significance: 'Moderate Deficiency', pharmacogenomics: 'Avoid Primaquine' }
    ],
    triageLevel: TriageLevel.URGENT,
    visitType: VisitType.OPD,
    status: PatientStatus.TRIAGED,
    tokenNumber: 'OPD-102',
    ward: 'Waiting Room A',
    isTelemedicine: true,
    hospitalId: 'H-AP-003'
  },
  {
    id: 'P-AP-1026',
    abhaId: '91-1111-2222-3333',
    name: 'Subba Rao',
    age: 65,
    gender: 'Male',
    admissionDate: '2023-10-26',
    symptoms: ['Chronic cough', 'Fatigue', 'Weight loss'],
    vitals: {
      heartRate: 82,
      bpSystolic: 130,
      bpDiastolic: 85,
      temperature: 37.1,
      spO2: 95,
      respRate: 18
    },
    history: 'Type 2 Diabetes, Past TB history',
    labResults: [
      { id: 'L-5', testName: 'HbA1c', value: '8.2', unit: '%', flag: 'HIGH', date: '2023-10-20', status: 'COMPLETED' },
      { id: 'L-6', testName: 'Sputum AFB', value: 'Positive', unit: '', flag: 'CRITICAL', date: '2023-10-26', status: 'COMPLETED' }
    ],
    labOrders: [
      { 
        id: 'LO-HIST-004', testName: 'Sputum AFB', priority: 'ROUTINE', status: 'COMPLETED', 
        orderedBy: 'Dr. V. Reddy', orderDate: '2023-10-26', 
        resultValue: 'Positive', resultUnit: '', resultFlag: 'CRITICAL', 
        completedDate: '2023-10-26', resultNotes: 'M. Tuberculosis detected.' 
      },
      { 
        id: 'LO-HIST-005', testName: 'HbA1c', priority: 'ROUTINE', status: 'COMPLETED', 
        orderedBy: 'Dr. V. Reddy', orderDate: '2023-10-20', 
        resultValue: '8.2', resultUnit: '%', resultFlag: 'HIGH', 
        completedDate: '2023-10-20' 
      }
    ],
    medications: [],
    triageLevel: TriageLevel.URGENT,
    visitType: VisitType.IPD,
    status: PatientStatus.ADMITTED,
    ward: 'Isolation-B',
    isTelemedicine: false,
    hospitalId: 'H-AP-002'
  }
];

export const DEMO_USERS = [
  { role: UserRole.SUPER_ADMIN, name: "Sri M. T. Krishna Babu (IAS)", label: "Principal Secretary (Health)" },
  { role: UserRole.HOSPITAL_ADMIN, name: "Dr. P. Ashok Kumar", label: "Superintendent, KGH" },
  { role: UserRole.DOCTOR, name: "Dr. K. Srinivas Rao", label: "Prof. Cardiology" },
  { role: UserRole.NURSE, name: "Sister Padma", label: "Head Nurse" },
  { role: UserRole.PHARMACIST, name: "Mr. K. Murthy", label: "Chief Pharmacist" },
  { role: UserRole.LAB_TECH, name: "Ms. S. Jyothi", label: "Lab Technician" },
  { role: UserRole.RECEPTIONIST, name: "Mrs. R. Kumari", label: "Front Desk Mgr" },
];

export const MOCK_REGISTRY_DATA: RegistryEntry[] = [
  { 
    id: 'REG-AP-001', 
    patientId: 'P-AP-1026', 
    patientName: 'Subba Rao', 
    patientAge: 65, 
    patientGender: 'Male',
    type: 'TB', 
    status: 'SUBMITTED', 
    submissionDate: '2023-10-25', 
    hospitalId: 'H-AP-002',
    hospitalName: 'GGH Vijayawada',
    diagnosis: 'Relapsed Pulmonary Tuberculosis',
    icdCode: 'A15.0',
    state: 'Andhra Pradesh',
    district: 'NTR District',
    riskScore: 'High'
  },
  { 
    id: 'REG-AP-002', 
    patientId: 'P-AP-1025', 
    patientName: 'Lakshmi Devi', 
    patientAge: 32, 
    patientGender: 'Female',
    type: 'Vector Borne', 
    status: 'PENDING', 
    submissionDate: '2023-10-26', 
    hospitalId: 'H-AP-003',
    hospitalName: 'Tribal PHC Araku',
    diagnosis: 'Dengue Fever',
    icdCode: 'A91',
    state: 'Andhra Pradesh',
    district: 'Alluri Sitharama Raju',
    riskScore: 'Medium'
  },
  { 
    id: 'REG-AP-003', 
    patientId: 'P-AP-1099', 
    patientName: 'K. Venkat', 
    patientAge: 45, 
    patientGender: 'Male',
    type: 'Cancer', 
    status: 'FLAGGED', 
    submissionDate: '2023-10-24', 
    hospitalId: 'H-AP-001',
    hospitalName: 'King George Hospital',
    diagnosis: 'Oral Carcinoma',
    icdCode: 'C06.9',
    state: 'Andhra Pradesh',
    district: 'Visakhapatnam',
    riskScore: 'Critical'
  },
  { 
    id: 'REG-AP-004', 
    patientId: 'P-AP-1105', 
    patientName: 'G. Rani', 
    patientAge: 28, 
    patientGender: 'Female',
    type: 'Maternal', 
    status: 'SUBMITTED', 
    submissionDate: '2023-10-23', 
    hospitalId: 'H-AP-003',
    hospitalName: 'Tribal PHC Araku',
    diagnosis: 'Severe Anemia in Pregnancy',
    icdCode: 'O99.0',
    state: 'Andhra Pradesh',
    district: 'Alluri Sitharama Raju',
    riskScore: 'High'
  },
  { 
    id: 'REG-AP-005', 
    patientId: 'P-AP-1200', 
    patientName: 'Ch. Prasad', 
    patientAge: 55, 
    patientGender: 'Male',
    type: 'Cancer', 
    status: 'SUBMITTED', 
    submissionDate: '2023-10-27', 
    hospitalId: 'H-AP-001',
    hospitalName: 'King George Hospital',
    diagnosis: 'Hepatocellular Carcinoma',
    icdCode: 'C22.0',
    state: 'Andhra Pradesh',
    district: 'Visakhapatnam',
    riskScore: 'High'
  }
];

export const REGISTRY_TRENDS = [
  { name: 'Jan', TB: 120, Cancer: 80, HIV: 40, Vector: 10 },
  { name: 'Feb', TB: 135, Cancer: 85, HIV: 42, Vector: 15 },
  { name: 'Mar', TB: 125, Cancer: 82, HIV: 45, Vector: 20 },
  { name: 'Apr', TB: 140, Cancer: 90, HIV: 44, Vector: 45 },
  { name: 'May', TB: 155, Cancer: 95, HIV: 48, Vector: 80 },
  { name: 'Jun', TB: 160, Cancer: 92, HIV: 50, Vector: 150 },
  { name: 'Jul', TB: 175, Cancer: 98, HIV: 52, Vector: 280 },
  { name: 'Aug', TB: 165, Cancer: 105, HIV: 55, Vector: 350 },
  { name: 'Sep', TB: 150, Cancer: 110, HIV: 58, Vector: 200 },
  { name: 'Oct', TB: 145, Cancer: 115, HIV: 60, Vector: 120 },
];

export const MOCK_GENOMICS_DATA: GenomicRegistryEntry[] = [
  {
    id: 'SEQ-9001',
    patientId: 'P-AP-1025',
    patientName: 'Lakshmi Devi',
    age: 32,
    gender: 'Female',
    indication: 'Pharmacogenomics Screen',
    labId: 'LAB-GEN-01 (KGH)',
    testDate: '2023-10-15',
    hospitalId: 'H-AP-003',
    status: 'COMPLETED',
    riskLevel: 'MODERATE',
    markers: [
      { gene: 'G6PD', variant: 'Class III', significance: 'Moderate Deficiency', pharmacogenomics: 'Avoid Primaquine' },
      { gene: 'CYP2C19', variant: '*1/*1', significance: 'Normal Metabolizer', pharmacogenomics: 'Standard Clopidogrel Dosing' }
    ]
  },
  {
    id: 'SEQ-9002',
    patientId: 'P-AP-5521',
    patientName: 'Raju Naik',
    age: 12,
    gender: 'Male',
    indication: 'Sickle Cell Screening',
    labId: 'LAB-GEN-01 (KGH)',
    testDate: '2023-10-20',
    hospitalId: 'H-AP-003',
    status: 'COMPLETED',
    riskLevel: 'HIGH',
    markers: [
      { gene: 'HBB', variant: 'Glu6Val (HbS)', significance: 'Homozygous (Sickle Cell Disease)', pharmacogenomics: '' }
    ]
  },
  {
    id: 'SEQ-9003',
    patientId: 'P-AP-1099',
    patientName: 'K. Venkat',
    age: 45,
    gender: 'Male',
    indication: 'Oncology Panel',
    labId: 'LAB-GEN-02 (Hyderabad)',
    testDate: '2023-10-22',
    hospitalId: 'H-AP-001',
    status: 'COMPLETED',
    riskLevel: 'HIGH',
    markers: [
      { gene: 'TP53', variant: 'R248Q', significance: 'Pathogenic', pharmacogenomics: 'Poor prognosis marker' },
      { gene: 'EGFR', variant: 'Wild Type', significance: 'Normal', pharmacogenomics: 'Resistant to TKIs likely' }
    ]
  },
  {
    id: 'SEQ-9004',
    patientId: 'P-AP-3312',
    patientName: 'S. Anjali',
    age: 58,
    gender: 'Female',
    indication: 'Cardiovascular Risk',
    labId: 'LAB-GEN-01 (KGH)',
    testDate: '2023-10-25',
    hospitalId: 'H-AP-002',
    status: 'PENDING_ANALYSIS',
    riskLevel: 'LOW',
    markers: []
  }
];

export const MOCK_AUDIT_LOGS: AuditLog[] = [
  { id: 'LOG-5001', timestamp: '2023-10-26 14:30:22', userId: 'S-AP-001', userName: 'Dr. K. Srinivas Rao', role: UserRole.DOCTOR, action: 'ACCESS', resource: 'Patient P-AP-1024 Record', details: 'Viewed clinical history' },
  { id: 'LOG-5002', timestamp: '2023-10-26 14:32:10', userId: 'AI-BOT', userName: 'AP Health AI', role: UserRole.SUPER_ADMIN, action: 'ANALYSIS', resource: 'Patient P-AP-1024', details: 'Generated Cardiac Risk Score: High' },
  { id: 'LOG-5003', timestamp: '2023-10-26 14:35:05', userId: 'S-AP-005', userName: 'Mr. K. Murthy', role: UserRole.PHARMACIST, action: 'DISPENSE', resource: 'Prescription RX-909', details: 'Dispensed Atorvastatin 10mg' },
  { id: 'LOG-5004', timestamp: '2023-10-26 15:00:00', userId: 'U-001', userName: 'Sri M. T. Krishna Babu', role: UserRole.SUPER_ADMIN, action: 'EXPORT', resource: 'State TB Registry', details: 'Exported Monthly Report for NTR District' },
];

export const STANDARD_SERVICES: BillableItem[] = [
  { id: 'SRV-101', category: 'Consultation', description: 'General Consultation (OPD)', cost: 500 },
  { id: 'SRV-102', category: 'Consultation', description: 'Specialist Consultation', cost: 1000 },
  { id: 'SRV-103', category: 'Consultation', description: 'Emergency / Triage Fee', cost: 750 },
  { id: 'SRV-201', category: 'Lab', description: 'Complete Blood Count (CBC)', cost: 450 },
  { id: 'SRV-202', category: 'Lab', description: 'Lipid Profile', cost: 850 },
  { id: 'SRV-203', category: 'Lab', description: 'Liver Function Test (LFT)', cost: 900 },
  { id: 'SRV-204', category: 'Lab', description: 'Dengue NS1 Antigen', cost: 1200 },
  { id: 'SRV-301', category: 'Radiology', description: 'X-Ray Chest PA View', cost: 400 },
  { id: 'SRV-302', category: 'Radiology', description: 'Ultrasound Abdomen', cost: 1500 },
  { id: 'SRV-303', category: 'Radiology', description: 'MRI Brain (Contrast)', cost: 8500 },
  { id: 'SRV-401', category: 'Bed Charges', description: 'General Ward / Day', cost: 500 },
  { id: 'SRV-402', category: 'Bed Charges', description: 'Semi-Private Room / Day', cost: 2500 },
  { id: 'SRV-403', category: 'Bed Charges', description: 'ICU Bed / Day', cost: 5000 },
];

export const MOCK_INVOICES: Invoice[] = [
  {
    id: 'INV-2023-901',
    patientId: 'P-AP-1024',
    patientName: 'Ramesh Babu',
    date: '2023-10-25',
    amount: 15500,
    status: 'INSURANCE_PENDING',
    type: 'IPD',
    items: [
      { description: 'ICU Charges (1 Day)', cost: 5000 },
      { description: 'Cardiac Enzyme Panel', cost: 2500 },
      { description: 'Doctor Consultation', cost: 1000 },
      { description: 'Medications', cost: 7000 }
    ]
  },
  {
    id: 'INV-2023-902',
    patientId: 'P-AP-1026',
    patientName: 'Subba Rao',
    date: '2023-10-26',
    amount: 500,
    status: 'PAID',
    paymentMethod: 'Cash',
    type: 'OPD',
    items: [
      { description: 'General Consultation', cost: 200 },
      { description: 'X-Ray Chest', cost: 300 }
    ]
  },
  {
    id: 'INV-2023-903',
    patientId: 'P-AP-1025',
    patientName: 'Lakshmi Devi',
    date: '2023-10-27',
    amount: 2450,
    status: 'PENDING',
    type: 'OPD',
    items: [
       { description: 'Specialist Consultation', cost: 1000 },
       { description: 'Dengue NS1 Antigen', cost: 1200 },
       { description: 'Registration Fee', cost: 250 }
    ]
  }
];

export const MOCK_CLAIMS: InsuranceClaim[] = [
  {
    id: 'CLM-AP-8812',
    invoiceId: 'INV-2023-901',
    patientId: 'P-AP-1024',
    patientName: 'Ramesh Babu',
    scheme: 'Aarogyasri',
    policyNumber: 'AP-ARG-99212',
    amount: 15500,
    status: 'SUBMITTED',
    submissionDate: '2023-10-26'
  }
];

export const MOCK_ASSETS: Asset[] = [
  {
    id: 'EQ-KG-01',
    name: 'MRI Scanner 1.5T',
    type: 'Medical Equipment',
    department: 'Radiology',
    status: 'Operational',
    purchaseDate: '2020-05-12',
    lastMaintenance: '2023-08-01',
    nextMaintenance: '2023-11-01',
    serialNumber: 'SIEM-MRI-9921'
  },
  {
    id: 'EQ-KG-02',
    name: 'Ventilator - Maquet',
    type: 'Medical Equipment',
    department: 'ICU',
    status: 'Maintenance',
    purchaseDate: '2021-03-15',
    lastMaintenance: '2023-09-10',
    nextMaintenance: '2023-10-28',
    serialNumber: 'VENT-MQ-881'
  },
  {
    id: 'EQ-KG-03',
    name: 'Anesthesia Workstation',
    type: 'Medical Equipment',
    department: 'Operation Theatre',
    status: 'Operational',
    purchaseDate: '2022-01-20',
    lastMaintenance: '2023-07-15',
    nextMaintenance: '2024-01-15',
    serialNumber: 'DRG-AN-442'
  },
  {
    id: 'INF-KG-01',
    name: 'Diesel Generator 500kVA',
    type: 'Infrastructure',
    department: 'Engineering',
    status: 'Operational',
    purchaseDate: '2019-11-01',
    lastMaintenance: '2023-10-01',
    nextMaintenance: '2024-04-01',
    serialNumber: 'KIRL-DG-551'
  }
];

export const MOCK_REFERRALS: Referral[] = [
  {
    id: 'REF-2023-001',
    patientId: 'P-AP-9001',
    patientName: 'K. Ramana',
    fromHospital: 'Tribal PHC Araku',
    toHospital: 'King George Hospital',
    reason: 'Severe Head Trauma (RTA)',
    priority: 'CRITICAL',
    status: 'IN_TRANSIT',
    transportType: '108 Ambulance',
    requestDate: '2023-10-27 10:15 AM'
  },
  {
    id: 'REF-2023-002',
    patientId: 'P-AP-9002',
    patientName: 'Baby of Rani',
    fromHospital: 'CHC Narsipatnam',
    toHospital: 'KGH Neonatal ICU',
    reason: 'Respiratory Distress Syndrome',
    priority: 'CRITICAL',
    status: 'APPROVED',
    transportType: '108 Ambulance',
    requestDate: '2023-10-27 11:00 AM'
  },
  {
    id: 'REF-2023-003',
    patientId: 'P-AP-9003',
    patientName: 'G. Surya',
    fromHospital: 'GGH Vijayawada',
    toHospital: 'AIIMS Mangalagiri',
    reason: 'Complex Neurosurgery',
    priority: 'URGENT',
    status: 'REQUESTED',
    transportType: 'Private',
    requestDate: '2023-10-27 09:30 AM'
  }
];

export const MOCK_LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: 'LR-001',
    staffId: 'S-AP-006',
    staffName: 'Dr. Anjali Gupta',
    role: UserRole.DOCTOR,
    type: 'Conference',
    startDate: '2023-11-10',
    endDate: '2023-11-12',
    reason: 'Pediatric Cardiology Summit, Delhi',
    status: 'PENDING'
  },
  {
    id: 'LR-002',
    staffId: 'S-AP-002',
    staffName: 'Staff Nurse Padma',
    role: UserRole.NURSE,
    type: 'Sick',
    startDate: '2023-10-28',
    endDate: '2023-10-30',
    reason: 'Viral Fever',
    status: 'APPROVED'
  },
  {
    id: 'LR-003',
    staffId: 'S-AP-001',
    staffName: 'Dr. K. Srinivas Rao',
    role: UserRole.DOCTOR,
    type: 'Casual',
    startDate: '2023-12-24',
    endDate: '2023-12-26',
    reason: 'Family Function',
    status: 'PENDING'
  }
];
