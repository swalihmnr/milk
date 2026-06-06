import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Search, Loader2, RefreshCw } from 'lucide-react';
import { api } from '../../../lib/api';

export default function VendorManager() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchVendors = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/vendors');
      setVendors(res.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch vendors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleStatusUpdate = async (id: string, newStatus: 'approved' | 'suspended') => {
    setUpdatingId(id);
    try {
      await api.patch(`/admin/vendors/${id}/status`, { approvalStatus: newStatus });
      fetchVendors();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to update vendor status');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredVendors = vendors.filter(v => {
    const term = searchQuery.toLowerCase();
    const company = v.companyName?.toLowerCase() || '';
    const gst = v.gstNumber?.toLowerCase() || '';
    const farmer = v.userId?.name?.toLowerCase() || '';
    return company.includes(term) || gst.includes(term) || farmer.includes(term);
  });

  const stats = {
    total: vendors.length,
    approved: vendors.filter(v => v.approvalStatus === 'approved').length,
    pending: vendors.filter(v => v.approvalStatus === 'pending').length,
    suspended: vendors.filter(v => v.approvalStatus === 'suspended').length,
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Dairy Vendors</h1>
          <p className="text-gray-500 text-sm mt-1">Manage and approve dairy farmer registration profiles.</p>
        </div>
        <button 
          onClick={fetchVendors} 
          disabled={loading}
          className="h-10 w-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-900 active:scale-95 transition-all shadow-sm"
        >
          <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats Counter Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Vendors', value: stats.total, color: 'text-slate-900' },
          { label: 'Approved', value: stats.approved, color: 'text-emerald-600' },
          { label: 'Pending', value: stats.pending, color: 'text-amber-500' },
          { label: 'Suspended', value: stats.suspended, color: 'text-rose-600' },
        ].map((s, idx) => (
          <div key={idx} className="bg-white border border-gray-150 p-5 rounded-2xl shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">{s.label}</span>
            <span className={`text-2xl font-black ${s.color}`}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Filter and Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search vendors by name, company, or GST number..." 
          className="w-full h-12 bg-white border border-gray-250 rounded-2xl pl-12 pr-4 shadow-sm hover:shadow focus:border-[#0052cc] focus:ring-2 focus:ring-[#0052cc]/10 outline-none transition-all font-semibold text-sm placeholder:text-gray-400 text-gray-800"
        />
      </div>

      {/* Vendors Table */}
      <div className="bg-white border border-gray-150 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#0052cc]" />
          </div>
        ) : error ? (
          <div className="text-center py-10 text-rose-500 font-bold">{error}</div>
        ) : filteredVendors.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                  <th className="py-4 px-6">Company Name</th>
                  <th className="py-4 px-6">Farmer/User</th>
                  <th className="py-4 px-6">GST</th>
                  <th className="py-4 px-6">Commission</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredVendors.map((vendor) => (
                  <tr key={vendor._id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/30 transition-colors">
                    <td className="py-5 px-6 font-bold text-gray-900">
                      {vendor.companyName}
                    </td>
                    <td className="py-5 px-6">
                      <div className="font-semibold text-gray-800">{vendor.userId?.name || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{vendor.userId?.phone || 'N/A'}</div>
                    </td>
                    <td className="py-5 px-6 font-mono text-xs text-gray-600">
                      {vendor.gstNumber || 'N/A'}
                    </td>
                    <td className="py-5 px-6 font-bold text-gray-700">
                      {vendor.commissionRate}%
                    </td>
                    <td className="py-5 px-6">
                      {vendor.approvalStatus === 'approved' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Approved
                        </span>
                      )}
                      {vendor.approvalStatus === 'pending' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-amber-700 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-lg">
                          <AlertTriangle className="h-3.5 w-3.5" /> Pending
                        </span>
                      )}
                      {vendor.approvalStatus === 'suspended' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-rose-700 bg-rose-50 border border-rose-100 px-2.5 py-1 rounded-lg">
                          <XCircle className="h-3.5 w-3.5" /> Suspended
                        </span>
                      )}
                    </td>
                    <td className="py-5 px-6 text-right">
                      {updatingId === vendor._id ? (
                        <Loader2 className="h-5 w-5 animate-spin text-gray-400 ml-auto" />
                      ) : (
                        <div className="flex justify-end gap-2">
                          {vendor.approvalStatus !== 'approved' && (
                            <button
                              onClick={() => handleStatusUpdate(vendor._id, 'approved')}
                              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-extrabold text-xs rounded-lg active:scale-95 transition-all"
                            >
                              Approve
                            </button>
                          )}
                          {vendor.approvalStatus !== 'suspended' && (
                            <button
                              onClick={() => handleStatusUpdate(vendor._id, 'suspended')}
                              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-xs rounded-lg active:scale-95 transition-all"
                            >
                              Suspend
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 text-gray-500 font-bold">No vendors found.</div>
        )}
      </div>
    </div>
  );
}
