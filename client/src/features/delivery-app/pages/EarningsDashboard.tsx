import React from 'react';
import { IndianRupee, TrendingUp, Calendar, ChevronRight, CheckCircle2, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EarningsDashboard() {
  return (
    <div className="bg-slate-900 min-h-screen text-white flex flex-col p-5">
      <h1 className="font-black text-2xl mb-6">Earnings</h1>

      {/* Main Balance Card */}
      <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-3xl p-6 relative overflow-hidden shadow-xl shadow-amber-500/20 mb-8">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white opacity-20 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <p className="text-amber-900 font-bold uppercase tracking-widest text-xs mb-1">Today's Earnings</p>
          <div className="flex items-end gap-2 mb-6">
            <span className="font-black text-5xl text-slate-900">₹0</span>
            <span className="text-amber-900 font-bold text-sm mb-1.5 flex items-center gap-1"></span>
          </div>
          
          <div className="flex justify-between items-center bg-slate-900/10 p-3 rounded-xl backdrop-blur-sm">
            <div>
              <p className="text-amber-900 text-[10px] font-black uppercase tracking-widest">Deliveries</p>
              <p className="font-black text-slate-900 text-lg">0 / 0</p>
            </div>
            <div className="h-8 w-px bg-amber-900/20"></div>
            <div>
              <p className="text-amber-900 text-[10px] font-black uppercase tracking-widest">Time Online</p>
              <p className="font-black text-slate-900 text-lg">0h 0m</p>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Chart Mockup */}
      <div className="bg-slate-800 rounded-3xl p-5 border border-slate-700 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-black text-lg">This Week</h2>
          <span className="text-amber-500 font-bold text-sm">₹0</span>
        </div>
        
        <div className="flex items-end justify-between h-32 gap-2">
          {[0, 0, 0, 0, 0, 0, 0].map((height, i) => (
            <div key={i} className="w-full flex flex-col items-center gap-2">
              <div className="w-full bg-slate-700 rounded-t-sm relative flex items-end justify-center h-full">
                <div 
                  className={`w-full rounded-t-sm bg-slate-600`} 
                  style={{ height: `${height}%` }}
                ></div>
              </div>
              <span className={`text-[10px] font-bold text-slate-500`}>
                {['M','T','W','T','F','S','S'][i]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <h2 className="font-black text-lg mb-4">Payout History</h2>
        <div className="space-y-3">
          <div className="text-center py-10 text-slate-500 text-sm">No payout history available.</div>
        </div>
      </div>
    </div>
  );
}
