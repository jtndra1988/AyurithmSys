
import React, { useState, useEffect, useRef } from 'react';
import { MOCK_HOSPITALS, MOCK_STAFF } from '../constants';
import { Hospital, StaffMember, UserRole } from '../types';
import { 
  Building2, 
  Activity, 
  Users, 
  MapPin, 
  Plus, 
  ArrowLeft, 
  Save, 
  UserPlus,
  Trash2,
  X,
  Edit,
  Award,
  CreditCard,
  Briefcase,
  Mail,
  CheckCircle2,
  BedDouble,
  Stethoscope,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Search,
  Check,
  ChevronDown
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

type ViewMode = 'list' | 'create' | 'analytics' | 'staff';

// --- Standardized Data Lists for Dropdowns ---
const STANDARD_DEPARTMENTS = [
  "Administration", "Anesthesiology", "Cardiology", "Critical Care (ICU)", "Dermatology", 
  "Emergency / Trauma", "Endocrinology", "ENT (Otorhinolaryngology)", "Gastroenterology", 
  "General Medicine", "General Surgery", "Gynecology & Obstetrics", "Hematology", 
  "Infectious Diseases", "Laboratory Services", "Nephrology", "Neurology", "Neurosurgery", 
  "Nursing", "Oncology", "Ophthalmology", "Orthopedics", "Pediatrics", "Pharmacy", 
  "Physiotherapy", "Psychiatry", "Pulmonology", "Radiology", "Urology"
];

const STANDARD_QUALIFICATIONS = [
  // Doctors
  "MBBS", "MD (General Medicine)", "MD (Pediatrics)", "MD (Anesthesiology)", "MD (Pathology)", 
  "MS (General Surgery)", "MS (Orthopedics)", "MS (ENT)", "MS (Ophthalmology)", 
  "DM (Cardiology)", "DM (Neurology)", "DM (Gastroenterology)", "DM (Nephrology)",
  "MCh (Neurosurgery)", "MCh (Cardiothoracic Surgery)", "MCh (Urology)", "DNB", 
  "Fellowship in Critical Care",
  // Nursing
  "ANM", "GNM", "B.Sc Nursing", "M.Sc Nursing", "Ph.D (Nursing)", "Diploma in Nursing Admin",
  // Pharmacy
  "D.Pharm", "B.Pharm", "M.Pharm", "Pharm.D",
  // Lab & Radio
  "DMLT", "BMLT", "MMLT", "Diploma in Radiology", "B.Sc Radiology",
  // Admin
  "MBA (Hospital Management)", "MHA (Master of Hospital Admin)", "BHA"
];

export const AdminHospital: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [hospitals, setHospitals] = useState<Hospital[]>(MOCK_HOSPITALS);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [staffList, setStaffList] = useState<StaffMember[]>(MOCK_STAFF);

  // --- Create Hospital Wizard State ---
  const [currentStep, setCurrentStep] = useState(1);
  const [newHospital, setNewHospital] = useState<Partial<Hospital>>({
    name: '',
    type: 'District Hospital',
    district: '',
    state: '',
    address: '',
    bedCapacity: 0,
    activePatients: 0,
    bedConfig: { general: 0, icu: 0, hdu: 0, emergency: 0, maternity: 0 },
    departments: [],
    facilities: [],
    rohiniId: '',
    abdmId: '',
    contactEmail: '',
    contactPhone: '',
    medicalSuperintendent: ''
  });

  // Helper inputs for tags
  const [tempDept, setTempDept] = useState('');
  const [tempFacility, setTempFacility] = useState('');

  // --- Staff Management State ---
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [newStaffData, setNewStaffData] = useState<Partial<StaffMember>>({
    name: '',
    role: UserRole.DOCTOR,
    department: '',
    contact: '',
    email: '',
    registrationNumber: '',
    qualification: '',
    experience: 0
  });

  // State for Multi-Select Dropdowns
  const [activeDropdown, setActiveDropdown] = useState<'department' | 'qualification' | null>(null);
  const [deptSearch, setDeptSearch] = useState('');
  const [qualSearch, setQualSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate total beds automatically
  useEffect(() => {
    if (newHospital.bedConfig) {
      const total = 
        (newHospital.bedConfig.general || 0) + 
        (newHospital.bedConfig.icu || 0) + 
        (newHospital.bedConfig.hdu || 0) + 
        (newHospital.bedConfig.emergency || 0) + 
        (newHospital.bedConfig.maternity || 0);
      setNewHospital(prev => ({ ...prev, bedCapacity: total }));
    }
  }, [newHospital.bedConfig]);

  // Mock Analytics Data Generator
  const getAnalyticsData = (hospital: Hospital) => {
    return [
      { name: 'Mon', admissions: Math.floor(hospital.bedCapacity * 0.05), discharges: Math.floor(hospital.bedCapacity * 0.04) },
      { name: 'Tue', admissions: Math.floor(hospital.bedCapacity * 0.06), discharges: Math.floor(hospital.bedCapacity * 0.05) },
      { name: 'Wed', admissions: Math.floor(hospital.bedCapacity * 0.04), discharges: Math.floor(hospital.bedCapacity * 0.06) },
      { name: 'Thu', admissions: Math.floor(hospital.bedCapacity * 0.07), discharges: Math.floor(hospital.bedCapacity * 0.04) },
      { name: 'Fri', admissions: Math.floor(hospital.bedCapacity * 0.05), discharges: Math.floor(hospital.bedCapacity * 0.05) },
      { name: 'Sat', admissions: Math.floor(hospital.bedCapacity * 0.03), discharges: Math.floor(hospital.bedCapacity * 0.02) },
      { name: 'Sun', admissions: Math.floor(hospital.bedCapacity * 0.02), discharges: Math.floor(hospital.bedCapacity * 0.01) },
    ];
  };

  const occupancyData = selectedHospital ? [
    { name: 'Occupied', value: selectedHospital.activePatients },
    { name: 'Available', value: selectedHospital.bedCapacity - selectedHospital.activePatients }
  ] : [];

  const COLORS = ['#ef4444', '#10b981'];

  const handleCreateHospital = () => {
    if (newHospital.name && newHospital.district) {
      const hospital = {
        ...newHospital,
        id: `H-${Math.floor(Math.random() * 1000)}`,
        activePatients: 0
      } as Hospital;
      
      setHospitals([...hospitals, hospital]);
      setViewMode('list');
      // Reset form
      setNewHospital({ 
        name: '', type: 'District Hospital', district: '', state: '', address: '',
        bedConfig: { general: 0, icu: 0, hdu: 0, emergency: 0, maternity: 0 },
        departments: [], facilities: [], bedCapacity: 0 
      });
      setCurrentStep(1);
    }
  };

  const addTag = (type: 'dept' | 'facility') => {
    if (type === 'dept' && tempDept) {
      setNewHospital(prev => ({ ...prev, departments: [...(prev.departments || []), tempDept] }));
      setTempDept('');
    } else if (type === 'facility' && tempFacility) {
      setNewHospital(prev => ({ ...prev, facilities: [...(prev.facilities || []), tempFacility] }));
      setTempFacility('');
    }
  };

  const removeTag = (type: 'dept' | 'facility', index: number) => {
    if (type === 'dept') {
      const updated = [...(newHospital.departments || [])];
      updated.splice(index, 1);
      setNewHospital(prev => ({ ...prev, departments: updated }));
    } else {
      const updated = [...(newHospital.facilities || [])];
      updated.splice(index, 1);
      setNewHospital(prev => ({ ...prev, facilities: updated }));
    }
  };

  // Staff Management Logic
  const openAddStaffModal = () => {
    setEditingStaffId(null);
    setNewStaffData({ name: '', role: UserRole.DOCTOR, department: '', contact: '', email: '', registrationNumber: '', qualification: '', experience: 0 });
    setIsAddStaffOpen(true);
    setDeptSearch('');
    setQualSearch('');
  };

  const handleEditStaff = (staff: StaffMember) => {
    setEditingStaffId(staff.id);
    setNewStaffData({ ...staff });
    setIsAddStaffOpen(true);
    setDeptSearch('');
    setQualSearch('');
  };

  const handleSaveStaff = () => {
    if (selectedHospital && newStaffData.name && newStaffData.department) {
      if (editingStaffId) {
        setStaffList(staffList.map(s => s.id === editingStaffId ? { ...s, ...newStaffData as StaffMember } : s));
      } else {
        const newStaffMember: StaffMember = {
          ...newStaffData as StaffMember,
          id: `S-${Math.floor(Math.random() * 10000)}`,
          hospitalId: selectedHospital.id,
          status: 'Active',
        };
        setStaffList([...staffList, newStaffMember]);
      }
      setIsAddStaffOpen(false);
      setEditingStaffId(null);
    }
  };

  const handleDeleteStaff = (id: string) => {
    if (window.confirm('Are you sure you want to remove this staff member?')) {
      setStaffList(staffList.filter(s => s.id !== id));
    }
  };

  const handleViewAnalytics = (hospital: Hospital) => {
    setSelectedHospital(hospital);
    setViewMode('analytics');
  };

  const handleManageStaff = (hospital: Hospital) => {
    setSelectedHospital(hospital);
    setViewMode('staff');
  };

  // --- Helper to Render Multi-Select Dropdown ---
  const renderMultiSelect = (
    label: string, 
    type: 'department' | 'qualification', 
    options: string[], 
    currentValue: string, 
    onUpdate: (val: string) => void,
    searchValue: string,
    onSearchChange: (val: string) => void
  ) => {
    const selectedItems = currentValue ? currentValue.split(', ').filter(Boolean) : [];
    const isOpen = activeDropdown === type;

    const toggleSelection = (item: string) => {
      let newSelection;
      if (selectedItems.includes(item)) {
        newSelection = selectedItems.filter(i => i !== item);
      } else {
        newSelection = [...selectedItems, item];
      }
      onUpdate(newSelection.join(', '));
    };

    const filteredOptions = options.filter(opt => 
      opt.toLowerCase().includes(searchValue.toLowerCase())
    );

    return (
      <div className="relative">
        <label className="block text-sm font-semibold text-slate-700 mb-1">{label} <span className="text-red-500">*</span></label>
        <div 
          onClick={() => setActiveDropdown(isOpen ? null : type)}
          className={`w-full px-3 py-2 border rounded-lg cursor-pointer bg-white flex items-center justify-between min-h-[42px] transition-all ${
            isOpen ? 'border-brand-500 ring-2 ring-brand-100' : 'border-slate-300 hover:border-slate-400'
          }`}
        >
          <div className="flex flex-wrap gap-1.5">
            {selectedItems.length > 0 ? (
              selectedItems.map((item, idx) => (
                <span key={idx} className="bg-brand-50 text-brand-700 px-2 py-0.5 rounded text-xs font-bold border border-brand-100 flex items-center gap-1">
                  {item}
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-red-500" 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelection(item);
                    }} 
                  />
                </span>
              ))
            ) : (
              <span className="text-slate-400 text-sm">Select {label}...</span>
            )}
          </div>
          <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>

        {isOpen && (
          <div ref={dropdownRef} className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="p-2 border-b border-slate-100 bg-slate-50 sticky top-0">
               <div className="relative">
                 <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                 <input 
                   type="text" 
                   className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-brand-500"
                   placeholder={`Search ${label}...`}
                   value={searchValue}
                   onChange={(e) => onSearchChange(e.target.value)}
                   autoFocus
                   onClick={(e) => e.stopPropagation()} 
                 />
               </div>
            </div>
            <div className="overflow-y-auto p-1">
               {filteredOptions.length > 0 ? (
                 filteredOptions.map((option) => (
                   <div 
                     key={option} 
                     onClick={(e) => {
                        e.stopPropagation();
                        toggleSelection(option);
                     }}
                     className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-lg cursor-pointer text-sm text-slate-700"
                   >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                         selectedItems.includes(option) ? 'bg-brand-600 border-brand-600 text-white' : 'border-slate-300'
                      }`}>
                         {selectedItems.includes(option) && <Check className="h-3 w-3" />}
                      </div>
                      <span>{option}</span>
                   </div>
                 ))
               ) : (
                 <div className="p-4 text-center text-slate-400 text-xs">No options found.</div>
               )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // --- Render Functions ---

  const renderList = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
           <h2 className="text-xl font-bold text-slate-800">Network Facilities</h2>
           <p className="text-sm text-slate-500">Manage all registered Government Hospitals, PHCs, and CHCs.</p>
        </div>
        <button 
          onClick={() => setViewMode('create')}
          className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 flex items-center gap-2 shadow-sm shadow-brand-200"
        >
          <Plus className="h-4 w-4" /> Add New Facility
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hospitals.map(hospital => (
          <div key={hospital.id} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all group flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-brand-50 rounded-lg text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                <Building2 className="h-6 w-6" />
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${
                 hospital.type === 'Medical College' ? 'bg-purple-50 text-purple-700' : 
                 hospital.type === 'District Hospital' ? 'bg-blue-50 text-blue-700' :
                 'bg-emerald-50 text-emerald-700'
              }`}>
                {hospital.type}
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1 leading-tight">{hospital.name}</h3>
            <div className="flex items-center gap-1 text-sm text-slate-500 mb-4">
              <MapPin className="h-3.5 w-3.5" /> {hospital.district}, {hospital.state}
            </div>
            
            <div className="mt-auto pt-4 border-t border-slate-100 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase mb-1">Total Capacity</p>
                  <div className="flex items-end gap-1">
                    <p className="text-lg font-bold text-slate-800">{hospital.bedCapacity}</p>
                    <span className="text-xs text-slate-400 mb-1">Beds</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase mb-1">Active Cases</p>
                  <p className="text-lg font-bold text-slate-800">{hospital.activePatients}</p>
                </div>
              </div>

              <div className="w-full bg-slate-100 h-1.5 rounded-full">
                 <div 
                   className={`h-1.5 rounded-full ${
                     (hospital.activePatients / hospital.bedCapacity) > 0.9 ? 'bg-red-500' : 'bg-emerald-500'
                   }`} 
                   style={{ width: `${Math.min((hospital.activePatients / hospital.bedCapacity) * 100, 100)}%` }}
                 ></div>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button 
                onClick={() => handleViewAnalytics(hospital)}
                className="flex-1 py-2 text-xs font-bold text-brand-600 bg-brand-50 rounded hover:bg-brand-100 transition-colors uppercase tracking-wide border border-brand-100"
              >
                Analytics
              </button>
              <button 
                onClick={() => handleManageStaff(hospital)}
                className="flex-1 py-2 text-xs font-bold text-slate-600 bg-slate-50 rounded hover:bg-slate-100 transition-colors uppercase tracking-wide border border-slate-200"
              >
                Staff
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCreateWizard = () => {
    const steps = [
      { num: 1, title: 'General Info', icon: Building2 },
      { num: 2, title: 'Infrastructure', icon: BedDouble },
      { num: 3, title: 'Clinical Scope', icon: Stethoscope },
      { num: 4, title: 'Admin & Compliance', icon: ShieldCheck },
    ];

    return (
      <div className="max-w-4xl mx-auto animate-in slide-in-from-right-4 duration-300">
        <div className="mb-6 flex items-center justify-between">
           <button onClick={() => setViewMode('list')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors">
              <ArrowLeft className="h-4 w-4" /> Cancel Registration
           </button>
           <h2 className="text-xl font-bold text-slate-800">Register New Facility</h2>
        </div>

        {/* Wizard Steps */}
        <div className="mb-8 flex justify-between items-center relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -z-10"></div>
          {steps.map((step) => (
             <div key={step.num} className={`flex flex-col items-center gap-2 bg-slate-50 px-2`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors border-4 ${
                   currentStep >= step.num 
                     ? 'bg-brand-600 text-white border-brand-100' 
                     : 'bg-white text-slate-400 border-slate-200'
                }`}>
                   <step.icon className="h-4 w-4" />
                </div>
                <span className={`text-xs font-medium ${currentStep >= step.num ? 'text-brand-700' : 'text-slate-400'}`}>
                   {step.title}
                </span>
             </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="p-8">
             {/* STEP 1: General Info */}
             {currentStep === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-sm font-semibold text-slate-700">Facility Name <span className="text-red-500">*</span></label>
                         <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" placeholder="e.g. Govt General Hospital" value={newHospital.name} onChange={e => setNewHospital({...newHospital, name: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                         <label className="text-sm font-semibold text-slate-700">Facility Type <span className="text-red-500">*</span></label>
                         <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white" value={newHospital.type} onChange={e => setNewHospital({...newHospital, type: e.target.value as any})}>
                            <option value="District Hospital">District Hospital</option>
                            <option value="Medical College">Medical College</option>
                            <option value="PHC">Primary Health Center (PHC)</option>
                            <option value="CHC">Community Health Center (CHC)</option>
                            <option value="Specialized Center">Specialized Center</option>
                         </select>
                      </div>
                      <div className="space-y-2">
                         <label className="text-sm font-semibold text-slate-700">State <span className="text-red-500">*</span></label>
                         <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" placeholder="e.g. Uttar Pradesh" value={newHospital.state} onChange={e => setNewHospital({...newHospital, state: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                         <label className="text-sm font-semibold text-slate-700">District <span className="text-red-500">*</span></label>
                         <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" placeholder="e.g. Lucknow" value={newHospital.district} onChange={e => setNewHospital({...newHospital, district: e.target.value})} />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                         <label className="text-sm font-semibold text-slate-700">Full Address</label>
                         <textarea className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none h-20 resize-none" placeholder="Enter complete postal address..." value={newHospital.address} onChange={e => setNewHospital({...newHospital, address: e.target.value})} />
                      </div>
                   </div>
                </div>
             )}

             {/* STEP 2: Infrastructure */}
             {currentStep === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
                   <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex justify-between items-center mb-6">
                      <h3 className="font-semibold text-slate-700">Total Calculated Capacity</h3>
                      <span className="text-2xl font-bold text-brand-600">{newHospital.bedCapacity} <span className="text-sm text-slate-500 font-normal">Beds</span></span>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                         <label className="text-sm font-semibold text-slate-700">General Wards</label>
                         <input type="number" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" placeholder="0" value={newHospital.bedConfig?.general} onChange={e => setNewHospital({...newHospital, bedConfig: { ...newHospital.bedConfig!, general: Number(e.target.value) }})} />
                      </div>
                      <div className="space-y-2">
                         <label className="text-sm font-semibold text-slate-700">ICU Beds</label>
                         <input type="number" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" placeholder="0" value={newHospital.bedConfig?.icu} onChange={e => setNewHospital({...newHospital, bedConfig: { ...newHospital.bedConfig!, icu: Number(e.target.value) }})} />
                      </div>
                      <div className="space-y-2">
                         <label className="text-sm font-semibold text-slate-700">HDU Beds</label>
                         <input type="number" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" placeholder="0" value={newHospital.bedConfig?.hdu} onChange={e => setNewHospital({...newHospital, bedConfig: { ...newHospital.bedConfig!, hdu: Number(e.target.value) }})} />
                      </div>
                      <div className="space-y-2">
                         <label className="text-sm font-semibold text-slate-700">Emergency / Trauma</label>
                         <input type="number" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" placeholder="0" value={newHospital.bedConfig?.emergency} onChange={e => setNewHospital({...newHospital, bedConfig: { ...newHospital.bedConfig!, emergency: Number(e.target.value) }})} />
                      </div>
                      <div className="space-y-2">
                         <label className="text-sm font-semibold text-slate-700">Maternity</label>
                         <input type="number" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" placeholder="0" value={newHospital.bedConfig?.maternity} onChange={e => setNewHospital({...newHospital, bedConfig: { ...newHospital.bedConfig!, maternity: Number(e.target.value) }})} />
                      </div>
                   </div>
                </div>
             )}

             {/* STEP 3: Clinical Scope */}
             {currentStep === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
                   {/* Departments */}
                   <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Departments</label>
                      <div className="flex gap-2">
                         <input type="text" className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" placeholder="Add Department (e.g. Cardiology)" value={tempDept} onChange={e => setTempDept(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTag('dept')} />
                         <button onClick={() => addTag('dept')} className="bg-slate-100 px-4 rounded-lg font-medium text-slate-600 hover:bg-slate-200">Add</button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                         {newHospital.departments?.map((dept, i) => (
                            <span key={i} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 border border-blue-100">
                               {dept}
                               <button onClick={() => removeTag('dept', i)}><X className="h-3 w-3 hover:text-red-500" /></button>
                            </span>
                         ))}
                      </div>
                   </div>

                   {/* Facilities */}
                   <div className="space-y-2 pt-4 border-t border-slate-100">
                      <label className="text-sm font-semibold text-slate-700">Specialized Facilities</label>
                      <div className="flex gap-2">
                         <input type="text" className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" placeholder="Add Facility (e.g. Blood Bank, MRI)" value={tempFacility} onChange={e => setTempFacility(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTag('facility')} />
                         <button onClick={() => addTag('facility')} className="bg-slate-100 px-4 rounded-lg font-medium text-slate-600 hover:bg-slate-200">Add</button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                         {newHospital.facilities?.map((fac, i) => (
                            <span key={i} className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 border border-purple-100">
                               {fac}
                               <button onClick={() => removeTag('facility', i)}><X className="h-3 w-3 hover:text-red-500" /></button>
                            </span>
                         ))}
                      </div>
                   </div>
                </div>
             )}

             {/* STEP 4: Admin & Compliance */}
             {currentStep === 4 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-sm font-semibold text-slate-700">Medical Superintendent Name</label>
                         <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" placeholder="Dr. Name" value={newHospital.medicalSuperintendent} onChange={e => setNewHospital({...newHospital, medicalSuperintendent: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                         <label className="text-sm font-semibold text-slate-700">Official Contact Email</label>
                         <input type="email" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" placeholder="admin@hospital.gov.in" value={newHospital.contactEmail} onChange={e => setNewHospital({...newHospital, contactEmail: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                         <label className="text-sm font-semibold text-slate-700">Emergency Helpline</label>
                         <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" placeholder="+91-..." value={newHospital.contactPhone} onChange={e => setNewHospital({...newHospital, contactPhone: e.target.value})} />
                      </div>
                   </div>
                   
                   <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-sm font-semibold text-slate-700">ROHINI ID (Insurance Registry)</label>
                         <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none font-mono" placeholder="ROHINI-XXXX" value={newHospital.rohiniId} onChange={e => setNewHospital({...newHospital, rohiniId: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                         <label className="text-sm font-semibold text-slate-700">ABDM Facility ID</label>
                         <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none font-mono" placeholder="IN-XX-XXXX" value={newHospital.abdmId} onChange={e => setNewHospital({...newHospital, abdmId: e.target.value})} />
                      </div>
                   </div>
                </div>
             )}
          </div>

          {/* Wizard Footer */}
          <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
             <button 
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
                className="px-5 py-2 rounded-lg text-slate-600 font-medium hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
             >
                <ChevronLeft className="h-4 w-4" /> Back
             </button>
             
             {currentStep < 4 ? (
                <button 
                   onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
                   className="px-6 py-2 bg-brand-600 text-white rounded-lg font-bold hover:bg-brand-700 shadow-sm flex items-center gap-2"
                >
                   Next Step <ChevronRight className="h-4 w-4" />
                </button>
             ) : (
                <button 
                   onClick={handleCreateHospital}
                   className="px-8 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 shadow-md flex items-center gap-2"
                >
                   <CheckCircle2 className="h-4 w-4" /> Complete Registration
                </button>
             )}
          </div>
        </div>
      </div>
    );
  };

  const renderAnalytics = () => {
    if (!selectedHospital) return null;
    return (
      <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setViewMode('list')}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to List
          </button>
          <h2 className="text-xl font-bold text-slate-800">{selectedHospital.name} Analytics</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Bed Occupancy</h3>
            <div className="w-full h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={occupancyData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {occupancyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-6 mt-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-sm font-medium text-slate-600">Occupied ({selectedHospital.activePatients})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="text-sm font-medium text-slate-600">Free ({selectedHospital.bedCapacity - selectedHospital.activePatients})</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 grid grid-cols-2 gap-4">
             <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
               <div>
                 <p className="text-sm text-slate-500 font-medium">Daily Admissions</p>
                 <h3 className="text-3xl font-bold text-slate-900 mt-2">42</h3>
                 <p className="text-xs text-green-600 mt-1">↑ 12% vs avg</p>
               </div>
               <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                 <Users className="h-6 w-6" />
               </div>
             </div>
             <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
               <div>
                 <p className="text-sm text-slate-500 font-medium">Avg Length of Stay</p>
                 <h3 className="text-3xl font-bold text-slate-900 mt-2">4.5 Days</h3>
                 <p className="text-xs text-slate-400 mt-1">Target: 4.0 Days</p>
               </div>
               <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                 <Activity className="h-6 w-6" />
               </div>
             </div>
             
             <div className="col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-64">
               <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Weekly Patient Flow</h3>
               <ResponsiveContainer width="100%" height="80%">
                 <BarChart data={getAnalyticsData(selectedHospital)}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                    <Tooltip contentStyle={{ borderRadius: '8px' }} />
                    <Bar dataKey="admissions" fill="#0ea5e9" name="Admissions" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="discharges" fill="#cbd5e1" name="Discharges" radius={[4, 4, 0, 0]} />
                 </BarChart>
               </ResponsiveContainer>
             </div>
          </div>
        </div>
      </div>
    );
  };

  const renderStaff = () => {
    if (!selectedHospital) return null;
    const staff = staffList.filter(s => s.hospitalId === selectedHospital.id);

    return (
      <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
             <button 
              onClick={() => setViewMode('list')}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors"
             >
               <ArrowLeft className="h-4 w-4" />
             </button>
             <h2 className="text-xl font-bold text-slate-800">{selectedHospital.name}: Staff Directory</h2>
          </div>
          <button 
            onClick={openAddStaffModal}
            className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 flex items-center gap-2 shadow-sm"
          >
            <UserPlus className="h-4 w-4" /> Add Staff
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
           <table className="w-full text-left">
              <thead>
                 <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-4">Professional</th>
                    <th className="px-6 py-4">Role & Dept</th>
                    <th className="px-6 py-4">Credentials</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Contact</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                 {staff.length > 0 ? (
                    staff.map(s => (
                       <tr key={s.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4">
                             <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600">
                                   {s.name.charAt(0)}
                                </div>
                                <div>
                                   <p className="font-semibold text-slate-900">{s.name}</p>
                                   <p className="text-xs text-slate-500">{s.email}</p>
                                </div>
                             </div>
                          </td>
                          <td className="px-6 py-4">
                             <p className="text-sm font-medium text-slate-800">{s.department}</p>
                             <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-wide mt-1">
                                {s.role.replace('_', ' ')}
                             </span>
                          </td>
                          <td className="px-6 py-4">
                             <div className="text-xs space-y-1">
                                {s.registrationNumber && (
                                   <div className="flex items-center gap-1.5 text-slate-600" title="Medical Registration">
                                      <CreditCard className="h-3 w-3" /> <span className="font-mono">{s.registrationNumber}</span>
                                   </div>
                                )}
                                {s.qualification && (
                                   <div className="flex items-center gap-1.5 text-slate-600" title="Qualification">
                                      <Award className="h-3 w-3" /> <span>{s.qualification}</span>
                                   </div>
                                )}
                             </div>
                          </td>
                          <td className="px-6 py-4">
                             <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                                s.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                             }`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${s.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                                {s.status}
                             </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500 font-mono">{s.contact}</td>
                          <td className="px-6 py-4 text-right">
                             <div className="flex items-center justify-end gap-2">
                                <button onClick={() => handleEditStaff(s)} className="text-slate-400 hover:text-brand-600 transition-colors p-1"><Edit className="h-4 w-4" /></button>
                                <button onClick={() => handleDeleteStaff(s.id)} className="text-slate-400 hover:text-red-600 transition-colors p-1"><Trash2 className="h-4 w-4" /></button>
                             </div>
                          </td>
                       </tr>
                    ))
                 ) : (
                    <tr>
                       <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                          No staff members found for this facility.
                       </td>
                    </tr>
                 )}
              </tbody>
           </table>
        </div>

        {/* Add/Edit Staff Modal */}
        {isAddStaffOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
             <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl m-4 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50">
                   <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                     <UserPlus className="h-5 w-5 text-brand-600" />
                     {editingStaffId ? 'Edit Medical Professional' : 'Register New Staff Member'}
                   </h3>
                   <button onClick={() => setIsAddStaffOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
                </div>
                
                <div className="p-6 overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Users className="h-4 w-4" /> Personal Information
                      </h4>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                      <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" placeholder="e.g. Dr. Rajesh Kumar" value={newStaffData.name} onChange={e => setNewStaffData({...newStaffData, name: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Role / Designation <span className="text-red-500">*</span></label>
                      <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white" value={newStaffData.role} onChange={e => setNewStaffData({...newStaffData, role: e.target.value as UserRole})}>
                         <option value={UserRole.DOCTOR}>Doctor / Consultant</option>
                         <option value={UserRole.NURSE}>Nursing Officer</option>
                         <option value={UserRole.HOSPITAL_ADMIN}>Hospital Administrator</option>
                         <option value={UserRole.PHARMACIST}>Pharmacist</option>
                         <option value={UserRole.LAB_TECH}>Lab Technician</option>
                         <option value={UserRole.RADIOLOGIST}>Radiologist</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input type="email" className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" placeholder="official@gov.in" value={newStaffData.email} onChange={e => setNewStaffData({...newStaffData, email: e.target.value})} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Contact Number <span className="text-red-500">*</span></label>
                      <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" placeholder="+91-9876543210" value={newStaffData.contact} onChange={e => setNewStaffData({...newStaffData, contact: e.target.value})} />
                    </div>

                    <div className="md:col-span-2 pt-2 border-t border-slate-100">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 mt-4 flex items-center gap-2">
                        <Award className="h-4 w-4" /> Professional Credentials
                      </h4>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Registration Number</label>
                      <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none font-mono placeholder:font-sans" placeholder="e.g. MCI-2340-22" value={newStaffData.registrationNumber} onChange={e => setNewStaffData({...newStaffData, registrationNumber: e.target.value})} />
                    </div>
                    
                    {/* Replaced Simple Input with Multi-Select Checkboxes */}
                    <div>
                       {renderMultiSelect(
                         "Qualification(s)", 
                         "qualification", 
                         STANDARD_QUALIFICATIONS, 
                         newStaffData.qualification || '', 
                         (val) => setNewStaffData({...newStaffData, qualification: val}),
                         qualSearch,
                         setQualSearch
                       )}
                    </div>

                    <div>
                       {renderMultiSelect(
                         "Department / Unit", 
                         "department", 
                         STANDARD_DEPARTMENTS, 
                         newStaffData.department || '', 
                         (val) => setNewStaffData({...newStaffData, department: val}),
                         deptSearch,
                         setDeptSearch
                       )}
                    </div>
                    
                    <div>
                       <label className="block text-sm font-semibold text-slate-700 mb-1">Experience (Years)</label>
                       <div className="relative">
                          <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <input type="number" className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" placeholder="e.g. 10" value={newStaffData.experience} onChange={e => setNewStaffData({...newStaffData, experience: Number(e.target.value)})} />
                       </div>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                   <button onClick={() => setIsAddStaffOpen(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                   <button onClick={handleSaveStaff} disabled={!newStaffData.name || !newStaffData.department || !newStaffData.contact} className="px-6 py-2 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center gap-2">
                      <Save className="h-4 w-4" /> {editingStaffId ? 'Update Record' : 'Register Staff'}
                   </button>
                </div>
             </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {viewMode === 'list' && renderList()}
      {viewMode === 'create' && renderCreateWizard()}
      {viewMode === 'analytics' && renderAnalytics()}
      {viewMode === 'staff' && renderStaff()}
    </div>
  );
};
