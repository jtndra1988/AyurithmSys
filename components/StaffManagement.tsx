
import React, { useState } from 'react';
import { MOCK_STAFF, MOCK_LEAVE_REQUESTS } from '../constants';
import { StaffMember, UserRole, LeaveRequest, StaffingImpactAnalysis } from '../types';
import { analyzeStaffingImpact } from '../services/geminiService';
import { 
  Users, CheckCircle2, XCircle, Calendar, Clock, Stethoscope, 
  BrainCircuit, RefreshCw, AlertTriangle, Search, Filter, Briefcase
} from 'lucide-react';

export const StaffManagement: React.FC = () => {
  // Simulating H-AP-001 context
  const [activeTab, setActiveTab] = useState<'ROSTER' | 'LEAVES'>('ROSTER');
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>(MOCK_STAFF.filter(s => s.hospitalId === 'H-AP-001'));
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(MOCK_LEAVE_REQUESTS);
  const [filterRole, setFilterRole] = useState<string>('ALL');
  
  // AI Analysis State
  const [analyzingLeave, setAnalyzingLeave] = useState<string | null>(null);
  const [impactAnalysis, setImpactAnalysis] = useState<Record<string, StaffingImpactAnalysis>>({});

  // Roster filtering
  const filteredStaff = staffMembers.filter(s => filterRole === 'ALL' || s.role === filterRole);

  const handleApproveLeave = (id: string) => {
    setLeaveRequests(prev => prev.map(req => 
      req.id === id ? { ...req, status: 'APPROVED' } : req
    ));
    // In a real app, this would update the staff availability status as well
  };

  const handleRejectLeave = (id: string) => {
    setLeaveRequests(prev => prev.map(req => 
      req.id === id ? { ...req, status: 'REJECTED' } : req
    ));
  };

  const runImpactAnalysis = async (request: LeaveRequest) => {
    setAnalyzingLeave(request.id);
    // Mock current roster data for context
    const rosterContext = `Total Doctors: ${staffMembers.filter(s => s.role === UserRole.DOCTOR).length}, Nurses: ${staffMembers.filter(s => s.role === UserRole.NURSE).length}`;
    
    const analysis = await analyzeStaffingImpact(request, rosterContext);
    setImpactAnalysis(prev => ({ ...prev, [request.id]: analysis }));
    setAnalyzingLeave(null);
  };

  const renderRoster = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
       {/* Header Stats */}
       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
             <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Users className="h-6 w-6" /></div>
             <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Total Staff</p>
                <h3 className="text-2xl font-bold text-slate-900">{staffMembers.length}</h3>
             </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
             <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg"><Stethoscope className="h-6 w-6" /></div>
             <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Doctors on Duty</p>
                <h3 className="text-2xl font-bold text-slate-900">{staffMembers.filter(s => s.role === UserRole.DOCTOR && s.status === 'Active').length}</h3>
             </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
             <div className="p-3 bg-purple-50 text-purple-600 rounded-lg"><HeartPulse className="h-6 w-6" /></div>
             <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Nurses on Duty</p>
                <h3 className="text-2xl font-bold text-slate-900">{staffMembers.filter(s => s.role === UserRole.NURSE && s.status === 'Active').length}</h3>
             </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
             <div className="p-3 bg-amber-50 text-amber-600 rounded-lg"><Briefcase className="h-6 w-6" /></div>
             <div>
                <p className="text-xs font-bold text-slate-500 uppercase">On Leave</p>
                <h3 className="text-2xl font-bold text-slate-900">{staffMembers.filter(s => s.status === 'On Leave').length}</h3>
             </div>
          </div>
       </div>

       {/* Roster List */}
       <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
             <h3 className="font-bold text-slate-700">Staff Directory & Availability</h3>
             <div className="flex gap-2">
                <select 
                   className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-500"
                   value={filterRole}
                   onChange={(e) => setFilterRole(e.target.value)}
                >
                   <option value="ALL">All Roles</option>
                   <option value={UserRole.DOCTOR}>Doctors</option>
                   <option value={UserRole.NURSE}>Nurses</option>
                   <option value={UserRole.PHARMACIST}>Pharmacists</option>
                </select>
             </div>
          </div>
          <table className="w-full text-left">
             <thead>
                <tr className="bg-white border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                   <th className="px-6 py-4">Staff Member</th>
                   <th className="px-6 py-4">Role / Dept</th>
                   <th className="px-6 py-4">Availability</th>
                   <th className="px-6 py-4">Contact</th>
                   <th className="px-6 py-4 text-right">Shift</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
                {filteredStaff.map(staff => (
                   <tr key={staff.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm">
                               {staff.name.charAt(0)}
                            </div>
                            <div>
                               <p className="font-bold text-slate-900">{staff.name}</p>
                               <p className="text-xs text-slate-500">{staff.email}</p>
                            </div>
                         </div>
                      </td>
                      <td className="px-6 py-4">
                         <p className="text-sm font-medium text-slate-800">{staff.department}</p>
                         <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded uppercase tracking-wider">
                            {staff.role.replace('_', ' ')}
                         </span>
                      </td>
                      <td className="px-6 py-4">
                         <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            staff.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                         }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${staff.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                            {staff.status}
                         </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-mono">
                         {staff.contact}
                      </td>
                      <td className="px-6 py-4 text-right">
                         <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
                            09:00 - 17:00
                         </span>
                      </td>
                   </tr>
                ))}
             </tbody>
          </table>
       </div>
    </div>
  );

  const renderLeaves = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
       <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex items-center gap-4">
          <div className="p-3 bg-white rounded-lg border border-indigo-200">
             <BrainCircuit className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
             <h3 className="font-bold text-indigo-900">AI HR Assistant</h3>
             <p className="text-sm text-indigo-700">
                Predicts impact of leave approvals on ward coverage and suggests replacements.
             </p>
          </div>
       </div>

       <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
             <h3 className="font-bold text-slate-700">Pending Leave Requests</h3>
          </div>
          <div className="divide-y divide-slate-100">
             {leaveRequests.map(req => (
                <div key={req.id} className="p-6 hover:bg-slate-50 transition-colors">
                   <div className="flex justify-between items-start">
                      <div className="flex items-start gap-4">
                         <div className="mt-1">
                            <Calendar className="h-5 w-5 text-slate-400" />
                         </div>
                         <div>
                            <h4 className="font-bold text-slate-800 text-lg">{req.staffName}</h4>
                            <p className="text-sm text-slate-500 mb-2">{req.role} • {req.type} Leave</p>
                            <div className="flex items-center gap-3 text-sm text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg w-fit">
                               <span className="font-bold">{req.startDate}</span>
                               <span className="text-slate-400">to</span>
                               <span className="font-bold">{req.endDate}</span>
                            </div>
                            <p className="text-sm text-slate-600 mt-3 italic">" {req.reason} "</p>
                         </div>
                      </div>

                      <div className="flex flex-col items-end gap-3">
                         {req.status === 'PENDING' ? (
                            <>
                               <div className="flex gap-2">
                                  <button 
                                     onClick={() => runImpactAnalysis(req)}
                                     disabled={analyzingLeave === req.id}
                                     className="px-3 py-1.5 bg-indigo-50 text-indigo-700 font-bold text-xs rounded border border-indigo-100 hover:bg-indigo-100 flex items-center gap-1"
                                  >
                                     {analyzingLeave === req.id ? <RefreshCw className="h-3 w-3 animate-spin" /> : <BrainCircuit className="h-3 w-3" />}
                                     AI Impact Analysis
                                  </button>
                               </div>
                               <div className="flex gap-2 mt-2">
                                  <button onClick={() => handleRejectLeave(req.id)} className="px-4 py-2 bg-white border border-red-200 text-red-600 font-bold text-sm rounded-lg hover:bg-red-50 flex items-center gap-1">
                                     <XCircle className="h-4 w-4" /> Reject
                                  </button>
                                  <button onClick={() => handleApproveLeave(req.id)} className="px-4 py-2 bg-emerald-600 text-white font-bold text-sm rounded-lg hover:bg-emerald-700 shadow-sm flex items-center gap-1">
                                     <CheckCircle2 className="h-4 w-4" /> Approve
                                  </button>
                               </div>
                            </>
                         ) : (
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${
                               req.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'
                            }`}>
                               {req.status}
                            </span>
                         )}
                      </div>
                   </div>

                   {/* AI Analysis Result */}
                   {impactAnalysis[req.id] && req.status === 'PENDING' && (
                      <div className="mt-4 ml-9 p-4 bg-indigo-50/50 rounded-lg border border-indigo-100 animate-in slide-in-from-top-2">
                         <div className="flex items-center gap-2 mb-2">
                            <h5 className="text-xs font-bold text-indigo-800 uppercase tracking-wider">AI Recommendation</h5>
                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                               impactAnalysis[req.id].approvalRisk === 'Low' ? 'bg-emerald-200 text-emerald-800' : 
                               impactAnalysis[req.id].approvalRisk === 'Medium' ? 'bg-amber-200 text-amber-800' : 'bg-red-200 text-red-800'
                            }`}>
                               Risk: {impactAnalysis[req.id].approvalRisk}
                            </span>
                         </div>
                         <p className="text-sm text-slate-700 mb-1"><strong>Impact:</strong> {impactAnalysis[req.id].impactSummary}</p>
                         <p className="text-sm text-slate-700"><strong>Advice:</strong> {impactAnalysis[req.id].recommendation}</p>
                      </div>
                   )}
                </div>
             ))}
          </div>
       </div>
    </div>
  );

  // Import HeartPulse locally for the icon (it was missing in imports but used in JSX)
  const HeartPulse = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M12 5v14"/><path d="m15 11-3 3-3-3"/></svg>
  );

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-800">Staff & Roster Management</h2>
          <div className="flex bg-slate-100 p-1 rounded-lg">
             <button 
                onClick={() => setActiveTab('ROSTER')}
                className={`px-6 py-2 text-sm font-bold rounded-md transition-all ${
                   activeTab === 'ROSTER' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
             >
                Staff Roster
             </button>
             <button 
                onClick={() => setActiveTab('LEAVES')}
                className={`px-6 py-2 text-sm font-bold rounded-md transition-all ${
                   activeTab === 'LEAVES' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
             >
                Leave Requests
                {leaveRequests.filter(r => r.status === 'PENDING').length > 0 && (
                   <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                      {leaveRequests.filter(r => r.status === 'PENDING').length}
                   </span>
                )}
             </button>
          </div>
       </div>

       {activeTab === 'ROSTER' && renderRoster()}
       {activeTab === 'LEAVES' && renderLeaves()}
    </div>
  );
};
