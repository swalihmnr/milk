import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Clock, Stethoscope, Activity, Image as ImageIcon, Pill, CalendarClock, TrendingDown, ClipboardList, FileText, X, LineChart } from 'lucide-react';
import toast from 'react-hot-toast';

// Medical Mock Data
const tickets = [
  {
    id: 'MED-001',
    type: 'Emergency Consult',
    title: 'Suspected Mastitis in Cow #402',
    from: 'Arjun Sunrise Farm',
    phone: '9876543210',
    description: 'Cow #402 is showing swelling in the udder and reduced milk yield today. Slight fever observed. Need immediate consultation.',
    priority: 'high',
    status: 'open',
    time: '06:30 AM',
    media: ['https://images.unsplash.com/photo-1596733430284-f7437764b1a9?auto=format&fit=crop&w=300&q=80'],
    cowTag: 'TAG-402',
  },
  {
    id: 'MED-002',
    type: 'System Alert',
    title: 'Proactive Alert: Yield Drop 25%',
    from: 'Bhoomi Dairy',
    phone: '9222211111',
    description: 'Automated System Alert: Cow #120 has shown a consistent 25% drop in milk yield over the last 3 days. Recommend proactive health check.',
    priority: 'medium',
    status: 'open',
    time: '08:15 AM',
    media: [],
    cowTag: 'TAG-120',
  },
  {
    id: 'MED-003',
    type: 'Routine Check',
    title: 'Scheduled FMD Vaccination',
    from: 'Green Meadows Inc',
    phone: '9111122222',
    description: 'Routine Foot-and-Mouth Disease (FMD) vaccination drive for 45 cows scheduled for tomorrow.',
    priority: 'low',
    status: 'in-progress',
    time: 'Yesterday',
    media: [],
    cowTag: 'Multiple (45)',
  },
  {
    id: 'MED-004',
    type: 'Consultation',
    title: 'Hoof Infection Recovery',
    from: 'Suresh Patel',
    phone: '9123400003',
    description: 'Cow #088 hoof infection looks much better. Attaching follow up photos for review.',
    priority: 'low',
    status: 'resolved',
    time: '2 days ago',
    media: ['https://images.unsplash.com/photo-1527847263472-aa5338d17f6f?auto=format&fit=crop&w=300&q=80'],
    cowTag: 'TAG-088',
    prescription: {
      diagnosis: 'Healing Hoof Lesion',
      medication: 'Topical Antibiotic Spray',
      dosage: 'Apply twice daily',
      duration: '5 Days'
    }
  },
];

