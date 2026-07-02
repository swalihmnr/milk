import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Map, List, Wallet, Bike, Briefcase, ShieldAlert, LogOut } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

export default function DeliveryAppLayout() {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Route Map', path: '/delivery-app/map', icon: Map },
    { name: 'Deliveries', path: '/delivery-app', icon: List },
    { name: 'Earnings', path: '/delivery-app/earnings', icon: Wallet },
    { name: 'Jobs', path: '/delivery-app/jobs', icon: Briefcase },
  ];

  if (user && (user.role === 'delivery' || user.role === 'delivery_boy') && user.isVerified === false) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
          {/* Subtle gradient glowing effect */}
          <div className="absolute -top-12 -left-12 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 flex flex-col items-center">
            {/* Pulsing Alert Icon */}
            <div className="h-20 w-20 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mb-6 border border-amber-500/20 shadow-lg shadow-amber-500/5 animate-pulse">
              <ShieldAlert className="h-10 w-10" />
            </div>

            <h1 className="text-2xl font-black text-white tracking-tight mb-2">
              Verification Pending
            </h1>
            <p className="text-amber-500 font-bold uppercase tracking-widest text-[10px] mb-6">
              Awaiting Admin Approval
            </p>

            <div className="bg-slate-950/60 rounded-2xl p-5 mb-8 text-left border border-slate-800/80">
              <p className="text-slate-300 text-sm leading-relaxed mb-3">
                Hello <span className="font-extrabold text-white">{user.name}</span>, your account has been registered successfully.
              </p>
              <div className="h-px bg-slate-800 w-full my-3"></div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Before you can access delivery jobs, routes, and earnings, an administrator must verify your credentials and license details. This process typically takes less than 24 hours.
              </p>
            </div>

            <button 
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all active:scale-95 border border-slate-700"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col relative pb-20 md:pb-0">
      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-50 bg-slate-800 border-b border-slate-700 px-5 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-amber-500 rounded-lg flex items-center justify-center">
            <Bike className="h-5 w-5 text-slate-900" />
          </div>
          <span className="font-black text-lg text-white tracking-tight">Driver<span className="text-amber-500">Flow</span></span>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-xs font-bold text-green-400 uppercase tracking-widest">Online</span>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-slate-800 border-t border-slate-700 px-6 py-3 flex items-center justify-between z-50 pb-safe">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/delivery-app' && location.pathname.startsWith(item.path));
          return (
            <Link key={item.name} to={item.path} className="flex flex-col items-center gap-1 group">
              <div className={`p-2 rounded-xl transition-colors ${isActive ? 'bg-slate-700 text-amber-500' : 'text-slate-400 group-hover:bg-slate-700/50'}`}>
                <item.icon className="h-6 w-6" />
              </div>
              <span className={`text-[10px] font-bold ${isActive ? 'text-amber-500' : 'text-slate-500'}`}>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
