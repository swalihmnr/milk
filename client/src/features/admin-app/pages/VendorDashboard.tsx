import React from 'react';
import { IndianRupee, Package, ShoppingBag, TrendingUp, AlertTriangle, Loader2 } from 'lucide-react';
import { useVendorStats } from '../../../hooks/useApi';
import { useAuth } from '../../../contexts/AuthContext';

export default function VendorDashboard() {
  const { user } = useAuth();
  // Using a hardcoded mock vendor ID for demo if user.vendorId isn't set
  const vendorId = user?.vendorId || '654321mockvendorid'; 
  const { data, loading, error } = useVendorStats(vendorId);

  const stats = [
    { title: 'Today\'s Sales', value: `₹${data?.todaySales || 0}`, icon: IndianRupee, color: 'bg-green-100 text-green-600' },
    { title: 'Active Subscriptions', value: data?.activeSubscriptions || 0, icon: Package, color: 'bg-[#0052cc]/10 text-[#0052cc]' },
    { title: 'Pending Orders', value: data?.pendingOrders || 0, icon: ShoppingBag, color: 'bg-orange-100 text-orange-600' },
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
        <h1 className="text-2xl font-black text-gray-900">Vendor Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your inventory, orders, and deliveries.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-start justify-between">
            <div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">{stat.title}</p>
              <h3 className="text-2xl font-black text-gray-900">{stat.value}</h3>
            </div>
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${stat.color}`}>
              <stat.icon className="h-6 w-6" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Inventory Alerts */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-black text-gray-900">Low Stock Alerts</h2>
          </div>
          
          <div className="space-y-3">
            {data?.lowStockProducts && data.lowStockProducts.length > 0 ? (
              data.lowStockProducts.map((product: any) => (
                <div key={product._id} className="flex items-center justify-between p-3 bg-red-50/50 rounded-xl border border-red-100">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-red-100 text-red-500 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{product.name}</h4>
                      <p className="text-xs text-red-500 font-medium mt-0.5">Only {product.stockQuantity} units left</p>
                    </div>
                  </div>
                  <button className="text-sm font-bold text-[#0052cc] bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm hover:bg-gray-50">
                    Update
                  </button>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No low stock alerts right now.</p>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-black text-gray-900">Recent Orders</h2>
            <button className="text-sm font-bold text-[#0052cc]">View All</button>
          </div>
          
          <div className="space-y-4">
            {data?.recentOrders && data.recentOrders.length > 0 ? (
              data.recentOrders.map((order: any, i: number) => (
                <div key={i} className="flex items-center justify-between border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">Order #{order.id}</h4>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">{order.items} items • ₹{order.total}</p>
                  </div>
                  <span className="bg-orange-50 text-orange-600 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md">
                    {order.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No recent orders.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
