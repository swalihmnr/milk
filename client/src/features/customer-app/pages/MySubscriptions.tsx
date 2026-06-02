import React, { useState } from 'react';
import { Calendar, PauseCircle, PlayCircle, Clock, CheckCircle2, ChevronLeft, MapPin, AlertCircle, Plus, Sparkles, X, Coffee } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Subscription {
  id: string;
  productName: string;
  vendorName: string;
  frequency: string;
  quantity: number;
  price: number;
  status: 'active' | 'paused' | 'vacation';
  vacationStart?: string;
  vacationEnd?: string;
  nextDelivery: string;
}

export default function MySubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => {
    const local = localStorage.getItem('mockSubscriptions');
    if (local) return JSON.parse(local);
    return [
      {
        id: 'sub_1',
        productName: 'Organic A2 Cow Milk',
        vendorName: 'Green Meadows Farm',
        frequency: 'Daily (Every Morning)',
        quantity: 2,
        price: 75.00,
        status: 'active',
        nextDelivery: 'Tomorrow, 6:00 AM - 7:30 AM'
      }
    ];
  });

  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);
  const [showVacationModal, setShowVacationModal] = useState(false);
  const [vacationStart, setVacationStart] = useState('');
  const [vacationEnd, setVacationEnd] = useState('');

  const saveSubs = (newSubs: Subscription[]) => {
    setSubscriptions(newSubs);
    localStorage.setItem('mockSubscriptions', JSON.stringify(newSubs));
  };

  const togglePause = (id: string) => {
    const updated = subscriptions.map(sub => {
      if (sub.id === id) {
        const nextStatus = sub.status === 'paused' ? 'active' : 'paused';
        return { ...sub, status: nextStatus };
      }
      return sub;
    });
    saveSubs(updated);
  };

  const handleOpenVacation = (sub: Subscription) => {
    setSelectedSub(sub);
    setVacationStart('');
    setVacationEnd('');
    setShowVacationModal(true);
  };

  const handleApplyVacation = () => {
    if (!vacationStart || !vacationEnd) {
      alert('Please select both start and end dates.');
      return;
    }
    if (new Date(vacationStart) > new Date(vacationEnd)) {
      alert('Start date must be before or equal to end date.');
      return;
    }

    const updated = subscriptions.map(sub => {
      if (sub.id === selectedSub?.id) {
        return {
          ...sub,
          status: 'vacation' as const,
          vacationStart,
          vacationEnd,
        };
      }
      return sub;
    });

    saveSubs(updated);
    setShowVacationModal(false);
    setSelectedSub(null);
  };

  const handleCancelVacation = (id: string) => {
    const updated = subscriptions.map(sub => {
      if (sub.id === id) {
        return {
          ...sub,
          status: 'active' as const,
          vacationStart: undefined,
          vacationEnd: undefined,
        };
      }
      return sub;
    });
    saveSubs(updated);
  };

  const handleCreateMockSub = () => {
    const newSub: Subscription = {
      id: `sub_${Date.now()}`,
      productName: 'Fresh Premium Buffalo Milk',
      vendorName: 'Organic Roots Farm',
      frequency: 'Alternate Days (Mon/Wed/Fri)',
      quantity: 1,
      price: 90.00,
      status: 'active',
      nextDelivery: 'Wednesday morning, 6:00 AM'
    };
    saveSubs([...subscriptions, newSub]);
  };

  return (
    <div className="bg-slate-50/30 min-h-screen pb-24 md:p-8 max-w-5xl mx-auto animate-in fade-in duration-500 relative">
      
      {/* ── HEADER ── */}
      <div className="sticky top-0 md:relative z-40 bg-white md:bg-transparent border-b md:border-b-0 border-slate-100 px-4 py-4 md:px-0 md:py-0 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/my-app" className="h-10 w-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-600 active:scale-95 transition-all shadow-sm hover:shadow">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="font-black text-xl md:text-2xl text-slate-900 tracking-tight">My Subscriptions</h1>
            <p className="hidden md:block text-slate-400 text-xs mt-0.5">Manage daily automated milk plans</p>
          </div>
        </div>

        {subscriptions.length > 0 && (
          <button 
            onClick={handleCreateMockSub}
            className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-blue-600 bg-blue-50 hover:bg-blue-100/70 px-3.5 py-2.5 rounded-xl active:scale-95 transition-all"
          >
            <Plus className="h-4 w-4" /> Add Plan
          </button>
        )}
      </div>

      {/* ── CONTENT BODY ── */}
      <div className="p-4 md:p-0">
        {subscriptions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-slate-100 shadow-sm max-w-lg mx-auto mt-8">
            <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
              <Calendar className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-black text-slate-950 mb-2">No Active Subscriptions</h2>
            <p className="text-xs text-slate-400 font-bold max-w-xs mb-6">Automate your morning dairy supply and get fresh farm milk delivered to your door every single day.</p>
            <button 
              onClick={handleCreateMockSub}
              className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-6 py-3 rounded-xl text-sm shadow-md shadow-blue-500/10 hover:scale-105 active:scale-95 transition-all"
            >
              Start Daily Subscription
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {subscriptions.map((sub, i) => (
              <div 
                key={sub.id} 
                className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between hover:border-slate-200 transition-all duration-300 group hover:shadow-md animate-in fade-in slide-in-from-bottom-4 relative overflow-hidden"
                style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'both' }}
              >
                {/* Visual Status Indicator Top Right */}
                <div className="absolute top-4 right-4">
                  {sub.status === 'active' && (
                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span> Active
                    </span>
                  )}
                  {sub.status === 'paused' && (
                    <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                      Paused
                    </span>
                  )}
                  {sub.status === 'vacation' && (
                    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                      Vacation
                    </span>
                  )}
                </div>

                {/* Plan Info */}
                <div className="space-y-1 pr-20">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{sub.vendorName}</span>
                  <h3 className="font-extrabold text-slate-800 text-base leading-snug">{sub.productName}</h3>
                  <p className="text-xs text-slate-505 font-bold mt-1">{sub.quantity} x {sub.frequency}</p>
                </div>

                {/* Status Banners */}
                <div className="my-4">
                  {sub.status === 'vacation' && (
                    <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-3 flex gap-2.5 items-start">
                      <AlertCircle className="h-4.5 w-4.5 text-amber-500 shrink-0 mt-0.5" />
                      <div className="text-left">
                        <p className="text-[11px] font-black text-amber-800">Vacation Pause Active</p>
                        <p className="text-[10px] font-bold text-amber-600/90 mt-0.5">
                          Deliveries suspended from {new Date(sub.vacationStart!).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})} to {new Date(sub.vacationEnd!).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                        </p>
                        <button 
                          onClick={() => handleCancelVacation(sub.id)}
                          className="text-[10px] font-black text-blue-600 hover:text-blue-700 mt-2 underline"
                        >
                          Resume Delivery Early
                        </button>
                      </div>
                    </div>
                  )}

                  {sub.status === 'active' && (
                    <div className="bg-blue-50/40 border border-blue-100/50 rounded-2xl p-3 flex gap-2.5 items-center">
                      <Clock className="h-4 w-4 text-blue-500 shrink-0" />
                      <span className="text-[10px] font-bold text-slate-500">
                        Next Drop: <strong className="text-slate-700">{sub.nextDelivery}</strong>
                      </span>
                    </div>
                  )}

                  {sub.status === 'paused' && (
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 flex gap-2.5 items-center">
                      <AlertCircle className="h-4 w-4 text-slate-400 shrink-0" />
                      <span className="text-[10px] font-bold text-slate-400">
                        Deliveries are on hold indefinitely.
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-3 border-t border-slate-50">
                  <button 
                    onClick={() => togglePause(sub.id)}
                    className="flex-1 h-9 bg-slate-50 hover:bg-slate-100 text-slate-700 font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all"
                  >
                    {sub.status === 'paused' ? (
                      <>
                        <PlayCircle className="h-4 w-4 text-emerald-500" /> Resume
                      </>
                    ) : (
                      <>
                        <PauseCircle className="h-4 w-4 text-slate-500" /> Pause Plan
                      </>
                    )}
                  </button>

                  {sub.status !== 'vacation' && (
                    <button 
                      onClick={() => handleOpenVacation(sub)}
                      className="flex-1 h-9 bg-blue-50 hover:bg-blue-100/70 text-blue-600 font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Calendar className="h-4 w-4" /> Vacation Mode
                    </button>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── VACATION PAUSE MODAL ── */}
      {showVacationModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-in scale-in duration-350 relative">
            <button 
              onClick={() => setShowVacationModal(false)}
              className="absolute top-4 right-4 h-8 w-8 bg-slate-50 hover:bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 tracking-tight">Set Vacation Pause</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Suspend deliveries temporarily</p>
              </div>
            </div>

            <div className="space-y-4 my-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Start Date</label>
                <input 
                  type="date" 
                  value={vacationStart}
                  onChange={(e) => setVacationStart(e.target.value)}
                  className="w-full h-11 border border-slate-200 rounded-xl px-3 text-xs md:text-sm font-semibold outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">End Date (Inclusive)</label>
                <input 
                  type="date" 
                  value={vacationEnd}
                  onChange={(e) => setVacationEnd(e.target.value)}
                  className="w-full h-11 border border-slate-200 rounded-xl px-3 text-xs md:text-sm font-semibold outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
                />
              </div>
            </div>

            <button
              onClick={handleApplyVacation}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm rounded-xl shadow-sm active:scale-95 transition-all"
            >
              Confirm Pause
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
