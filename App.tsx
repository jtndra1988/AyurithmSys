
import React, { useState } from 'react';
import Layout from './components/shared/Layout';
import { Dashboard } from './components/super_admin/Dashboard';
import { PatientList } from './components/shared/PatientList';
import { PatientDetail } from './components/shared/PatientDetail';
import { FrontDesk } from './components/FrontDesk';
import { Telemedicine } from './components/shared/Telemedicine';
import { Pharmacy } from './components/Pharmacy';
import { LabRadiology } from './components/LabRadiology';
import { AdminHospital } from './components/super_admin/AdminHospital';
import { AdminRegistries } from './components/super_admin/AdminRegistries';
import { AdminAudit } from './components/super_admin/AdminAudit';
import { Login } from './components/shared/Login';
import { UserRole, Patient, RegistryEntry, AuditLog, PatientStatus, VisitType } from './types';
import { MOCK_REGISTRY_DATA, MOCK_AUDIT_LOGS, DEMO_USERS, MOCK_PATIENTS } from './constants';
import { GenomicsRegistry } from './components/super_admin/GenomicsRegistry';
import { HospitalCommandCenter } from './components/hospital_admin/HospitalCommandCenter';
import { Billing } from './components/hospital_admin/Billing';
import { AssetManagement } from './components/AssetManagement';
import { DoctorDashboard } from './components/DoctorDashboard';
import { InpatientRounds } from './components/InpatientRounds';
import { NurseDashboard } from './components/NurseDashboard';
import { StaffManagement } from './components/StaffManagement';
import { BloodBank } from './components/BloodBank';
import { TeleICU } from './components/TeleICU';
import { EmergencyCommand } from './components/super_admin/EmergencyCommand';

