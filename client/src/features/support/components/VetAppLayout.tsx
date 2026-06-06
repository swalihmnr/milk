import React from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, Stethoscope, ClipboardList, Settings, UserCircle2, MessageSquare, Award, Activity } from 'lucide-react';

export default function VetAppLayout() {
  const { user, loading, logout } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-teal-50 text-teal-800">
        <span className="h-8 w-8 rounded-full border-2 border-teal-600 border-t-transparent animate-spin mb-4"></span>
        <p className="font-bold text-sm">Verifying doctor access...</p>
      </div>
    );
  }

  if (!user || user.role !== 'vet') {
    return <Navigate to="/dashboard" replace />;
  }

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'Dr';

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-slate-50 text-slate-900">
      {/* Sidebar navigation */}
      <aside className="w-full md:w-72 bg-white border-r border-slate-200 p-0 hidden md:flex md:flex-col shadow-sm z-20">
        <div className="p-8 pb-4 flex items-center gap-3">
          <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl p-2.5 text-white shadow-lg shadow-teal-500/20">
            <Stethoscope className="h-6 w-6 fill-current" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">DairyOS</h1>
            <p className="text-[10px] font-bold text-teal-600 uppercase tracking-widest">Veterinary</p>
          </div>
        </div>
        
        <div className="px-6 py-4">
          <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3 border border-slate-100">
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-teal-400 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{user?.name || 'Veterinarian'}</p>
              <p className="text-[10px] text-slate-500 font-medium capitalize">Platform Doctor</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1.5 mt-2 px-4">
          <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 mt-4">Consultations</p>
          <Link to="/vet-app" className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${currentPath === '/vet-app' ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/20' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
            <ClipboardList className="h-5 w-5" /> Open Tickets
          </Link>

          <Link to="/vet-app/messages" className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${currentPath === '/vet-app/messages' ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/20' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
            <MessageSquare className="h-5 w-5" /> Messages
          </Link>

          <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 mt-6">Programs</p>

          <Link to="/vet-app/schemes" className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${currentPath === '/vet-app/schemes' ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/20' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
            <Award className="h-5 w-5" /> Govt Subsidies
          </Link>
          
          <Link to="/vet-app/breeding" className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${currentPath === '/vet-app/breeding' ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/20' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
            <Activity className="h-5 w-5" /> Reproduction Tracker
          </Link>

          <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 mt-6">Settings</p>

          <Link to="/vet-app/profile" className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${currentPath === '/vet-app/profile' ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/20' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
            <UserCircle2 className="h-5 w-5" /> Doctor Profile
          </Link>
        </nav>
        
        <div className="p-6 mt-auto border-t border-slate-100">
          <button 
            onClick={logout}
            className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-red-500 bg-red-50 hover:bg-red-100 transition-colors"
          >
            <LogOut className="h-5 w-5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 pb-24 md:pb-0 overflow-y-auto bg-slate-50">
        {/* Mobile Header */}
        <header className="md:hidden h-16 bg-white border-b border-slate-200 flex items-center px-4 sticky top-0 z-40">
          <Stethoscope className="h-5 w-5 text-teal-600 mr-2" />
          <span className="font-black text-lg text-slate-900 tracking-tight">Dairy<span className="text-teal-600">OS</span> Vet</span>
        </header>

        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
      
      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white md:hidden flex justify-around shadow-[0_-2px_10px_rgb(0,0,0,0.05)] z-50 px-2 rounded-t-xl">
        <Link to="/vet-app" className={`flex flex-col items-center justify-center w-full py-3 border-t-2 transition-colors ${currentPath === '/vet-app' ? 'border-teal-600 text-teal-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
          <ClipboardList className="h-5 w-5 mb-1" />
          <span className="text-[10px] font-medium">Tickets</span>
        </Link>
        <Link to="/vet-app/profile" className={`flex flex-col items-center justify-center w-full py-3 border-t-2 transition-colors ${currentPath === '/vet-app/profile' ? 'border-teal-600 text-teal-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
          <UserCircle2 className="h-5 w-5 mb-1" />
          <span className="text-[10px] font-medium">Profile</span>
        </Link>
      </nav>
    </div>
  );
}
