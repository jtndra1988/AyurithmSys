
import React from 'react';
import { UserRole } from '../../types';
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
  ShieldCheck,
  Wrench,
  Ticket,
  ClipboardList,
  BedDouble,
  Search,
  HeartPulse,
  Briefcase,
  Droplet,
  MonitorPlay,
  Radio
} from 'lucide-react';
import { DEMO_USERS } from '../../constants';

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
    // --- SUPER ADMIN ---
    { 
      id: 'dashboard', 
      label: 'Command Center', 
      icon: LayoutDashboard, 
      roles: [UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN] 
    },
    {
      id: 'emergency-command',
      label: '108 Response Center',
      icon: Radio,
      roles: [UserRole.SUPER_ADMIN]
    },
    {
      id: 'blood-bank',
      label: 'Jeevandan Grid',
      icon: Droplet,
      roles: [UserRole.SUPER_ADMIN]
    },
    { 
      id: 'admin-hospitals', 
      label: 'Network Hospitals', 
      icon: Building2, 
      roles: [UserRole.SUPER_ADMIN] 
    },
    { 
      id: 'admin-registries', 
      label: 'AP State Registries', 
      icon: UploadCloud, 
      roles: [UserRole.SUPER_ADMIN] 
    },
    { 
      id: 'genomics', 
      label: 'Genomics Registry', 
      icon: Dna, 
      roles: [UserRole.SUPER_ADMIN] 
    },
    { 
      id: 'admin-audit', 
      label: 'Audit & Compliance', 
      icon: ShieldCheck, 
      roles: [UserRole.SUPER_ADMIN] 
    },

    // --- HOSPITAL ADMIN SPECIFIC ---
    {
      id: 'staff-management',
      label: 'Staff & Roster',
      icon: Users,
      roles: [UserRole.HOSPITAL_ADMIN]
    },
    { 
      id: 'billing', 
      label: 'Billing & Insurance', 
      icon: CreditCard, 
      roles: [UserRole.HOSPITAL_ADMIN, UserRole.RECEPTIONIST] 
    },
    { 
      id: 'assets', 
      label: 'Asset Management', 
      icon: Wrench, 
      roles: [UserRole.HOSPITAL_ADMIN] 
    },
    { 
      id: 'pharmacy', 
      label: 'Pharmacy Inventory', 
      icon: Pill, 
      roles: [UserRole.HOSPITAL_ADMIN, UserRole.PHARMACIST] 
    },

    // --- DOCTOR ---
    {
      id: 'doctor-dashboard',
      label: 'Clinical Dashboard',
      icon: LayoutDashboard, 
      roles: [UserRole.DOCTOR]
    },
    {
      id: 'tele-icu',
      label: 'e-ICU Command',
      icon: MonitorPlay,
      roles: [UserRole.DOCTOR]
    },
    { 
      id: 'patients', 
      label: 'My OPD Queue', 
      icon: Users, 
      roles: [UserRole.DOCTOR] 
    },
    { 
      id: 'patients-ipd', 
      label: 'Inpatient Rounds', 
      icon: BedDouble, 
      roles: [UserRole.DOCTOR] 
    },
    { 
      id: 'telemedicine', 
      label: 'Telemedicine', 
      icon: Video, 
      roles: [UserRole.DOCTOR, UserRole.NURSE] 
    },

    // --- NURSE SPECIFIC ---
    {
      id: 'nurse-dashboard',
      label: 'Nurse Station',
      icon: HeartPulse,
      roles: [UserRole.NURSE]
    },

    // --- SHARED / OTHERS ---
    { 
      id: 'front-desk', 
      label: 'Front Desk / Triage', 
      icon: Ticket, 
      roles: [UserRole.RECEPTIONIST, UserRole.NURSE] 
    },
    { 
      id: 'lab', 
      label: 'Laboratory & PACS', 
      icon: TestTube2, 
      roles: [UserRole.LAB_TECH, UserRole.DOCTOR] 
    },
  ];

  const currentUser = DEMO_USERS.find(u => u.role === currentRole) || DEMO_USERS[0];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-slate-900 text-white transition-all duration-300 flex flex-col shadow-xl z-20`}>
        <div className="p-4 flex items-center justify-between border-b border-slate-800">
          <div className={`flex items-center gap-2 ${!isSidebarOpen && 'justify-center w-full'}`}>
            <Building2 className="h-8 w-8 text-emerald-400" />
            {isSidebarOpen && (
               <div className="leading-tight">
                  <span className="font-bold text-lg tracking-tight block text-emerald-50">AP Health Cloud</span>
                  <span className="text-[9px] text-slate-400 uppercase tracking-widest block">Govt. of Andhra Pradesh</span>
               </div>
            )}
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
                  ? 'bg-emerald-600 text-white shadow-md' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {isSidebarOpen && <span className="font-medium text-sm">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-900">
          {isSidebarOpen && (
             <div className="mb-4 text-xs text-slate-400 px-2">
                Logged in as: <br/>
                <span className="font-bold text-white text-sm">{currentUser.name}</span> <br/>
                <span className="text-emerald-400 text-[10px] uppercase font-bold">{currentUser.label}</span>
             </div>
          )}
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5" />
            {isSidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-slate-200 shadow-sm px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 capitalize">
               {activeView.replace(/-/g, ' ')}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
               Statewide Hospital Management System v1.2
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end hidden md:flex">
              <span className="text-sm font-semibold text-slate-700">{currentUser.name}</span>
              <span className="text-xs text-slate-500">{currentUser.label}</span>
            </div>
            <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold border border-emerald-200 shadow-sm">
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
