import React, { useState, useEffect } from 'react';
import { Search, Loader2, RefreshCw, Truck, Calendar, MapPin, ShieldAlert, Sparkles, X, Check } from 'lucide-react';
import { api } from '../../../lib/api';
import { useAuth } from '../../../contexts/AuthContext';

export default function AdminDeliveryManager() {
  const { user, loading: authLoading } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchDeliveries = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const endpoint = isAdmin ? '/admin/deliveries' : '/deliveries';
      const res = await api.get(endpoint);
      setDeliveries(res.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch deliveries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchDeliveries();
    }
  }, [authLoading, user]);

  const filteredDeliveries = deliveries.filter(del => {
    // Search filter
    const term = searchQuery.toLowerCase();
    const customer = del.customerId?.name?.toLowerCase() || '';
    const farmer = del.farmerId?.name?.toLowerCase() || '';
    const boy = del.deliveryBoyId?.name?.toLowerCase() || '';
    const matchesSearch = customer.includes(term) || farmer.includes(term) || boy.includes(term);

    // Status filter
    const matchesStatus = statusFilter === 'all' || del.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Delivery Management</h1>
          <p className="text-gray-500 text-sm mt-1">Track supply chains and manage driver onboarding.</p>
        </div>
        <button
          onClick={fetchDeliveries}
          disabled={loading}
          className="h-10 w-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-900 active:scale-95 transition-all shadow-sm"
        >
          <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats Counter Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Drops Scheduled', value: filteredDeliveries.length, icon: Calendar, color: 'text-slate-900', bg: 'border-slate-200' },
          { label: 'Delivered Successfully', value: filteredDeliveries.filter(d => d.status === 'delivered').length, icon: Truck, color: 'text-emerald-600', bg: 'border-emerald-100 bg-emerald-50/10' },
          { label: 'Missed Drops', value: filteredDeliveries.filter(d => d.status === 'missed').length, icon: ShieldAlert, color: 'text-rose-600', bg: 'border-rose-100 bg-rose-50/10' },
          { label: 'Remaining Pending', value: filteredDeliveries.filter(d => d.status === 'pending').length, icon: Sparkles, color: 'text-blue-600', bg: 'border-blue-100 bg-blue-50/10' },
        ].map((s, idx) => (
          <div key={idx} className={`bg-white border p-5 rounded-2xl shadow-sm flex items-center justify-between ${s.bg}`}>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">{s.label}</span>
              <span className="text-2xl font-black">{s.value}</span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Filter and Search controls */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Customer, Farmer, or Delivery Boy..."
            className="w-full h-12 bg-white border border-gray-250 rounded-2xl pl-12 pr-4 shadow-sm hover:shadow focus:border-[#0052cc] focus:ring-2 focus:ring-[#0052cc]/10 outline-none transition-all font-semibold text-sm placeholder:text-gray-400 text-gray-800"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-12 bg-white border border-gray-250 rounded-2xl px-4 shadow-sm font-semibold text-sm text-gray-700 outline-none focus:border-[#0052cc] min-w-[160px]"
        >
          <option value="all">All Dispatch Statuses</option>
          <option value="pending">Pending</option>
          <option value="delivered">Delivered</option>
          <option value="missed">Missed</option>
        </select>
      </div>

      {/* Deliveries Table */}
      <div className="bg-white border border-gray-150 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#0052cc]" />
          </div>
        ) : error ? (
          <div className="text-center py-10 text-rose-500 font-bold">{error}</div>
        ) : filteredDeliveries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                  <th className="py-4 px-6">Schedule Date</th>
                  <th className="py-4 px-6">Shift</th>
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6">Source Farm</th>
                  <th className="py-4 px-6">Assigned Carrier</th>
                  <th className="py-4 px-6">Qty (Units)</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Notes / Issue</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredDeliveries.map((del) => (
                  <tr key={del._id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/30 transition-colors">
                    <td className="py-5 px-6 font-bold text-gray-950">
                      {new Date(del.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-5 px-6">
                      <span className={`inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${del.shift === 'morning' ? 'bg-orange-50 text-orange-700 border-orange-100' : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                        }`}>
                        {del.shift}
                      </span>
                    </td>
                    <td className="py-5 px-6 font-semibold text-gray-800">
                      {del.customerId?.name || 'N/A'}
                    </td>
                    <td className="py-5 px-6 text-gray-700 font-medium">
                      <div>{del.farmerId?.name || 'N/A'}</div>
                      {del.farmerId?.farmName && <div className="text-[10px] font-semibold text-slate-400">{del.farmerId.farmName}</div>}
                    </td>
                    <td className="py-5 px-6 font-semibold text-slate-800">
                      {del.deliveryBoyId?.name || <span className="text-slate-400 font-medium italic">Unassigned</span>}
                    </td>
                    <td className="py-5 px-6 font-black text-slate-900">
                      {del.quantity} Liters
                    </td>
                    <td className="py-5 px-6">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${del.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                          del.status === 'pending' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                            'bg-rose-50 text-rose-700 border-rose-100'
                        }`}>
                        {del.status}
                      </span>
                    </td>
                    <td className="py-5 px-6 text-slate-500 font-medium max-w-[200px] truncate">
                      {del.status === 'missed' ? (
                        <span className="text-rose-500 font-semibold text-xs flex items-center gap-1">
                          ⚠ {del.missedReason || 'Vacation Mode / Closed'}
                        </span>
                      ) : del.confirmedAt ? (
                        <span className="text-emerald-600 font-semibold text-xs flex items-center gap-1">
                          ✓ Proximity Verified
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs italic">Awaiting dispatch</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 text-gray-500 font-bold">No platform deliveries found.</div>
        )}
      </div>
    </div>
  );
}
