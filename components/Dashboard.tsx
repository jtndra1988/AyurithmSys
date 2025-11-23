import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Activity, Users, AlertTriangle, BedDouble, Map, Globe } from 'lucide-react';

const data = [
  { name: 'Mon', admissions: 45, discharges: 30 },
  { name: 'Tue', admissions: 52, discharges: 35 },
  { name: 'Wed', admissions: 48, discharges: 40 },
  { name: 'Thu', admissions: 61, discharges: 45 },
  { name: 'Fri', admissions: 55, discharges: 48 },
  { name: 'Sat', admissions: 40, discharges: 25 },
  { name: 'Sun', admissions: 35, discharges: 20 },
];

const riskData = [
  { name: '00:00', risk: 12 },
  { name: '04:00', risk: 15 },
  { name: '08:00', risk: 45 },
  { name: '12:00', risk: 38 },
  { name: '16:00', risk: 55 },
  { name: '20:00', risk: 25 },
];

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-slate-500 font-medium">National Active Cases</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-2">14,248</h3>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
              <Globe className="h-6 w-6" />
            </div>
          </div>
          <p className="text-xs text-green-600 mt-4 flex items-center font-medium">
            <span className="mr-1">↑ 12%</span> vs last week
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-slate-500 font-medium">Avg ICU Occupancy</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-2">87%</h3>
            </div>
            <div className="p-3 bg-red-50 rounded-lg text-red-600">
              <Activity className="h-6 w-6" />
            </div>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-4">
            <div className="bg-red-500 h-1.5 rounded-full" style={{ width: '87%' }}></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-slate-500 font-medium">AI Critical Alerts</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-2">142</h3>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-4">Across 45 Districts</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-slate-500 font-medium">Network Capacity</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-2">3,200</h3>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
              <BedDouble className="h-6 w-6" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-4">Available Beds (Aggregated)</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Patient Flow Trends (National)</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  cursor={{ fill: '#f1f5f9' }}
                />
                <Bar dataKey="admissions" fill="#0ea5e9" radius={[4, 4, 0, 0]} name="New Admissions" />
                <Bar dataKey="discharges" fill="#cbd5e1" radius={[4, 4, 0, 0]} name="Discharges" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Epidemic Watch (Sepsis/Dengue)</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={riskData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                <Line type="monotone" dataKey="risk" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#ef4444' }} activeDot={{ r: 8 }} name="Risk Factor" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 p-3 bg-red-50 text-red-800 text-sm rounded-lg flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span>AI Model Warning: High variance detected in Northern Districts at 16:00.</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl p-8 text-center text-slate-300">
         <Map className="h-12 w-12 mx-auto mb-4 opacity-50" />
         <h3 className="text-xl font-bold text-white">Geospatial Disease Heatmap</h3>
         <p className="max-w-md mx-auto mt-2">Interactive map visualization would load here, showing real-time disease clusters integrated with GIS.</p>
      </div>
    </div>
  );
};