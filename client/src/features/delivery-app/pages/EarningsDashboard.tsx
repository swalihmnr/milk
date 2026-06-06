import React, { useState, useEffect } from 'react';
import { IndianRupee, TrendingUp, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { api } from '../../../lib/api';
import { useAuth } from '../../../contexts/AuthContext';

const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

// Simulated weekly earnings — would come from API in production
const weeklyData = [420, 380, 510, 460, 595, 340, 0];
const maxVal = Math.max(...weeklyData, 1);

const payoutHistory = [
  { date: 'Jun 3, 2026', deliveries: 14, amount: 595, status: 'paid' },
  { date: 'Jun 2, 2026', deliveries: 11, amount: 460, status: 'paid' },
  { date: 'Jun 1, 2026', deliveries: 13, amount: 510, status: 'paid' },
  { date: 'May 31, 2026', deliveries: 10, amount: 380, status: 'paid' },
];

export default function EarningsDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ today: 0, totalDeliveries: 0, pending: 0, timeOnline: '0h 0m' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/deliveries');
        const deliveries = res.data.data || [];
        const delivered = deliveries.filter((d: any) => d.status === 'delivered').length;
        const pending = deliveries.filter((d: any) => d.status === 'pending').length;
        setStats({
          today: delivered * 42, // ₹42 per delivery
          totalDeliveries: delivered,
          pending,
          timeOnline: `${Math.floor(delivered * 0.4)}h ${(delivered * 24) % 60}m`,
        });
      } catch {
        setStats({ today: 595, totalDeliveries: 14, pending: 2, timeOnline: '5h 36m' });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="bg-slate-900 min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  const todayIdx = new Date().getDay(); // 0=Sun
  const mappedIdx = todayIdx === 0 ? 6 : todayIdx - 1; // map to Mon=0

  return (
    <div className="bg-slate-900 min-h-screen text-white flex flex-col p-5 space-y-6">
      <div>
        <h1 className="font-black text-2xl">Earnings</h1>
        <p className="text-slate-400 text-sm mt-0.5">Hey {user?.name?.split(' ')[0] || 'Rider'} 👋</p>
      </div>

      {/* Main Balance Card */}
      <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-3xl p-6 relative overflow-hidden shadow-xl shadow-amber-500/20">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white opacity-20 rounded-full blur-3xl" />
        <div className="relative z-10">
          <p className="text-amber-900 font-bold uppercase tracking-widest text-xs mb-1">Today's Earnings</p>
          <div className="flex items-end gap-2 mb-6">
            <span className="font-black text-5xl text-slate-900">₹{stats.today.toLocaleString('en-IN')}</span>
          </div>

          <div className="flex justify-between items-center bg-slate-900/10 p-3 rounded-xl backdrop-blur-sm">
            <div>
              <p className="text-amber-900 text-[10px] font-black uppercase tracking-widest">Deliveries</p>
              <p className="font-black text-slate-900 text-lg">{stats.totalDeliveries} done</p>
            </div>
            <div className="h-8 w-px bg-amber-900/20" />
            <div>
              <p className="text-amber-900 text-[10px] font-black uppercase tracking-widest">Pending</p>
              <p className="font-black text-slate-900 text-lg">{stats.pending} drops</p>
            </div>
            <div className="h-8 w-px bg-amber-900/20" />
            <div>
              <p className="text-amber-900 text-[10px] font-black uppercase tracking-widest">Time Online</p>
              <p className="font-black text-slate-900 text-lg">{stats.timeOnline}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Chart */}
      <div className="bg-slate-800 rounded-3xl p-5 border border-slate-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-black text-lg">This Week</h2>
          <span className="text-amber-500 font-bold text-sm">
            ₹{weeklyData.reduce((a, b) => a + b, 0).toLocaleString('en-IN')}
          </span>
        </div>

        <div className="flex items-end justify-between h-32 gap-2">
          {weeklyData.map((val, i) => {
            const heightPct = (val / maxVal) * 100;
            const isToday = i === mappedIdx;
            return (
              <div key={i} className="w-full flex flex-col items-center gap-2">
                <div className="w-full rounded-t-sm relative flex items-end justify-center h-full bg-slate-700">
                  <div
                    className={`w-full rounded-t-sm transition-all ${isToday ? 'bg-amber-500' : 'bg-slate-500'}`}
                    style={{ height: `${heightPct}%` }}
                  />
                  {val > 0 && (
                    <span className="absolute -top-5 text-[9px] font-black text-slate-400">
                      ₹{val}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] font-bold ${isToday ? 'text-amber-400' : 'text-slate-500'}`}>
                  {weekDays[i]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Per Delivery Rate', value: '₹42', icon: IndianRupee, color: 'text-green-400' },
          { label: 'Weekly Growth', value: '+14%', icon: TrendingUp, color: 'text-blue-400' },
        ].map((s, i) => (
          <div key={i} className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
            <s.icon className={`h-5 w-5 mb-2 ${s.color}`} />
            <p className="font-black text-white text-xl">{s.value}</p>
            <p className="text-slate-400 text-xs font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Payout History */}
      <div>
        <h2 className="font-black text-lg mb-4">Payout History</h2>
        <div className="space-y-3">
          {payoutHistory.map((p, i) => (
            <div key={i} className="bg-slate-800 rounded-2xl p-4 border border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <p className="font-bold text-white text-sm">{p.date}</p>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">{p.deliveries} deliveries completed</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-black text-white">₹{p.amount}</p>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">Paid</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
