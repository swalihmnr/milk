import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Plus, CheckCircle2, PauseCircle, Clock, Loader2, 
  Search, Filter, CalendarClock, Droplets, User,
  MoreHorizontal, AlertTriangle, PlayCircle, XCircle, Trash2, Edit3
} from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import CreateSubscriptionModal from './CreateSubscriptionModal';
import CreatePrePlanModal from './CreatePrePlanModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function SubscriptionList() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [isPrePlanModalOpen, setIsPrePlanModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'subscriptions' | 'preplans'>('subscriptions');
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {}
  });

  const fetchSubscriptions = async () => {
    try {
      const res = await api.get('/subscriptions');
      setSubscriptions(res.data.data);
    } catch (err) {
      toast.error("Failed to load subscriptions");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data.data);
    } catch (err) {
      toast.error("Failed to load pre-configured plans");
    }
  };

  const handleDeleteProduct = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Catalog Plan?",
      description: "Are you sure you want to delete this pre-configured catalog plan? This action cannot be undone.",
      onConfirm: async () => {
        try {
          await api.delete(`/products/${id}`);
          toast.success("Pre-configured plan deleted successfully");
          fetchProducts();
        } catch (err) {
          toast.error("Failed to delete plan");
        }
      }
    });
  };

  const handleDeleteSubscription = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Subscription?",
      description: "Are you sure you want to delete this customer milk subscription? This action cannot be undone.",
      onConfirm: async () => {
        try {
          await api.delete(`/subscriptions/${id}`);
          toast.success("Subscription deleted successfully");
          fetchSubscriptions();
        } catch (err) {
          toast.error("Failed to delete subscription");
        }
      }
    });
  };

  useEffect(() => {
    fetchSubscriptions();
    fetchProducts();
  }, []);

  const handleToggleStatus = async (sub: any) => {
    const isPaused = sub.status === 'paused';
    const endpoint = `/subscriptions/${sub._id}/${isPaused ? 'resume' : 'pause'}`;
    
    try {
      toast.loading(isPaused ? "Resuming plan..." : "Pausing plan...", { id: 'status' });
      await api.post(endpoint, isPaused ? {} : { 
        pauseStartDate: new Date(),
        pauseEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Default 1 week
      });
      toast.success(isPaused ? "Plan resumed!" : "Plan paused!", { id: 'status' });
      fetchSubscriptions();
    } catch (err) {
      toast.error("Failed to update status", { id: 'status' });
    }
  };

  const filtered = subscriptions.filter(s => {
    if (filter === 'active') return s.status === 'active';
    if (filter === 'paused') return s.status === 'paused';
    return true;
  });

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-gray-400">
      <Loader2 className="h-8 w-8 animate-spin text-[#0052cc]" />
      <p className="font-bold tracking-tight">Syncing milk plans...</p>
    </div>
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[#0052cc] font-bold text-sm bg-blue-50 w-fit px-3 py-1 rounded-full mb-2">
            <CalendarClock className="h-4 w-4" /> Subscription Engine
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Customer Milk Plans</h1>
          <p className="text-gray-500 font-medium">Manage recurring deliveries and billing cycles.</p>
        </div>
        
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <Button 
            onClick={() => {
              setIsPrePlanModalOpen(true);
            }}
            className="h-14 px-6 bg-[#0052cc] hover:bg-[#003d99] text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 transition-all active:scale-95 text-sm"
          >
            <Plus className="mr-2 h-5 w-5" /> Pre-configured Plan
          </Button>
          <Button 
            onClick={() => {
              setIsModalOpen(true);
            }}
            className="h-14 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-xl shadow-emerald-500/20 transition-all active:scale-95 text-sm"
          >
            <Plus className="mr-2 h-5 w-5" /> Custom Plan
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 flex items-center gap-5 shadow-sm">
          <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center text-[#0052cc]">
            <Droplets className="h-7 w-7" />
          </div>
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Active Plans</p>
            <h3 className="text-2xl font-black text-gray-900">{subscriptions.filter(s => s.status === 'active').length}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 flex items-center gap-5 shadow-sm">
          <div className="h-14 w-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500">
            <PauseCircle className="h-7 w-7" />
          </div>
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Paused Plans</p>
            <h3 className="text-2xl font-black text-gray-900">{subscriptions.filter(s => s.status === 'paused').length}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 flex items-center gap-5 shadow-sm">
          <div className="h-14 w-14 rounded-2xl bg-green-50 flex items-center justify-center text-green-600">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Total Active Vol.</p>
            <h3 className="text-2xl font-black text-gray-900">
              {subscriptions.filter(s => s.status === 'active').reduce((sum, s) => sum + s.quantity, 0)} L <span className="text-sm text-gray-400 font-bold">/ day</span>
            </h3>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-gray-100 gap-4 mb-4">
        <button 
          onClick={() => setActiveTab('subscriptions')}
          className={`pb-4 text-sm font-black transition-all border-b-2 ${activeTab === 'subscriptions' ? 'border-[#0052cc] text-[#0052cc]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
          Active Customer Subscriptions
        </button>
        <button 
          onClick={() => setActiveTab('preplans')}
          className={`pb-4 text-sm font-black transition-all border-b-2 ${activeTab === 'preplans' ? 'border-[#0052cc] text-[#0052cc]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
          Pre-configured Catalog
        </button>
      </div>

      {activeTab === 'subscriptions' ? (
        <>
          {/* Filters & Search */}
          <div className="flex items-center gap-4 bg-gray-50/50 p-2 rounded-2xl border border-gray-100 w-fit">
            {['all', 'active', 'paused'].map(t => (
              <button 
                key={t}
                onClick={() => setFilter(t)}
                className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all capitalize ${filter === t ? 'bg-white text-[#0052cc] shadow-md border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Subscription Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.length > 0 ? filtered.map((sub) => (
              <Card key={sub._id} className={`group relative border-none shadow-sm rounded-[2.5rem] overflow-hidden transition-all hover:shadow-xl ${sub.status === 'paused' ? 'bg-amber-50/20' : 'bg-white'}`}>
                <CardHeader className="p-8 pb-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${sub.status === 'active' ? 'bg-[#0052cc] shadow-blue-500/20' : 'bg-amber-400 shadow-amber-500/20'}`}>
                        <User className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-black text-gray-900">{sub.customerId?.name || 'Customer'}</CardTitle>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{sub.planName}</p>
                      </div>
                    </div>
                    <div className={`h-2 w-2 rounded-full ${sub.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-amber-400'}`} />
                  </div>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                  <div className="flex items-baseline gap-2 mb-6">
                    <h3 className="text-4xl font-black text-gray-900">{sub.quantity}L</h3>
                    <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">{sub.frequency}</span>
                  </div>
                  
                  <div className="space-y-3 mb-8">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-bold text-gray-400 uppercase text-[10px] tracking-widest">Billing Cycle</span>
                      <span className="font-black text-gray-900 capitalize">{sub.billingCycle}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-bold text-gray-400 uppercase text-[10px] tracking-widest">Price Point</span>
                      <span className="font-black text-gray-900">₹{sub.price} / L</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-6 border-t border-gray-50">
                    {sub.status === 'active' ? (
                      <Button 
                        onClick={() => handleToggleStatus(sub)}
                        variant="outline" className="flex-1 rounded-xl h-11 border-amber-100 text-amber-600 font-bold hover:bg-amber-50 hover:border-amber-200"
                      >
                        <PauseCircle className="mr-2 h-4 w-4" /> Pause
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => handleToggleStatus(sub)}
                        variant="outline" className="flex-1 rounded-xl h-11 border-green-100 text-green-600 font-bold hover:bg-green-50 hover:border-green-200"
                      >
                        <PlayCircle className="mr-2 h-4 w-4" /> Resume
                      </Button>
                    )}
                    <Button 
                      onClick={() => handleDeleteSubscription(sub._id)}
                      variant="ghost" 
                      className="h-11 w-11 rounded-xl bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                    >
                      <XCircle className="h-5 w-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )) : (
              <div className="col-span-full py-20 flex flex-col items-center justify-center gap-4 text-gray-400 bg-white rounded-[2.5rem] border border-dashed border-gray-200">
                <CalendarClock className="h-16 w-16 opacity-20" />
                <div className="text-center">
                  <p className="text-xl font-black text-gray-900">No active subscriptions found</p>
                  <p className="font-medium">Get started by creating a new plan for your customers.</p>
                </div>
                <Button 
                  onClick={() => {
                    setIsModalOpen(true);
                  }}
                  variant="outline" className="mt-4 rounded-xl font-bold"
                >
                  Setup First Plan
                </Button>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.length > 0 ? products.map((prod) => (
            <Card key={prod._id} className="group relative border-none shadow-sm rounded-[2.5rem] overflow-hidden transition-all hover:shadow-xl bg-white">
              <CardHeader className="p-8 pb-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl flex items-center justify-center bg-blue-50 text-[#0052cc]">
                      <Droplets className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-black text-gray-900">{prod.name}</CardTitle>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{prod.unit || 'Litre'}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <div className="flex items-baseline gap-2 mb-6">
                  <h3 className="text-4xl font-black text-gray-900">₹{prod.price}</h3>
                  <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">per {prod.unit || 'Litre'}</span>
                </div>
                
                <div className="flex items-center gap-3 pt-6 border-t border-gray-150">
                  <Button 
                    onClick={() => {
                      setEditingProduct(prod);
                      setIsPrePlanModalOpen(true);
                    }}
                    variant="outline" 
                    className="flex-1 rounded-xl h-11 border-blue-100 text-[#0052cc] font-bold hover:bg-blue-50 hover:border-blue-200"
                  >
                    <Edit3 className="mr-2 h-4 w-4" /> Edit
                  </Button>
                  <Button 
                    onClick={() => handleDeleteProduct(prod._id)}
                    variant="outline" 
                    className="flex-1 rounded-xl h-11 border-red-100 text-red-600 font-bold hover:bg-red-50 hover:border-red-200"
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          )) : (
            <div className="col-span-full py-20 flex flex-col items-center justify-center gap-4 text-gray-400 bg-white rounded-[2.5rem] border border-dashed border-gray-200">
              <Droplets className="h-16 w-16 opacity-20" />
              <div className="text-center">
                <p className="text-xl font-black text-gray-900">No pre-configured plans found</p>
                <p className="font-medium">Define recurring products in your catalog that farmers can quickly launch.</p>
              </div>
              <Button 
                onClick={() => {
                  setIsPrePlanModalOpen(true);
                }}
                variant="outline" className="mt-4 rounded-xl font-bold"
              >
                Create First Pre-Plan
              </Button>
            </div>
          )}
        </div>
      )}

      <CreateSubscriptionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchSubscriptions}
      />

      <CreatePrePlanModal 
        isOpen={isPrePlanModalOpen}
        onClose={() => {
          setIsPrePlanModalOpen(false);
          setEditingProduct(null);
        }}
        onSuccess={fetchProducts}
        editingProduct={editingProduct}
      />

      {/* Premium Custom Confirmation Modal */}
      <Dialog open={confirmModal.isOpen} onOpenChange={(open) => setConfirmModal(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent className="sm:max-w-[420px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl bg-white">
          <div className="bg-gradient-to-br from-red-50 to-red-100/50 p-6 text-red-700 border-b border-red-100/30">
            <DialogHeader>
              <DialogTitle className="text-xl font-black flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-red-600 animate-bounce" /> {confirmModal.title}
              </DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-8 space-y-6">
            <p className="text-gray-600 font-medium text-sm leading-relaxed">{confirmModal.description}</p>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="flex-1 rounded-xl h-12 border-gray-200 font-bold hover:bg-gray-50 text-gray-500"
              >
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal(prev => ({ ...prev, isOpen: false }));
                }}
                className="flex-1 rounded-xl h-12 bg-red-600 hover:bg-red-700 text-white font-black shadow-lg shadow-red-500/20"
              >
                Confirm Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
