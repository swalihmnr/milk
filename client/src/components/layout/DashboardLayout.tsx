import React from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, BarChart2, Tractor, Users, Truck, ReceiptText, Settings, LayoutGrid, PawPrint, UserCircle2, Droplet, UserCheck, CalendarClock, Package } from 'lucide-react';

export default function DashboardLayout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      navigate('/login');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-secondary text-primary">
      {/* Sidebar navigation */}
      {/* Sidebar navigation */}
      <aside className="w-full md:w-72 bg-white border-r border-gray-100 p-0 hidden md:flex md:flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20">
        <div className="p-8 pb-4 flex items-center gap-3">
          <div className="bg-gradient-to-br from-[#0052cc] to-[#0073e6] rounded-xl p-2.5 text-white shadow-lg shadow-blue-500/20">
            <Droplet className="h-6 w-6 fill-current" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">DairyOS</h1>
            <p className="text-[10px] font-bold text-[#0052cc] uppercase tracking-widest">Enterprise</p>
          </div>
        </div>
        
        <div className="px-6 py-4">
          <div className="bg-[#f8fafc] rounded-2xl p-4 flex items-center gap-3 border border-gray-100">
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-orange-400 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{user?.name || 'Farmer'}</p>
              <p className="text-[10px] text-gray-500 font-medium capitalize">{user?.role || 'Farmer'}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1.5 mt-2 px-4">
          <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 mt-4">Main Menu</p>
          
          <Link to="/dashboard" className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${currentPath === '/dashboard' ? 'bg-[#0052cc] text-white shadow-lg shadow-blue-500/20' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
            <LayoutGrid className="h-5 w-5" /> Analytics
          </Link>
          
          <Link to="/dashboard/customers" className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${currentPath === '/dashboard/customers' ? 'bg-[#0052cc] text-white shadow-lg shadow-blue-500/20' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
            <Users className="h-5 w-5" /> Customers
          </Link>

          <Link to="/dashboard/cows" className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${currentPath === '/dashboard/cows' ? 'bg-[#0052cc] text-white shadow-lg shadow-blue-500/20' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
            <PawPrint className="h-5 w-5" /> Herd Management
          </Link>

          <Link to="/dashboard/subscriptions" className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${currentPath === '/dashboard/subscriptions' ? 'bg-[#0052cc] text-white shadow-lg shadow-blue-500/20' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
            <CalendarClock className="h-5 w-5" /> Milk Plans
          </Link>



          <Link to="/dashboard/deliveries" className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${currentPath === '/dashboard/deliveries' ? 'bg-[#0052cc] text-white shadow-lg shadow-blue-500/20' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
            <Truck className="h-5 w-5" /> Delivery Routes
          </Link>

          <Link to="/dashboard/delivery-boys" className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${currentPath === '/dashboard/delivery-boys' ? 'bg-[#0052cc] text-white shadow-lg shadow-blue-500/20' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
            <UserCheck className="h-5 w-5" /> Delivery Boys
          </Link>

          <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 mt-6">Financials</p>

          <Link to="/dashboard/billing" className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${currentPath === '/dashboard/billing' ? 'bg-[#0052cc] text-white shadow-lg shadow-blue-500/20' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
            <ReceiptText className="h-5 w-5" /> Billing & Invoices
          </Link>

          <Link to="/dashboard/profile" className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${currentPath === '/dashboard/profile' ? 'bg-[#0052cc] text-white shadow-lg shadow-blue-500/20' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
            <UserCircle2 className="h-5 w-5" /> Profile Settings
          </Link>
        </nav>
        
        <div className="p-6 mt-auto border-t border-gray-100">
          <button 
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-red-500 bg-red-50 hover:bg-red-100 transition-colors"
          >
            <LogOut className="h-5 w-5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 pb-24 md:pb-0 overflow-y-auto bg-[#f8fafc]">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
      
      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white md:hidden flex justify-around shadow-[0_-2px_10px_rgb(0,0,0,0.05)] z-50 px-2 rounded-t-xl">
        <Link to="/dashboard" className={`flex flex-col items-center justify-center w-full py-3 border-t-2 transition-colors ${currentPath === '/dashboard' ? 'border-accent text-accent' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
          <LayoutGrid className="h-5 w-5 mb-1" />
          <span className="text-[10px] font-medium">Home</span>
        </Link>
        <Link to="/dashboard/cows" className={`flex flex-col items-center justify-center w-full py-3 border-t-2 transition-colors ${currentPath === '/dashboard/cows' ? 'border-accent text-accent' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
          <PawPrint className="h-5 w-5 mb-1" />
          <span className="text-[10px] font-medium">Cows</span>
        </Link>
        <Link to="/dashboard/deliveries" className={`flex flex-col items-center justify-center w-full py-3 border-t-2 transition-colors ${currentPath === '/dashboard/deliveries' ? 'border-accent text-accent' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
          <Truck className="h-5 w-5 mb-1" />
          <span className="text-[10px] font-medium">Delivery</span>
        </Link>
        <Link to="/dashboard/billing" className={`flex flex-col items-center justify-center w-full py-3 border-t-2 transition-colors ${currentPath === '/dashboard/billing' ? 'border-accent text-accent' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
          <ReceiptText className="h-5 w-5 mb-1" />
          <span className="text-[10px] font-medium">Billing</span>
        </Link>
        <Link to="/dashboard/profile" className={`flex flex-col items-center justify-center w-full py-3 border-t-2 transition-colors ${currentPath === '/dashboard/profile' ? 'border-accent text-accent' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
          <UserCircle2 className="h-5 w-5 mb-1" />
          <span className="text-[10px] font-medium">Profile</span>
        </Link>
      </nav>
    </div>
  );
}