function App() {
  // Start with no user logged in
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  
  // Global Patient State (Lifted from PatientList to manage lifecycle)
  const [patients, setPatients] = useState<Patient[]>(MOCK_PATIENTS);

  // Global State for Registries
  const [registryData, setRegistryData] = useState<RegistryEntry[]>(MOCK_REGISTRY_DATA);
  
  // Global State for Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(MOCK_AUDIT_LOGS);

  // Helper to find current user details
  const currentUser = DEMO_USERS.find(u => u.role === currentRole);

  // Centralized Logging Function
  const handleLogAction = (action: string, resource: string, details: string) => {
    if (!currentUser) return;

    const newLog: AuditLog = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toLocaleString('en-IN'),
      userId: currentUser.role === UserRole.SUPER_ADMIN ? 'U-001' : 'S-AP-XXX',
      userName: currentUser.name,
      role: currentUser.role,
      action: action,
      resource: resource,
      details: details
    };

    setAuditLogs(prev => [newLog, ...prev]);
  };

  const handleLogin = (role: UserRole) => {
    setCurrentRole(role);
    const user = DEMO_USERS.find(u => u.role === role);
    
    const loginLog: AuditLog = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toLocaleString('en-IN'),
      userId: 'SYS-AUTH',
      userName: user?.name || 'Unknown',
      role: role,
      action: 'LOGIN',
      resource: 'System Access',
      details: 'User authenticated via Secure Portal'
    };
    setAuditLogs(prev => [loginLog, ...prev]);

    // Set default view based on role
    if (role === UserRole.PHARMACIST) setActiveView('pharmacy');
    else if (role === UserRole.LAB_TECH) setActiveView('lab');
    else if (role === UserRole.SUPER_ADMIN) setActiveView('dashboard');
    else if (role === UserRole.HOSPITAL_ADMIN) setActiveView('dashboard');
    else if (role === UserRole.RECEPTIONIST) setActiveView('front-desk');
    else if (role === UserRole.DOCTOR) setActiveView('doctor-dashboard');
    else if (role === UserRole.NURSE) setActiveView('nurse-dashboard');
    else setActiveView('dashboard');
  };

  const handleLogout = () => {
    handleLogAction('LOGOUT', 'System Access', 'User session terminated');
    setCurrentRole(null);
    setActiveView('dashboard');
    setSelectedPatient(null);
  };

  const handleNavigate = (view: string) => {
    setActiveView(view);
    setSelectedPatient(null);
  };

  const handlePatientSelect = (patient: Patient) => {
    handleLogAction('ACCESS', `Patient ${patient.id}`, `Viewed clinical record of ${patient.name}`);
    setSelectedPatient(patient);
  };

  // --- Patient Lifecycle Actions ---

  // 1. Registration (Front Desk)
  const handleRegisterPatient = (newPatient: Patient) => {
    setPatients(prev => [newPatient, ...prev]);
    handleLogAction('REGISTRATION', `Patient ${newPatient.id}`, `Registered new ${newPatient.visitType} patient: ${newPatient.name}`);
  };

  // 2. Admission (Doctor converts OPD -> IPD)
  const handleAdmitPatient = (patientId: string, ward: string) => {
    setPatients(prev => prev.map(p => 
      p.id === patientId ? { ...p, status: PatientStatus.ADMITTED, visitType: VisitType.IPD, ward: ward } : p
    ));
    handleLogAction('ADMISSION', `Patient ${patientId}`, `Admitted to ${ward}`);
  };

  // 3. Discharge (Doctor finishes IPD)
  const handleDischargePatient = (patientId: string) => {
    setPatients(prev => prev.map(p => 
      p.id === patientId ? { ...p, status: PatientStatus.DISCHARGED, dischargeDate: new Date().toISOString().split('T')[0] } : p
    ));
    handleLogAction('DISCHARGE', `Patient ${patientId}`, `Patient discharged from hospital`);
  };

  // --- Registry Workflow Actions ---
  const handleAddToRegistry = (entry: RegistryEntry) => {
    setRegistryData(prev => [entry, ...prev]);
    handleLogAction('SUBMISSION', `Registry ${entry.type}`, `Reported Case: ${entry.diagnosis}`);
    alert("Case successfully reported to AP State Surveillance Unit.");
  };

  const handleUpdateRegistryStatus = (id: string, newStatus: 'SUBMITTED' | 'FLAGGED' | 'REJECTED') => {
    let actionDetails = '';
    if (newStatus === 'REJECTED') {
      setRegistryData(prev => prev.filter(item => item.id !== id));
      actionDetails = 'Rejected and removed entry';
    } else {
      setRegistryData(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
      actionDetails = newStatus === 'SUBMITTED' ? 'Approved and Committed' : 'Flagged for Audit';
    }
    handleLogAction('GOVERNANCE', `Registry ID ${id}`, actionDetails);
  };

  if (!currentRole) {
    return <Login onLogin={handleLogin} />;
  }

  const renderContent = () => {
    if (selectedPatient) {
      return (
        <PatientDetail 
          patient={selectedPatient} 
          onClose={() => setSelectedPatient(null)}
          onReportToRegistry={handleAddToRegistry}
          onLogAction={handleLogAction}
          onAdmit={handleAdmitPatient}
          onDischarge={handleDischargePatient}
          currentUserRole={currentRole}
        />
      );
    }

    switch (activeView) {
      case 'dashboard':
        return currentRole === UserRole.HOSPITAL_ADMIN ? <HospitalCommandCenter /> : <Dashboard />;
      case 'doctor-dashboard':
        return <DoctorDashboard />;
      case 'nurse-dashboard':
        return (
          <NurseDashboard 
            patients={patients}
            onSelectPatient={handlePatientSelect}
          />
        );
      case 'staff-management':
        return <StaffManagement />;
      case 'front-desk':
        return <FrontDesk onRegister={handleRegisterPatient} />;
      case 'patients': // My OPD Queue
        return (
          <PatientList 
            patients={patients}
            onSelectPatient={handlePatientSelect} 
            onLogAction={handleLogAction} 
          />
        );
      case 'patients-ipd': // Inpatient Rounds
        return (
          <InpatientRounds 
            patients={patients}
            onSelectPatient={handlePatientSelect}
            onLogAction={handleLogAction}
          />
        );
      case 'patients-all': // Patient Records
        return (
          <PatientList 
            patients={patients}
            onSelectPatient={handlePatientSelect} 
            onLogAction={handleLogAction} 
          />
        );
      case 'telemedicine':
        return <Telemedicine />;
      case 'pharmacy':
        return <Pharmacy />;
      case 'lab':
        return (
          <LabRadiology 
            patients={patients} 
            onUpdatePatients={setPatients}
            currentUserRole={currentRole}
          />
        );
      case 'admin-hospitals':
        return <AdminHospital />;
      case 'admin-registries':
        return (
          <AdminRegistries 
            data={registryData} 
            onUpdateStatus={handleUpdateRegistryStatus}
            onLogAction={handleLogAction}
          />
        );
      case 'admin-audit':
        return <AdminAudit logs={auditLogs} />;
      case 'genomics':
        return <GenomicsRegistry onLogAction={handleLogAction} />;
      case 'billing':
        return <Billing />;
      case 'assets':
        return <AssetManagement />;
      case 'blood-bank':
        return <BloodBank />;
      case 'tele-icu':
        return <TeleICU />;
      case 'emergency-command':
        return <EmergencyCommand />;
      default:
        return <div className="p-4 text-slate-500">Module Under Construction</div>;
    }
  };

  return (
    <Layout 
      currentRole={currentRole} 
      onLogout={handleLogout}
      activeView={activeView}
      onNavigate={handleNavigate}
    >
      {renderContent()}
    </Layout>
  );
}

export default App;