const priorityConfig: Record<string, { label: string; bg: string; text: string; border: string }> = {
  high: { label: 'Urgent', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  medium: { label: 'Review', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  low: { label: 'Routine', bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' },
};

const statusConfig: Record<string, { label: string; icon: any; color: string }> = {
  open: { label: 'Pending Review', icon: AlertCircle, color: 'text-rose-500' },
  'in-progress': { label: 'In Treatment', icon: Clock, color: 'text-amber-500' },
  resolved: { label: 'Resolved', icon: CheckCircle2, color: 'text-emerald-500' },
};

const typeIconConfig: Record<string, any> = {
  'Emergency Consult': Activity,
  'System Alert': TrendingDown,
  'Routine Check': CalendarClock,
  'Consultation': Stethoscope,
};

export default function VetDashboard() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [ticketsData, setTicketsData] = useState(tickets);
  
  // Cow History Modal State
  const [viewingCowHistory, setViewingCowHistory] = useState<string | null>(null);
  
  // Prescription Form State
  const [diagnosis, setDiagnosis] = useState('');
  const [medication, setMedication] = useState('');
  const [dosage, setDosage] = useState('');
  const [duration, setDuration] = useState('');

  const filtered = activeFilter === 'all'
    ? ticketsData
    : ticketsData.filter(t => t.status === activeFilter);

  const openCount = ticketsData.filter(t => t.status === 'open').length;
  const inProgressCount = ticketsData.filter(t => t.status === 'in-progress').length;
  const resolvedCount = ticketsData.filter(t => t.status === 'resolved').length;

  const handleIssuePrescription = (ticketId: string) => {
    if (!diagnosis || !medication) {
      toast.error("Diagnosis and Medication are required!");
      return;
    }
    
    setTicketsData(prev => prev.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          status: 'resolved',
          prescription: { diagnosis, medication, dosage, duration }
        };
      }
      return t;
    }));
    
    toast.success("Digital Prescription Issued Successfully!");
    setDiagnosis('');
    setMedication('');
    setDosage('');
    setDuration('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Clinical Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">
          Review symptoms, track herd health alerts, and issue digital prescriptions.
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Pending Reviews', value: openCount, icon: AlertCircle, color: 'bg-rose-100 text-rose-600' },
          { label: 'Active Treatments', value: inProgressCount, icon: Clock, color: 'bg-amber-100 text-amber-600' },
          { label: 'Resolved Cases', value: resolvedCount, icon: CheckCircle2, color: 'bg-teal-100 text-teal-600' },
          { label: 'Total Consults', value: ticketsData.length, icon: Stethoscope, color: 'bg-teal-50 text-teal-700' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-start justify-between">
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">{s.label}</p>
              <h3 className="text-2xl font-black text-slate-900">{s.value}</h3>
            </div>
            <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${s.color}`}>
              <s.icon className="h-5 w-5" />
            </div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-slate-200">
        {['all', 'open', 'in-progress', 'resolved'].map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-5 py-3 font-bold text-sm border-b-2 transition-colors capitalize ${
              activeFilter === f
                ? 'border-teal-600 text-teal-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {f === 'all' ? 'All Cases' : f.replace('-', ' ')}
            {f !== 'all' && (
              <span className={`ml-2 text-[10px] font-black px-1.5 py-0.5 rounded ${activeFilter === f ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-600'}`}>
                {ticketsData.filter(t => t.status === f).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Ticket Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filtered.map(ticket => {
          const pri = priorityConfig[ticket.priority];
          const stat = statusConfig[ticket.status];
          const StatIcon = stat.icon;
          const TypeIcon = typeIconConfig[ticket.type] || Activity;
          const isSelected = selectedTicket === ticket.id;

          return (
            <div
              key={ticket.id}
              className={`bg-white rounded-2xl border p-5 flex flex-col gap-4 cursor-pointer transition-all ${
                isSelected ? 'ring-2 ring-teal-500 shadow-md border-transparent' : 'border-slate-200 shadow-sm hover:shadow-md'
              }`}
              onClick={() => setSelectedTicket(prev => prev === ticket.id ? null : ticket.id)}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-600'}`}>
                    <TypeIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{ticket.id}</p>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{ticket.type}</span>
                    </div>
                    <h3 className="font-black text-slate-900 leading-tight">{ticket.title}</h3>
                    <p className="text-xs text-slate-500 font-medium mt-1">{ticket.from} • {ticket.cowTag}</p>
                  </div>
                </div>
                <StatIcon className={`h-5 w-5 shrink-0 ${stat.color}`} />
              </div>

              {/* Description */}
              <p className={`text-sm text-slate-600 leading-relaxed ${isSelected ? '' : 'line-clamp-2'}`}>
                {ticket.description}
              </p>

              {/* Media Thumbnails (if any) */}
              {ticket.media.length > 0 && (
                <div className="flex gap-2 mt-1">
                  {ticket.media.map((url, idx) => (
                    <div key={idx} className="relative h-16 w-16 rounded-lg overflow-hidden border border-slate-200 group">
                      <img src={url} alt="Symptom" className="h-full w-full object-cover group-hover:scale-110 transition-transform" />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <ImageIcon className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-auto">
                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border ${pri.bg} ${pri.text} ${pri.border}`}>
                  {pri.label}
                </span>
                <span className="text-[11px] font-bold text-slate-400">{ticket.time}</span>
              </div>

              {/* EXPANDED DOCTOR UI */}
              {isSelected && (
                <div className="mt-2 pt-4 border-t border-slate-200 animate-in fade-in slide-in-from-top-2 duration-200 cursor-default" onClick={e => e.stopPropagation()}>
                  
                  {/* Digital Prescription Card (If Resolved) */}
                  {ticket.status === 'resolved' && ticket.prescription ? (
                    <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 relative overflow-hidden">
                      <div className="absolute -right-4 -top-4 opacity-5">
                        <Stethoscope className="h-24 w-24" />
                      </div>
                      <div className="flex items-center justify-between mb-3 relative z-10">
                        <div className="flex items-center gap-2">
                          <Pill className="h-4 w-4 text-teal-600" />
                          <h4 className="font-bold text-teal-900 text-sm">Official Treatment Plan</h4>
                        </div>
                        {ticket.cowTag && !ticket.cowTag.includes('Multiple') && (
                          <button 
                            onClick={() => setViewingCowHistory(ticket.cowTag)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-teal-700 text-xs font-bold rounded-lg shadow-sm border border-teal-100 hover:bg-teal-50 transition-colors"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            Medical Record
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm relative z-10">
                        <div>
                          <p className="text-teal-600/70 text-[10px] font-bold uppercase tracking-wider">Diagnosis</p>
                          <p className="font-medium text-teal-900">{ticket.prescription.diagnosis}</p>
                        </div>
                        <div>
                          <p className="text-teal-600/70 text-[10px] font-bold uppercase tracking-wider">Medication</p>
                          <p className="font-bold text-teal-900">{ticket.prescription.medication}</p>
                        </div>
                        <div>
                          <p className="text-teal-600/70 text-[10px] font-bold uppercase tracking-wider">Dosage</p>
                          <p className="font-medium text-teal-900">{ticket.prescription.dosage}</p>
                        </div>
                        <div>
                          <p className="text-teal-600/70 text-[10px] font-bold uppercase tracking-wider">Duration</p>
                          <p className="font-medium text-teal-900">{ticket.prescription.duration}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Digital Prescription Form (If Open/In-Progress) */
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <ClipboardList className="h-4 w-4 text-teal-600" />
                          <h4 className="font-bold text-slate-800 text-sm">Issue Treatment Plan</h4>
                        </div>
                        {ticket.cowTag && !ticket.cowTag.includes('Multiple') && (
                          <button 
                            onClick={() => setViewingCowHistory(ticket.cowTag)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-teal-700 text-xs font-bold rounded-lg shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            Medical Record
                          </button>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Clinical Diagnosis</label>
                          <input 
                            type="text" 
                            placeholder="e.g., Clinical Mastitis" 
                            className="w-full text-sm p-2.5 rounded-lg border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                            value={diagnosis}
                            onChange={e => setDiagnosis(e.target.value)}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="col-span-2 sm:col-span-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Medication</label>
                            <input 
                              type="text" 
                              placeholder="e.g., Amoxicillin" 
                              className="w-full text-sm p-2.5 rounded-lg border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                              value={medication}
                              onChange={e => setMedication(e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Dosage</label>
                            <input 
                              type="text" 
                              placeholder="e.g., 50ml twice daily" 
                              className="w-full text-sm p-2.5 rounded-lg border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                              value={dosage}
                              onChange={e => setDosage(e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Duration</label>
                            <input 
                              type="text" 
                              placeholder="e.g., 5 Days" 
                              className="w-full text-sm p-2.5 rounded-lg border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                              value={duration}
                              onChange={e => setDuration(e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="pt-3 flex items-center justify-end gap-2">
                          {ticket.status === 'open' && (
                            <button 
                              className="px-4 py-2 text-xs font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"
                              onClick={() => {
                                setTicketsData(prev => prev.map(t => t.id === ticket.id ? {...t, status: 'in-progress'} : t));
                                toast.success("Marked as In Treatment");
                              }}
                            >
                              Start Treatment
                            </button>
                          )}
                          <button 
                            className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm shadow-teal-500/20 transition-all flex items-center gap-1.5"
                            onClick={() => handleIssuePrescription(ticket.id)}
                          >
                            <Pill className="h-3.5 w-3.5" />
                            Issue Prescription
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Cow Medical History Modal */}
      {viewingCowHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-teal-100 rounded-xl flex items-center justify-center">
                  <Activity className="h-6 w-6 text-teal-600" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">Patient File: {viewingCowHistory}</h2>
                  <p className="text-xs font-bold text-slate-500">Sunrise Dairy Farm • Active Status</p>
                </div>
              </div>
              <button 
                onClick={() => setViewingCowHistory(null)}
                className="h-8 w-8 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center transition-colors text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* Vitals Grid */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Vitals & Demographics</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Breed</p>
                    <p className="font-black text-slate-900">Holstein</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Age</p>
                    <p className="font-black text-slate-900">4 Years</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Weight</p>
                    <p className="font-black text-slate-900">620 kg</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Lactation</p>
                    <p className="font-black text-slate-900">2nd Cycle</p>
                  </div>
                </div>
              </div>

              {/* Yield Monitoring */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Yield Monitoring (14 Days)</h3>
                  <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-2 py-0.5 rounded flex items-center gap-1">
                    <TrendingDown className="h-3 w-3" /> Down 15%
                  </span>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center justify-center h-32 relative overflow-hidden">
                  {/* Mock Chart Visualization */}
                  <div className="absolute inset-0 flex items-end justify-between px-6 pt-8 pb-4 opacity-40">
                    {[12, 12, 11, 12, 11, 10, 9, 8, 8, 9, 8, 7, 6, 5].map((val, i) => (
                      <div key={i} className="w-[4%] bg-teal-500 rounded-t-sm" style={{ height: `${(val / 12) * 100}%` }}></div>
                    ))}
                  </div>
                  <div className="z-10 flex items-center gap-2 text-slate-500 font-bold bg-white/80 px-4 py-2 rounded-lg backdrop-blur-sm shadow-sm">
                    <LineChart className="h-5 w-5 text-teal-600" />
                    <span>Average 9.2L / day</span>
                  </div>
                </div>
              </div>

              {/* Past History */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Medical History</h3>
                <div className="space-y-3">
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-2 w-2 rounded-full bg-slate-300 mt-2"></div>
                      <div className="w-px h-full bg-slate-200 my-1"></div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex-1">
                      <p className="text-xs font-bold text-slate-800">Routine FMD Vaccination</p>
                      <p className="text-[10px] font-medium text-slate-500 mt-0.5">Administered 4 months ago</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-2 w-2 rounded-full bg-teal-500 mt-2 ring-4 ring-teal-50"></div>
                    </div>
                    <div className="bg-teal-50 rounded-xl p-3 border border-teal-100 flex-1">
                      <p className="text-xs font-bold text-teal-900">Treatment: Minor Hoof Infection</p>
                      <p className="text-[10px] font-medium text-teal-700 mt-0.5">Resolved 8 months ago. Copper Sulfate foot bath.</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
