import React, { useState } from 'react';
import {
  Milk, IndianRupee, Calendar, Bell, HelpCircle,
  CheckCircle2, AlertTriangle, Droplets, ChevronRight,
  Home, Receipt, Package, MessageCircle, Sun, Moon,
  PauseCircle, PlayCircle, Phone, MapPin, Star, Clock,
  TrendingUp, X, Send, ArrowRight
} from 'lucide-react';

const TABS = ['home', 'deliveries', 'billing', 'support'] as const;
type Tab = typeof TABS[number];

// Mock data
const customer = {
  name: 'Rahul Sharma',
  phone: '9876543210',
  area: 'Sector 4, Pune',
  plan: 'Daily Cow Milk — 1.5L',
  morningQty: 1,
  eveningQty: 0.5,
  status: 'active',
  billingCycle: 'Monthly',
  pricePerMonth: 2400,
};

const deliveries = [
  { date: 'Today, Apr 25', shift: 'Morning', qty: 1, status: 'delivered', time: '06:15 AM' },
  { date: 'Today, Apr 25', shift: 'Evening', qty: 0.5, status: 'pending', time: '—' },
  { date: 'Yesterday, Apr 24', shift: 'Morning', qty: 1, status: 'delivered', time: '06:20 AM' },
  { date: 'Yesterday, Apr 24', shift: 'Evening', qty: 0.5, status: 'delivered', time: '05:55 PM' },
  { date: 'Apr 23', shift: 'Morning', qty: 0, status: 'missed', time: '—' },
  { date: 'Apr 23', shift: 'Evening', qty: 0.5, status: 'delivered', time: '06:00 PM' },
];

const invoices = [
  { month: 'April 2026', total: 2400, paid: 0, status: 'unpaid', due: 'Apr 30, 2026' },
  { month: 'March 2026', total: 2400, paid: 2400, status: 'paid', due: 'Mar 31, 2026' },
  { month: 'February 2026', total: 2200, paid: 2200, status: 'paid', due: 'Feb 28, 2026' },
];

