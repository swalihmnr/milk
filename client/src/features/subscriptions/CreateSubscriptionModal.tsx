import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { Loader2, Plus, Calendar, Package, IndianRupee, User } from 'lucide-react';

interface CreateSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateSubscriptionModal({ isOpen, onClose, onSuccess }: CreateSubscriptionModalProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isCustom, setIsCustom] = useState(false);
  
  const [form, setForm] = useState({
    customerId: '',
    planName: '',
    planType: 'daily',
    frequency: 'daily',
    quantity: 1,
    billingCycle: 'monthly',
    price: 0,
    startDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (isOpen) {
      setFetching(true);
      // Fetch customers and products
      Promise.all([
        api.get('/customers'),
        api.get('/products')
      ]).then(([custRes, prodRes]) => {
        setCustomers(custRes.data.data);
        setProducts(prodRes.data.data);
      }).catch(err => {
        toast.error("Failed to load options");
      }).finally(() => {
        setFetching(false);
      });
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerId || !form.planName || !form.price) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      await api.post('/subscriptions', form);
      toast.success("Subscription plan created!");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create subscription");
    } finally {
      setLoading(false);
    }
  };

  const handleProductChange = (val: string) => {
    const product = products.find(p => p.name === val || p._id === val);
    if (product) {
      setForm(prev => ({ 
        ...prev, 
        planName: product.name,
        price: product.price
      }));
    } else {
      setForm(prev => ({ ...prev, planName: val }));
    }
  };

  if (isOpen && fetching) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-gradient-to-br from-[#0052cc] to-[#0073e6] p-8 text-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black flex items-center gap-3">
                <Plus className="h-6 w-6" /> New Milk Plan
              </DialogTitle>
              <p className="text-blue-100 text-sm mt-1">Assign a recurring subscription to a customer.</p>
            </DialogHeader>
          </div>
          <div className="p-16 flex flex-col items-center justify-center gap-4 text-gray-400 bg-white animate-pulse">
            <Loader2 className="h-8 w-8 animate-spin text-[#0052cc]" />
            <p className="font-bold tracking-tight">Loading options...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (isOpen && !fetching && customers.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-gradient-to-br from-[#0052cc] to-[#0073e6] p-8 text-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black flex items-center gap-3">
                <Plus className="h-6 w-6" /> New Milk Plan
              </DialogTitle>
              <p className="text-blue-100 text-sm mt-1">Assign a recurring subscription to a customer.</p>
            </DialogHeader>
          </div>
          <div className="p-8 space-y-6 text-center bg-white">
            <div className="mx-auto w-16 h-16 bg-blue-50 text-[#0052cc] rounded-2xl flex items-center justify-center">
              <User className="h-8 w-8" />
            </div>
            <div className="space-y-2 px-4">
              <h3 className="text-xl font-black text-gray-900">No Customers Registered</h3>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">
                You must register at least one customer in your directory before you can assign a milk delivery plan.
              </p>
            </div>
            <div className="flex flex-col gap-3 pt-2">
              <Button
                onClick={() => {
                  onClose();
                  navigate('/dashboard/customers');
                }}
                className="w-full h-14 bg-[#0052cc] hover:bg-[#003d99] text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 text-md transition-all active:scale-95"
              >
                Go to Customer Directory
              </Button>
              <Button
                variant="ghost"
                onClick={onClose}
                className="w-full h-12 text-gray-400 font-bold hover:bg-gray-50 rounded-2xl"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-gradient-to-br from-[#0052cc] to-[#0073e6] p-8 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black flex items-center gap-3">
              <Plus className="h-6 w-6" /> New Milk Plan
            </DialogTitle>
            <p className="text-blue-100 text-sm mt-1">Assign a recurring subscription to a customer.</p>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5 bg-white">
          <div className="space-y-4">
            {/* Customer Selection */}
            <div className="space-y-2">
              <Label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Customer</Label>
              <Select onValueChange={(val) => setForm({ ...form, customerId: val })}>
                <SelectTrigger className="h-12 bg-gray-50 border-gray-100 rounded-xl">
                  <SelectValue placeholder="Select a customer" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {customers.map(c => (
                    <SelectItem key={c._id} value={c._id}>{c.name} ({c.phone})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Product/Plan Name */}
            <div className="space-y-2">
              <Label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Product / Plan</Label>
              <Select 
                onValueChange={(val) => {
                  if (val === 'Custom') {
                    setIsCustom(true);
                    setForm(prev => ({ ...prev, planName: '' }));
                  } else {
                    setIsCustom(false);
                    handleProductChange(val);
                  }
                }}
              >
                <SelectTrigger className="h-12 bg-gray-50 border-gray-100 rounded-xl">
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {products.map(p => (
                    <SelectItem key={p._id} value={p._id}>{p.name} - ₹{p.price}/{p.unit}</SelectItem>
                  ))}
                  <SelectItem value="Custom">Custom Plan...</SelectItem>
                </SelectContent>
              </Select>
              {isCustom && (
                <Input 
                  placeholder="Enter custom plan name"
                  value={form.planName}
                  onChange={e => setForm({ ...form, planName: e.target.value })}
                  className="mt-2 h-12 bg-gray-50 border-gray-100 rounded-xl animate-in fade-in slide-in-from-top-1"
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Quantity */}
              <div className="space-y-2">
                <Label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Daily Qty (L)</Label>
                <div className="relative">
                  <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    type="number" 
                    step="0.5"
                    value={form.quantity}
                    onChange={e => setForm({ ...form, quantity: Number(e.target.value) })}
                    className="pl-10 h-12 bg-gray-50 border-gray-100 rounded-xl"
                  />
                </div>
              </div>
              {/* Price */}
              <div className="space-y-2">
                <Label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Price per L</Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    type="number" 
                    value={form.price}
                    onChange={e => setForm({ ...form, price: Number(e.target.value) })}
                    className="pl-10 h-12 bg-gray-50 border-gray-100 rounded-xl"
                  />
                </div>
              </div>

              {/* Start Date */}
              <div className="space-y-2">
                <Label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Start Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    type="date" 
                    value={form.startDate}
                    onChange={e => setForm({ ...form, startDate: e.target.value })}
                    className="pl-10 h-12 bg-gray-50 border-gray-100 rounded-xl"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Frequency */}
              <div className="space-y-2">
                <Label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Frequency</Label>
                <Select value={form.frequency} onValueChange={(val) => setForm({ ...form, frequency: val })}>
                  <SelectTrigger className="h-12 bg-gray-50 border-gray-100 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="daily">Every Day</SelectItem>
                    <SelectItem value="alternate_day">Alternate Days</SelectItem>
                    <SelectItem value="weekly">Specific Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Billing Cycle */}
              <div className="space-y-2">
                <Label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Billing</Label>
                <Select defaultValue="monthly" onValueChange={(val) => setForm({ ...form, billingCycle: val })}>
                  <SelectTrigger className="h-12 bg-gray-50 border-gray-100 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="prepaid">Prepaid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Delivery Days (for Weekly) */}
            {form.frequency === 'weekly' && (
              <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                <Label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Delivery Days</Label>
                <div className="flex flex-wrap gap-2">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => {
                    const dayIdx = (i + 1) % 7; // Map to 0-6 (Sun is 0)
                    const isSelected = (form as any).deliveryDays?.includes(dayIdx);
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          const current = (form as any).deliveryDays || [];
                          const next = current.includes(dayIdx) 
                            ? current.filter((d: number) => d !== dayIdx)
                            : [...current, dayIdx];
                          setForm({ ...form, [ 'deliveryDays' as any]: next });
                        }}
                        className={`h-10 w-10 rounded-xl text-xs font-black transition-all ${
                          isSelected 
                            ? 'bg-[#0052cc] text-white shadow-lg shadow-blue-500/20' 
                            : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Alternate Day Hint */}
            {form.frequency === 'alternate_day' && (
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 animate-in slide-in-from-top-2 duration-300">
                <p className="text-[10px] font-bold text-amber-700 leading-relaxed uppercase tracking-wider">
                  💡 Alternate deliveries will start from your selected Start Date ({form.startDate}).
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="pt-6">
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-14 bg-[#0052cc] hover:bg-[#003d99] text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 text-lg"
            >
              {loading ? (
                <><Loader2 className="h-6 w-6 animate-spin mr-2" /> Creating...</>
              ) : (
                "Launch Subscription"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
