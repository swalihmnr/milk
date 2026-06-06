import React, { useState, useEffect } from 'react';
import { Search, MapPin, CheckCircle2, AlertTriangle, XCircle, Navigation, Loader2, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../../lib/api';

export default function DeliveryList() {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'delivered' | 'missed'>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [showMissedModal, setShowMissedModal] = useState<string | null>(null);
  const [missedReason, setMissedReason] = useState('');

  const fetchDeliveries = async () => {
    setLoading(true);
    setError(null);
    try {
      // API call to fetch deliveries (scoped by role via backend)
      const res = await api.get('/deliveries');
      setDeliveries(res.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch deliveries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const handleMarkMissed = async (id: string) => {
    if (!missedReason.trim()) {
      alert('Please provide a reason for the missed delivery');
      return;
    }
    setUpdatingId(id);
    try {
      await api.patch(`/deliveries/${id}/status`, {
        status: 'missed',
        missedReason: missedReason.trim()
      });
      setShowMissedModal(null);
      setMissedReason('');
      fetchDeliveries();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to update delivery status');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredDeliveries = deliveries.filter(del => {
    // Search filter
    const term = searchQuery.toLowerCase();
    const name = del.customerId?.name?.toLowerCase() || '';
    const address = del.customerId?.address?.toLowerCase() || '';
    const matchesSearch = name.includes(term) || address.includes(term);

    // Status filter
    const matchesStatus = statusFilter === 'all' || del.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-slate-900 min-h-screen text-white flex flex-col pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-slate-800 border-b border-slate-700 px-5 py-4 flex items-center justify-between shadow-md">
        <div>
          <h1 className="font-black text-xl tracking-tight">Today's Runs</h1>
          <p className="text-slate-400 text-xs mt-0.5">Checklist for delivery schedule</p>
        </div>
        <button 
          onClick={fetchDeliveries} 
          disabled={loading}
          className="h-10 w-10 bg-slate-700 rounded-xl flex items-center justify-center text-slate-300 hover:text-white active:scale-95 transition-all"
        >
          <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="p-5 flex-1 flex flex-col gap-4">
        {/* Search and Filters */}
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customers or addresses..." 
              className="w-full h-12 bg-slate-800 border border-slate-700 rounded-2xl pl-12 pr-4 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all text-sm font-semibold placeholder:text-slate-500"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {(['all', 'pending', 'delivered', 'missed'] as const).map(f => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                  statusFilter === f 
                    ? 'bg-amber-500 text-slate-900 shadow-md shadow-amber-500/20' 
                    : 'bg-slate-800 text-slate-400 border border-slate-700/60'
                }`}
              >
                {f} ({deliveries.filter(d => f === 'all' || d.status === f).length})
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 text-center text-red-400 font-bold text-sm">
            {error}
          </div>
        ) : filteredDeliveries.length > 0 ? (
          <div className="space-y-4">
            {filteredDeliveries.map((delivery, idx) => (
              <div 
                key={delivery._id} 
                className="bg-slate-800 border border-slate-700/60 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="min-w-0">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex flex-wrap items-center gap-2 mb-1">
                      <span>Stop #{idx + 1} • {delivery.shift} shift</span>
                      {delivery.deliveryBoyId && (
                        <span className="bg-slate-700/50 px-1.5 py-0.5 rounded text-amber-500 border border-amber-500/20">
                          Carrier: {delivery.deliveryBoyId.name}
                        </span>
                      )}
                      {!delivery.deliveryBoyId && (
                        <span className="bg-slate-700/50 px-1.5 py-0.5 rounded text-slate-400 border border-slate-600">
                          Unassigned
                        </span>
                      )}
                    </span>
                    <h3 className="font-extrabold text-lg text-white truncate">
                      {delivery.customerId?.name || 'Customer'}
                    </h3>
                    <p className="text-slate-400 text-xs leading-relaxed mt-1 flex items-start gap-1">
                      <MapPin className="h-4 w-4 shrink-0 text-slate-500 mt-0.5" />
                      {delivery.customerId?.address || 'No address provided'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="block font-black text-amber-500 text-xl">{delivery.quantity} L</span>
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">A2 Milk</span>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center justify-between">
                  <div>
                    {delivery.status === 'pending' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2.5 py-1 rounded-lg">
                        <AlertTriangle className="h-3.5 w-3.5" /> Pending
                      </span>
                    )}
                    {delivery.status === 'delivered' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-1 rounded-lg">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Delivered
                      </span>
                    )}
                    {delivery.status === 'missed' && (
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-rose-400 bg-rose-400/10 border border-rose-400/20 px-2.5 py-1 rounded-lg self-start">
                          <XCircle className="h-3.5 w-3.5" /> Missed
                        </span>
                        {delivery.missedReason && (
                          <span className="text-[10px] text-slate-500 italic mt-0.5">Reason: "{delivery.missedReason}"</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {delivery.status === 'pending' && (
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setShowMissedModal(delivery._id)}
                        className="h-10 px-3 border border-slate-600 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all text-xs font-bold active:scale-95"
                      >
                        Skip
                      </button>
                      <Link 
                        to={`/delivery-app/confirm/${delivery._id}`}
                        className="h-10 px-4 bg-amber-500 hover:bg-amber-400 text-slate-900 text-xs font-black rounded-xl flex items-center justify-center gap-1 active:scale-95 transition-all shadow-md shadow-amber-500/10"
                      >
                        Confirm <Navigation className="h-3.5 w-3.5 fill-slate-900" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-800/40 rounded-3xl border border-slate-800/80 p-5 flex flex-col items-center">
            <CheckCircle2 className="h-12 w-12 text-slate-600 mb-3" />
            <p className="text-slate-400 font-bold text-sm">No runs matching the filters</p>
          </div>
        )}
      </div>

      {/* Missed Delivery Modal */}
      {showMissedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-800 border border-slate-700 w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in scale-in duration-200">
            <h3 className="text-lg font-black text-white mb-2">Mark as Missed</h3>
            <p className="text-slate-400 text-xs mb-4">Please provide a reason why this delivery is skipped/missed (e.g. door locked, vacation, customer refused).</p>
            
            <textarea
              value={missedReason}
              onChange={(e) => setMissedReason(e.target.value)}
              placeholder="Enter reason..."
              className="w-full h-24 bg-slate-900 border border-slate-700 rounded-xl p-3 outline-none focus:border-rose-500 text-sm font-semibold placeholder:text-slate-600 text-white mb-4 resize-none"
            />

            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => {
                  setShowMissedModal(null);
                  setMissedReason('');
                }}
                className="h-11 px-4 border border-slate-600 rounded-xl font-bold text-xs text-slate-300 active:scale-95 transition-transform"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleMarkMissed(showMissedModal)}
                disabled={updatingId !== null}
                className="h-11 px-5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-black text-xs active:scale-95 transition-all flex items-center gap-1 shadow-md shadow-rose-500/20"
              >
                {updatingId ? 'Saving...' : 'Confirm Missed'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
