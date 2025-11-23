
import React, { useState, useEffect } from 'react';
import { Patient, UserRole, LabOrder, LabReportAnalysis, LabInventory, LabEquipment } from '../types';
import { MOCK_LAB_TESTS, DEMO_USERS, MOCK_LAB_INVENTORY, MOCK_LAB_EQUIPMENT } from '../constants';
import { getLabReportAnalysis, getLabQualityAnalysis, LabQualityAnalysis } from '../services/geminiService';
import { 
  Search, TestTube2, CheckCircle2, Clock, Filter, Plus, X, 
  FileText, Activity, AlertTriangle, ChevronRight, Microscope, Syringe,
  BrainCircuit, Printer, Share2, RefreshCw, BarChart3, Package, Settings, ScanBarcode
} from 'lucide-react';

interface LabRadiologyProps {
  patients: Patient[];
  onUpdatePatients: (updatedPatients: Patient[]) => void;
  currentUserRole?: UserRole;
}

interface ExtendedLabOrder extends LabOrder {
  patientName: string;
  patientId: string;
  patientAge: number;
  patientGender: string;
  ward: string;
}

type LabTab = 'DASHBOARD' | 'WORKLIST' | 'INVENTORY' | 'EQUIPMENT';

export const LabRadiology: React.FC<LabRadiologyProps> = ({ patients, onUpdatePatients, currentUserRole }) => {
  // General State
  const [activeTab, setActiveTab] = useState<'QUEUE' | 'COMPLETED' | 'ORDER' | LabTab>(currentUserRole === UserRole.LAB_TECH ? 'DASHBOARD' : 'QUEUE');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Lab Tech Specific States
  const [labInventory, setLabInventory] = useState<LabInventory[]>(MOCK_LAB_INVENTORY);
  const [labEquipment, setLabEquipment] = useState<LabEquipment[]>(MOCK_LAB_EQUIPMENT);
  const [aiQuality, setAiQuality] = useState<LabQualityAnalysis | null>(null);
  const [isScanning, setIsScanning] = useState(false); // Simulating barcode scan

  // States for Actions
  const [selectedOrder, setSelectedOrder] = useState<{order: ExtendedLabOrder, patientId: string} | null>(null);
  const [viewingReport, setViewingReport] = useState<ExtendedLabOrder | null>(null);
  const [reportAnalysis, setReportAnalysis] = useState<LabReportAnalysis | null>(null);
  const [analyzingReport, setAnalyzingReport] = useState(false);
  
  // Result Entry Form State
  const [resultData, setResultData] = useState({
    value: '',
    unit: '',
    flag: 'NORMAL' as 'NORMAL' | 'HIGH' | 'LOW' | 'CRITICAL',
    notes: ''
  });

  // Order New Test State (Doctor)
  const [orderPatientId, setOrderPatientId] = useState('');
  const [orderTestName, setOrderTestName] = useState('');
  const [orderPriority, setOrderPriority] = useState<'ROUTINE' | 'URGENT'>('ROUTINE');

  const isDoctor = currentUserRole === UserRole.DOCTOR;
  const isTech = currentUserRole === UserRole.LAB_TECH || currentUserRole === UserRole.SUPER_ADMIN || currentUserRole === UserRole.HOSPITAL_ADMIN;

  // --- Helpers ---

  // Flatten all orders from all patients into a single list with patient metadata
  const getAllOrders = (): ExtendedLabOrder[] => {
    return patients.flatMap(p => 
      (p.labOrders || []).map(order => ({
        ...order,
        patientName: p.name,
        patientId: p.id,
        patientAge: p.age,
        patientGender: p.gender,
        ward: p.ward
      }))
    ).sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
  };

  const allOrders = getAllOrders();

  const filteredOrders = allOrders.filter(o => {
    const matchesSearch = 
      o.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      o.testName.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'QUEUE' || activeTab === 'WORKLIST') {
      return matchesSearch && o.status !== 'COMPLETED';
    } else if (activeTab === 'COMPLETED') {
      return matchesSearch && o.status === 'COMPLETED';
    }
    return matchesSearch;
  });

  useEffect(() => {
    if (isTech) {
      const fetchQC = async () => {
        const metrics = {
          pending: allOrders.filter(o => o.status !== 'COMPLETED').length,
          criticals: allOrders.filter(o => o.resultFlag === 'CRITICAL').length,
          equipmentStatus: labEquipment.map(e => e.status)
        };
        const result = await getLabQualityAnalysis(metrics);
        setAiQuality(result);
      };
      fetchQC();
    }
  }, [allOrders, isTech]);

  // --- Actions ---

  const updateOrderStatus = (patientId: string, orderId: string, newStatus: LabOrder['status'], resultDetails?: any) => {
    const updatedPatients = patients.map(p => {
      if (p.id === patientId) {
        return {
          ...p,
          labOrders: p.labOrders?.map(o => {
            if (o.id === orderId) {
              return { 
                ...o, 
                status: newStatus, 
                ...resultDetails,
                completedDate: newStatus === 'COMPLETED' ? new Date().toISOString().split('T')[0] : undefined
              };
            }
            return o;
          })
        };
      }
      return p;
    });
    onUpdatePatients(updatedPatients);
  };

  const handleCollectSample = (order: any) => {
    updateOrderStatus(order.patientId, order.id, 'SAMPLE_COLLECTED');
  };

  const handleProcessSample = (order: any) => {
    updateOrderStatus(order.patientId, order.id, 'PROCESSING');
  };

  const handleOpenResultModal = (order: any) => {
    setSelectedOrder({ order, patientId: order.patientId });
    setResultData({ value: '', unit: '', flag: 'NORMAL', notes: '' });
  };

  const handleSubmitResult = () => {
    if (!selectedOrder) return;
    updateOrderStatus(selectedOrder.patientId, selectedOrder.order.id, 'COMPLETED', {
      resultValue: resultData.value,
      resultUnit: resultData.unit,
      resultFlag: resultData.flag,
      resultNotes: resultData.notes
    });
    setSelectedOrder(null);
  };

  const handleCreateOrder = () => {
    if (!orderPatientId || !orderTestName) return;
    
    const updatedPatients = patients.map(p => {
      if (p.id === orderPatientId) {
        const newOrder: LabOrder = {
          id: `LO-${Date.now()}`,
          testName: orderTestName,
          priority: orderPriority,
          status: 'ORDERED',
          orderedBy: 'Dr. Current',
          orderDate: new Date().toISOString().split('T')[0]
        };
        return { ...p, labOrders: [newOrder, ...(p.labOrders || [])] };
      }
      return p;
    });
    
    onUpdatePatients(updatedPatients);
    setOrderPatientId('');
    setOrderTestName('');
    setActiveTab('QUEUE');
  };

  const handleViewReport = async (order: ExtendedLabOrder) => {
    setViewingReport(order);
    setReportAnalysis(null);
    setAnalyzingReport(true);
    const resultData = order.resultComponents && order.resultComponents.length > 0 
      ? order.resultComponents 
      : order.resultValue;

    const result = await getLabReportAnalysis(
      order.testName, 
      resultData, 
      order.resultUnit || '', 
      order.patientAge, 
      order.patientGender
    );
    setReportAnalysis(result);
    setAnalyzingReport(false);
  };

  const handleScanBarcode = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      alert("Simulated Scan: Sample ID matched. Opened result entry.");
    }, 1500);
  };

  // --- Renderers ---

  const renderLabTechDashboard = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
       {/* AI QC Panel */}
       <div className="bg-gradient-to-r from-emerald-900 to-teal-900 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="flex items-center gap-3 mb-4 relative z-10">
             <div className="p-2 bg-white/10 rounded-lg border border-white/20">
                <BrainCircuit className="h-6 w-6 text-emerald-300" />
             </div>
             <div>
                <h3 className="font-bold text-lg">AI Quality Control Manager</h3>
                <p className="text-xs text-emerald-200">Automated LIS Optimization</p>
             </div>
          </div>
          {aiQuality ? (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                <div className="bg-black/20 p-4 rounded-lg border border-white/10">
                   <p className="text-xs text-emerald-200 uppercase font-bold mb-1">TAT Efficiency</p>
                   <p className="text-2xl font-bold">{aiQuality.tatScore}/100</p>
                   <p className="text-xs text-emerald-300 mt-1 flex items-center gap-1"><Activity className="h-3 w-3" /> {aiQuality.efficiencyTrend}</p>
                </div>
                <div className="bg-black/20 p-4 rounded-lg border border-white/10">
                   <p className="text-xs text-amber-300 uppercase font-bold mb-1 flex items-center gap-2"><Settings className="h-3 w-3" /> Calibration Alert</p>
                   <p className="text-sm font-medium text-white leading-snug">{aiQuality.calibrationAlert}</p>
                </div>
                <div className="bg-black/20 p-4 rounded-lg border border-white/10">
                   <p className="text-xs text-blue-300 uppercase font-bold mb-1 flex items-center gap-2"><Clock className="h-3 w-3" /> Shift Advice</p>
                   <p className="text-sm font-medium text-white leading-snug">{aiQuality.staffingAdvice}</p>
                </div>
             </div>
          ) : (
             <div className="text-center text-emerald-300 text-sm py-4">Analyzing lab metrics...</div>
          )}
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl -mr-12 -mb-12"></div>
       </div>

       {/* KPI Cards */}
       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
             <p className="text-xs font-bold text-slate-500 uppercase">Pending Samples</p>
             <h3 className="text-2xl font-bold text-slate-900 mt-2">{allOrders.filter(o => o.status !== 'COMPLETED').length}</h3>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
             <p className="text-xs font-bold text-slate-500 uppercase">Stat Orders</p>
             <h3 className="text-2xl font-bold text-red-600 mt-2">{allOrders.filter(o => o.priority === 'URGENT' && o.status !== 'COMPLETED').length}</h3>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
             <p className="text-xs font-bold text-slate-500 uppercase">Critical Results</p>
             <h3 className="text-2xl font-bold text-amber-600 mt-2">{allOrders.filter(o => o.resultFlag === 'CRITICAL').length}</h3>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
             <p className="text-xs font-bold text-slate-500 uppercase">Operational Eqp</p>
             <h3 className="text-2xl font-bold text-emerald-600 mt-2">{labEquipment.filter(e => e.status === 'Operational').length}/{labEquipment.length}</h3>
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
             <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Settings className="h-5 w-5 text-slate-500" /> Instrument Status</h3>
             <div className="space-y-3">
                {labEquipment.map(eq => (
                   <div key={eq.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <div>
                         <p className="font-bold text-sm text-slate-800">{eq.name}</p>
                         <p className="text-xs text-slate-500">{eq.type}</p>
                      </div>
                      <div className="text-right">
                         <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                            eq.status === 'Operational' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                         }`}>{eq.status}</span>
                         <p className="text-[10px] text-slate-400 mt-1">Next Service: {eq.nextMaintenance}</p>
                      </div>
                   </div>
                ))}
             </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
             <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Package className="h-5 w-5 text-slate-500" /> Reagent Inventory</h3>
             <div className="space-y-3">
                {labInventory.slice(0,4).map(item => (
                   <div key={item.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <div>
                         <p className="font-bold text-sm text-slate-800">{item.name}</p>
                         <p className="text-xs text-slate-500">{item.type}</p>
                      </div>
                      <div className="text-right">
                         <span className={`text-xs font-bold px-2 py-1 rounded ${
                            item.status === 'OK' ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50'
                         }`}>{item.stock} {item.unit}</span>
                      </div>
                   </div>
                ))}
             </div>
             <button onClick={() => setActiveTab('INVENTORY')} className="w-full mt-4 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded">View Full Inventory</button>
          </div>
       </div>
    </div>
  );

  const renderInventory = () => (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-300">
       <table className="w-full text-left">
          <thead>
             <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4">Item Name</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Stock Level</th>
                <th className="px-6 py-4">Expiry</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
             </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
             {labInventory.map(item => (
                <tr key={item.id} className="hover:bg-slate-50">
                   <td className="px-6 py-4 font-medium text-slate-900">{item.name}</td>
                   <td className="px-6 py-4 text-sm text-slate-600">{item.type}</td>
                   <td className="px-6 py-4 text-sm font-bold text-slate-800">{item.stock} {item.unit}</td>
                   <td className="px-6 py-4 text-sm text-slate-600 font-mono">{item.expiryDate}</td>
                   <td className="px-6 py-4">
                      <span className={`text-xs font-bold px-2 py-1 rounded ${
                         item.status === 'OK' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                      }`}>{item.status}</span>
                   </td>
                   <td className="px-6 py-4 text-right">
                      <button className="text-xs text-blue-600 font-bold hover:underline">Restock</button>
                   </td>
                </tr>
             ))}
          </tbody>
       </table>
    </div>
  );

  const renderQueue = () => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-300">
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
         <h3 className="font-bold text-slate-700">Active Worklist</h3>
         {isTech && (
            <button 
               onClick={handleScanBarcode}
               className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded hover:bg-slate-700 transition-colors"
            >
               <ScanBarcode className="h-4 w-4" /> {isScanning ? 'Scanning...' : 'Scan Barcode'}
            </button>
         )}
      </div>
      <table className="w-full text-left">
        <thead>
          <tr className="bg-white border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <th className="px-6 py-4">Order Info</th>
            <th className="px-6 py-4">Patient</th>
            <th className="px-6 py-4">Test Details</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {filteredOrders.map(order => (
            <tr key={order.id} className="hover:bg-slate-50 group">
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                   <span className={`w-1.5 h-8 rounded-full ${order.priority === 'URGENT' ? 'bg-red-500' : 'bg-blue-500'}`}></span>
                   <div>
                      <p className="font-mono text-xs text-slate-500">{order.id}</p>
                      <p className="text-xs font-bold text-slate-700">{order.orderDate}</p>
                   </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <p className="text-sm font-semibold text-slate-900">{order.patientName}</p>
                <p className="text-xs text-slate-500">{order.patientAge}y/{order.patientGender} • {order.ward}</p>
              </td>
              <td className="px-6 py-4">
                <p className="text-sm font-medium text-slate-800">{order.testName}</p>
                <p className="text-xs text-slate-500">Ordered by: {order.orderedBy}</p>
              </td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                  order.status === 'ORDERED' ? 'bg-slate-100 text-slate-600' :
                  order.status === 'SAMPLE_COLLECTED' ? 'bg-blue-50 text-blue-700' :
                  'bg-purple-50 text-purple-700'
                }`}>
                  {order.status.replace('_', ' ')}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                {isTech && (
                  <>
                    {order.status === 'ORDERED' && (
                      <button onClick={() => handleCollectSample(order)} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700 flex items-center gap-1 ml-auto">
                        <Syringe className="h-3 w-3" /> Collect
                      </button>
                    )}
                    {order.status === 'SAMPLE_COLLECTED' && (
                      <button onClick={() => handleProcessSample(order)} className="px-3 py-1.5 bg-purple-600 text-white text-xs font-bold rounded hover:bg-purple-700 flex items-center gap-1 ml-auto">
                        <Microscope className="h-3 w-3" /> Process
                      </button>
                    )}
                    {order.status === 'PROCESSING' && (
                      <button onClick={() => handleOpenResultModal(order)} className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded hover:bg-emerald-700 flex items-center gap-1 ml-auto">
                        <CheckCircle2 className="h-3 w-3" /> Enter Result
                      </button>
                    )}
                  </>
                )}
                {isDoctor && <span className="text-xs text-slate-400 italic">In Lab Queue</span>}
              </td>
            </tr>
          ))}
          {filteredOrders.length === 0 && (
            <tr><td colSpan={5} className="p-8 text-center text-slate-400">No active orders found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const renderCompleted = () => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-300">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <th className="px-6 py-4">Date</th>
            <th className="px-6 py-4">Patient</th>
            <th className="px-6 py-4">Test</th>
            <th className="px-6 py-4">Result</th>
            <th className="px-6 py-4">Flag</th>
            <th className="px-6 py-4 text-right">Report</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {filteredOrders.map(order => (
            <tr key={order.id} className="hover:bg-slate-50">
              <td className="px-6 py-4 text-xs text-slate-500">{order.completedDate || order.orderDate}</td>
              <td className="px-6 py-4">
                <p className="text-sm font-semibold text-slate-900">{order.patientName}</p>
                <p className="text-xs text-slate-500">{order.patientId}</p>
              </td>
              <td className="px-6 py-4 text-sm text-slate-700">{order.testName}</td>
              <td className="px-6 py-4">
                {order.resultComponents ? (
                   <span className="text-xs font-bold text-slate-600 italic">View Details</span>
                ) : (
                   <><span className="font-mono font-bold text-slate-800">{order.resultValue}</span> <span className="text-xs text-slate-500">{order.resultUnit}</span></>
                )}
              </td>
              <td className="px-6 py-4">
                {order.resultFlag && order.resultFlag !== 'NORMAL' ? (
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold uppercase ${
                    order.resultFlag === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    <AlertTriangle className="h-3 w-3" /> {order.resultFlag}
                  </span>
                ) : (
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Normal</span>
                )}
              </td>
              <td className="px-6 py-4 text-right">
                 <button 
                    onClick={() => handleViewReport(order)}
                    className="px-3 py-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded text-xs font-bold flex items-center gap-1 ml-auto transition-colors"
                 >
                    <FileText className="h-3 w-3" /> View
                 </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderOrderForm = () => (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-right-8 duration-300">
       <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          <TestTube2 className="h-5 w-5 text-blue-600" /> Order New Laboratory Test
       </h3>
       <div className="space-y-6">
          <div>
             <label className="block text-sm font-semibold text-slate-700 mb-2">Select Patient</label>
             <select 
                className="w-full p-3 border border-slate-300 rounded-lg bg-white"
                value={orderPatientId}
                onChange={e => setOrderPatientId(e.target.value)}
             >
                <option value="">-- Choose Patient --</option>
                {patients.map(p => (
                   <option key={p.id} value={p.id}>{p.name} ({p.id}) - {p.ward}</option>
                ))}
             </select>
          </div>
          <div>
             <label className="block text-sm font-semibold text-slate-700 mb-2">Test Name</label>
             <input 
                list="labTests"
                type="text" 
                className="w-full p-3 border border-slate-300 rounded-lg"
                placeholder="Search test (e.g. CBC)..."
                value={orderTestName}
                onChange={e => setOrderTestName(e.target.value)}
             />
             <datalist id="labTests">
                {MOCK_LAB_TESTS.map(t => <option key={t} value={t} />)}
             </datalist>
          </div>
          <div>
             <label className="block text-sm font-semibold text-slate-700 mb-2">Priority</label>
             <div className="flex gap-4">
                <button onClick={() => setOrderPriority('ROUTINE')} className={`flex-1 py-3 rounded-lg border font-medium ${orderPriority === 'ROUTINE' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-slate-200'}`}>Routine</button>
                <button onClick={() => setOrderPriority('URGENT')} className={`flex-1 py-3 rounded-lg border font-medium ${orderPriority === 'URGENT' ? 'bg-red-50 border-red-500 text-red-700' : 'border-slate-200'}`}>Urgent / STAT</button>
             </div>
          </div>
          <button 
             disabled={!orderPatientId || !orderTestName}
             onClick={handleCreateOrder}
             className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
             Submit Order
          </button>
       </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
         <div className="flex gap-2 bg-slate-100 p-1 rounded-lg overflow-x-auto">
            {isTech && (
               <button 
                  onClick={() => setActiveTab('DASHBOARD')} 
                  className={`px-4 py-2 text-sm font-bold rounded-md transition-all whitespace-nowrap ${activeTab === 'DASHBOARD' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
               >
                  LIS Dashboard
               </button>
            )}
            <button 
               onClick={() => setActiveTab(isTech ? 'WORKLIST' : 'QUEUE')} 
               className={`px-4 py-2 text-sm font-bold rounded-md transition-all whitespace-nowrap ${activeTab === 'QUEUE' || activeTab === 'WORKLIST' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
            >
               {isDoctor ? 'Pending Results' : 'Worklist'}
            </button>
            {isTech && (
               <button 
                  onClick={() => setActiveTab('INVENTORY')} 
                  className={`px-4 py-2 text-sm font-bold rounded-md transition-all whitespace-nowrap ${activeTab === 'INVENTORY' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
               >
                  Inventory
               </button>
            )}
            <button 
               onClick={() => setActiveTab('COMPLETED')} 
               className={`px-4 py-2 text-sm font-bold rounded-md transition-all whitespace-nowrap ${activeTab === 'COMPLETED' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
            >
               History
            </button>
            {isDoctor && (
               <button 
                  onClick={() => setActiveTab('ORDER')} 
                  className={`px-4 py-2 text-sm font-bold rounded-md transition-all whitespace-nowrap ${activeTab === 'ORDER' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
               >
                  Order Test
               </button>
            )}
         </div>

         {activeTab !== 'ORDER' && activeTab !== 'DASHBOARD' && (
            <div className="relative w-full md:w-64">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
               <input 
                  type="text" 
                  placeholder="Search tests..." 
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
               />
            </div>
         )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
         {activeTab === 'DASHBOARD' && renderLabTechDashboard()}
         {(activeTab === 'QUEUE' || activeTab === 'WORKLIST') && renderQueue()}
         {activeTab === 'COMPLETED' && renderCompleted()}
         {activeTab === 'ORDER' && renderOrderForm()}
         {activeTab === 'INVENTORY' && renderInventory()}
      </div>

      {/* Result Entry Modal */}
      {selectedOrder && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
               <div className="bg-emerald-600 p-4 text-white flex justify-between items-center">
                  <h3 className="font-bold flex items-center gap-2"><Microscope className="h-5 w-5" /> Enter Lab Result</h3>
                  <button onClick={() => setSelectedOrder(null)}><X className="h-5 w-5" /></button>
               </div>
               <div className="p-6 space-y-4">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mb-4">
                     <p className="text-xs text-slate-500 uppercase font-bold">{selectedOrder.order.testName}</p>
                     <p className="text-sm font-semibold text-slate-900">{selectedOrder.order.patientName}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Value</label>
                        <input type="text" className="w-full p-2 border rounded" placeholder="e.g. 12.5" value={resultData.value} onChange={e => setResultData({...resultData, value: e.target.value})} />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Unit</label>
                        <input type="text" className="w-full p-2 border rounded" placeholder="e.g. g/dL" value={resultData.unit} onChange={e => setResultData({...resultData, unit: e.target.value})} />
                     </div>
                  </div>

                  <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Clinical Flag</label>
                     <div className="flex gap-2">
                        {['NORMAL', 'HIGH', 'LOW', 'CRITICAL'].map(flag => (
                           <button 
                              key={flag}
                              onClick={() => setResultData({...resultData, flag: flag as any})}
                              className={`flex-1 py-2 text-xs font-bold rounded border ${
                                 resultData.flag === flag 
                                   ? (flag === 'NORMAL' ? 'bg-emerald-600 text-white border-emerald-600' : flag === 'CRITICAL' ? 'bg-red-600 text-white border-red-600' : 'bg-amber-50 text-white border-amber-500')
                                   : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                              }`}
                           >
                              {flag}
                           </button>
                        ))}
                     </div>
                  </div>

                  <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tech Notes</label>
                     <textarea className="w-full p-2 border rounded h-20 text-sm" placeholder="Comments..." value={resultData.notes} onChange={e => setResultData({...resultData, notes: e.target.value})} />
                  </div>

                  <button onClick={handleSubmitResult} className="w-full py-3 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 shadow-md">
                     Verify & Release Result
                  </button>
               </div>
            </div>
         </div>
      )}

      {/* View Report Modal with AI Analysis */}
      {viewingReport && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[95vh]">
               
               {/* Report Header */}
               <div className="bg-slate-900 p-6 text-white flex justify-between items-start">
                  <div>
                     <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-6 w-6 text-blue-400" />
                        <h2 className="text-xl font-bold">Clinical Pathology Report</h2>
                     </div>
                     <p className="text-sm text-slate-400">Generated on {new Date().toLocaleDateString()}</p>
                  </div>
                  <button onClick={() => setViewingReport(null)} className="text-slate-400 hover:text-white p-1"><X className="h-6 w-6" /></button>
               </div>

               <div className="flex-1 overflow-y-auto p-8 space-y-8">
                  
                  {/* Patient Header Info */}
                  <div className="grid grid-cols-2 gap-8 pb-6 border-b border-slate-200">
                     <div>
                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">Patient Details</p>
                        <p className="font-bold text-lg text-slate-900">{viewingReport.patientName}</p>
                        <p className="text-sm text-slate-600">{viewingReport.patientAge} Years / {viewingReport.patientGender}</p>
                        <p className="text-sm text-slate-600 font-mono mt-1">ID: {viewingReport.patientId}</p>
                     </div>
                     <div className="text-right">
                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">Ordering Physician</p>
                        <p className="font-bold text-slate-900">{viewingReport.orderedBy}</p>
                        <p className="text-xs font-bold text-slate-400 uppercase mb-1 mt-3">Specimen Date</p>
                        <p className="text-sm text-slate-600">{viewingReport.completedDate}</p>
                     </div>
                  </div>

                  {/* Detailed Result Table or Single Result */}
                  <div className="space-y-4">
                     <h3 className="text-lg font-bold text-slate-800 bg-slate-50 p-2 rounded pl-4 border-l-4 border-blue-500">
                        Test Result: {viewingReport.testName}
                     </h3>
                     
                     {viewingReport.resultComponents && viewingReport.resultComponents.length > 0 ? (
                        <div className="overflow-hidden border border-slate-200 rounded-xl">
                           <table className="w-full text-left">
                              <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-bold">
                                 <tr>
                                    <th className="px-4 py-3">Parameter</th>
                                    <th className="px-4 py-3">Observed Value</th>
                                    <th className="px-4 py-3">Reference Range</th>
                                    <th className="px-4 py-3 text-right">Flag</th>
                                 </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                 {viewingReport.resultComponents.map((comp, i) => (
                                    <tr key={i} className="hover:bg-slate-50">
                                       <td className="px-4 py-3 font-medium text-slate-700">{comp.name}</td>
                                       <td className="px-4 py-3 font-bold text-slate-900">
                                          {comp.value} <span className="text-xs font-normal text-slate-500 ml-1">{comp.unit}</span>
                                       </td>
                                       <td className="px-4 py-3 text-sm text-slate-500 font-mono">{comp.referenceRange}</td>
                                       <td className="px-4 py-3 text-right">
                                          {comp.flag !== 'NORMAL' ? (
                                             <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold uppercase ${
                                                comp.flag === 'CRITICAL' ? 'bg-red-100 text-red-700' : 
                                                comp.flag === 'HIGH' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                                             }`}>
                                                {comp.flag}
                                             </span>
                                          ) : (
                                             <span className="text-xs text-emerald-600 font-bold">Normal</span>
                                          )}
                                       </td>
                                    </tr>
                                 ))}
                              </tbody>
                           </table>
                        </div>
                     ) : (
                        <div className="flex items-center justify-between p-6 border-2 border-slate-100 rounded-xl bg-white">
                           <div>
                              <p className="text-4xl font-bold text-slate-900">
                                 {viewingReport.resultValue}
                                 <span className="text-lg text-slate-500 font-normal ml-2">{viewingReport.resultUnit}</span>
                              </p>
                           </div>
                           {viewingReport.resultFlag && viewingReport.resultFlag !== 'NORMAL' ? (
                              <div className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                                 viewingReport.resultFlag === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                                 viewingReport.resultFlag === 'HIGH' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                              }`}>
                                 <AlertTriangle className="h-5 w-5" />
                                 <span className="font-bold uppercase">{viewingReport.resultFlag}</span>
                              </div>
                           ) : (
                              <div className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg flex items-center gap-2">
                                 <CheckCircle2 className="h-5 w-5" />
                                 <span className="font-bold uppercase">Within Limits</span>
                              </div>
                           )}
                        </div>
                     )}
                     
                     {viewingReport.resultNotes && (
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm text-slate-700 italic">
                           " {viewingReport.resultNotes} "
                        </div>
                     )}
                  </div>

                  {/* AI Analysis Section */}
                  <div className="border border-indigo-100 rounded-xl overflow-hidden shadow-sm">
                     <div className="bg-indigo-50 p-4 flex justify-between items-center border-b border-indigo-100">
                        <div className="flex items-center gap-2">
                           <BrainCircuit className="h-5 w-5 text-indigo-600" />
                           <h4 className="font-bold text-indigo-900">AI Clinical Interpretation</h4>
                        </div>
                        {analyzingReport && <span className="flex items-center gap-2 text-xs text-indigo-600 font-bold animate-pulse"><RefreshCw className="h-3 w-3 animate-spin" /> Analyzing Pattern...</span>}
                     </div>
                     
                     <div className="p-6">
                        {reportAnalysis ? (
                           <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                 <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Clinical Significance</p>
                                    <p className="text-sm font-medium text-slate-800 leading-relaxed">
                                       {reportAnalysis.clinicalInterpretation}
                                    </p>
                                 </div>
                                 <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Reference Range Context</p>
                                    <p className="text-sm text-slate-600">
                                       {reportAnalysis.referenceRangeComment}
                                    </p>
                                 </div>
                              </div>
                              
                              <div className={`p-4 rounded-lg border mt-2 ${
                                 reportAnalysis.severityAssessment === 'Critical' ? 'bg-red-50 border-red-100' :
                                 reportAnalysis.severityAssessment === 'Abnormal' ? 'bg-amber-50 border-amber-100' : 'bg-emerald-50 border-emerald-100'
                              }`}>
                                 <p className={`text-xs font-bold uppercase mb-1 ${
                                    reportAnalysis.severityAssessment === 'Critical' ? 'text-red-700' :
                                    reportAnalysis.severityAssessment === 'Abnormal' ? 'text-amber-700' : 'text-emerald-700'
                                 }`}>Suggested Action</p>
                                 <p className="text-sm font-bold text-slate-800">
                                    {reportAnalysis.suggestedAction}
                                 </p>
                              </div>
                           </div>
                        ) : (
                           <div className="text-center py-8 text-slate-400 text-sm">
                              Unable to generate AI analysis for this result.
                           </div>
                        )}
                     </div>
                  </div>
               </div>

               {/* Footer Actions */}
               <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-between items-center">
                  <p className="text-xs text-slate-400">Electronically Verified by Dr. P. Pathologist</p>
                  <div className="flex gap-3">
                     <button className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                        <Share2 className="h-4 w-4" /> Share
                     </button>
                     <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 flex items-center gap-2 shadow-sm">
                        <Printer className="h-4 w-4" /> Print Report
                     </button>
                  </div>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};