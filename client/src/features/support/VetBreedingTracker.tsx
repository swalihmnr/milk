import React, { useState } from 'react';
import { CalendarClock, CheckCircle2, AlertTriangle, PlusCircle, Thermometer, Baby, Clock, Search, Beaker, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

// Mock Data for Breeding Tracker
const mockCows = [
  { id: 'TAG-1045', farmer: 'Sunrise Dairy', breed: 'Holstein', status: 'open', lastCalved: '120 days ago', alert: 'Missed Heat' },
  { id: 'TAG-2201', farmer: 'Bhoomi Farm', breed: 'Jersey', status: 'open', lastCalved: '65 days ago', alert: null },
  { id: 'TAG-0822', farmer: 'Green Meadows', breed: 'Gir', status: 'inseminated', aiDate: 'Oct 15, 2023', daysSinceAI: 85, alert: 'PD Due Soon' },
  { id: 'TAG-0901', farmer: 'Sunrise Dairy', breed: 'Holstein', status: 'inseminated', aiDate: 'Aug 10, 2023', daysSinceAI: 151, alert: null },
  { id: 'TAG-3112', farmer: 'Suresh Patel', breed: 'HF Cross', status: 'pregnant', due: 'Feb 12, 2024', daysPregnant: 190, alert: null },
  { id: 'TAG-4001', farmer: 'Bhoomi Farm', breed: 'Jersey', status: 'dry', due: 'Nov 05, 2023', daysPregnant: 265, alert: 'Calving Imminent' },
];

export default function VetBreedingTracker() {
  const [cows, setCows] = useState(mockCows);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCow, setSelectedCow] = useState<string | null>(null);

  // Group cows by status
  const openCows = cows.filter(c => c.status === 'open' && (c.id.includes(searchTerm) || c.farmer.toLowerCase().includes(searchTerm.toLowerCase())));
  const inseminatedCows = cows.filter(c => c.status === 'inseminated' && (c.id.includes(searchTerm) || c.farmer.toLowerCase().includes(searchTerm.toLowerCase())));
  const pregnantCows = cows.filter(c => c.status === 'pregnant' && (c.id.includes(searchTerm) || c.farmer.toLowerCase().includes(searchTerm.toLowerCase())));
  const dryCows = cows.filter(c => c.status === 'dry' && (c.id.includes(searchTerm) || c.farmer.toLowerCase().includes(searchTerm.toLowerCase())));

  const handleStatusUpdate = (cowId: string, newStatus: string) => {
    setCows(prev => prev.map(c => {
      if (c.id === cowId) {
        return { ...c, status: newStatus, alert: null };
      }
      return c;
    }));
    toast.success(`Updated ${cowId} status to ${newStatus}`);
    setSelectedCow(null);
  };

  const getAlertStyle = (alert: string | null) => {
    if (!alert) return null;
    if (alert.includes('Imminent') || alert.includes('Missed')) return 'bg-rose-100 text-rose-700 border-rose-200';
    return 'bg-amber-100 text-amber-700 border-amber-200';
  };

  // Render a Cow Card
  const CowCard = ({ cow }: { cow: any }) => (
    <div 
      onClick={() => setSelectedCow(selectedCow === cow.id ? null : cow.id)}
      className={`bg-white rounded-xl border p-4 shadow-sm cursor-pointer transition-all ${
        selectedCow === cow.id ? 'ring-2 ring-teal-500 border-transparent shadow-md' : 'border-slate-200 hover:shadow-md'
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="font-black text-slate-900">{cow.id}</h4>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{cow.breed}</p>
        </div>
        {cow.alert && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${getAlertStyle(cow.alert)}`}>
            <AlertTriangle className="h-3 w-3" /> {cow.alert}
          </span>
        )}
      </div>
      
      <p className="text-xs font-medium text-slate-600 mb-3">{cow.farmer}</p>
      
      {/* Dynamic details based on status */}
      <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100 text-xs text-slate-600 space-y-1">
        {cow.status === 'open' && <div className="flex justify-between"><span className="text-slate-400">Last Calved:</span> <span className="font-bold text-slate-800">{cow.lastCalved}</span></div>}
        {cow.status === 'inseminated' && (
          <>
            <div className="flex justify-between"><span className="text-slate-400">A.I. Date:</span> <span className="font-bold text-slate-800">{cow.aiDate}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Days Since:</span> <span className={`font-bold ${cow.daysSinceAI > 90 ? 'text-rose-600' : 'text-slate-800'}`}>{cow.daysSinceAI} days</span></div>
          </>
        )}
        {(cow.status === 'pregnant' || cow.status === 'dry') && (
          <>
            <div className="flex justify-between"><span className="text-slate-400">Due Date:</span> <span className="font-bold text-slate-800">{cow.due}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Days Preg:</span> <span className="font-bold text-slate-800">{cow.daysPregnant} days</span></div>
          </>
        )}
      </div>

      {/* Action Area (Expanded) */}
      {selectedCow === cow.id && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col gap-2">
          {cow.status === 'open' && (
            <button 
              onClick={(e) => { e.stopPropagation(); handleStatusUpdate(cow.id, 'inseminated'); }}
              className="w-full flex items-center justify-center gap-1.5 py-2 bg-teal-50 text-teal-700 hover:bg-teal-100 rounded-lg text-xs font-bold transition-colors"
            >
              <Beaker className="h-3.5 w-3.5" /> Log Artificial Insemination (A.I.)
            </button>
          )}
          {cow.status === 'inseminated' && (
            <button 
              onClick={(e) => { e.stopPropagation(); handleStatusUpdate(cow.id, 'pregnant'); }}
              className="w-full flex items-center justify-center gap-1.5 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors"
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> Confirm Pregnancy (P.D.)
            </button>
          )}
          {cow.status === 'pregnant' && cow.daysPregnant > 220 && (
            <button 
              onClick={(e) => { e.stopPropagation(); handleStatusUpdate(cow.id, 'dry'); }}
              className="w-full flex items-center justify-center gap-1.5 py-2 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg text-xs font-bold transition-colors"
            >
              <Clock className="h-3.5 w-3.5" /> Mark as Dry (Stop Milking)
            </button>
          )}
          {cow.status === 'dry' && (
            <button 
              onClick={(e) => { e.stopPropagation(); handleStatusUpdate(cow.id, 'open'); }}
              className="w-full flex items-center justify-center gap-1.5 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-bold transition-colors"
            >
              <Baby className="h-3.5 w-3.5" /> Log Calving Event
            </button>
          )}
          <button 
            onClick={(e) => e.stopPropagation()}
            className="w-full flex items-center justify-center gap-1.5 py-2 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-bold transition-colors"
          >
            <FileText className="h-3.5 w-3.5" /> View Full Medical File
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Reproductive Management</h1>
          <p className="text-slate-500 text-sm mt-1">
            Track A.I. schedules, pregnancy diagnoses, and calving dates to optimize herd yields.
          </p>
        </div>
        
        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search Cow ID or Farm..." 
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500">
            <Thermometer className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Open</p>
            <h3 className="text-xl font-black text-slate-900">{openCows.length}</h3>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 bg-teal-100 rounded-xl flex items-center justify-center text-teal-600">
            <Beaker className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Inseminated</p>
            <h3 className="text-xl font-black text-slate-900">{inseminatedCows.length}</h3>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pregnant</p>
            <h3 className="text-xl font-black text-slate-900">{pregnantCows.length}</h3>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
            <CalendarClock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dry</p>
            <h3 className="text-xl font-black text-slate-900">{dryCows.length}</h3>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 pb-6 overflow-x-auto">
        
        {/* Column: Open */}
        <div className="flex flex-col gap-3 min-w-[280px]">
          <div className="flex items-center justify-between pb-2 border-b-2 border-slate-200">
            <div className="flex items-center gap-2 text-slate-700">
              <Thermometer className="h-4 w-4" />
              <h3 className="font-black">Open (Heat)</h3>
            </div>
            <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">{openCows.length}</span>
          </div>
          {openCows.map(cow => <CowCard key={cow.id} cow={cow} />)}
          {openCows.length === 0 && <div className="p-4 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-sm font-medium">No open cows</div>}
        </div>

        {/* Column: Inseminated */}
        <div className="flex flex-col gap-3 min-w-[280px]">
          <div className="flex items-center justify-between pb-2 border-b-2 border-teal-500">
            <div className="flex items-center gap-2 text-teal-700">
              <Beaker className="h-4 w-4" />
              <h3 className="font-black">Inseminated (A.I.)</h3>
            </div>
            <span className="bg-teal-100 text-teal-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{inseminatedCows.length}</span>
          </div>
          {inseminatedCows.map(cow => <CowCard key={cow.id} cow={cow} />)}
          {inseminatedCows.length === 0 && <div className="p-4 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-sm font-medium">No cows pending P.D.</div>}
        </div>

        {/* Column: Pregnant */}
        <div className="flex flex-col gap-3 min-w-[280px]">
          <div className="flex items-center justify-between pb-2 border-b-2 border-emerald-500">
            <div className="flex items-center gap-2 text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              <h3 className="font-black">Pregnant</h3>
            </div>
            <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{pregnantCows.length}</span>
          </div>
          {pregnantCows.map(cow => <CowCard key={cow.id} cow={cow} />)}
          {pregnantCows.length === 0 && <div className="p-4 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-sm font-medium">No pregnant cows</div>}
        </div>

        {/* Column: Dry */}
        <div className="flex flex-col gap-3 min-w-[280px]">
          <div className="flex items-center justify-between pb-2 border-b-2 border-amber-500">
            <div className="flex items-center gap-2 text-amber-700">
              <CalendarClock className="h-4 w-4" />
              <h3 className="font-black">Dry Period</h3>
            </div>
            <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{dryCows.length}</span>
          </div>
          {dryCows.map(cow => <CowCard key={cow.id} cow={cow} />)}
          {dryCows.length === 0 && <div className="p-4 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-sm font-medium">No dry cows</div>}
        </div>

      </div>
    </div>
  );
}
