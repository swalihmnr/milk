import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Package, ShoppingCart, Calendar, User, Droplets, Bell, LogOut } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useCart } from '../../../contexts/CartContext';

export default function UserAppLayout() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { cart } = useCart();

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const navItems = [
    { name: 'Home', path: '/my-app', icon: Home },
    { name: 'Products', path: '/my-app/products', icon: Package },
    { name: 'Cart', path: '/my-app/cart', icon: ShoppingCart, badge: cartCount },
    { name: 'Subscriptions', path: '/my-app/subscriptions', icon: Calendar },
    { name: 'Profile', path: '/my-app/profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col md:flex-row relative">
      
      {/* ── DESKTOP SIDEBAR NAVIGATION ── */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-100 h-screen sticky top-0 shrink-0 z-50">
        {/* Logo Section */}
        <div className="p-6 border-b border-slate-50 flex items-center gap-3">
          <div className="h-10 w-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/10">
            <Droplets className="h-5 w-5 text-white animate-pulse" />
          </div>
          <span className="font-black text-xl text-slate-800 tracking-tight">
            Milk<span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Flow</span>
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/my-app' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 group relative overflow-hidden ${
                  isActive
                    ? 'bg-blue-50/70 text-blue-600 shadow-sm'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <div className="flex items-center gap-3.5 z-10">
                  <item.icon className={`h-5 w-5 transition-transform duration-200 group-hover:scale-105 ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-black z-10 ${
                    isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {item.badge}
                  </span>
                )}
                {/* Active Indicator Slide-in Effect */}
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-r-md"></div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile / Footer Section */}
        <div className="p-4 border-t border-slate-50 bg-slate-50/20">
          <div className="flex items-center gap-3 p-2 bg-white border border-slate-100 rounded-2xl shadow-sm">
            <div className="h-10 w-10 bg-gradient-to-tr from-blue-100 to-indigo-100 text-blue-700 rounded-xl flex items-center justify-center font-black text-sm shrink-0 border border-blue-50/50">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">{user?.name || 'Guest'}</p>
              <p className="text-[10px] font-medium text-slate-400 truncate">{user?.phone || 'No Phone'}</p>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
            >
              <LogOut className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── MOBILE HEADER ── */}
      <header className="md:hidden sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <Droplets className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="font-black text-lg text-slate-800 tracking-tight">
            Milk<span className="text-blue-600">Flow</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button className="relative h-9 w-9 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-600 active:scale-95 transition-transform">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </header>

      {/* ── MAIN CONTENT AREA ── */}
      <main className="flex-1 flex flex-col min-w-0 md:max-h-screen md:overflow-y-auto">
        <div className="flex-1 pb-20 md:pb-0">
          <Outlet />
        </div>
      </main>

      {/* ── MOBILE BOTTOM NAVIGATION ── */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-md border-t border-slate-100 px-5 py-2 flex items-center justify-around z-40 pb-safe shadow-[0_-8px_24px_rgba(0,0,0,0.04)]">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/my-app' && location.pathname.startsWith(item.path));
          return (
            <Link 
              key={item.name} 
              to={item.path} 
              className="flex flex-col items-center py-1.5 relative select-none w-14 active:scale-90 transition-transform duration-150"
            >
              <div className={`p-1.5 rounded-xl transition-all duration-200 ${
                isActive ? 'text-blue-600 scale-105' : 'text-slate-400'
              }`}>
                <item.icon className="h-5.5 w-5.5" />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute top-1 right-2.5 bg-blue-600 border-2 border-white text-white text-[9px] font-black h-4 px-1.5 rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[9px] font-extrabold tracking-wide uppercase transition-colors ${
                isActive ? 'text-blue-600 font-black' : 'text-slate-400'
              }`}>
                {item.name === 'Subscriptions' ? 'Subs' : item.name}
              </span>
            </Link>
          );
        })}
      </nav>

    </div>
  );
}
