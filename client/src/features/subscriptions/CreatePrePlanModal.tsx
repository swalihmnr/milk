import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { Loader2, Plus, Milk, IndianRupee, Edit3 } from 'lucide-react';

interface CreatePrePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingProduct?: any;
}

export default function CreatePrePlanModal({ isOpen, onClose, onSuccess, editingProduct }: CreatePrePlanModalProps) {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [form, setForm] = useState({
    name: '',
    price: 0,
    unit: 'Litre',
    categoryId: '',
    stockQuantity: 999,
    isActive: true
  });

  useEffect(() => {
    if (isOpen) {
      if (editingProduct) {
        setForm({
          name: editingProduct.name || '',
          price: editingProduct.price || 0,
          unit: editingProduct.unit || 'Litre',
          categoryId: editingProduct.categoryId?._id || editingProduct.categoryId || '',
          stockQuantity: editingProduct.stockQuantity || 999,
          isActive: editingProduct.isActive !== undefined ? editingProduct.isActive : true
        });
      } else {
        setForm({
          name: '',
          price: 0,
          unit: 'Litre',
          categoryId: '',
          stockQuantity: 999,
          isActive: true
        });
        setFetching(true);
        api.get('/products/categories')
          .then(res => {
            if (res.data.data.length > 0) {
              setForm(prev => ({ ...prev, categoryId: res.data.data[0]._id }));
            }
          })
          .catch(err => {
            toast.error("Failed to load categories");
          })
          .finally(() => {
            setFetching(false);
          });
      }
    }
  }, [isOpen, editingProduct]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, form);
        toast.success("Pre-configured plan updated successfully!");
      } else {
        await api.post('/products', form);
        toast.success("Pre-configured plan created successfully!");
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save preconfigured plan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-gradient-to-br from-[#0052cc] to-[#0073e6] p-8 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black flex items-center gap-3">
              {editingProduct ? (
                <><Edit3 className="h-6 w-6" /> Edit Pre-plan</>
              ) : (
                <><Plus className="h-6 w-6" /> Create Pre-plan</>
              )}
            </DialogTitle>
            <p className="text-blue-100 text-sm mt-1">
              {editingProduct ? "Modify pre-configured plan attributes." : "Add a new pre-configured plan to your catalog."}
            </p>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5 bg-white">
          <div className="space-y-4">
            {/* Plan Name */}
            <div className="space-y-2">
              <Label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Plan Name</Label>
              <div className="relative">
                <Milk className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="e.g. Daily Buffalo Milk"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="pl-10 h-12 bg-gray-50 border-gray-100 rounded-xl focus:bg-white focus:border-[#0052cc]"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Price */}
              <div className="space-y-2">
                <Label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Price per unit</Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    type="number" 
                    value={form.price}
                    onChange={e => setForm({ ...form, price: Number(e.target.value) })}
                    className="pl-10 h-12 bg-gray-50 border-gray-100 rounded-xl"
                    required
                  />
                </div>
              </div>

              {/* Unit */}
              <div className="space-y-2">
                <Label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Unit</Label>
                <Input 
                  placeholder="e.g. Litre, 500g"
                  value={form.unit}
                  onChange={e => setForm({ ...form, unit: e.target.value })}
                  className="h-12 bg-gray-50 border-gray-100 rounded-xl"
                  required
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-6">
            <Button 
              type="submit" 
              disabled={loading || fetching}
              className="w-full h-14 bg-[#0052cc] hover:bg-[#003d99] text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 text-lg"
            >
              {loading ? (
                <><Loader2 className="h-6 w-6 animate-spin mr-2" /> Saving...</>
              ) : (
                editingProduct ? "Save Changes" : "Create Pre-plan"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
