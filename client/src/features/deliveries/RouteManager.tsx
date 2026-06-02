import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Plus, Truck, MapPin, User, Trash2, CheckCircle2, XCircle, Loader2, Users, Pencil } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFetch } from '../../hooks/useApi';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertTriangle } from 'lucide-react';

interface Customer { _id: string; name: string; phone: string; address: string; routeId?: string; }
interface DeliveryBoy { _id: string; name: string; phone: string; vehicleType?: string; }
interface Route { _id: string; name: string; area: string; status: 'active' | 'inactive'; deliveryBoyId?: DeliveryBoy | null; }

// ─── Assign Boy Modal ────────────────────────────────────────────────────────
function AssignModal({ route, deliveryBoys, onClose, onAssigned }: { route: Route; deliveryBoys: DeliveryBoy[]; onClose: () => void; onAssigned: (r: Route) => void; }) {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(route.deliveryBoyId?._id || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.patch(`/routes/${route._id}/assign`, { deliveryBoyId: selected || null });
      toast.success('Delivery boy assigned!');
      onAssigned(res.data.data);
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to assign');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
        <div className="p-6 border-b border-gray-100 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-black text-gray-900">Assign Delivery Boy</h2>
            <p className="text-sm text-gray-500 mt-1">Route: <span className="font-bold text-[#0052cc]">{route.name}</span></p>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200">✕</button>
        </div>
        <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
          <button onClick={() => setSelected('')} className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all ${selected === '' ? 'border-red-300 bg-red-50' : 'border-gray-100 hover:border-gray-200'}`}>
            <div className="h-10 w-10 bg-red-50 rounded-xl flex items-center justify-center"><XCircle className="h-5 w-5 text-red-400" /></div>
            <div><p className="font-bold text-gray-700">No Assignment</p><p className="text-xs text-gray-400">Remove current delivery boy</p></div>
            {selected === '' && <CheckCircle2 className="h-5 w-5 text-red-400 ml-auto" />}
          </button>
          {deliveryBoys.length === 0 && (
            <div className="text-center py-8 text-gray-400 flex flex-col items-center gap-4">
              <Truck className="h-10 w-10 opacity-20" />
              <div>
                <p className="text-sm font-medium">No delivery boys registered yet</p>
                <p className="text-xs text-gray-400 mt-1">You must register delivery boys first.</p>
              </div>
              <Button 
                onClick={() => {
                  onClose();
                  navigate("/dashboard/delivery-boys");
                }}
                className="bg-[#0052cc] hover:bg-[#003d99] text-white font-bold rounded-2xl px-5 h-10 shadow-lg shadow-blue-500/20 text-xs shrink-0 flex items-center gap-2"
              >
                <Plus className="h-3.5 w-3.5" /> Register Delivery Boy
              </Button>
            </div>
          )}
          {deliveryBoys.map(boy => (
            <button key={boy._id} onClick={() => setSelected(boy._id)} className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all ${selected === boy._id ? 'border-[#0052cc] bg-blue-50' : 'border-gray-100 hover:border-gray-200'}`}>
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-black text-sm ${selected === boy._id ? 'bg-[#0052cc] text-white' : 'bg-gray-100 text-gray-600'}`}>{boy.name.charAt(0).toUpperCase()}</div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900">{boy.name}</p>
                <p className="text-xs text-gray-500">{boy.phone}{boy.vehicleType ? ` • ${boy.vehicleType}` : ''}</p>
              </div>
              {selected === boy._id && <CheckCircle2 className="h-5 w-5 text-[#0052cc] shrink-0" />}
            </button>
          ))}
        </div>
        <div className="p-4 border-t border-gray-100 flex gap-3">
          <Button variant="outline" className="flex-1 h-12 rounded-2xl font-bold" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button className="flex-1 h-12 rounded-2xl font-black bg-[#0052cc] hover:bg-[#003d99] text-white" onClick={handleSave} disabled={saving}>
            {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</> : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Create / Edit Route Modal (single-step with customer selection) ─────────
function RouteFormModal({ editRoute, onClose, onSaved }: {
  editRoute?: Route | null;
  onClose: () => void;
  onSaved: (r: Route, isNew: boolean) => void;
}) {
  const isEdit = !!editRoute;
  const { data: customers, loading: loadingCustomers } = useFetch<Customer[]>('/customers');
  const [form, setForm] = useState({ name: editRoute?.name || '', area: editRoute?.area || '' });
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  // Pre-select customers already on this route when editing
  useEffect(() => {
    if (isEdit && customers) {
      const assigned = customers.filter(c => c.routeId === editRoute!._id).map(c => c._id);
      setSelectedCustomers(assigned);
    }
  }, [isEdit, customers, editRoute]);

  const toggleCustomer = (id: string) =>
    setSelectedCustomers(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);

  const filteredCustomers = useMemo(() =>
    (customers || []).filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.address.toLowerCase().includes(search.toLowerCase())
    ), [customers, search]);

  const handleSave = async () => {
    if (!form.name.trim() || !form.area.trim()) { toast.error('Name and Area are required'); return; }
    setSaving(true);
    try {
      let route: Route;
      if (isEdit) {
        const res = await api.put(`/routes/${editRoute!._id}`, form);
        route = res.data.data;
      } else {
        const res = await api.post('/routes', form);
        route = res.data.data;
      }
      // Assign customers
      await api.post('/customers/assign-to-route', { routeId: route._id, customerIds: selectedCustomers });
      toast.success(isEdit ? 'Route updated!' : `Route created with ${selectedCustomers.length} customers!`);
      onSaved(route, !isEdit);
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save route');
    } finally { setSaving(false); }
  };

  const inputCls = 'w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-[#0052cc] focus:ring-4 focus:ring-[#0052cc]/10 transition-all placeholder:text-gray-400';

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="p-6 border-b border-gray-100 shrink-0 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-black text-gray-900">{isEdit ? 'Edit Route' : 'Create New Route'}</h2>
            <p className="text-sm text-gray-500 mt-0.5">Fill details and select customers for this route</p>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200">✕</button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Route details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Route Name *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Route A" className={inputCls} autoFocus />
            </div>
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Area / Zone *</label>
              <input value={form.area} onChange={e => setForm(f => ({ ...f, area: e.target.value }))} placeholder="e.g. Sector 4" className={inputCls} />
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Assign Customers</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Search + count */}
          <div className="flex items-center gap-3">
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers..." className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0052cc] transition-all" />
            <span className="text-xs font-black text-[#0052cc] bg-blue-50 border border-blue-100 px-3 py-2 rounded-xl shrink-0">{selectedCustomers.length} selected</span>
          </div>

          {/* Customer list */}
          {loadingCustomers && (
            <div className="flex items-center justify-center py-8 text-gray-400">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />Loading customers...
            </div>
          )}

          {!loadingCustomers && filteredCustomers.length === 0 && (
            <div className="flex flex-col items-center justify-center text-gray-400 py-8">
              <Users className="h-10 w-10 opacity-20 mb-2" />
              <p className="text-sm font-medium">{customers?.length === 0 ? 'No customers found' : 'No results'}</p>
            </div>
          )}

          <div className="space-y-2">
            {filteredCustomers.map(c => {
              const isSelected = selectedCustomers.includes(c._id);
              return (
                <button key={c._id} onClick={() => toggleCustomer(c._id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl border-2 text-left transition-all ${isSelected ? 'border-[#0052cc] bg-blue-50' : 'border-gray-100 hover:border-gray-200'}`}>
                  <div className={`h-9 w-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${isSelected ? 'bg-[#0052cc] text-white' : 'bg-gray-100 text-gray-600'}`}>
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-gray-900 truncate">{c.name}</p>
                    <p className="text-xs text-gray-500 truncate">{c.address} • {c.phone}</p>
                  </div>
                  {isSelected && <CheckCircle2 className="h-4 w-4 text-[#0052cc] shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex gap-3 shrink-0">
          <Button variant="outline" className="flex-1 h-12 rounded-2xl font-bold" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button className="flex-1 h-12 rounded-2xl font-black bg-[#0052cc] hover:bg-[#003d99] text-white shadow-lg shadow-blue-500/20" onClick={handleSave} disabled={saving}>
            {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />{isEdit ? 'Saving...' : 'Creating...'}</> : isEdit ? 'Save Changes' : `Create Route`}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function RouteManager() {
  const { data: routes, loading, error, setData: setRoutes } = useFetch<Route[]>('/routes');
  const { data: deliveryBoys } = useFetch<DeliveryBoy[]>('/routes/delivery-boys');
  const [assignTarget, setAssignTarget] = useState<Route | null>(null);
  const [formRoute, setFormRoute] = useState<Route | null | undefined>(undefined); // undefined=closed, null=create, Route=edit
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteRouteId, setConfirmDeleteRouteId] = useState<string | null>(null);

  const handleAssigned = useCallback((updated: Route) => {
    setRoutes(prev => prev ? prev.map(r => r._id === updated._id ? updated : r) : prev);
  }, [setRoutes]);

  const handleSaved = useCallback((route: Route, isNew: boolean) => {
    if (isNew) {
      setRoutes(prev => prev ? [route, ...prev] : [route]);
    } else {
      setRoutes(prev => prev ? prev.map(r => r._id === route._id ? route : r) : prev);
    }
  }, [setRoutes]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await api.delete(`/routes/${id}`);
      toast.success('Route deleted');
      setRoutes(prev => prev ? prev.filter(r => r._id !== id) : prev);
    } catch { toast.error('Failed to delete'); }
    finally { setDeletingId(null); }
  };

  const toggleStatus = async (route: Route) => {
    const newStatus = route.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await api.put(`/routes/${route._id}`, { status: newStatus });
      handleAssigned(res.data.data);
      toast.success(`Route marked as ${newStatus}`);
    } catch { toast.error('Failed to update status'); }
  };

  const stats = [
    { label: 'Total Routes', value: routes?.length ?? 0, color: 'text-gray-900', bg: 'bg-gray-50', icon: MapPin },
    { label: 'Active', value: routes?.filter(r => r.status === 'active').length ?? 0, color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle2 },
    { label: 'Delivery Boys', value: deliveryBoys?.length ?? 0, color: 'text-[#0052cc]', bg: 'bg-blue-50', icon: Truck },
  ];

  return (
    <>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-[2rem] border border-gray-100 shadow-sm">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Delivery Routes</h1>
            <p className="text-gray-500 font-medium mt-1 text-sm">Create zones, assign customers and delivery boys</p>
          </div>
          <Button onClick={() => setFormRoute(null)} className="bg-[#0052cc] hover:bg-[#003d99] text-white font-bold px-6 h-11 rounded-2xl shadow-lg shadow-blue-500/20 flex items-center gap-2 w-fit">
            <Plus className="h-4 w-4" /> New Route
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {stats.map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm flex items-center gap-3 sm:gap-4">
              <div className={`h-10 w-10 sm:h-12 sm:w-12 ${s.bg} rounded-2xl flex items-center justify-center shrink-0`}>
                <s.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest">{s.label}</p>
                <p className={`text-xl sm:text-2xl font-black ${s.color}`}>{loading ? '—' : s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Routes List */}
        <Card className="border-gray-100 shadow-sm rounded-[2rem] overflow-hidden">
          <CardHeader className="px-6 sm:px-8 pt-6 sm:pt-8 pb-4 flex flex-row items-center justify-between">
            <CardTitle className="text-lg sm:text-xl font-black text-gray-900">All Routes</CardTitle>
            {routes && routes.length > 0 && (
              <span className="text-xs font-bold text-gray-400 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-xl">{routes.length} total</span>
            )}
          </CardHeader>
          <CardContent className="p-0">
            {loading && <div className="flex items-center justify-center py-20 gap-3 text-gray-400"><Loader2 className="h-5 w-5 animate-spin" /><span className="font-medium">Loading routes...</span></div>}
            {error && <div className="text-center py-16"><p className="font-bold text-red-500 mb-1">Failed to load routes</p><p className="text-sm text-gray-400">{error}</p></div>}

            {!loading && !error && (!routes || routes.length === 0) && (
              <div className="text-center py-20">
                <div className="h-20 w-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5">
                  <MapPin className="h-10 w-10 text-[#0052cc] opacity-40" />
                </div>
                <h3 className="font-black text-gray-900 text-lg mb-2">No Routes Created</h3>
                <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">Create your first delivery route to assign customers and delivery boys.</p>
                <Button onClick={() => setFormRoute(null)} className="bg-[#0052cc] hover:bg-[#003d99] text-white rounded-2xl font-bold px-6">
                  <Plus className="h-4 w-4 mr-2" /> Create First Route
                </Button>
              </div>
            )}

            {!loading && routes && routes.length > 0 && (
              <div className="divide-y divide-gray-50">
                {routes.map(route => (
                  <div key={route._id} className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 px-6 sm:px-8 py-4 sm:py-5 hover:bg-gray-50/60 transition-colors">
                    {/* Route info */}
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-2xl flex items-center justify-center shrink-0 ${route.status === 'active' ? 'bg-blue-50 text-[#0052cc]' : 'bg-gray-100 text-gray-400'}`}>
                        <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-black text-gray-900 text-sm sm:text-base">{route.name}</p>
                          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${route.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {route.status}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500 truncate mt-0.5">{route.area}</p>
                      </div>
                    </div>

                    {/* Assigned boy */}
                    <div className="flex items-center ml-13 sm:ml-16 lg:ml-0">
                      {route.deliveryBoyId ? (
                        <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 px-3 py-2 rounded-xl">
                          <div className="h-7 w-7 sm:h-8 sm:w-8 bg-[#0052cc] rounded-lg flex items-center justify-center text-white text-xs font-black">{route.deliveryBoyId.name.charAt(0)}</div>
                          <div><p className="text-xs font-black text-gray-900 leading-tight">{route.deliveryBoyId.name}</p><p className="text-[10px] text-gray-500">{route.deliveryBoyId.phone}</p></div>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setAssignTarget(route)}
                          className="flex items-center gap-2 bg-gray-50 hover:bg-blue-50 hover:text-[#0052cc] border border-dashed border-gray-200 hover:border-blue-200 px-3 py-2 rounded-xl text-gray-400 transition-all active:scale-95 cursor-pointer"
                        >
                          <User className="h-4 w-4" />
                          <span className="text-xs font-bold">Assign Delivery Boy</span>
                        </button>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-13 sm:ml-16 lg:ml-0 shrink-0 flex-wrap">
                      <Button size="sm" variant="outline" onClick={() => setFormRoute(route)} className="h-9 rounded-xl font-bold text-gray-600 border-gray-200 hover:bg-gray-50 gap-1.5">
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setAssignTarget(route)} className="h-9 rounded-xl font-bold text-[#0052cc] border-blue-200 hover:bg-blue-50 gap-1.5">
                        <Truck className="h-3.5 w-3.5" /> Assign Boy
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => toggleStatus(route)}
                        className={`h-9 rounded-xl font-bold ${route.status === 'active' ? 'text-orange-500 border-orange-200 hover:bg-orange-50' : 'text-green-600 border-green-200 hover:bg-green-50'}`}>
                        {route.status === 'active' ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setConfirmDeleteRouteId(route._id)} disabled={deletingId === route._id}
                        className="h-9 w-9 p-0 rounded-xl text-red-400 border-red-100 hover:bg-red-50">
                        {deletingId === route._id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {assignTarget && <AssignModal route={assignTarget} deliveryBoys={deliveryBoys || []} onClose={() => setAssignTarget(null)} onAssigned={r => { handleAssigned(r); setAssignTarget(null); }} />}
      {formRoute !== undefined && <RouteFormModal editRoute={formRoute} onClose={() => setFormRoute(undefined)} onSaved={handleSaved} />}

      {/* Premium Custom Confirmation Modal */}
      <Dialog open={!!confirmDeleteRouteId} onOpenChange={(open) => !open && setConfirmDeleteRouteId(null)}>
        <DialogContent className="sm:max-w-[420px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl bg-white">
          <div className="bg-gradient-to-br from-red-50 to-red-100/50 p-6 text-red-700 border-b border-red-100/30">
            <DialogHeader>
              <DialogTitle className="text-xl font-black flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-red-600 animate-bounce" /> Delete Route?
              </DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-8 space-y-6">
            <p className="text-gray-600 font-medium text-sm leading-relaxed">
              Are you sure you want to delete this route? Customers assigned to this route will be unassigned.
            </p>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setConfirmDeleteRouteId(null)}
                className="flex-1 rounded-xl h-12 border-gray-200 font-bold hover:bg-gray-50 text-gray-500"
              >
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  if (confirmDeleteRouteId) {
                    handleDelete(confirmDeleteRouteId);
                  }
                  setConfirmDeleteRouteId(null);
                }}
                className="flex-1 rounded-xl h-12 bg-red-600 hover:bg-red-700 text-white font-black shadow-lg shadow-red-500/20"
              >
                Confirm Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
