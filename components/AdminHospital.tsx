
import React, { useState } from 'react';
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
  Mail
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

type ViewMode = 'list' | 'create' | 'analytics' | 'staff';

export const AdminHospital: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [hospitals, setHospitals] = useState<Hospital[]>(MOCK_HOSPITALS);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [staffList, setStaffList] = useState<StaffMember[]>(MOCK_STAFF);

  // New Hospital Form State
  const [newHospital, setNewHospital] = useState<Partial<Hospital>>({
    name: '',
    type: 'District Hospital',
    district: '',
    bedCapacity: 0,
    activePatients: 0
  });

  // Add/Edit Staff Form State
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
      const hospital: Hospital = {
        id: `H-${Math.floor(Math.random() * 1000)}`,
        name: newHospital.name || '',
        type: newHospital.type as any,
        district: newHospital.district || '',
        bedCapacity: Number(newHospital.bedCapacity),
        activePatients: 0
      };
      setHospitals([...hospitals, hospital]);
      setViewMode('list');
      setNewHospital({ name: '', type: 'District Hospital', district: '', bedCapacity: 0 });
    }
  };

  const openAddStaffModal = () => {
    setEditingStaffId(null);
    setNewStaffData({ 
      name: '', 
      role: UserRole.DOCTOR, 
      department: '', 
      contact: '',
      email: '',
      registrationNumber: '',
      qualification: '',
      experience: 0
    });
    setIsAddStaffOpen(true);
  };

  const handleEditStaff = (staff: StaffMember) => {
    setEditingStaffId(staff.id);
    setNewStaffData({
      name: staff.name,
      role: staff.role,
      department: staff.department,
      contact: staff.contact,
      email: staff.email,
      registrationNumber: staff.registrationNumber,
      qualification: staff.qualification,
      experience: staff.experience
    });
    setIsAddStaffOpen(true);
  };

  const handleSaveStaff = () => {
    if (selectedHospital && newStaffData.name && newStaffData.department) {
      if (editingStaffId) {
        // Update existing staff
        setStaffList(staffList.map(s => s.id === editingStaffId ? {
          ...s,
          ...newStaffData as StaffMember
        } : s));
      } else {
        // Create new staff
        const newStaffMember: StaffMember = {
          id: `S-${Math.floor(Math.random() * 10000)}`,
          name: newStaffData.name || '',
          role: newStaffData.role || UserRole.DOCTOR,
          department: newStaffData.department || '',
          hospitalId: selectedHospital.id,
          status: 'Active',
          contact: newStaffData.contact || 'N/A',
          email: newStaffData.email,
          registrationNumber: newStaffData.registrationNumber,
          qualification: newStaffData.qualification,
          experience: newStaffData.experience
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

  // Render List View
  const renderList = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">Network Hospitals</h2>
        <button 
          onClick={() => setViewMode('create')}
          className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 flex items-center gap-2 shadow-sm shadow-brand-200"
        >
          <Plus className="h-4 w-4" /> Add New Facility
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hospitals.map(hospital => (
          <div key={hospital.id} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-brand-50 rounded-lg text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                <Building2 className="h-6 w-6" />
              </div>
              <span className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded uppercase tracking-wider">
                {hospital.type}
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">{hospital.name}</h3>
            <div className="flex items-center gap-1 text-sm text-slate-500 mb-4">
              <MapPin className="h-3.5 w-3.5" /> {hospital.district}
            </div>
            
            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase mb-1">Occupancy</p>
                <div className="flex items-end gap-1">
                  <p className="text-xl font-bold text-slate-800">
                    {Math.round((hospital.activePatients / hospital.bedCapacity) * 100)}%
                  </p>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1">
                  <div 
                    className={`h-1.5 rounded-full ${
                      (hospital.activePatients / hospital.bedCapacity) > 0.9 ? 'bg-red-500' : 'bg-emerald-500'
                    }`} 
                    style={{ width: `${(hospital.activePatients / hospital.bedCapacity) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase mb-1">Active Pts</p>
                <p className="text-xl font-bold text-slate-800">{hospital.activePatients}</p>
              </div>
            </div>

            <div className="mt-4 pt-4 flex gap-2 border-t border-slate-100">
              <button 
                onClick={() => handleViewAnalytics(hospital)}
                className="flex-1 py-2 text-xs font-bold text-brand-600 bg-brand-50 rounded hover:bg-brand-100 transition-colors uppercase tracking-wide"
              >
                Analytics
              </button>
              <button 
                onClick={() => handleManageStaff(hospital)}
                className="flex-1 py-2 text-xs font-bold text-slate-600 bg-slate-50 rounded hover:bg-slate-100 transition-colors uppercase tracking-wide"
              >
                Staff
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render Create View
  const renderCreate = () => (
    <div className="max-w-2xl mx-auto animate-in slide-in-from-right-4 duration-300">
      <button 
        onClick={() => setViewMode('list')}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to List
      </button>

      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-brand-600" /> Register New Healthcare Facility
          </h2>
        </div>
        
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Facility Name</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                placeholder="e.g. Govt General Hospital"
                value={newHospital.name}
                onChange={e => setNewHospital({...newHospital, name: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">District / City</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                placeholder="e.g. Varanasi"
                value={newHospital.district}
                onChange={e => setNewHospital({...newHospital, district: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Facility Type</label>
              <select 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all bg-white"
                value={newHospital.type}
                onChange={e => setNewHospital({...newHospital, type: e.target.value as any})}
              >
                <option value="District Hospital">District Hospital</option>
                <option value="Medical College">Medical College</option>
                <option value="PHC">Primary Health Center (PHC)</option>
                <option value="CHC">Community Health Center (CHC)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Total Bed Capacity</label>
              <input 
                type="number" 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                placeholder="e.g. 500"
                value={newHospital.bedCapacity}
                onChange={e => setNewHospital({...newHospital, bedCapacity: Number(e.target.value)})}
              />
            </div>
          </div>

          <div className="pt-6 flex justify-end gap-3 border-t border-slate-100">
            <button 
              onClick={() => setViewMode('list')}
              className="px-6 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleCreateHospital}
              className="px-6 py-2 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700 shadow-md shadow-brand-200 transition-colors flex items-center gap-2"
              disabled={!newHospital.name || !newHospital.district}
            >
              <Save className="h-4 w-4" /> Save Facility
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Render Analytics View
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
          {/* Occupancy Card */}
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

          {/* Key Metrics */}
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
             
             {/* Weekly Trend Chart */}
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

  // Render Staff View
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
                                <button 
                                  onClick={() => handleEditStaff(s)}
                                  className="text-slate-400 hover:text-brand-600 transition-colors p-1"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteStaff(s.id)}
                                  className="text-slate-400 hover:text-red-600 transition-colors p-1"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
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
                   <button onClick={() => setIsAddStaffOpen(false)} className="text-slate-400 hover:text-slate-600">
                      <X className="h-5 w-5" />
                   </button>
                </div>
                
                <div className="p-6 overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Section 1: Personal Info */}
                    <div className="md:col-span-2">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Users className="h-4 w-4" /> Personal Information
                      </h4>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                      <input 
                         type="text" 
                         className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                         placeholder="e.g. Dr. Rajesh Kumar"
                         value={newStaffData.name}
                         onChange={e => setNewStaffData({...newStaffData, name: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Role / Designation <span className="text-red-500">*</span></label>
                      <select 
                         className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                         value={newStaffData.role}
                         onChange={e => setNewStaffData({...newStaffData, role: e.target.value as UserRole})}
                      >
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
                        <input 
                          type="email" 
                          className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                          placeholder="official@gov.in"
                          value={newStaffData.email}
                          onChange={e => setNewStaffData({...newStaffData, email: e.target.value})}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Contact Number <span className="text-red-500">*</span></label>
                      <input 
                         type="text" 
                         className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                         placeholder="+91-9876543210"
                         value={newStaffData.contact}
                         onChange={e => setNewStaffData({...newStaffData, contact: e.target.value})}
                      />
                    </div>

                    {/* Section 2: Professional Credentials */}
                    <div className="md:col-span-2 pt-2 border-t border-slate-100">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 mt-4 flex items-center gap-2">
                        <Award className="h-4 w-4" /> Professional Credentials
                      </h4>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">
                        Registration Number <span className="text-slate-400 text-xs font-normal">(MCI / INC / State Council)</span>
                      </label>
                      <input 
                         type="text" 
                         className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none font-mono placeholder:font-sans"
                         placeholder="e.g. MCI-2340-22"
                         value={newStaffData.registrationNumber}
                         onChange={e => setNewStaffData({...newStaffData, registrationNumber: e.target.value})}
                      />
                    </div>

                    <div>
                       <label className="block text-sm font-semibold text-slate-700 mb-1">Qualification(s)</label>
                       <input 
                          type="text" 
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                          placeholder="e.g. MBBS, MD (Internal Medicine)"
                          value={newStaffData.qualification}
                          onChange={e => setNewStaffData({...newStaffData, qualification: e.target.value})}
                       />
                    </div>

                    <div>
                       <label className="block text-sm font-semibold text-slate-700 mb-1">Department / Unit <span className="text-red-500">*</span></label>
                       <input 
                          type="text" 
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                          placeholder="e.g. Cardiology, ICU, OPD"
                          value={newStaffData.department}
                          onChange={e => setNewStaffData({...newStaffData, department: e.target.value})}
                       />
                    </div>

                    <div>
                       <label className="block text-sm font-semibold text-slate-700 mb-1">Experience (Years)</label>
                       <div className="relative">
                          <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <input 
                             type="number" 
                             className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                             placeholder="e.g. 10"
                             value={newStaffData.experience}
                             onChange={e => setNewStaffData({...newStaffData, experience: Number(e.target.value)})}
                          />
                       </div>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                   <button 
                      onClick={() => setIsAddStaffOpen(false)}
                      className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
                   >
                      Cancel
                   </button>
                   <button 
                      onClick={handleSaveStaff}
                      disabled={!newStaffData.name || !newStaffData.department || !newStaffData.contact}
                      className="px-6 py-2 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center gap-2"
                   >
                      <Save className="h-4 w-4" />
                      {editingStaffId ? 'Update Record' : 'Register Staff'}
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
      {viewMode === 'create' && renderCreate()}
      {viewMode === 'analytics' && renderAnalytics()}
      {viewMode === 'staff' && renderStaff()}
    </div>
  );
};
