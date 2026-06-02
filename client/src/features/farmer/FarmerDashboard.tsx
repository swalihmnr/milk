import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Bell, Truck, AlertTriangle, BadgeCheck, TrendingUp, 
  Droplets, Users, Calendar, Search, MoreHorizontal,
  ChevronRight, ArrowUpRight, Milk, Loader2, CheckCircle2
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { api } from '@/lib/api';
import { useFetch } from '@/hooks/useApi';

export default function FarmerDashboard() {
  const { data: customers, loading: loadingCust } = useFetch<any[]>('/customers');
  const { data: cows, loading: loadingCows } = useFetch<any[]>('/cows');
  const { data: invoices, loading: loadingInv } = useFetch<any[]>('/invoices');
  const [productionData, setProductionData] = useState<any[]>([]);
  const [loadingProd, setLoadingProd] = useState(true);

  useEffect(() => {
    // Fetch production for the last 7 days
    api.get('/milk-production')
      .then(res => {
        const raw = res.data.data;
        // Group by day for the chart
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const chartData = days.map(day => ({
          name: day,
          volume: raw.filter((p: any) => new Date(p.createdAt).getDay() === days.indexOf(day))
                    .reduce((sum: number, p: any) => sum + p.yieldLiters, 0) || 0
        }));
        // Rotate so today is last
        const today = new Date().getDay();
        const rotated = [...chartData.slice(today + 1), ...chartData.slice(0, today + 1)];
        setProductionData(rotated);
      })
      .catch(e => console.error(e))
      .finally(() => setLoadingProd(false));
  }, []);

  const totalYield = productionData.reduce((sum, d) => sum + d.volume, 0);
  const totalRevenue = invoices?.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0) || 0;
  const pendingRevenue = invoices?.reduce((sum, inv) => sum + (inv.pendingAmount || 0), 0) || 0;

  const loading = loadingCust || loadingCows || loadingInv || loadingProd;

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-gray-400">
      <Loader2 className="h-8 w-8 animate-spin text-[#0052cc]" />
      <p className="font-bold">Analyzing your dairy operations...</p>
    </div>
  );

  return (
    <div className="space-y-8 pb-12">
      {/* ── Welcome Header ────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[#0052cc] font-bold text-sm bg-blue-50 w-fit px-3 py-1 rounded-full mb-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0052cc]"></span>
            </span>
            Live Operations
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Namaste! 👋</h1>
          <p className="text-gray-500 font-medium">Here's what's happening at your farm today.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-[#0052cc] transition-colors" />
            <input 
              type="text" 
              placeholder="Search directory..." 
              className="pl-10 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl text-sm focus:bg-white focus:border-[#0052cc]/20 focus:ring-4 focus:ring-[#0052cc]/5 outline-none transition-all w-full md:w-64"
            />
          </div>
          <button className="p-3 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all shadow-sm relative">
            <Bell className="h-5 w-5 text-gray-600" />
            <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
        </div>
      </div>

      {/* ── KPI Grid ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Weekly Yield */}
        <Card className="relative overflow-hidden border-none shadow-xl bg-gradient-to-br from-[#0052cc] to-[#0073e6] text-white rounded-[2rem]">
          <div className="absolute top-0 right-0 p-6 opacity-20">
            <Droplets className="h-16 w-16" />
          </div>
          <CardContent className="p-8">
            <p className="text-blue-100 font-bold text-[10px] uppercase tracking-widest mb-4">7-Day Yield</p>
            <div className="flex items-baseline gap-2 mb-2">
              <h3 className="text-4xl font-black">{totalYield}</h3>
              <span className="text-xl font-bold opacity-80">L</span>
            </div>
            <div className="text-[10px] font-black bg-white/20 w-fit px-2 py-1 rounded-md uppercase">
              Total Production
            </div>
          </CardContent>
        </Card>

        {/* Active Customers */}
        <Card className="border-gray-100 shadow-sm bg-white rounded-[2rem] hover:shadow-md transition-all">
          <CardContent className="p-8">
            <div className="h-12 w-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500 mb-6">
              <Users className="h-6 w-6" />
            </div>
            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mb-2">Customers</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-black text-gray-900">{customers?.length || 0}</h3>
              <span className="text-sm font-bold text-gray-400">active</span>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Revenue */}
        <Card className="border-gray-100 shadow-sm bg-white rounded-[2rem] hover:shadow-md transition-all">
          <CardContent className="p-8">
            <div className="h-12 w-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-600 mb-6 font-black text-xl">
              ₹
            </div>
            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mb-2">Total Collected</p>
            <div className="flex items-baseline gap-1">
              <h3 className="text-3xl font-black text-gray-900">{totalRevenue.toLocaleString('en-IN')}</h3>
            </div>
          </CardContent>
        </Card>

        {/* Pending Dues */}
        <Card className="border-gray-100 shadow-sm bg-white rounded-[2rem] hover:shadow-md transition-all">
          <CardContent className="p-8">
            <div className="h-12 w-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 mb-6">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mb-2">Pending Dues</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-black text-red-600">₹{pendingRevenue.toLocaleString('en-IN')}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Main Production Chart ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-gray-100 shadow-sm bg-white rounded-[2.5rem] p-4">
          <CardHeader className="flex flex-row items-center justify-between pb-8 pt-4 px-6">
            <div>
              <CardTitle className="text-xl font-black text-gray-900">Milk Production Trends</CardTitle>
              <p className="text-sm text-gray-500 font-medium mt-1">Daily yield breakdown for the current week</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={productionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0052cc" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#0052cc" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#94a3b8" 
                    fontSize={12} 
                    fontWeight="bold"
                    tickLine={false} 
                    axisLine={false}
                    dy={15} 
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={12} 
                    fontWeight="bold"
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(val) => `${val}L`}
                    dx={-10}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', fontWeight: 'bold' }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="volume" 
                    stroke="#0052cc" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorVolume)" 
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* ── Quick Stats Sidebar ─────────────────────────────────────── */}
        <div className="space-y-6">
          <Card className="border-gray-100 shadow-sm bg-white rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-xl font-black">Herd Overview</CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <Milk className="h-5 w-5 text-blue-500" />
                  <span className="font-bold text-gray-700">Total Animals</span>
                </div>
                <span className="font-black text-xl">{cows?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-green-50/50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <BadgeCheck className="h-5 w-5 text-green-500" />
                  <span className="font-bold text-gray-700">Healthy</span>
                </div>
                <span className="font-black text-xl text-green-600">
                  {cows?.filter(c => c.healthStatus === 'healthy').length || 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-red-50/50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <span className="font-bold text-gray-700">Needs Care</span>
                </div>
                <span className="font-black text-xl text-red-600">
                  {cows?.filter(c => c.healthStatus === 'sick').length || 0}
                </span>
              </div>
              <button 
                onClick={() => window.location.href='/dashboard/herd'}
                className="w-full h-12 bg-[#0052cc] hover:bg-[#003d99] text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
              >
                Manage Herd <ChevronRight className="h-4 w-4" />
              </button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Recent Invoices ─────────────────────────────────────── */}
      <Card className="border-gray-100 shadow-sm bg-white rounded-[2.5rem] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between p-8">
          <div>
            <CardTitle className="text-xl font-black text-gray-900">Recent Billing</CardTitle>
            <p className="text-sm text-gray-500 font-medium mt-1">Last 5 generated invoices</p>
          </div>
          <button 
            onClick={() => window.location.href='/dashboard/billing'}
            className="flex items-center gap-2 text-sm font-bold text-[#0052cc] bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100 transition-all"
          >
            All Invoices <ArrowUpRight className="h-4 w-4" />
          </button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 text-[11px] font-black text-gray-400 uppercase tracking-widest border-y border-gray-100">
                  <th className="px-8 py-5">Customer</th>
                  <th className="px-8 py-5">Amount</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5">Date</th>
                  <th className="px-8 py-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {invoices && invoices.length > 0 ? invoices.slice(0, 5).map((inv: any) => (
                  <tr key={inv._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-4 font-bold text-gray-900">{inv.customerId?.name || 'Unknown'}</td>
                    <td className="px-8 py-4 font-black">₹{inv.totalAmount}</td>
                    <td className="px-8 py-4">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${inv.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-sm text-gray-500">{new Date(inv.createdAt).toLocaleDateString()}</td>
                    <td className="px-8 py-4 text-right">
                      <button className="text-gray-400 hover:text-[#0052cc]">
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-8 py-12 text-center text-gray-400 font-medium">No billing history available yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
