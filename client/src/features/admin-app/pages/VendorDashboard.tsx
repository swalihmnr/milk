import React from 'react';
import { IndianRupee, Package, ShoppingBag, TrendingUp, AlertTriangle, Loader2, Truck, RotateCcw, CheckCircle2 } from 'lucide-react';
import { useVendorStats } from '../../../hooks/useApi';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

const salesTrendData = [
  { name: 'Week 1', revenue: 8200, orders: 34 },
  { name: 'Week 2', revenue: 10500, orders: 42 },
  { name: 'Week 3', revenue: 9800, orders: 39 },
  { name: 'Week 4', revenue: 12450, orders: 51 },
];

const productDemandData = [
  { name: 'A2 Cow Milk', sold: 320, stock: 80 },
  { name: 'Buffalo Milk', sold: 210, stock: 55 },
  { name: 'Paneer', sold: 90, stock: 12 },
  { name: 'Curd', sold: 140, stock: 60 },
  { name: 'Ghee', sold: 55, stock: 30 },
];

export default function VendorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const vendorId = user?.vendorId || '654321mockvendorid';
  const { data, loading, error } = useVendorStats(vendorId);

  const stats = [
    {
      title: "Today's Sales",
      value: `₹${(data?.todaySales || 0).toLocaleString('en-IN')}`,
      icon: IndianRupee,
      color: 'bg-green-100 text-green-600',
      trend: '+8%',
      trendUp: true,
    },
    {
      title: 'Active Subscriptions',
      value: data?.activeSubscriptions || 0,
      icon: Package,
      color: 'bg-[#0052cc]/10 text-[#0052cc]',
      trend: '+12%',
      trendUp: true,
    },
    {
      title: 'Pending Orders',
      value: data?.pendingOrders || 0,
      icon: ShoppingBag,
      color: 'bg-orange-100 text-orange-600',
      trend: '-3%',
      trendUp: false,
    },
    {
      title: 'Refunds Pending',
      value: 2,
      icon: RotateCcw,
      color: 'bg-red-100 text-red-500',
      trend: '0%',
      trendUp: true,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#0052cc]" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-5 font-bold">Error loading dashboard: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Vendor Overview</h1>
        <p className="text-gray-500 text-sm mt-1">
          {user?.name || 'Your Store'} — Sales, inventory, and subscription performance.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-start justify-between"
          >
            <div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">
                {stat.title}
              </p>
              <h3 className="text-2xl font-black text-gray-900">{stat.value}</h3>
              <p
                className={`text-sm font-bold mt-2 flex items-center gap-1 ${
                  stat.trendUp ? 'text-green-500' : 'text-red-400'
                }`}
              >
                <TrendingUp className="h-4 w-4" /> {stat.trend}
              </p>
            </div>
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${stat.color}`}>
              <stat.icon className="h-6 w-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-black text-gray-900">Revenue Trend</h2>
              <p className="text-xs text-gray-400 font-medium mt-0.5">Weekly sales & order volume</p>
            </div>
            <div className="h-9 w-9 rounded-xl bg-green-50 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={salesTrendData}>
              <defs>
                <linearGradient id="vendorRevGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0052cc" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#0052cc" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 700, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fontWeight: 700, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontWeight: 700, fontSize: 12 }}
                formatter={(val: any) => [`₹${val.toLocaleString('en-IN')}`, 'Revenue']}
              />
              <Area type="monotone" dataKey="revenue" stroke="#0052cc" strokeWidth={2.5} fill="url(#vendorRevGradient)" dot={{ r: 4, fill: '#0052cc' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Product Demand vs Stock */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-black text-gray-900">Demand vs Stock</h2>
              <p className="text-xs text-gray-400 font-medium mt-0.5">Units sold vs current inventory</p>
            </div>
            <div className="h-9 w-9 rounded-xl bg-blue-50 flex items-center justify-center">
              <Package className="h-5 w-5 text-[#0052cc]" />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={productDemandData} barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fontWeight: 700, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontWeight: 700, fontSize: 12 }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, fontWeight: 700 }} />
              <Bar dataKey="sold" name="Units Sold" fill="#0052cc" radius={[6, 6, 0, 0]} />
              <Bar dataKey="stock" name="In Stock" fill="#34d399" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-black text-gray-900">Low Stock Alerts</h2>
            <button
              onClick={() => navigate('/vendor-app/products')}
              className="text-sm font-bold text-[#0052cc] hover:underline"
            >
              Manage Products
            </button>
          </div>

          <div className="space-y-3">
            {data?.lowStockProducts && data.lowStockProducts.length > 0 ? (
              data.lowStockProducts.map((product: any) => (
                <div
                  key={product._id}
                  className="flex items-center justify-between p-3 bg-red-50/50 rounded-xl border border-red-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-red-100 text-red-500 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{product.name}</h4>
                      <p className="text-xs text-red-500 font-medium mt-0.5">
                        Only {product.stockQuantity} units left
                      </p>
                    </div>
                  </div>
                  <button className="text-sm font-bold text-[#0052cc] bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors">
                    Update
                  </button>
                </div>
              ))
            ) : (
              <div className="flex items-center gap-3 py-4">
                <div className="h-10 w-10 bg-green-100 text-green-500 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <p className="text-sm text-gray-600 font-medium">All products are adequately stocked.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-black text-gray-900">Recent Orders</h2>
            <button
              onClick={() => navigate('/vendor-app/orders')}
              className="text-sm font-bold text-[#0052cc] hover:underline"
            >
              View All
            </button>
          </div>

          <div className="space-y-4">
            {data?.recentOrders && data.recentOrders.length > 0 ? (
              data.recentOrders.map((order: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-b border-gray-50 pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 bg-orange-50 rounded-lg flex items-center justify-center">
                      <Truck className="h-4 w-4 text-orange-500" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">Order #{order.id}</h4>
                      <p className="text-xs text-gray-500 font-medium mt-0.5">
                        {order.items} items · ₹{order.total}
                      </p>
                    </div>
                  </div>
                  <span className="bg-orange-50 text-orange-600 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border border-orange-100">
                    {order.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 font-medium">No recent orders to display.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