export default function CustomerAppDashboard() {
  const [tab, setTab] = useState<Tab>('home');
  const [paused, setPaused] = useState(false);
  const [ticketOpen, setTicketOpen] = useState(false);
  const [ticketMsg, setTicketMsg] = useState('');
  const [ticketSent, setTicketSent] = useState(false);
  const [notifications] = useState(2);

  const greetingHour = new Date().getHours();
  const greeting = greetingHour < 12 ? 'Good Morning' : greetingHour < 17 ? 'Good Afternoon' : 'Good Evening';

  const todayDeliveries = deliveries.filter(d => d.date.startsWith('Today'));
  const todayDelivered = todayDeliveries.filter(d => d.status === 'delivered').reduce((s, d) => s + d.qty, 0);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col relative overflow-x-hidden">
      {/* ── DESKTOP TOP NAV ── */}
      <nav className="hidden md:flex items-center justify-between px-8 py-5 bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 bg-[#0052cc] rounded-xl flex items-center justify-center">
            <Milk className="h-6 w-6 text-white" />
          </div>
          <span className="font-black text-xl text-gray-900 tracking-tight">Dairy<span className="text-[#0052cc]">OS</span></span>
        </div>
        <div className="flex items-center gap-8">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`text-sm font-bold uppercase tracking-widest transition-all ${tab === t ? 'text-[#0052cc]' : 'text-gray-400 hover:text-gray-600'}`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right mr-2">
            <p className="text-xs font-bold text-gray-900">{customer.name}</p>
            <p className="text-[10px] text-gray-500 font-medium">{customer.plan}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center font-black text-[#0052cc]">
            {customer.name[0]}
          </div>
        </div>
      </nav>

      <div className="flex-1 w-full max-w-5xl mx-auto md:py-10">

      {/* ── HEADER ── */}
      <div className={`px-5 pt-10 pb-6 text-white transition-all md:rounded-[2rem] md:mx-4 ${paused ? 'bg-gradient-to-br from-gray-700 to-gray-900' : 'bg-gradient-to-br from-[#0052cc] to-[#0073e6]'}`}>
        <div className="flex items-center justify-between mb-5">
          <div className="md:hidden">
            <p className="text-blue-200 text-[11px] font-bold uppercase tracking-widest mb-0.5">{greeting} 👋</p>
            <h1 className="text-2xl font-black text-white">{customer.name.split(' ')[0]}</h1>
            <p className="text-blue-200 text-xs mt-0.5 font-medium">{customer.plan}</p>
          </div>
          <div className="hidden md:block">
            <h1 className="text-3xl font-black text-white">Dashboard Overview</h1>
            <p className="text-blue-100 text-sm mt-1 font-medium">Welcome back, {customer.name}! Here is what's happening with your milk subscription.</p>
          </div>
          <div className="flex items-center gap-3 md:hidden">
            <div className="relative">
              <button className="h-10 w-10 bg-white/15 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20 hover:bg-white/25 transition-colors">
                <Bell className="h-5 w-5" />
              </button>
              {notifications > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-400 text-white text-[9px] font-black flex items-center justify-center border border-[#0052cc]">{notifications}</span>
              )}
            </div>
          </div>
        </div>

        {/* Today's Status Card */}
        <div className="bg-white/12 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest mb-1">Today's Delivery</p>
              {paused ? (
                <p className="font-black text-xl text-orange-300">⏸ Paused</p>
              ) : (
                <p className="font-black text-xl">{todayDelivered} L <span className="text-white/60 text-sm font-medium">delivered</span></p>
              )}
            </div>
            <div className="flex gap-2">
              <div className="text-center">
                <div className="flex items-center gap-1 text-amber-300 mb-1"><Sun className="h-3 w-3" /><span className="text-[10px] font-bold">AM</span></div>
                {todayDeliveries.find(d => d.shift === 'Morning')?.status === 'delivered'
                  ? <CheckCircle2 className="h-6 w-6 text-green-400 mx-auto" />
                  : <Clock className="h-6 w-6 text-white/40 mx-auto" />}
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1 text-indigo-300 mb-1"><Moon className="h-3 w-3" /><span className="text-[10px] font-bold">PM</span></div>
                {todayDeliveries.find(d => d.shift === 'Evening')?.status === 'delivered'
                  ? <CheckCircle2 className="h-6 w-6 text-green-400 mx-auto" />
                  : <Clock className="h-6 w-6 text-white/40 mx-auto" />}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="flex-1 overflow-y-auto pb-28">

        {/* HOME TAB */}
        {tab === 'home' && (
          <div className="px-4 pt-5 space-y-6 md:grid md:grid-cols-3 md:gap-6 md:space-y-0">
            
            <div className="md:col-span-2 space-y-6">
              {/* Quick Actions */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <button
                  onClick={() => setPaused(p => !p)}
                  className={`p-4 rounded-2xl text-left border-2 transition-all active:scale-95 ${paused ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-100 shadow-sm hover:shadow-md'}`}
                >
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-3 ${paused ? 'bg-orange-100' : 'bg-blue-50'}`}>
                    {paused ? <PlayCircle className="h-5 w-5 text-orange-600" /> : <PauseCircle className="h-5 w-5 text-[#0052cc]" />}
                  </div>
                  <p className="font-black text-sm text-gray-900">{paused ? 'Resume' : 'Pause'}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">Vacation mode</p>
                </button>

                <button
                  onClick={() => setTab('billing')}
                  className="bg-white p-4 rounded-2xl text-left border-2 border-gray-100 shadow-sm hover:shadow-md transition-all active:scale-95"
                >
                  <div className="h-10 w-10 bg-green-50 rounded-xl flex items-center justify-center mb-3">
                    <IndianRupee className="h-5 w-5 text-green-600" />
                  </div>
                  <p className="font-black text-sm text-gray-900">Pay Bill</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">₹{invoices[0].total}</p>
                </button>

                <button
                  onClick={() => setTab('deliveries')}
                  className="bg-white p-4 rounded-2xl text-left border-2 border-gray-100 shadow-sm hover:shadow-md transition-all active:scale-95"
                >
                  <div className="h-10 w-10 bg-purple-50 rounded-xl flex items-center justify-center mb-3">
                    <Package className="h-5 w-5 text-purple-600" />
                  </div>
                  <p className="font-black text-sm text-gray-900">History</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">Deliveries</p>
                </button>

                <button
                  onClick={() => setTab('support')}
                  className="bg-white p-4 rounded-2xl text-left border-2 border-gray-100 shadow-sm hover:shadow-md transition-all active:scale-95"
                >
                  <div className="h-10 w-10 bg-red-50 rounded-xl flex items-center justify-center mb-3">
                    <HelpCircle className="h-5 w-5 text-red-500" />
                  </div>
                  <p className="font-black text-sm text-gray-900">Support</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">Help</p>
                </button>
              </div>

              {/* Recent Deliveries Preview (Desktop Only) */}
              <div className="hidden md:block bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-black text-xl text-gray-900">Recent Deliveries</h3>
                  <button onClick={() => setTab('deliveries')} className="text-[#0052cc] text-sm font-bold flex items-center gap-1">
                    View All <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-3">
                  {deliveries.slice(0, 3).map((d, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{d.date}</p>
                          <p className="text-xs text-gray-500">{d.shift} Shift</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-gray-900">{d.qty} L</p>
                        <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest">{d.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Current Plan Card */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 text-white shadow-xl shadow-gray-200">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Active Plan</p>
                    <p className="font-black text-xl leading-tight">{customer.plan}</p>
                  </div>
                  <span className="bg-green-500/20 text-green-400 text-[10px] font-black px-2.5 py-1 rounded-full uppercase flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse"></span> Active
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-6">
                  <div className="bg-white/5 p-3 rounded-2xl">
                    <p className="text-gray-500 text-[10px] font-bold uppercase mb-1 flex items-center gap-1"><Sun className="h-3 w-3 text-amber-400" /> Morning</p>
                    <p className="font-black text-white text-lg">{customer.morningQty}L</p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-2xl">
                    <p className="text-gray-500 text-[10px] font-bold uppercase mb-1 flex items-center gap-1"><Moon className="h-3 w-3 text-indigo-400" /> Evening</p>
                    <p className="font-black text-white text-lg">{customer.eveningQty}L</p>
                  </div>
                </div>
                <div className="mt-4 bg-blue-600/20 border border-blue-500/20 p-4 rounded-2xl flex items-center justify-between">
                   <p className="text-xs font-bold text-blue-200 uppercase">Monthly Price</p>
                   <p className="font-black text-xl text-white">₹{customer.pricePerMonth}</p>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'This Month', value: '38.5L', icon: Droplets, color: 'text-blue-600 bg-blue-50' },
                  { label: 'Delivered', value: '96%', icon: CheckCircle2, color: 'text-green-600 bg-green-50' },
                ].map(s => (
                  <div key={s.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
                    <div className={`h-8 w-8 rounded-xl ${s.color} flex items-center justify-center mx-auto mb-2`}>
                      <s.icon className="h-4 w-4" />
                    </div>
                    <p className="font-black text-gray-900 text-lg">{s.value}</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wide">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* My Info */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2 tracking-tight">
                   <MapPin className="h-5 w-5 text-[#0052cc]" /> 
                   Delivery Address
                </h3>
                <p className="text-sm text-gray-600 font-medium mb-5 leading-relaxed bg-gray-50 p-4 rounded-2xl">{customer.area}</p>
                <div className="flex items-center gap-3 border-t border-gray-50 pt-5">
                  <div className="h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center">
                    <Phone className="h-4 w-4 text-[#0052cc]" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Contact Number</p>
                    <p className="font-black text-gray-800">{customer.phone}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DELIVERIES TAB */}
        {tab === 'deliveries' && (
          <div className="px-4 pt-5 space-y-4">
            <div>
              <h2 className="text-xl font-black text-gray-900 mb-1">Delivery History</h2>
              <p className="text-sm text-gray-500">Your recent milk deliveries</p>
            </div>
            <div className="space-y-2">
              {deliveries.map((d, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3.5 flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    d.status === 'delivered' ? 'bg-green-50' : d.status === 'missed' ? 'bg-red-50' : 'bg-amber-50'
                  }`}>
                    {d.status === 'delivered' ? <CheckCircle2 className="h-5 w-5 text-green-600" />
                      : d.status === 'missed' ? <AlertTriangle className="h-5 w-5 text-red-500" />
                      : <Clock className="h-5 w-5 text-amber-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm text-gray-900">{d.date}</p>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${
                        d.shift === 'Morning' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'
                      }`}>{d.shift}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{d.time}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`font-black text-sm ${d.status === 'missed' ? 'text-red-500' : 'text-gray-900'}`}>
                      {d.status === 'missed' ? 'Missed' : `${d.qty}L`}
                    </p>
                    <p className={`text-[10px] font-bold uppercase ${
                      d.status === 'delivered' ? 'text-green-600' : d.status === 'missed' ? 'text-red-500' : 'text-amber-500'
                    }`}>{d.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BILLING TAB */}
        {tab === 'billing' && (
          <div className="px-4 pt-5 space-y-4">
            <div>
              <h2 className="text-xl font-black text-gray-900 mb-1">Billing</h2>
              <p className="text-sm text-gray-500">Invoices and payment history</p>
            </div>

            {/* Current Bill Banner */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5 text-white">
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Current Balance Due</p>
              <h2 className="text-4xl font-black text-white mb-1">₹{invoices[0].total}</h2>
              <p className="text-red-400 text-xs font-semibold flex items-center gap-1 mb-4">
                <AlertTriangle className="h-3 w-3" /> Due by {invoices[0].due}
              </p>
              <button className="w-full bg-[#0052cc] hover:bg-blue-600 text-white font-black py-3 rounded-xl transition-all active:scale-95 shadow-lg shadow-blue-900/40">
                Pay ₹{invoices[0].total} Now
              </button>
            </div>

            {/* Invoice List */}
            <div className="space-y-2">
              {invoices.map((inv, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-4 flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${inv.status === 'paid' ? 'bg-green-50' : 'bg-red-50'}`}>
                    <Receipt className={`h-5 w-5 ${inv.status === 'paid' ? 'text-green-600' : 'text-red-500'}`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm text-gray-900">{inv.month}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Due: {inv.due}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-gray-900">₹{inv.total}</p>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${inv.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {inv.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUPPORT TAB */}
        {tab === 'support' && (
          <div className="px-4 pt-5 space-y-4">
            <div>
              <h2 className="text-xl font-black text-gray-900 mb-1">Support</h2>
              <p className="text-sm text-gray-500">We're here to help</p>
            </div>

            {/* Quick Issue Buttons */}
            <div className="space-y-2">
              {['Milk not delivered today', 'Wrong quantity received', 'Late delivery', 'Billing issue', 'Change delivery address'].map(issue => (
                <button
                  key={issue}
                  onClick={() => { setTicketMsg(issue); setTicketOpen(true); }}
                  className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3.5 text-left flex items-center justify-between hover:bg-gray-50 active:scale-[0.99] transition-all"
                >
                  <span className="text-sm font-bold text-gray-800">{issue}</span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </button>
              ))}
            </div>

            {/* Contact Card */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 bg-[#0052cc] rounded-xl flex items-center justify-center">
                  <Phone className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-black text-gray-900">Call Your Farmer</p>
                  <p className="text-xs text-gray-500">Direct line for urgent issues</p>
                </div>
              </div>
              <button className="w-full bg-[#0052cc] text-white font-black py-3 rounded-xl text-sm active:scale-95 transition-all">
                📞 Call Now
              </button>
            </div>

            {/* Rating */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <p className="font-black text-gray-900 mb-3">Rate Your Service</p>
              <div className="flex gap-2">
                {[1,2,3,4,5].map(s => (
                  <button key={s} className="flex-1 py-2 rounded-xl bg-gray-50 hover:bg-amber-50 hover:text-amber-500 transition-all text-gray-300 text-xl font-black active:scale-95">
                    ★
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── TICKET MODAL ── */}
      {ticketOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-t-3xl p-6 space-y-4 animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-gray-900 text-lg">Raise a Ticket</h3>
              <button onClick={() => { setTicketOpen(false); setTicketSent(false); }} className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                <X className="h-4 w-4" />
              </button>
            </div>
            {ticketSent ? (
              <div className="text-center py-8">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="font-black text-gray-900 text-lg">Ticket Raised!</p>
                <p className="text-gray-500 text-sm mt-1">We'll resolve this within 24 hours.</p>
              </div>
            ) : (
              <>
                <textarea
                  value={ticketMsg}
                  onChange={e => setTicketMsg(e.target.value)}
                  rows={4}
                  placeholder="Describe your issue..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0052cc] resize-none"
                />
                <button
                  onClick={() => setTicketSent(true)}
                  className="w-full bg-[#0052cc] text-white font-black py-3.5 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <Send className="h-4 w-4" /> Send Ticket
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── BOTTOM NAV ── */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] px-4 py-3 z-40">
        <div className="grid grid-cols-4 gap-1">
          {[
            { id: 'home', icon: Home, label: 'Home' },
            { id: 'deliveries', icon: Package, label: 'Deliveries' },
            { id: 'billing', icon: Receipt, label: 'Billing' },
            { id: 'support', icon: MessageCircle, label: 'Support' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as Tab)}
              className={`flex flex-col items-center py-1.5 rounded-xl transition-all ${tab === t.id ? 'text-[#0052cc]' : 'text-gray-400'}`}
            >
              <t.icon className={`h-5 w-5 mb-1 transition-all ${tab === t.id ? 'scale-110 text-[#0052cc]' : ''}`} />
              <span className="text-[10px] font-bold uppercase tracking-wide">{t.label}</span>
              {tab === t.id && <div className="h-1 w-4 bg-[#0052cc] rounded-full mt-0.5"></div>}
            </button>
          ))}
        </div>
      </div>
    </div>
  </div>
  );
}
