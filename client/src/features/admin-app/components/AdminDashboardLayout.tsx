import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Package, ShoppingBag, Truck, Settings, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

export default function AdminDashboardLayout() {
  const location = useLocation();
  const { logout } = useAuth();

  const navItems = [
    { name: 'Overview', path: '/admin-app', icon: LayoutDashboard },
    { name: 'Vendors', path: '/admin-app/vendors', icon: ShieldCheck },
    { name: 'Approvals', path: '/admin-app/approvals', icon: ShieldCheck },
    { name: 'Users', path: '/admin-app/users', icon: Users },
    { name: 'Products', path: '/admin-app/products', icon: Package },
    { name: 'Orders', path: '/admin-app/orders', icon: ShoppingBag },
    { name: 'Deliveries', path: '/admin-app/deliveries', icon: Truck },
    { name: 'Settings', path: '/admin-app/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col h-screen sticky top-0">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <span className="font-black text-xl text-gray-900 tracking-tight">Dairy<span className="text-[#0052cc]">OS</span> Admin</span>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/admin-app' && location.pathname.startsWith(item.path));
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
          <button onClick={logout} className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-bold text-red-600 hover:bg-red-50 transition-colors">
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Mobile Header */}
        <header className="md:hidden h-16 bg-white border-b border-gray-200 flex items-center px-4 sticky top-0 z-50">
          <span className="font-black text-xl text-gray-900 tracking-tight">Dairy<span className="text-[#0052cc]">OS</span> Admin</span>
        </header>

        <div className="flex-1 p-6 md:p-8 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
