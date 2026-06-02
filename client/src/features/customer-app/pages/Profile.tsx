import React, { useState } from 'react';
import { User, MapPin, CreditCard, Clock, HelpCircle, LogOut, ChevronRight, Settings, Plus, X, ShieldCheck, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';

export default function Profile() {
  const { user, logout } = useAuth();

  const [walletBalance, setWalletBalance] = useState(() => {
    const val = localStorage.getItem('mockWalletBalance');
    return val ? Number(val) : 500.00;
  });
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('500');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleTopUp = () => {
    const amount = Number(topUpAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      const newBalance = walletBalance + amount;
      setWalletBalance(newBalance);
      localStorage.setItem('mockWalletBalance', newBalance.toString());
      setIsProcessing(false);
      setShowTopUpModal(false);
    }, 1500);
  };

  const menuItems = [
    { icon: Clock, label: 'Order History', path: '/my-app/orders' },
    { icon: MapPin, label: 'Delivery Addresses', path: '/my-app/addresses' },
    { icon: CreditCard, label: 'Payment Methods', path: '/my-app/payments' },
    { icon: Settings, label: 'Account Settings', path: '/my-app/settings' },
    { icon: HelpCircle, label: 'Help & Support', path: '/my-app/support' },
  ];

  return (
    <div className="bg-slate-50/30 min-h-screen pb-24 md:p-8 max-w-2xl mx-auto animate-in fade-in duration-500 relative">
      
      {/* ── PROFILE HERO BANNER ── */}
      <div className="bg-gradient-to-tr from-blue-700 to-indigo-600 pt-16 pb-10 px-6 rounded-b-[40px] md:rounded-[40px] text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex items-center gap-5">
          <div className="h-20 w-20 bg-white/15 rounded-3xl backdrop-blur-md flex items-center justify-center border border-white/20 shrink-0 shadow-lg">
            <User className="h-10 w-10 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-black tracking-tight truncate">{user?.name || 'Guest User'}</h1>
            <p className="text-indigo-100 font-bold text-xs mt-0.5">{user?.phone || 'No phone number'}</p>
            <span className="inline-block mt-2 bg-white/20 px-3.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest backdrop-blur-md border border-white/10">
              {user?.role === 'customer' ? 'Premium Member' : user?.role || 'Member'}
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-0 mt-6 space-y-6">
        
        {/* ── WALLET BALANCE CARD ── */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex items-center justify-between hover:border-slate-200 transition-colors">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-emerald-50 text-emerald-600 border border-emerald-50 rounded-2xl flex items-center justify-center shrink-0">
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Milk Wallet Balance</p>
              <p className="text-2xl font-black text-slate-900 mt-0.5">₹{walletBalance.toFixed(2)}</p>
            </div>
          </div>
          <button 
            onClick={() => setShowTopUpModal(true)}
            className="flex items-center gap-1 bg-blue-50 hover:bg-blue-100/70 text-blue-600 font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all active:scale-95 shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" /> Top Up
          </button>
        </div>

        {/* ── MENU ITEMS ── */}
        <div className="bg-white rounded-3xl p-2 shadow-sm border border-slate-100">
          {menuItems.map((item, index) => (
            <Link 
              key={index} 
              to={item.path}
              className="flex items-center justify-between p-4 hover:bg-slate-50/50 rounded-2xl transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                  <item.icon className="h-4.5 w-4.5 text-slate-600 group-hover:text-blue-600 transition-colors" />
                </div>
                <span className="font-extrabold text-sm text-slate-700 group-hover:text-slate-900">{item.label}</span>
              </div>
              <ChevronRight className="h-4.5 w-4.5 text-slate-400 group-hover:text-blue-600 transition-all group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>

        {/* ── LOGOUT BUTTON ── */}
        <button 
          onClick={logout}
          className="w-full bg-white rounded-3xl p-4 shadow-sm border border-red-100 flex items-center justify-center gap-3 text-red-500 font-black text-sm hover:bg-red-50/50 transition-colors active:scale-[0.99]"
        >
          <LogOut className="h-4.5 w-4.5" />
          Log Out Account
        </button>

      </div>

      {/* ── TOP UP MODAL ── */}
      {showTopUpModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-in scale-in duration-350 relative">
            <button 
              onClick={() => setShowTopUpModal(false)}
              className="absolute top-4 right-4 h-8 w-8 bg-slate-50 hover:bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 tracking-tight">Top Up Wallet</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Add money to your Milk Wallet</p>
              </div>
            </div>

            <div className="space-y-4 my-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Enter Amount (₹)</label>
                <input 
                  type="number" 
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  className="w-full h-11 border border-slate-200 rounded-xl px-3 text-xs md:text-sm font-semibold outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. 500"
                />
              </div>

              {/* Predefined Amounts */}
              <div className="grid grid-cols-3 gap-2">
                {['100', '500', '1000'].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setTopUpAmount(amt)}
                    className={`h-9 rounded-lg text-xs font-black transition-colors ${
                      topUpAmount === amt 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    +₹{amt}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleTopUp}
              disabled={isProcessing}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-350 text-white font-extrabold text-sm rounded-xl shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              {isProcessing ? 'Processing Transaction...' : 'Add to Wallet'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
