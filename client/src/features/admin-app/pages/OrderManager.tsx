import React, { useState, useEffect } from 'react';
import { Search, Loader2, RefreshCw, FileText, Landmark, CreditCard, DollarSign } from 'lucide-react';
import { api } from '../../../lib/api';
import { useAuth } from '../../../contexts/AuthContext';

export default function OrderManager() {
  const { user, loading: authLoading } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchInvoices = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const endpoint = isAdmin ? '/admin/invoices' : '/invoices';
      const res = await api.get(endpoint);
      setInvoices(res.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchInvoices();
    }
  }, [authLoading, user]);

  const filteredInvoices = invoices.filter(inv => {
    // Search filter
    const term = searchQuery.toLowerCase();
    const invNumber = inv.invoiceNumber?.toLowerCase() || '';
    const customer = inv.customerId?.name?.toLowerCase() || '';
    const farmer = inv.farmerId?.name?.toLowerCase() || '';
    const matchesSearch = invNumber.includes(term) || customer.includes(term) || farmer.includes(term);

    // Status filter
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate totals
  const totalAmount = filteredInvoices.reduce((acc, inv) => acc + (inv.totalAmount || 0), 0);
  const totalPaid = filteredInvoices.reduce((acc, inv) => acc + (inv.paidAmount || 0), 0);
  const totalPending = filteredInvoices.reduce((acc, inv) => acc + (inv.pendingAmount || 0), 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Invoice Logs</h1>
          <p className="text-gray-500 text-sm mt-1">Monitor payments, due dates, and transactions across DairyOS.</p>
        </div>
        <button 
          onClick={fetchInvoices} 
          disabled={loading}
          className="h-10 w-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-900 active:scale-95 transition-all shadow-sm"
        >
          <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats Counter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Invoiced', value: `₹${totalAmount.toLocaleString('en-IN')}`, icon: DollarSign, color: 'text-slate-900', bg: 'border-slate-200' },
          { label: 'Collected', value: `₹${totalPaid.toLocaleString('en-IN')}`, icon: CreditCard, color: 'text-emerald-600', bg: 'border-emerald-100 bg-emerald-50/10' },
          { label: 'Outstanding Balance', value: `₹${totalPending.toLocaleString('en-IN')}`, icon: Landmark, color: 'text-rose-600', bg: 'border-rose-100 bg-rose-50/10' },
        ].map((s, idx) => (
          <div key={idx} className={`bg-white border p-5 rounded-2xl shadow-sm flex items-center justify-between ${s.bg}`}>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">{s.label}</span>
              <span className={`text-2xl font-black ${s.color}`}>{s.value}</span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
              <s.icon className="h-5 w-5 text-slate-400" />
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
            placeholder="Search by Invoice Number, Customer, or Vendor..." 
            className="w-full h-12 bg-white border border-gray-250 rounded-2xl pl-12 pr-4 shadow-sm hover:shadow focus:border-[#0052cc] focus:ring-2 focus:ring-[#0052cc]/10 outline-none transition-all font-semibold text-sm placeholder:text-gray-400 text-gray-800"
          />
        </div>
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-12 bg-white border border-gray-250 rounded-2xl px-4 shadow-sm font-semibold text-sm text-gray-700 outline-none focus:border-[#0052cc] min-w-[160px]"
        >
          <option value="all">All Statuses</option>
          <option value="paid">Paid</option>
          <option value="partial">Partial</option>
          <option value="unpaid">Unpaid</option>
        </select>
      </div>

      {/* Invoices Table */}
      <div className="bg-white border border-gray-150 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#0052cc]" />
          </div>
        ) : error ? (
          <div className="text-center py-10 text-rose-500 font-bold">{error}</div>
        ) : filteredInvoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                  <th className="py-4 px-6">Invoice No</th>
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6">Farmer/Vendor</th>
                  <th className="py-4 px-6">Billing Month</th>
                  <th className="py-4 px-6">Total Amount</th>
                  <th className="py-4 px-6">Paid</th>
                  <th className="py-4 px-6">Pending</th>
                  <th className="py-4 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredInvoices.map((inv) => (
                  <tr key={inv._id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/30 transition-colors">
                    <td className="py-5 px-6 font-bold text-gray-950 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-slate-400" />
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-5 px-6 font-semibold text-gray-800">
                      <div>{inv.customerId?.name || 'N/A'}</div>
                      {inv.customerId?.phone && <div className="text-[10px] font-medium text-slate-400 mt-0.5">{inv.customerId.phone}</div>}
                    </td>
                    <td className="py-5 px-6 text-gray-700 font-medium">
                      <div>{inv.farmerId?.name || 'N/A'}</div>
                      {inv.farmerId?.farmName && <div className="text-[10px] font-medium text-blue-500 mt-0.5">{inv.farmerId.farmName}</div>}
                    </td>
                    <td className="py-5 px-6 font-bold text-slate-500">
                      {inv.billingMonth}
                    </td>
                    <td className="py-5 px-6 font-black text-slate-900">
                      ₹{inv.totalAmount}
                    </td>
                    <td className="py-5 px-6 font-semibold text-emerald-600">
                      ₹{inv.paidAmount}
                    </td>
                    <td className="py-5 px-6 font-semibold text-rose-500">
                      ₹{inv.pendingAmount}
                    </td>
                    <td className="py-5 px-6">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${
                        inv.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        inv.status === 'partial' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                        'bg-rose-50 text-rose-700 border-rose-100'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 text-gray-500 font-bold">No platform invoices found.</div>
        )}
      </div>
    </div>
  );
}
