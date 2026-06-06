import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IndianRupee, Users, Package, TrendingUp, AlertCircle, CheckCircle2, RotateCcw, Loader2 } from 'lucide-react';
import { useAdminStats } from '../../../hooks/useApi';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Legend } from 'recharts';

const subscriptionGrowthData = [
  { name: 'Week 1', subscriptions: 40, revenue: 15000 },
  { name: 'Week 2', subscriptions: 75, revenue: 32000 },
  { name: 'Week 3', subscriptions: 110, revenue: 48050 },
  { name: 'Week 4', subscriptions: 168, revenue: 76000 },
  { name: 'Week 5', subscriptions: 230, revenue: 98000 },
  { name: 'Week 6', subscriptions: 310, revenue: 145000 },
];

const demandSupplyData = [
  { name: 'Milk A2', demand: 450, supply: 420 },
  { name: 'Buffalo', demand: 300, supply: 310 },
  { name: 'Paneer', demand: 120, supply: 90 },
  { name: 'Curd', demand: 200, supply: 210 },
  { name: 'Ghee', demand: 80, supply: 75 },
];

export default function AdminOverview() {
  const navigate = useNavigate();
  const { data, loading, error } = useAdminStats();

  const stats = [
    { title: 'Total Revenue', value: `₹${data?.totalRevenue || 0}`, icon: IndianRupee, color: 'bg-green-100 text-green-600', trend: '+12%' },
    { title: 'Active Users', value: data?.totalUsers || 0, icon: Users, color: 'bg-blue-100 text-[#0052cc]', trend: '+5%' },
    { title: 'Total Orders', value: data?.totalOrders || 0, icon: Package, color: 'bg-purple-100 text-purple-600', trend: '+18%' },
    { title: 'Refunds Pending', value: '12', icon: RotateCcw, color: 'bg-orange-100 text-orange-600', trend: '-2%' },
  ];

  if (loading) {
    return <div className="flex items-center justify-center h-full min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-[#0052cc]" /></div>;
  }

  if (error) {
    return <div className="text-red-500 p-5 font-bold">Error loading dashboard: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Admin Overview</h1>
        <p className="text-gray-500 text-sm mt-1">Platform performance metrics and analytics.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-start justify-between">
            <div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">{stat.title}</p>
              <h3 className="text-2xl font-black text-gray-900">{stat.value}</h3>
              <p className="text-sm font-bold text-green-500 mt-2 flex items-center gap-1">
                <TrendingUp className="h-4 w-4" /> {stat.trend}
              </p>
            </div>
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${stat.color}`}>
              <stat.icon className="h-6 w-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subscription growth chart */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-black text-gray-900">Subscription Growth</h2>
              <p className="text-xs text-gray-500 font-bold">Sign-ups & Revenue trends over time</p>
            </div>
            <TrendingUp className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={subscriptionGrowthData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSubs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0052cc" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#0052cc" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorSubs)" name="Revenue (₹)" />
                <Area type="monotone" dataKey="subscriptions" stroke="#0052cc" strokeWidth={3} fillOpacity={1} fill="url(#colorSubs)" name="Subscriptions" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Demand & Supply bar chart */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-black text-gray-900">Demand vs Supply Index</h2>
              <p className="text-xs text-gray-500 font-bold">Category replenishment volumes (liters/units)</p>
            </div>
            <Package className="h-5 w-5 text-[#0052cc]" />
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={demandSupplyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                <Legend iconType="circle" fontSize={11} />
                <Bar dataKey="demand" fill="#0052cc" radius={[6, 6, 0, 0]} name="Customer Demand" />
                <Bar dataKey="supply" fill="#10b981" radius={[6, 6, 0, 0]} name="Farmer Supply" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Vendor Approvals */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-black text-gray-900">Pending Vendor Approvals</h2>
            <button className="text-sm font-bold text-[#0052cc]">View All</button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-widest">
                  <th className="pb-3 px-2">Company</th>
                  <th className="pb-3 px-2">GST</th>
                  <th className="pb-3 px-2">Date</th>
                  <th className="pb-3 px-2">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {data?.pendingVendors && data.pendingVendors.length > 0 ? (
                  data.pendingVendors.map((vendor: any, i: number) => (
                    <tr key={vendor._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-2 font-bold text-gray-900 flex items-center gap-3">
                        <div className="h-8 w-8 bg-blue-50 text-[#0052cc] rounded-lg flex items-center justify-center">
                          {vendor.companyName?.charAt(0) || 'V'}
                        </div>
                        {vendor.companyName}
                      </td>
                      <td className="py-4 px-2 text-gray-600 font-mono text-xs">{vendor.gstNumber || 'N/A'}</td>
                      <td className="py-4 px-2 text-gray-500">{new Date(vendor.createdAt).toLocaleDateString()}</td>
                      <td className="py-4 px-2">
                        <div className="flex gap-2">
                          <button className="h-8 w-8 bg-green-50 text-green-600 rounded-lg flex items-center justify-center hover:bg-green-100 transition-colors">
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                          <button className="h-8 w-8 bg-red-50 text-red-600 rounded-lg flex items-center justify-center hover:bg-red-100 transition-colors">
                            <AlertCircle className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-gray-500">No pending approvals.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Failed Deliveries Alert */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col">
          <h2 className="text-lg font-black text-gray-900 mb-6">Delivery Issues</h2>
          
          <div className="flex-1 flex flex-col justify-center items-center text-center">
            <div className="h-16 w-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="font-black text-3xl text-gray-900 mb-1">14</h3>
            <p className="text-gray-500 font-medium text-sm">Failed deliveries today</p>
          </div>
          
          <button 
            onClick={() => navigate('/admin-app/deliveries')}
            className="w-full mt-6 bg-red-50 text-red-600 font-bold py-3 rounded-xl hover:bg-red-100 transition-colors active:scale-95"
          >
            Resolve Issues
          </button>
        </div>

      </div>
    </div>
  );
}
