import React, { useState, useCallback } from 'react';
import { Plus, Truck, Phone, Star, Package, ToggleLeft, ToggleRight, Trash2, Loader2, UserCheck, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFetch } from '../../hooks/useApi';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertTriangle } from 'lucide-react';

interface DeliveryBoy {
  _id: string;
  userId: string;
  name: string;
  phone: string;
  vehicleType: string;
  licenseNumber?: string;
  isActive: boolean;
  totalDeliveries: number;
  rating: number;
  createdAt: string;
}

const VEHICLE_TYPES = ['Bicycle', 'Motorcycle', 'Scooter', 'Auto', 'Car', 'Van'];

// ─── Register Modal ──────────────────────────────────────────────────────────
function RegisterModal({ onClose, onRegistered }: { onClose: () => void; onRegistered: (boy: DeliveryBoy) => void }) {
  const [form, setForm] = useState({ name: '', phone: '', password: '', vehicleType: 'Motorcycle', licenseNumber: '' });
  const [showPass, setShowPass] = useState(false);
  const [saving, setSaving] = useState(false);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.phone.trim() || !form.password.trim()) {
      toast.error('Name, phone and password are required');
      return;
    }
    if (form.phone.length < 10) { toast.error('Enter a valid phone number'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }

    setSaving(true);
    try {
      const res = await api.post('/delivery-boys', form);
      toast.success(`${form.name} registered as delivery boy!`);
      onRegistered(res.data.data);
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setSaving(false); }
  };

  const inputCls = 'w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-[#0052cc] focus:ring-4 focus:ring-[#0052cc]/10 transition-all placeholder:text-gray-400';
  const labelCls = 'block text-xs font-black text-gray-500 uppercase tracking-widest mb-2';

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200">

        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-black text-gray-900">Register Delivery Boy</h2>
            <p className="text-sm text-gray-500 mt-1">Creates an account they can log in with</p>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 hover:text-gray-600">✕</button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4 overflow-y-auto max-h-[65vh]">
          <div>
            <label className={labelCls}>Full Name *</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Ramesh Kumar" className={inputCls} autoFocus />
          </div>
          <div>
            <label className={labelCls}>Phone Number *</label>
            <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="10-digit mobile number" className={inputCls} type="tel" maxLength={15} />
          </div>
          <div>
            <label className={labelCls}>Login Password *</label>
            <div className="relative">
              <input
                value={form.password}
                onChange={e => set('password', e.target.value)}
                placeholder="Min 6 characters"
                type={showPass ? 'text' : 'password'}
                className={inputCls + ' pr-12'}
              />
              <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1.5">They'll use this to log in to the delivery app</p>
          </div>
          <div>
            <label className={labelCls}>Vehicle Type *</label>
            <select value={form.vehicleType} onChange={e => set('vehicleType', e.target.value)}
              className={inputCls + ' cursor-pointer'}>
              {VEHICLE_TYPES.map(v => <option key={v}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>License Number <span className="text-gray-300 font-medium normal-case">(optional)</span></label>
            <input value={form.licenseNumber} onChange={e => set('licenseNumber', e.target.value)} placeholder="DL-XXXXXXXXXX" className={inputCls} />
          </div>

          {/* Info box */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3">
            <UserCheck className="h-5 w-5 text-[#0052cc] shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-bold mb-0.5">What happens after registration?</p>
              <ul className="text-xs space-y-0.5 text-blue-600 list-disc list-inside">
                <li>A login account is created for them</li>
                <li>They can log in at <span className="font-bold">/login</span></li>
                <li>You can assign them to routes immediately</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex gap-3">
          <Button variant="outline" className="flex-1 h-12 rounded-2xl font-bold" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button className="flex-1 h-12 rounded-2xl font-black bg-[#0052cc] hover:bg-[#003d99] text-white shadow-lg shadow-blue-500/20" onClick={handleSubmit} disabled={saving}>
            {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Registering...</> : 'Register'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function DeliveryBoysManager() {
  const { data: boys, loading, error, setData: setBoys } = useFetch<DeliveryBoy[]>('/delivery-boys');
  const [showRegister, setShowRegister] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteBoy, setConfirmDeleteBoy] = useState<DeliveryBoy | null>(null);

  const handleRegistered = useCallback((boy: DeliveryBoy) => {
    setBoys(prev => prev ? [boy, ...prev] : [boy]);
  }, [setBoys]);

  const handleToggle = async (boy: DeliveryBoy) => {
    setTogglingId(boy._id);
    try {
      await api.patch(`/delivery-boys/${boy._id}/toggle`);
      setBoys(prev => prev ? prev.map(b => b._id === boy._id ? { ...b, isActive: !b.isActive } : b) : prev);
      toast.success(boy.isActive ? `${boy.name} deactivated` : `${boy.name} activated`);
    } catch { toast.error('Failed to update status'); }
    finally { setTogglingId(null); }
  };

  const handleDelete = async (boy: DeliveryBoy) => {
    setDeletingId(boy._id);
    try {
      await api.delete(`/delivery-boys/${boy._id}`);
      setBoys(prev => prev ? prev.filter(b => b._id !== boy._id) : prev);
      toast.success(`${boy.name} removed`);
    } catch { toast.error('Failed to remove delivery boy'); }
    finally { setDeletingId(null); }
  };

  const active = boys?.filter(b => b.isActive).length ?? 0;
  const inactive = (boys?.length ?? 0) - active;

  return (
    <>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-[2rem] border border-gray-100 shadow-sm">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Delivery Boys</h1>
            <p className="text-gray-500 font-medium mt-1 text-sm">Register and manage your delivery personnel</p>
          </div>
          <Button onClick={() => setShowRegister(true)} className="bg-[#0052cc] hover:bg-[#003d99] text-white font-bold px-6 h-11 rounded-2xl shadow-lg shadow-blue-500/20 flex items-center gap-2 w-fit">
            <Plus className="h-4 w-4" /> Register Delivery Boy
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total', value: boys?.length ?? 0, color: 'text-gray-900', bg: 'bg-gray-50', icon: Truck },
            { label: 'Active', value: active, color: 'text-green-600', bg: 'bg-green-50', icon: UserCheck },
            { label: 'Inactive', value: inactive, color: 'text-gray-400', bg: 'bg-gray-100', icon: ToggleLeft },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-3">
              <div className={`h-11 w-11 ${s.bg} rounded-2xl flex items-center justify-center shrink-0`}>
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{s.label}</p>
                <p className={`text-2xl font-black ${s.color}`}>{loading ? '—' : s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* List */}
        <Card className="border-gray-100 shadow-sm rounded-[2rem] overflow-hidden">
          <CardHeader className="px-8 pt-8 pb-4 flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-black text-gray-900">Registered Boys</CardTitle>
            {boys && boys.length > 0 && (
              <span className="text-xs font-bold text-gray-400 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-xl">{boys.length} total</span>
            )}
          </CardHeader>
          <CardContent className="p-0">
            {loading && (
              <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="font-medium">Loading...</span>
              </div>
            )}

            {error && (
              <div className="text-center py-16">
                <p className="font-bold text-red-500">Failed to load delivery boys</p>
                <p className="text-sm text-gray-400 mt-1">{error}</p>
              </div>
            )}

            {!loading && !error && (!boys || boys.length === 0) && (
              <div className="text-center py-20">
                <div className="h-20 w-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5">
                  <Truck className="h-10 w-10 text-[#0052cc] opacity-40" />
                </div>
                <h3 className="font-black text-gray-900 text-lg mb-2">No Delivery Boys Yet</h3>
                <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">
                  Register your first delivery boy. They'll get a login account and can be assigned to routes.
                </p>
                <Button onClick={() => setShowRegister(true)} className="bg-[#0052cc] hover:bg-[#003d99] text-white rounded-2xl font-bold px-6">
                  <Plus className="h-4 w-4 mr-2" /> Register First Boy
                </Button>
              </div>
            )}

            {!loading && boys && boys.length > 0 && (
              <div className="divide-y divide-gray-50">
                {boys.map(boy => (
                  <div key={boy._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 sm:px-8 py-5 hover:bg-gray-50/50 transition-colors">
                    {/* Avatar + info */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-white font-black text-lg shrink-0 shadow-sm ${boy.isActive ? 'bg-gradient-to-br from-[#0052cc] to-[#0073e6]' : 'bg-gray-200'}`}>
                        {boy.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-black text-gray-900">{boy.name}</p>
                          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${boy.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {boy.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <span className="text-sm text-gray-500 flex items-center gap-1"><Phone className="h-3 w-3" />{boy.phone}</span>
                          <span className="text-sm text-gray-500 flex items-center gap-1"><Truck className="h-3 w-3" />{boy.vehicleType}</span>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 ml-16 sm:ml-0">
                      <div className="text-center">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Deliveries</p>
                        <p className="text-lg font-black text-gray-900">{boy.totalDeliveries}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Rating</p>
                        {boy.totalDeliveries === 0 ? (
                          <span className="text-xs font-black text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">New</span>
                        ) : (
                          <p className={`text-lg font-black flex items-center gap-1 ${
                            (boy.rating ?? 0) >= 4 ? 'text-green-500' : (boy.rating ?? 0) >= 3 ? 'text-yellow-500' : 'text-red-500'
                          }`}>
                            <Star className="h-4 w-4 fill-current" />{(boy.rating ?? 0).toFixed(1)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-16 sm:ml-0 shrink-0">
                      <button
                        onClick={() => handleToggle(boy)}
                        disabled={togglingId === boy._id}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                          boy.isActive
                            ? 'text-orange-500 border-orange-200 hover:bg-orange-50'
                            : 'text-green-600 border-green-200 hover:bg-green-50'
                        }`}
                      >
                        {togglingId === boy._id
                          ? <Loader2 className="h-4 w-4 animate-spin" />
                          : boy.isActive
                            ? <><ToggleRight className="h-4 w-4" /> Deactivate</>
                            : <><ToggleLeft className="h-4 w-4" /> Activate</>
                        }
                      </button>
                       <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setConfirmDeleteBoy(boy)}
                        disabled={deletingId === boy._id}
                        className="h-9 w-9 p-0 rounded-xl text-red-400 border-red-100 hover:bg-red-50"
                      >
                        {deletingId === boy._id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {showRegister && (
        <RegisterModal onClose={() => setShowRegister(false)} onRegistered={handleRegistered} />
      )}

      {/* Premium Custom Confirmation Modal */}
      <Dialog open={!!confirmDeleteBoy} onOpenChange={(open) => !open && setConfirmDeleteBoy(null)}>
        <DialogContent className="sm:max-w-[420px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl bg-white">
          <div className="bg-gradient-to-br from-red-50 to-red-100/50 p-6 text-red-700 border-b border-red-100/30">
            <DialogHeader>
              <DialogTitle className="text-xl font-black flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-red-600 animate-bounce" /> Remove Delivery Boy?
              </DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-8 space-y-6">
            <p className="text-gray-600 font-medium text-sm leading-relaxed">
              Are you sure you want to remove <span className="font-bold text-gray-900">{confirmDeleteBoy?.name}</span>? This will delete their account permanently.
            </p>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setConfirmDeleteBoy(null)}
                className="flex-1 rounded-xl h-12 border-gray-200 font-bold hover:bg-gray-50 text-gray-500"
              >
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  if (confirmDeleteBoy) {
                    handleDelete(confirmDeleteBoy);
                  }
                  setConfirmDeleteBoy(null);
                }}
                className="flex-1 rounded-xl h-12 bg-red-600 hover:bg-red-700 text-white font-black shadow-lg shadow-red-500/20"
              >
                Remove Boy
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
