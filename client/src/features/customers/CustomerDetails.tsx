import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, MapPin, Phone, Mail, Calendar, 
  Droplet, CreditCard, Clock, CheckCircle2, 
  AlertCircle, ChevronRight, Edit3, Trash2,
  TrendingUp, Package, History, Loader2, Navigation,
  X, Truck, Plus, AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import FarmMapPicker from '@/components/ui/FarmMapPicker';
import type { MapCoords } from '@/components/ui/FarmMapPicker';
import toast from 'react-hot-toast';
import CreateSubscriptionModal from '../subscriptions/CreateSubscriptionModal';

export default function CustomerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<any>(null);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [route, setRoute] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [openSubModal, setOpenSubModal] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDayDetail, setSelectedDayDetail] = useState<any>(null);

  const fetchData = async () => {
    try {
      const [custRes, subRes, invRes, delRes] = await Promise.all([
        api.get(`/customers/${id}`),
        api.get(`/subscriptions/customer/${id}`),
        api.get(`/invoices?customerId=${id}`),
        api.get(`/deliveries?customerId=${id}`)
      ]);
      
      setCustomer(custRes.data.data);
      setSubscriptions(subRes.data.data);
      setInvoices(invRes.data.data);
      setDeliveries(delRes.data?.data || []);

      if (custRes.data.data.routeId) {
        try {
          const routeRes = await api.get(`/routes`);
          const foundRoute = routeRes.data.data.find((r: any) => r._id === custRes.data.data.routeId);
          setRoute(foundRoute);
        } catch (e) { console.error("Failed to fetch route info", e); }
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load customer data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/customers/${id}`);
      toast.success("Customer removed successfully");
      navigate('/dashboard/customers');
    } catch (err) {
      toast.error("Failed to delete customer");
    } finally {
      setDeleting(false);
    }
  };

  const getDeliveriesForDay = (dayNum: number) => {
    return deliveries.filter(d => {
      const dDate = new Date(d.date);
      return dDate.getFullYear() === currentYear &&
             dDate.getMonth() === currentMonth &&
             dDate.getDate() === dayNum;
    });
  };

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-gray-400">
      <Loader2 className="h-8 w-8 animate-spin text-[#0052cc]" />
      <p className="font-bold">Retrieving customer profile...</p>
    </div>
  );

  if (!customer) return (
    <div className="p-8 text-center space-y-4">
      <div className="h-16 w-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
        <AlertCircle className="h-8 w-8" />
      </div>
      <h2 className="text-xl font-black text-gray-900">Customer not found</h2>
      <Button onClick={() => navigate('/dashboard/customers')} variant="outline" className="rounded-xl">Back to Directory</Button>
    </div>
  );

  const activeSub = subscriptions.find(s => s.status === 'active');
  const totalBalance = invoices.reduce((sum, inv) => sum + (inv.pendingAmount || 0), 0);

  return (
    <div className="max-w-6xl mx-auto pb-12 space-y-8 animate-in fade-in duration-500">
      {/* ── Breadcrumb & Actions ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <button 
          onClick={() => navigate('/dashboard/customers')}
          className="flex items-center gap-2 text-gray-500 hover:text-[#0052cc] font-bold transition-colors group"
        >
          <div className="h-8 w-8 rounded-full bg-white border border-gray-100 flex items-center justify-center group-hover:border-[#0052cc]/20 shadow-sm">
            <ArrowLeft className="h-4 w-4" />
          </div>
          Back to Directory
        </button>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button 
            onClick={() => setIsEditOpen(true)}
            variant="outline" className="flex-1 sm:flex-none rounded-xl border-gray-100 font-bold flex items-center gap-2 hover:bg-gray-50 h-11"
          >
            <Edit3 className="h-4 w-4 text-blue-500" /> Edit Profile
          </Button>
          <Button 
            onClick={() => setIsDeleteConfirmOpen(true)}
            disabled={deleting}
            variant="outline" className="flex-1 sm:flex-none rounded-xl border-gray-100 font-bold flex items-center gap-2 text-red-500 hover:bg-red-50 hover:border-red-100 h-11"
          >
            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Terminate
          </Button>
        </div>
      </div>

      {/* ── Main Profile Header ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-xl bg-white rounded-[2.5rem] overflow-hidden">
          <CardContent className="p-8 sm:p-10">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="h-24 w-24 rounded-[2rem] bg-gradient-to-br from-[#0052cc] to-[#0073e6] flex items-center justify-center text-3xl font-black text-white shadow-lg shadow-blue-500/20 shrink-0">
                {customer.name.split(' ').map((n: any) => n[0]).join('')}
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">{customer.name}</h1>
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest flex items-center ${customer.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      <span className={`h-1.5 w-1.5 rounded-full mr-2 ${customer.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span> {customer.status || 'ACTIVE'}
                    </span>
                  </div>
                  <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">ID: #CUST-{customer._id?.slice(-8)}</p>
                </div>
                
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                    <Phone className="h-4 w-4 text-[#0052cc]" />
                    <span className="font-bold text-gray-700">{customer.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                    <MapPin className="h-4 w-4 text-[#0052cc]" />
                    <span className="font-bold text-gray-700 truncate max-w-[200px]">{customer.area}, {customer.city}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                    <Calendar className="h-4 w-4 text-[#0052cc]" />
                    <span className="font-bold text-gray-700">Added {new Date(customer.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-gradient-to-br from-[#0052cc] to-[#0073e6] text-white rounded-[2.5rem]">
          <CardContent className="p-10 flex flex-col justify-between h-full">
            <div>
              <p className="text-white/60 font-bold text-[10px] uppercase tracking-widest mb-2">Pending Balance</p>
              <h2 className="text-5xl font-black">₹{totalBalance.toLocaleString('en-IN')}</h2>
              <p className="text-blue-100/80 text-xs font-bold mt-2">
                {invoices.length > 0 ? `From ${invoices.length} pending invoices` : 'No outstanding balance'}
              </p>
            </div>
            <Button className="mt-8 bg-white/20 hover:bg-white/30 text-white font-black rounded-2xl h-14 border border-white/20 backdrop-blur-sm">
              Generate Invoice
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* ── Details Grid ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Subscription Info */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-gray-100 shadow-sm bg-white rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-xl font-black flex items-center gap-3">
                <Droplet className="h-5 w-5 text-blue-500" /> Subscription Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              {activeSub ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 rounded-[2rem] p-6 border border-blue-100/50">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3">Plan Name</p>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-blue-600 shadow-sm shrink-0">
                        <Droplet className="h-5 w-5" />
                      </div>
                      <span className="text-lg font-black text-blue-900 truncate">{activeSub.planName}</span>
                    </div>
                  </div>
                  <div className="bg-orange-50 rounded-[2rem] p-6 border border-orange-100/50">
                    <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-3">Quantity</p>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-orange-600 shadow-sm shrink-0">
                        <Package className="h-5 w-5" />
                      </div>
                      <span className="text-lg font-black text-orange-900">{activeSub.quantity} Liters</span>
                    </div>
                  </div>
                  <div className="bg-emerald-50 rounded-[2rem] p-6 border border-emerald-100/50">
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-3">Cycle</p>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
                        <Clock className="h-5 w-5" />
                      </div>
                      <span className="text-lg font-black text-emerald-900 uppercase">{activeSub.billingCycle}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-10 text-center border-2 border-dashed border-gray-100 rounded-[2.5rem] space-y-3">
                  <Droplet className="h-10 w-10 text-gray-200 mx-auto mb-2" />
                  <p className="font-bold text-gray-400">No active subscription found</p>
                  <Button 
                    onClick={() => setOpenSubModal(true)}
                    className="bg-[#0052cc] hover:bg-[#003d99] text-white font-black rounded-xl px-6 py-3 text-xs shadow-md transition-all active:scale-95"
                  >
                    <Plus className="mr-1.5 h-4 w-4" /> Activate a Plan
                  </Button>
                </div>
              )}
              
              <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-gray-50 rounded-[2rem] border border-gray-100 gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center text-gray-400 shadow-sm shrink-0">
                    <Truck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-gray-900">
                      Assigned Route: <span className={route ? 'text-[#0052cc]' : 'text-gray-400'}>{route ? route.name : 'Unassigned'}</span>
                    </p>
                    <p className="text-[10px] font-bold text-gray-400 mt-0.5 uppercase tracking-widest">
                      {route ? `Area: ${route.area}` : 'Assign to a route for daily deliveries'}
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={() => navigate('/dashboard/deliveries')}
                  variant="ghost" className="rounded-xl font-bold text-gray-500 hover:text-[#0052cc]"
                >
                  Manage Routes
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Calendar (Farmer's Customer Portal) */}
          <Card className="border-gray-100 shadow-sm bg-white rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-black flex items-center gap-3">
                <Calendar className="h-5 w-5 text-blue-500" /> Delivery Calendar
              </CardTitle>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (currentMonth === 0) {
                      setCurrentMonth(11);
                      setCurrentYear(y => y - 1);
                    } else {
                      setCurrentMonth(m => m - 1);
                    }
                  }}
                  className="h-8 w-8 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center font-bold text-gray-600 active:scale-95"
                >
                  &larr;
                </button>
                <span className="text-xs font-black text-gray-750 min-w-[85px] text-center">
                  {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][currentMonth]} {currentYear}
                </span>
                <button
                  onClick={() => {
                    if (currentMonth === 11) {
                      setCurrentMonth(0);
                      setCurrentYear(y => y + 1);
                    } else {
                      setCurrentMonth(m => m + 1);
                    }
                  }}
                  className="h-8 w-8 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center font-bold text-gray-600 active:scale-95"
                >
                  &rarr;
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              {/* Calendar Grid Weekdays */}
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} className="py-1">{d}</div>)}
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-2">
                {/* Empty buffer cells */}
                {Array.from({ length: new Date(currentYear, currentMonth, 1).getDay() }).map((_, idx) => (
                  <div key={`empty-${idx}`} className="aspect-square bg-gray-50/10 rounded-xl border border-dashed border-gray-100/50" />
                ))}

                {/* Actual cells */}
                {Array.from({ length: new Date(currentYear, currentMonth + 1, 0).getDate() }).map((_, idx) => {
                  const dayNum = idx + 1;
                  const dayDeliveries = getDeliveriesForDay(dayNum);
                  const isToday = new Date().getDate() === dayNum && new Date().getMonth() === currentMonth && new Date().getFullYear() === currentYear;

                  let cellColor = 'border-gray-100 hover:border-blue-400 hover:shadow-sm cursor-pointer';
                  let badgeColor = '';
                  
                  if (dayDeliveries.length > 0) {
                    const status = dayDeliveries[0].status;
                    if (status === 'delivered') {
                      cellColor = 'border-emerald-100 bg-emerald-50/20 hover:border-emerald-400';
                      badgeColor = 'bg-emerald-500';
                    } else if (status === 'missed') {
                      cellColor = 'border-rose-100 bg-rose-50/20 hover:border-rose-400';
                      badgeColor = 'bg-rose-500';
                    } else {
                      cellColor = 'border-amber-100 bg-amber-50/20 hover:border-amber-400';
                      badgeColor = 'bg-amber-500';
                    }
                  }

                  return (
                    <button
                      key={`day-${dayNum}`}
                      onClick={() => {
                        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                        setSelectedDayDetail({ day: dayNum, dateStr, deliveries: dayDeliveries });
                      }}
                      className={`aspect-square p-2 rounded-xl border text-left flex flex-col justify-between transition-all group ${cellColor} ${isToday ? 'ring-2 ring-blue-500 ring-offset-1' : ''}`}
                    >
                      <span className={`text-[10px] font-black ${isToday ? 'text-blue-600' : 'text-gray-750'}`}>{dayNum}</span>
                      {dayDeliveries.length > 0 && (
                        <div className="flex gap-1 items-center justify-end w-full">
                          <span className={`h-2 w-2 rounded-full ${badgeColor}`} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Delivery Location Map */}
          <Card className="border-gray-100 shadow-sm bg-white rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-xl font-black flex items-center gap-3">
                <MapPin className="h-5 w-5 text-red-500" /> Delivery Location
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <div className="h-80 w-full rounded-[2rem] overflow-hidden border border-gray-100 shadow-inner relative group bg-gray-50">
                <FarmMapPicker 
                  center={customer.lat && customer.lon ? { lat: customer.lat, lon: customer.lon } : undefined} 
                  pin={customer.lat && customer.lon ? { lat: customer.lat, lon: customer.lon } : null}
                  onPinMove={() => {}} // Static display
                />
              </div>
              <div className="mt-4 flex items-center gap-3 text-sm font-bold text-gray-500 ml-2">
                {customer.lat ? (
                  <><CheckCircle2 className="h-4 w-4 text-green-500" /> GPS verified at {customer.lat.toFixed(6)}, {customer.lon.toFixed(6)}</>
                ) : (
                  <><AlertCircle className="h-4 w-4 text-amber-500" /> No GPS location pinned for this customer</>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-8">
          {/* Quick Stats */}
          <Card className="border-gray-100 shadow-sm bg-white rounded-[2.5rem] overflow-hidden">
            <CardContent className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Lifetime Invoices</span>
                  <span className="font-black text-gray-900">{invoices.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Subscription status</span>
                  <span className={`font-black uppercase text-[10px] px-2 py-0.5 rounded-md ${activeSub ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'}`}>
                    {activeSub ? 'Active' : 'None'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Payment Reliability</span>
                  <span className="text-green-600 font-black">Good</span>
                </div>
              </div>
              <div className="pt-6 border-t border-gray-50">
                <Button 
                  onClick={() => navigate('/dashboard/billing')}
                  className="w-full h-12 bg-gray-50 hover:bg-gray-100 text-gray-900 font-bold rounded-xl flex items-center gap-2 transition-all"
                >
                  <CreditCard className="h-4 w-4 text-blue-500" /> View Billing
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Activity Log (Invoices) */}
          <Card className="border-gray-100 shadow-sm bg-white rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-8 pb-2">
              <CardTitle className="text-lg font-black flex items-center gap-2">
                <History className="h-4 w-4 text-gray-400" /> Billing History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              {invoices.length > 0 ? invoices.slice(0, 4).map((inv, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className={`h-10 w-10 rounded-xl ${inv.status === 'paid' ? 'bg-green-50 text-green-500' : 'bg-amber-50 text-amber-500'} flex items-center justify-center flex-shrink-0 group-hover:rotate-6 transition-all`}>
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-900 leading-none">Invoice ₹{inv.totalAmount}</p>
                    <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">{inv.status} • {new Date(inv.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              )) : (
                <p className="text-center text-gray-400 text-sm font-medium py-4">No billing records found</p>
              )}
              <Button 
                onClick={() => navigate('/dashboard/billing')}
                variant="ghost" className="w-full text-xs font-black text-[#0052cc] uppercase tracking-widest hover:bg-blue-50 py-4"
              >
                Full Billing History <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <EditCustomerModal 
        isOpen={isEditOpen} 
        onClose={() => setIsEditOpen(false)} 
        customer={customer} 
        onUpdate={(updated: any) => {
          setCustomer(updated);
          setIsEditOpen(false);
          fetchData(); // Refresh all
        }}
      />

      <CreateSubscriptionModal
        isOpen={openSubModal}
        onClose={() => setOpenSubModal(false)}
        onSuccess={() => {
          setOpenSubModal(false);
          fetchData();
        }}
        prefilledCustomerId={id}
      />

      {/* Premium Custom Confirmation Modal */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[420px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl bg-white">
          <div className="bg-gradient-to-br from-red-50 to-red-100/50 p-6 text-red-700 border-b border-red-100/30">
            <DialogHeader>
              <DialogTitle className="text-xl font-black flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-red-600 animate-bounce" /> Terminate Profile?
              </DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-8 space-y-6">
            <p className="text-gray-600 font-medium text-sm leading-relaxed">
              Are you sure you want to delete this customer? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="flex-1 rounded-xl h-12 border-gray-200 font-bold hover:bg-gray-50 text-gray-500"
              >
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  handleDelete();
                  setIsDeleteConfirmOpen(false);
                }}
                className="flex-1 rounded-xl h-12 bg-red-600 hover:bg-red-700 text-white font-black shadow-lg shadow-red-500/20"
              >
                Terminate Customer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Day Detail & Mark Status Dialog */}
      <Dialog open={!!selectedDayDetail} onOpenChange={(open) => !open && setSelectedDayDetail(null)}>
        <DialogContent className="sm:max-w-[420px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl bg-white">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-6 text-blue-900 border-b border-blue-100/30 relative">
            <DialogHeader>
              <DialogTitle className="text-xl font-black">
                Delivery for {selectedDayDetail?.day} {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][currentMonth]} {currentYear}
              </DialogTitle>
              <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mt-1">Mark Daily Status</p>
            </DialogHeader>
            <button onClick={() => setSelectedDayDetail(null)} className="absolute top-6 right-6 text-blue-900/40 hover:text-blue-900">
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="p-8 space-y-6">
            {selectedDayDetail?.deliveries.length > 0 ? (
              <div className="space-y-4">
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Current Record</p>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-black text-gray-900 text-sm">{activeSub?.planName || 'Milk Plan'}</p>
                      <p className="text-xs text-gray-500 font-medium mt-0.5">Quantity: {selectedDayDetail.deliveries[0].quantity}L • Shift: {selectedDayDetail.deliveries[0].shift}</p>
                    </div>
                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                      selectedDayDetail.deliveries[0].status === 'delivered' ? 'bg-green-100 text-green-700' :
                      selectedDayDetail.deliveries[0].status === 'missed' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {selectedDayDetail.deliveries[0].status}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={async () => {
                      const deliveryId = selectedDayDetail.deliveries[0]._id;
                      try {
                        await api.patch(`/deliveries/${deliveryId}/status`, { status: 'delivered' });
                        toast.success("Marked as Delivered");
                        setSelectedDayDetail(null);
                        fetchData();
                      } catch { toast.error("Failed to update status"); }
                    }}
                    className="flex-1 rounded-xl h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-black"
                  >
                    Mark Delivered
                  </Button>
                  <Button
                    onClick={async () => {
                      const deliveryId = selectedDayDetail.deliveries[0]._id;
                      try {
                        await api.patch(`/deliveries/${deliveryId}/status`, { status: 'missed' });
                        toast.success("Marked as Missed");
                        setSelectedDayDetail(null);
                        fetchData();
                      } catch { toast.error("Failed to update status"); }
                    }}
                    className="flex-1 rounded-xl h-11 bg-rose-600 hover:bg-rose-700 text-white font-black"
                  >
                    Mark Missed
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 border-2 border-dashed border-gray-100 rounded-2xl text-center space-y-1">
                  <AlertCircle className="h-6 w-6 text-gray-300 mx-auto" />
                  <p className="font-bold text-gray-500 text-sm">No delivery record created for this day</p>
                  <p className="text-[10px] text-gray-400 font-medium">Create a record below to keep track of this delivery.</p>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={async () => {
                      if (!customer.routeId) {
                        toast.error("Please assign a route to this customer first");
                        return;
                      }
                      try {
                        await api.post('/deliveries', {
                          customerId: id,
                          routeId: customer.routeId,
                          date: selectedDayDetail.dateStr,
                          shift: 'morning',
                          quantity: activeSub?.quantity || 1,
                          status: 'delivered'
                        });
                        toast.success("Created and marked Delivered");
                        setSelectedDayDetail(null);
                        fetchData();
                      } catch { toast.error("Failed to create record"); }
                    }}
                    className="flex-1 rounded-xl h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-black"
                  >
                    Mark Delivered
                  </Button>
                  <Button
                    onClick={async () => {
                      if (!customer.routeId) {
                        toast.error("Please assign a route to this customer first");
                        return;
                      }
                      try {
                        await api.post('/deliveries', {
                          customerId: id,
                          routeId: customer.routeId,
                          date: selectedDayDetail.dateStr,
                          shift: 'morning',
                          quantity: activeSub?.quantity || 1,
                          status: 'missed'
                        });
                        toast.success("Created and marked Missed");
                        setSelectedDayDetail(null);
                        fetchData();
                      } catch { toast.error("Failed to create record"); }
                    }}
                    className="flex-1 rounded-xl h-11 bg-rose-600 hover:bg-rose-700 text-white font-black"
                  >
                    Mark Missed
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Edit Modal Component ───────────────────────────────────────────────────
function EditCustomerModal({ isOpen, onClose, customer, onUpdate }: any) {
  const [form, setForm] = useState({ 
    name: customer?.name || '', 
    phone: customer?.phone || '', 
    address: customer?.address || '', 
    area: customer?.area || '', 
    city: customer?.city || '', 
    lat: customer?.lat || null, 
    lon: customer?.lon || null 
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (customer) {
      setForm({
        name: customer.name,
        phone: customer.phone,
        address: customer.address || '',
        area: customer.area || '',
        city: customer.city || '',
        lat: customer.lat || null,
        lon: customer.lon || null,
      });
    }
  }, [customer, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put(`/customers/${customer._id}`, form);
      toast.success("Profile updated");
      onUpdate(res.data.data);
    } catch (err) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleMapChange = (coords: MapCoords) => {
    setForm(prev => ({ ...prev, lat: coords.lat, lon: coords.lon }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-gradient-to-br from-[#0052cc] to-[#0073e6] p-8 text-white relative">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">Edit Customer</DialogTitle>
            <p className="text-blue-100 text-sm mt-1">Update personal and location details.</p>
          </DialogHeader>
          <button onClick={onClose} className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-5 bg-white max-h-[75vh] overflow-y-auto">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</Label>
              <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="h-12 bg-gray-50 border-gray-100 rounded-xl" required />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Phone</Label>
              <Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="h-12 bg-gray-50 border-gray-100 rounded-xl" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Area</Label>
                <Input value={form.area} onChange={e => setForm({...form, area: e.target.value})} className="h-12 bg-gray-50 border-gray-100 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">City</Label>
                <Input value={form.city} onChange={e => setForm({...form, city: e.target.value})} className="h-12 bg-gray-50 border-gray-100 rounded-xl" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Pin Precise Location</Label>
              <div className="h-48 rounded-2xl overflow-hidden border border-gray-100 bg-gray-50">
                <FarmMapPicker 
                  center={form.lat && form.lon ? { lat: form.lat, lon: form.lon } : undefined}
                  pin={form.lat && form.lon ? { lat: form.lat, lon: form.lon } : null}
                  onChange={handleMapChange}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button type="submit" disabled={saving} className="w-full h-12 bg-[#0052cc] hover:bg-blue-800 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />} 
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
