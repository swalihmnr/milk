import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Map, List, Wallet, Bike } from 'lucide-react';

export default function DeliveryAppLayout() {
  const location = useLocation();

  const navItems = [
    { name: 'Route Map', path: '/delivery-app', icon: Map },
    { name: 'Deliveries', path: '/delivery-app/list', icon: List },
    { name: 'Earnings', path: '/delivery-app/earnings', icon: Wallet },
  ];

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
