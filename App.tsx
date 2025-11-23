import React, { useState } from 'react';
import Layout from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { PatientList } from './components/PatientList';
import { PatientDetail } from './components/PatientDetail';
import { Telemedicine } from './components/Telemedicine';
import { Pharmacy } from './components/Pharmacy';
import { LabRadiology } from './components/LabRadiology';
import { AdminHospital } from './components/AdminHospital';
import { AdminRegistries } from './components/AdminRegistries';
import { AdminAudit } from './components/AdminAudit';
import { Login } from './components/Login';
import { UserRole, Patient } from './types';

function App() {
  // Start with no user logged in
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const handleLogin = (role: UserRole) => {
    setCurrentRole(role);
    // Set default view based on role
    if (role === UserRole.PHARMACIST) setActiveView('pharmacy');
    else if (role === UserRole.LAB_TECH) setActiveView('lab');
    else if (role === UserRole.SUPER_ADMIN) setActiveView('dashboard');
    else setActiveView('dashboard');
  };

  const handleLogout = () => {
    setCurrentRole(null);
    setActiveView('dashboard');
    setSelectedPatient(null);
  };

  const handleNavigate = (view: string) => {
    setActiveView(view);
    setSelectedPatient(null);
  };

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
  };

  // If not logged in, show Login Screen
  if (!currentRole) {
    return <Login onLogin={handleLogin} />;
  }

  const renderContent = () => {
    if (selectedPatient) {
      return (
        <PatientDetail 
          patient={selectedPatient} 
          onClose={() => setSelectedPatient(null)} 
        />
      );
    }

    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'patients':
        return <PatientList onSelectPatient={handlePatientSelect} />;
      case 'telemedicine':
        return <Telemedicine />;
      case 'pharmacy':
        return <Pharmacy />;
      case 'lab':
        return <LabRadiology />;
      case 'admin-hospitals':
        return <AdminHospital />;
      case 'admin-registries':
        return <AdminRegistries />;
      case 'admin-audit':
        return <AdminAudit />;
      case 'genomics':
        return (
           <div className="flex flex-col items-center justify-center h-full text-center p-12 animate-in fade-in duration-500">
             <div className="bg-purple-50 p-6 rounded-full mb-6">
               <svg className="w-16 h-16 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
               </svg>
             </div>
             <h3 className="text-2xl font-bold text-slate-800">Genomics Registry</h3>
             <p className="text-slate-500 max-w-md mt-2">
               Integrated National Registry for genomic markers. Restricted access for Super Admins and Genetic Counselors only.
             </p>
           </div>
        );
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