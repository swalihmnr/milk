import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Plus, Search, MapPin, Phone, Users, Filter, 
  Droplet, Calendar, MoreHorizontal, User as UserIcon,
  ChevronRight, ArrowUpRight, CheckCircle2, X, Navigation,
  TrendingUp, ChevronDown, Milk, Sun, Moon, RefreshCcw
} from 'lucide-react';
import { api } from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AddressAutocomplete from '@/components/ui/AddressAutocomplete';
import type { ParsedAddress } from '@/components/ui/AddressAutocomplete';
import FarmMapPicker from '@/components/ui/FarmMapPicker';
import type { MapCoords } from '@/components/ui/FarmMapPicker';

export default function CustomerList() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    name: '', phone: '', address: '', area: '', city: '', district: '', state: '', pincode: '', lat: null as number | null, lon: null as number | null 
  });
  const [planData, setPlanData] = useState({
    milkType: 'cow',
    planType: 'daily' as 'daily' | 'monthly' | 'custom',
    billingCycle: 'monthly' as 'weekly' | 'monthly' | 'prepaid',
    morningQuantity: '',
    eveningQuantity: '',
    price: '',
    startDate: new Date().toISOString().split('T')[0],
  });
  const [includePlan, setIncludePlan] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapCenter, setMapCenter] = useState<MapCoords | undefined>(undefined);
  const [pinCoords, setPinCoords] = useState<MapCoords | null>(null);
  const [triggerGPS, setTriggerGPS] = useState(0);

  const fetchCustomers = () => {
    api.get('/customers').then(res => setCustomers(res.data.data)).catch(e => console.error(e));
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleAddressSelect = (addr: ParsedAddress) => {
    setFormData(prev => ({ 
      ...prev, 
      address: addr.displayName,
      area: addr.road || addr.village || '',
      city: addr.city,
      state: addr.state,
      pincode: addr.postcode,
      district: addr.city,
      lat: addr.lat,
      lon: addr.lon
    }));
    setMapCenter({ lat: addr.lat, lon: addr.lon });
    setPinCoords({ lat: addr.lat, lon: addr.lon });
  };

  const handleMapChange = (coords: MapCoords) => {
    setPinCoords(coords);
    setFormData(prev => ({ ...prev, lat: coords.lat, lon: coords.lon }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const customerRes = await api.post('/customers', formData);
      const customerId = customerRes.data.data._id;

      // Also create the milk plan if user opted in
      if (includePlan && planData.price && (planData.morningQuantity || planData.eveningQuantity)) {
        const morning = Number(planData.morningQuantity) || 0;
        const evening = Number(planData.eveningQuantity) || 0;
        const total = morning + evening;
        // Build a friendly plan name e.g. "Daily Cow Milk – 2.5L"
        const planName = `${planData.planType.charAt(0).toUpperCase() + planData.planType.slice(1)} ${planData.milkType.charAt(0).toUpperCase() + planData.milkType.slice(1)} Milk – ${total}L`;
        await api.post('/subscriptions', {
          customerId,
          planName,
          planType: planData.planType,
          billingCycle: planData.billingCycle,
          quantity: total,
          price: Number(planData.price),
          status: 'active',
          autoRenewal: true,
        });
      }

      setOpen(false);
      setFormData({ name: '', phone: '', address: '', area: '', city: '', district: '', state: '', pincode: '', lat: null, lon: null });
      setPlanData({ milkType: 'cow', planType: 'daily', billingCycle: 'monthly', morningQuantity: '', eveningQuantity: '', price: '', startDate: new Date().toISOString().split('T')[0] });
      setIncludePlan(false);
      fetchCustomers();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.phone.includes(searchQuery)
  );

  return (
    <div className="space-y-8 pb-12 max-w-6xl mx-auto">
      {/* ── Header Section ────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[#0052cc] font-bold text-sm bg-blue-50 w-fit px-3 py-1 rounded-full mb-2">
            <Users className="h-3.5 w-3.5" />
            Active CRM
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Customer Directory</h1>
          <p className="text-gray-500 font-medium">Manage your milk delivery network and subscriptions.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-[#0052cc] transition-colors" />
            <input 
              type="text" 
              placeholder="Search by name or phone..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl text-sm focus:bg-white focus:border-[#0052cc]/20 focus:ring-4 focus:ring-[#0052cc]/5 outline-none transition-all w-full md:w-64"
            />
          </div>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="h-12 px-6 bg-[#0052cc] hover:bg-blue-800 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all active:scale-95">
                <Plus className="h-5 w-5" /> Add Customer
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden">
              <div className="bg-gradient-to-br from-[#0052cc] to-[#0073e6] p-8 text-white">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black">New Customer</DialogTitle>
                  <p className="text-blue-100 text-sm mt-1">Pinpoint the delivery location for precision.</p>
                </DialogHeader>
              </div>
              <form onSubmit={handleSubmit} className="p-8 space-y-5 bg-white max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Full Name</Label>
                    <div className="relative">
                      <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input id="name" placeholder="Customer Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="pl-10 h-12 bg-gray-50 border-gray-100 rounded-xl focus:bg-white focus:border-[#0052cc]" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input id="phone" type="tel" placeholder="9876543210" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="pl-10 h-12 bg-gray-50 border-gray-100 rounded-xl focus:bg-white focus:border-[#0052cc]" required />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Delivery Address (Search & Pin)</Label>
                    <button 
                      type="button"
                      onClick={() => setTriggerGPS(prev => prev + 1)}
                      className="text-[10px] font-bold text-[#0052cc] hover:underline flex items-center gap-1"
                    >
                      <Navigation className="h-3 w-3" /> Fetch My Current Location
                    </button>
                  </div>
                  <AddressAutocomplete 
                    onSelect={handleAddressSelect} 
                    placeholder="Search building, street, landmark..."
                    triggerGPS={triggerGPS}
                  />
                </div>

                <div className="h-48 w-full rounded-2xl overflow-hidden border border-gray-100 shadow-inner">
                   <FarmMapPicker 
                     center={mapCenter} 
                     pin={pinCoords} 
                     onChange={handleMapChange} 
                   />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="area" className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Area/Sector</Label>
                    <Input id="area" placeholder="e.g. Sector 4" value={formData.area} onChange={(e) => setFormData({...formData, area: e.target.value})} className="h-12 bg-gray-50 border-gray-100 rounded-xl focus:bg-white focus:border-[#0052cc]" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">City</Label>
                    <Input id="city" placeholder="e.g. Pune" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="h-12 bg-gray-50 border-gray-100 rounded-xl focus:bg-white focus:border-[#0052cc]" required />
                  </div>
                </div>

                {/* ── Milk Plan Section ─────────────────────────────── */}
                <div className="rounded-2xl border-2 border-dashed border-gray-200 overflow-hidden transition-all">
                  {/* Toggle Header */}
                  <button
                    type="button"
                    onClick={() => setIncludePlan(p => !p)}
                    className={`w-full flex items-center justify-between px-5 py-4 transition-colors ${
                      includePlan ? 'bg-[#0052cc] text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Milk className="h-4 w-4" />
                      <span className="font-black text-sm uppercase tracking-widest">Milk Delivery Plan</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        includePlan ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>Optional</span>
                    </div>
                    <span className={`text-xs font-bold transition-all ${
                      includePlan ? 'text-white/80' : 'text-[#0052cc]'
                    }`}>{includePlan ? '▲ Collapse' : '▼ Set Plan'}</span>
                  </button>

                  {includePlan && (
                    <div className="p-5 space-y-4 bg-white">
                      {/* Plan Type & Billing Cycle */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Milk Type</Label>
                          <select
                            className="flex h-12 w-full rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0052cc] focus:bg-white transition-all"
                            value={planData.milkType}
                            onChange={e => setPlanData({...planData, milkType: e.target.value})}
                          >
                            <option value="cow">🐄 Cow Milk</option>
                            <option value="buffalo">🐃 Buffalo Milk</option>
                            <option value="mixed">🥛 Mixed</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Plan Type</Label>
                          <select
                            className="flex h-12 w-full rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0052cc] focus:bg-white transition-all"
                            value={planData.planType}
                            onChange={e => setPlanData({...planData, planType: e.target.value as any})}
                          >
                            <option value="daily">Daily</option>
                            <option value="monthly">Monthly</option>
                            <option value="custom">Custom</option>
                          </select>
                        </div>
                      </div>

                      {/* Billing Cycle */}
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Billing Cycle</Label>
                        <div className="grid grid-cols-3 gap-2">
                          {(['weekly', 'monthly', 'prepaid'] as const).map(cycle => (
                            <button
                              key={cycle}
                              type="button"
                              onClick={() => setPlanData({...planData, billingCycle: cycle})}
                              className={`h-11 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border-2 ${
                                planData.billingCycle === cycle
                                  ? 'bg-[#0052cc] text-white border-[#0052cc] shadow-md'
                                  : 'bg-gray-50 text-gray-600 border-gray-100 hover:border-[#0052cc]/40'
                              }`}
                            >
                              {cycle}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Qty Breakdown */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-1">
                            <Sun className="h-3 w-3 text-amber-500" /> Morning (L)
                          </Label>
                          <Input
                            type="number" min="0" step="0.5" placeholder="0.0"
                            value={planData.morningQuantity}
                            onChange={e => setPlanData({...planData, morningQuantity: e.target.value})}
                            className="h-12 bg-gray-50 border-gray-100 rounded-xl focus:bg-white focus:border-[#0052cc]"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-1">
                            <Moon className="h-3 w-3 text-indigo-500" /> Evening (L)
                          </Label>
                          <Input
                            type="number" min="0" step="0.5" placeholder="0.0"
                            value={planData.eveningQuantity}
                            onChange={e => setPlanData({...planData, eveningQuantity: e.target.value})}
                            className="h-12 bg-gray-50 border-gray-100 rounded-xl focus:bg-white focus:border-[#0052cc]"
                          />
                        </div>
                      </div>

                      {/* Total Preview */}
                      {(planData.morningQuantity || planData.eveningQuantity) && (
                        <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                          <Droplet className="h-4 w-4 text-[#0052cc]" />
                          <span className="text-sm font-bold text-[#0052cc]">
                            Total: {(Number(planData.morningQuantity) || 0) + (Number(planData.eveningQuantity) || 0)} L / day
                          </span>
                        </div>
                      )}

                      {/* Price & Start Date */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Price / Month (₹)</Label>
                          <Input
                            type="number" min="0" placeholder="e.g. 1500"
                            value={planData.price}
                            onChange={e => setPlanData({...planData, price: e.target.value})}
                            className="h-12 bg-gray-50 border-gray-100 rounded-xl focus:bg-white focus:border-[#0052cc]"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Start Date</Label>
                          <Input
                            type="date"
                            value={planData.startDate}
                            onChange={e => setPlanData({...planData, startDate: e.target.value})}
                            className="h-12 bg-gray-50 border-gray-100 rounded-xl focus:bg-white focus:border-[#0052cc]"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <DialogFooter className="pt-4">
                  <Button type="submit" className="w-full h-12 bg-[#0052cc] hover:bg-blue-800 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20">
                    {includePlan ? 'Register Customer + Activate Plan' : 'Register Customer'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* ── KPI Grid ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Customers', value: customers.length, trend: 'Registered', color: 'from-[#0052cc] to-[#0073e6]', icon: Users },
          { label: 'Active', value: customers.filter((c: any) => c.status === 'active').length || customers.length, trend: 'Currently active', color: 'from-emerald-400 to-teal-500', icon: CheckCircle2 },
          { label: 'With Location', value: customers.filter((c: any) => c.lat && c.lon).length, trend: 'GPS pinned', color: 'from-orange-400 to-pink-500', icon: MapPin },
          { label: 'Recent', value: customers.filter((c: any) => { const d = new Date(c.createdAt); const now = new Date(); return (now.getTime() - d.getTime()) < 7 * 86400000; }).length, trend: 'This week', color: 'from-amber-400 to-orange-500', icon: TrendingUp },
        ].map((kpi, i) => (
          <Card key={i} className={`relative overflow-hidden border-none shadow-xl bg-gradient-to-br ${kpi.color} text-white rounded-[2rem]`}>
            <div className="absolute top-0 right-0 p-6 opacity-20">
              <kpi.icon className="h-12 w-12" />
            </div>
            <CardContent className="p-8">
              <p className="text-white/80 font-bold text-[10px] uppercase tracking-widest mb-4">{kpi.label}</p>
              <div className="flex items-baseline gap-2 mb-2">
                <h3 className="text-3xl font-black">{kpi.value}</h3>
              </div>
              <div className="text-[10px] font-black bg-white/20 w-fit px-2 py-1 rounded-md uppercase">
                {kpi.trend}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Customer Table/Grid ─────────────────────────────────────────── */}
      <Card className="border-gray-100 shadow-sm bg-white rounded-[2.5rem] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between p-8">
          <div>
            <CardTitle className="text-xl font-black text-gray-900">Member Directory</CardTitle>
            <p className="text-sm text-gray-500 font-medium mt-1">Listing {filteredCustomers.length} registered customers</p>
          </div>
          <div className="flex items-center gap-2">
             <Button variant="outline" className="rounded-xl border-gray-100 text-gray-500 font-bold flex items-center gap-2">
               <Filter className="h-4 w-4" /> Filter
             </Button>
             <Button variant="outline" className="rounded-xl border-gray-100 text-gray-500 font-bold flex items-center gap-2">
               Sort By: Latest <ChevronDown className="h-4 w-4 ml-1" />
             </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-100 border-t border-gray-100">
            {filteredCustomers.map((c) => (
              <div key={c._id} className="bg-white p-8 hover:bg-gray-50/50 transition-all group relative overflow-hidden">
                <div className="flex gap-6 relative z-10">
                  <div className="h-16 w-16 rounded-[1.25rem] bg-[#f8fafc] border border-gray-100 flex items-center justify-center text-xl font-black text-gray-400 group-hover:bg-[#0052cc] group-hover:text-white group-hover:rotate-3 transition-all duration-300">
                    {c.name.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-black text-xl text-gray-900 truncate pr-4">{c.name}</h4>
                      <span className="bg-green-100 text-green-700 text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest flex items-center shadow-sm">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-2 animate-pulse"></span> ACTIVE
                      </span>
                    </div>
                    <p className="text-xs text-[#0052cc] font-bold uppercase tracking-wider">ID: #CUST-{c._id?.slice(-5)}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-8">
                  <div className="bg-gray-50/80 rounded-[1.5rem] p-4 border border-gray-100 group-hover:bg-white group-hover:border-[#0052cc]/10 transition-all">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                      <Phone className="h-3 w-3" /> Contact
                    </p>
                    <p className="font-bold text-sm text-gray-900">{c.phone}</p>
                  </div>
                  <div className="bg-gray-50/80 rounded-[1.5rem] p-4 border border-gray-100 group-hover:bg-white group-hover:border-[#0052cc]/10 transition-all">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                      <MapPin className="h-3 w-3" /> Location
                    </p>
                    <p className="font-bold text-sm text-gray-900 truncate" title={c.area}>{c.area}, {c.city}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-50">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest ${c.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {c.status || 'active'}
                    </span>
                    <span className="text-[11px] font-bold text-gray-400">Added {new Date(c.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    onClick={() => navigate(`/dashboard/customers/${c._id}`)}
                    className="rounded-xl h-10 px-4 text-[#0052cc] font-black hover:bg-blue-50 transition-all flex items-center gap-2"
                  >
                    Details <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {filteredCustomers.length === 0 && (
              <div className="col-span-2 bg-white p-24 text-center">
                <div className="h-24 w-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="h-10 w-10 text-gray-200" />
                </div>
                <h3 className="text-xl font-black text-gray-900">No matching customers</h3>
                <p className="text-gray-500 font-medium mt-2">Try adjusting your search filters or add a new customer.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
