import React from 'react';
import { UserRole } from '../types';
import { 
  Activity, 
  LayoutDashboard, 
  Users, 
  Stethoscope, 
  Video, 
  FileText, 
  Settings, 
  LogOut,
  Dna,
  Menu,
  Pill,
  TestTube2,
  Building2,
  CreditCard,
  UploadCloud,
  ShieldCheck
} from 'lucide-react';
import { DEMO_USERS } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  currentRole: UserRole;
  onLogout: () => void;
  activeView: string;
  onNavigate: (view: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentRole, onLogout, activeView, onNavigate }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  // Define navigation items with role access
  const navItems = [
    { 
      id: 'dashboard', 
      label: 'Command Center', 
      icon: LayoutDashboard, 
      roles: [UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN, UserRole.DOCTOR] 
    },
    { 
      id: 'admin-hospitals', 
      label: 'Hospitals', 
      icon: Building2, 
      roles: [UserRole.SUPER_ADMIN] 
    },
    { 
      id: 'admin-registries', 
      label: 'National Registries', 
      icon: UploadCloud, 
      roles: [UserRole.SUPER_ADMIN] 
    },
    { 
      id: 'admin-audit', 
      label: 'Audit & Compliance', 
      icon: ShieldCheck, 
      roles: [UserRole.SUPER_ADMIN] 
    },
    { 
      id: 'patients', 
      label: 'Patient List', 
      icon: Users, 
      roles: [UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST, UserRole.HOSPITAL_ADMIN] 
    },
    { 
      id: 'telemedicine', 
      label: 'Telemedicine', 
      icon: Video, 
      roles: [UserRole.DOCTOR, UserRole.NURSE] 
    },
    { 
      id: 'pharmacy', 
      label: 'Pharmacy', 
      icon: Pill, 
      roles: [UserRole.PHARMACIST, UserRole.HOSPITAL_ADMIN] 
    },
    { 
      id: 'lab', 
      label: 'Laboratory', 
      icon: TestTube2, 
      roles: [UserRole.LAB_TECH, UserRole.DOCTOR] 
    },
    { 
      id: 'genomics', 
      label: 'Genomics Registry', 
      icon: Dna, 
      roles: [UserRole.SUPER_ADMIN, UserRole.DOCTOR] 
    },
    { 
      id: 'billing', 
      label: 'Billing & Insurance', 
      icon: CreditCard, 
      roles: [UserRole.HOSPITAL_ADMIN, UserRole.RECEPTIONIST] 
    },
  ];

  const currentUser = DEMO_USERS.find(u => u.role === currentRole) || DEMO_USERS[0];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-brand-900 text-white transition-all duration-300 flex flex-col shadow-xl z-20`}>
        <div className="p-4 flex items-center justify-between border-b border-brand-700">
          <div className={`flex items-center gap-2 ${!isSidebarOpen && 'justify-center w-full'}`}>
            <Activity className="h-8 w-8 text-brand-500" />
            {isSidebarOpen && <span className="font-bold text-xl tracking-tight">HMS<span className="text-brand-500">+</span></span>}
          </div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden">
            <Menu className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 py-6 px-2 space-y-1 overflow-y-auto">
          {navItems.filter(item => item.roles.includes(currentRole)).map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeView === item.id 
                  ? 'bg-brand-700 text-white shadow-md' 
                  : 'text-brand-100 hover:bg-brand-800'
              }`}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {isSidebarOpen && <span className="font-medium text-sm">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-brand-700">
          {isSidebarOpen && (
             <div className="mb-4 text-xs text-brand-300 px-2">
                Logged in as: <br/>
                <span className="font-bold text-white">{currentUser.name}</span>
             </div>
          )}
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-red-200 hover:bg-red-900/30 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5" />
            {isSidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-slate-200 shadow-sm px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-800 capitalize">
            {activeView.replace('-', ' ')}
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end hidden md:flex">
              <span className="text-sm font-semibold text-slate-700">{currentUser.name}</span>
              <span className="text-xs text-slate-500">{currentUser.label}</span>
            </div>
            <div className="h-10 w-10 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 font-bold border border-brand-200 shadow-sm">
              {currentUser.name.split(' ').map(n => n[0]).join('').substring(0,2)}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;