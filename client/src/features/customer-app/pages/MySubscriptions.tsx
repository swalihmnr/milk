import React, { useState, useEffect } from 'react';
import { Calendar, PauseCircle, PlayCircle, Clock, CheckCircle2, ChevronLeft, MapPin, AlertCircle, Plus, Sparkles, X, Coffee, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../../lib/api';

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

const DEMO_SUBS: Subscription[] = [
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

export default function MySubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSubs = async () => {
      try {
        const res = await api.get('/subscriptions');
        const raw = res.data?.data || [];
        if (raw.length > 0) {
          const mapped: Subscription[] = raw.map((s: any) => ({
            id: s._id,
            productName: s.productId?.name || 'Milk Plan',
            vendorName: s.farmerId?.name || s.vendorId?.name || 'Your Farmer',
            frequency: s.frequency === 'daily' ? 'Daily (Every Morning)'
              : s.frequency === 'weekly' ? 'Weekly'
              : s.frequency === 'alternate' ? 'Alternate Days'
              : s.frequency || 'Daily',
            quantity: s.quantity || 1,
            price: s.pricePerUnit || s.price || 65,
            status: (s.status === 'active' || s.status === 'paused' || s.status === 'vacation')
              ? s.status : 'active',
            vacationStart: s.vacationStart,
            vacationEnd: s.vacationEnd,
            nextDelivery: 'Tomorrow, 6:00 AM - 7:30 AM'
          }));
          setSubscriptions(mapped);
        } else {
          // No API subs — use demo defaults so the UI isn't empty
          const local = localStorage.getItem('mockSubscriptions');
          setSubscriptions(local ? JSON.parse(local) : DEMO_SUBS);
        }
      } catch {
        const local = localStorage.getItem('mockSubscriptions');
        setSubscriptions(local ? JSON.parse(local) : DEMO_SUBS);
      } finally {
        setLoading(false);
      }
    };
    loadSubs();
  }, []);

  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);
  const [showVacationModal, setShowVacationModal] = useState(false);
  const [vacationStart, setVacationStart] = useState('');
  const [vacationEnd, setVacationEnd] = useState('');
  const [activeTab, setActiveTab] = useState<'plans' | 'calendar'>('plans');
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDayDetail, setSelectedDayDetail] = useState<any>(null);

  const saveSubs = (newSubs: Subscription[]) => {
    setSubscriptions(newSubs);
    localStorage.setItem('mockSubscriptions', JSON.stringify(newSubs));
  };

  const togglePause = (id: string) => {
    const updated = subscriptions.map(sub => {
      if (sub.id === id) {
        const nextStatus = (sub.status === 'paused' ? 'active' : 'paused') as 'active' | 'paused' | 'vacation';
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

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const getDeliveriesForDay = (dayNum: number) => {
    const targetDate = new Date(currentYear, currentMonth, dayNum);
    const dayOfWeek = targetDate.getDay();

    return subscriptions.map(sub => {
      let matchesFrequency = false;
      const freqLower = sub.frequency.toLowerCase();
      if (freqLower.includes('daily')) {
        matchesFrequency = true;
      } else if (freqLower.includes('alternate')) {
        if (freqLower.includes('mon') || freqLower.includes('wed') || freqLower.includes('fri')) {
          matchesFrequency = dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5;
        } else {
          matchesFrequency = dayOfWeek === 2 || dayOfWeek === 4 || dayOfWeek === 6;
        }
      } else if (freqLower.includes('weekly')) {
        matchesFrequency = dayOfWeek === 0;
      }

      if (!matchesFrequency) return null;

      let dayStatus: 'scheduled' | 'paused' | 'vacation' = 'scheduled';
      if (sub.status === 'paused') {
        dayStatus = 'paused';
      } else if (sub.status === 'vacation' && sub.vacationStart && sub.vacationEnd) {
        const start = new Date(sub.vacationStart);
        const end = new Date(sub.vacationEnd);
        const tDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
        const sDate = new Date(start.getFullYear(), start.getMonth(), start.getDate());
        const eDate = new Date(end.getFullYear(), end.getMonth(), end.getDate());

        if (tDate >= sDate && tDate <= eDate) {
          dayStatus = 'vacation';
        }
      }

      const today = new Date();
      const resetToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      let finalStatus: 'delivered' | 'scheduled' | 'paused' | 'vacation' = dayStatus;
      if (dayStatus === 'scheduled' && targetDate < resetToday) {
        finalStatus = 'delivered';
      }

      return {
        ...sub,
        dayStatus: finalStatus
      };
    }).filter(Boolean) as any[];
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

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

      {/* Tab Selector */}
      <div className="flex gap-2 p-1.5 bg-slate-100/80 rounded-2xl max-w-[320px] mb-6 mx-4 md:mx-0 border border-slate-200/30">
        <button
          onClick={() => setActiveTab('plans')}
          className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
            activeTab === 'plans' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Active Plans
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
            activeTab === 'calendar' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Delivery Calendar
        </button>
      </div>

      {/* ── CONTENT BODY ── */}
      <div className="p-4 md:p-0">
        {activeTab === 'plans' ? (
          subscriptions.length === 0 ? (
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
                    <p className="text-xs text-slate-500 font-bold mt-1">{sub.quantity} x {sub.frequency}</p>
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
                        <span className="text-[10px] font-bold text-slate-505 font-semibold">
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
          )
        ) : (
          /* Calendar Grid view */
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            {/* Calendar Controls */}
            <div className="flex items-center justify-between mb-6">
              <button 
                onClick={handlePrevMonth}
                className="h-10 w-10 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl flex items-center justify-center text-slate-600 active:scale-95 transition-all font-bold"
              >
                &larr;
              </button>
              <h3 className="text-lg font-black text-slate-800 tracking-tight">
                {monthNames[currentMonth]} {currentYear}
              </h3>
              <button 
                onClick={handleNextMonth}
                className="h-10 w-10 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl flex items-center justify-center text-slate-600 active:scale-95 transition-all font-bold"
              >
                &rarr;
              </button>
            </div>

            {/* Calendar Weekday Names */}
            <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(dayName => (
                <div key={dayName} className="py-2">{dayName}</div>
              ))}
            </div>

            {/* Calendar Day Cells */}
            <div className="grid grid-cols-7 gap-2">
              {/* Prepend empty cells for starting day shift */}
              {Array.from({ length: new Date(currentYear, currentMonth, 1).getDay() }).map((_, idx) => (
                <div key={`empty-${idx}`} className="aspect-square bg-slate-50/20 rounded-2xl border border-dashed border-slate-100/50"></div>
              ))}

              {/* Loop over actual days of month */}
              {Array.from({ length: new Date(currentYear, currentMonth + 1, 0).getDate() }).map((_, idx) => {
                const dayNum = idx + 1;
                const todaysDeliveries = getDeliveriesForDay(dayNum);
                const isToday = new Date().getDate() === dayNum && new Date().getMonth() === currentMonth && new Date().getFullYear() === currentYear;

                return (
                  <button
                    key={`day-${dayNum}`}
                    onClick={() => todaysDeliveries.length > 0 && setSelectedDayDetail({ day: dayNum, deliveries: todaysDeliveries })}
                    disabled={todaysDeliveries.length === 0}
                    className={`aspect-square p-2.5 rounded-2xl border text-left flex flex-col justify-between transition-all group ${
                      isToday 
                        ? 'border-blue-500 bg-blue-50/30' 
                        : todaysDeliveries.length > 0 
                        ? 'border-slate-100 hover:border-blue-400 hover:shadow-sm cursor-pointer' 
                        : 'border-slate-50 bg-slate-50/10 text-slate-300 cursor-default'
                    }`}
                  >
                    <span className={`text-xs font-black ${isToday ? 'text-blue-600' : 'text-slate-700'}`}>{dayNum}</span>
                    
                    {/* Render indicator droplets */}
                    {todaysDeliveries.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {todaysDeliveries.map((del, dIdx) => {
                          let badgeColor = 'bg-blue-500';
                          if (del.dayStatus === 'delivered') badgeColor = 'bg-emerald-500';
                          else if (del.dayStatus === 'paused') badgeColor = 'bg-slate-300';
                          else if (del.dayStatus === 'vacation') badgeColor = 'bg-amber-500';

                          return (
                            <span 
                              key={dIdx} 
                              className={`h-2.5 w-2.5 rounded-full ${badgeColor} transition-transform group-hover:scale-110`}
                              title={`${del.productName} (${del.dayStatus})`}
                            ></span>
                          );
                        })}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
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

      {/* ── DAY DETAIL MODAL ── */}
      {selectedDayDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-in scale-in duration-350 relative">
            <button 
              onClick={() => setSelectedDayDetail(null)}
              className="absolute top-4 right-4 h-8 w-8 bg-slate-50 hover:bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 tracking-tight">
                  Delivery Schedule
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {monthNames[currentMonth]} {selectedDayDetail.day}, {currentYear}
                </p>
              </div>
            </div>

            <div className="space-y-4 my-6">
              {selectedDayDetail.deliveries.map((del: any, idx: number) => (
                <div key={idx} className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50 space-y-2 text-left">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{del.vendorName}</span>
                      <h4 className="font-extrabold text-slate-800 text-sm">{del.productName}</h4>
                    </div>
                    {del.dayStatus === 'delivered' && (
                      <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider">Delivered</span>
                    )}
                    {del.dayStatus === 'scheduled' && (
                      <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider">Scheduled</span>
                    )}
                    {del.dayStatus === 'paused' && (
                      <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider">Paused</span>
                    )}
                    {del.dayStatus === 'vacation' && (
                      <span className="bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider">Vacation</span>
                    )}
                  </div>
                  
                  <div className="flex justify-between text-xs text-slate-650 pt-2 border-t border-slate-100">
                    <span>Quantity: <strong>{del.quantity} unit(s)</strong></span>
                    <span>Est. Time: <strong>6:00 AM - 7:30 AM</strong></span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setSelectedDayDetail(null)}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm rounded-xl shadow-sm active:scale-95 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
