import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Truck, Settings, LogOut, Wrench, ArrowRight } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

export default function VendorDashboardLayout() {
  const location = useLocation();
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [showMaintenancePopup, setShowMaintenancePopup] = useState(true);

  const navItems = [
    { name: 'Overview', path: '/vendor-app', icon: LayoutDashboard },
    { name: 'Products', path: '/vendor-app/products', icon: Package },
    { name: 'Orders (Invoices)', path: '/vendor-app/orders', icon: ShoppingBag },
    { name: 'Deliveries', path: '/vendor-app/deliveries', icon: Truck },
    { name: 'Settings', path: '/vendor-app/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col h-screen sticky top-0">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <span className="font-black text-xl text-gray-900 tracking-tight">Dairy<span className="text-[#0052cc]">OS</span> Vendor</span>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 opacity-50 pointer-events-none">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/vendor-app' && location.pathname.startsWith(item.path));
            return (
              <Link 
                key={item.name} 
                to={item.path} 
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-colors ${
                  isActive 
                    ? 'bg-blue-50 text-[#0052cc]' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden relative">
        {/* Mobile Header */}
        <header className="md:hidden h-16 bg-white border-b border-gray-200 flex items-center px-4 sticky top-0 z-40">
          <span className="font-black text-xl text-gray-900 tracking-tight">Dairy<span className="text-[#0052cc]">OS</span> Vendor</span>
        </header>

        <div className="flex-1 p-6 md:p-8 overflow-y-auto filter blur-[2px] opacity-60 pointer-events-none">
          <Outlet />
        </div>

        {/* Maintenance Popup Modal */}
        {showMaintenancePopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="max-w-xl w-full bg-white rounded-3xl p-8 md:p-10 shadow-2xl border border-slate-100 text-center animate-in zoom-in-95 duration-300 relative">
              
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 h-24 w-24 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-xl shadow-blue-600/30 border-4 border-white">
                <Wrench className="h-10 w-10 animate-pulse" />
              </div>

              <div className="mt-10 mb-6">
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-2">
                  Vendor Portal Paused
                </h1>
                <p className="text-blue-600 font-bold uppercase tracking-widest text-xs">Under Maintenance</p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-5 mb-8 text-left border border-slate-100">
                <h2 className="font-extrabold text-slate-800 text-base mb-2">What is this portal for?</h2>
                <p className="text-slate-600 text-sm leading-relaxed mb-3">
                  The Vendor Portal is designed for third-party e-commerce sellers offering generic packaged goods alongside farm-fresh dairy.
                </p>
                <div className="h-px bg-slate-200 w-full my-3"></div>
                <p className="text-slate-600 text-sm leading-relaxed font-medium">
                  Currently, we are hyper-focused on our core mission: <span className="text-blue-700 font-extrabold">empowering local dairy farmers.</span> All farm operations and subscriptions are managed exclusively through the <span className="font-bold text-slate-800">Farmer Portal</span>.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {user?.roles?.includes('farmer') && (
                  <button 
                    onClick={() => navigate('/dashboard')}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl transition-all shadow-sm shadow-blue-600/20 active:scale-95"
                  >
                    Go to Farmer Portal <ArrowRight className="h-5 w-5" />
                  </button>
                )}
                <button 
                  onClick={logout}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-xl transition-all active:scale-95"
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
