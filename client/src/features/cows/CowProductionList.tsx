import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  PawPrint, Activity, Syringe, Search, Plus, Milk, 
  CheckCircle2, AlertTriangle, ChevronDown, Filter, Calendar
} from 'lucide-react';
import { api } from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function CowProductionList() {
  const [cows, setCows] = useState<any[]>([]);
  const [openCow, setOpenCow] = useState(false);
  const [openMilk, setOpenMilk] = useState(false);
  
  // Updated cowData to match backend schema
  const [cowData, setCowData] = useState({ 
    cowCode: '', 
    breed: '', 
    age: '', 
    purchaseOrBirthDate: '', 
    healthStatus: 'healthy' 
  });
  
  const [milkData, setMilkData] = useState({ 
    cowId: '', 
    yieldLiters: '', 
    shift: 'morning', 
    fatContent: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [searchQuery, setSearchQuery] = useState('');

  const fetchCows = () => {
    api.get('/cows').then(res => setCows(res.data.data)).catch(e => console.error(e));
  };

  useEffect(() => {
    fetchCows();
  }, []);

  const handleAddCow = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/cows', { 
        ...cowData, 
        age: Number(cowData.age),
        // Send ISO string date
        purchaseOrBirthDate: new Date(cowData.purchaseOrBirthDate).toISOString()
      });
      setOpenCow(false);
      setCowData({ cowCode: '', breed: '', age: '', purchaseOrBirthDate: '', healthStatus: 'healthy' });
      fetchCows();
    } catch (err) {
      console.error(err);
      alert('Failed to add cow.');
    }
  };

  const handleAddMilk = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const liters = Number(milkData.yieldLiters);
      const isMorning = milkData.shift === 'morning';
      
      const payload = {
        cowId: milkData.cowId || undefined,
        date: milkData.date ? new Date(milkData.date).toISOString() : new Date().toISOString(),
        morningLiters: isMorning ? liters : 0,
        eveningLiters: !isMorning ? liters : 0,
        totalLiters: liters,
        fatPercentage: Number(milkData.fatContent) || undefined
      };

      await api.post('/milk-production', payload);
      setOpenMilk(false);
      setMilkData({ 
        cowId: '', 
        yieldLiters: '', 
        shift: 'morning', 
        fatContent: '',
        date: new Date().toISOString().split('T')[0]
      });
      alert('Production logged successfully!');
      fetchCows();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to log production.');
    }
  };

  const filteredCows = cows.filter(c => 
    c.cowCode.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.breed.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Dynamic calculations
  const totalCows = cows.length;
  const healthyCows = cows.filter(c => c.healthStatus === 'healthy').length;
  const healthyPercentage = totalCows === 0 ? 0 : Math.round((healthyCows / totalCows) * 100);
  const sickCows = cows.filter(c => c.healthStatus === 'sick').length;

  return (
    <div className="space-y-8 pb-12 max-w-6xl mx-auto">
      {/* ── Header Section ────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[#0052cc] font-bold text-sm bg-blue-50 w-fit px-3 py-1 rounded-full mb-2">
            <PawPrint className="h-3.5 w-3.5" />
            Herd Management
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Livestock Directory</h1>
          <p className="text-gray-500 font-medium">Monitor herd health, demographics, and daily milk yield.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative group w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-[#0052cc] transition-colors" />
            <input 
              type="text" 
              placeholder="Search ID or breed..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl text-sm focus:bg-white focus:border-[#0052cc]/20 focus:ring-4 focus:ring-[#0052cc]/5 outline-none transition-all w-full sm:w-64"
            />
          </div>
          
          <Dialog open={openCow} onOpenChange={setOpenCow}>
            <DialogTrigger asChild>
              <Button className="h-12 px-6 bg-[#0052cc] hover:bg-blue-800 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all active:scale-95 w-full sm:w-auto">
                <Plus className="h-5 w-5" /> Add Cow
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden">
              <div className="bg-gradient-to-br from-[#0052cc] to-[#0073e6] p-6 text-white">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black">Register New Cow</DialogTitle>
                  <p className="text-blue-100 text-sm mt-1">Add a new animal to your herd registry.</p>
                </DialogHeader>
              </div>
              <form onSubmit={handleAddCow} className="p-6 space-y-4 bg-white">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Cow ID / Tag Number</Label>
                  <Input placeholder="e.g. HF-9021" value={cowData.cowCode} onChange={e => setCowData({...cowData, cowCode: e.target.value})} className="h-12 bg-gray-50 border-gray-100 rounded-xl focus:bg-white focus:border-[#0052cc]" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Breed</Label>
                    <Input placeholder="e.g. Holstein" value={cowData.breed} onChange={e => setCowData({...cowData, breed: e.target.value})} className="h-12 bg-gray-50 border-gray-100 rounded-xl focus:bg-white focus:border-[#0052cc]" required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Age (Years)</Label>
                    <Input type="number" min="0" step="0.1" placeholder="e.g. 3.5" value={cowData.age} onChange={e => setCowData({...cowData, age: e.target.value})} className="h-12 bg-gray-50 border-gray-100 rounded-xl focus:bg-white focus:border-[#0052cc]" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Date of Birth / Purchase</Label>
                  <Input type="date" value={cowData.purchaseOrBirthDate} onChange={e => setCowData({...cowData, purchaseOrBirthDate: e.target.value})} className="h-12 bg-gray-50 border-gray-100 rounded-xl focus:bg-white focus:border-[#0052cc]" required />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Initial Health Status</Label>
                  <select 
                    className="flex h-12 w-full rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0052cc] focus:bg-white transition-all"
                    value={cowData.healthStatus} 
                    onChange={e => setCowData({...cowData, healthStatus: e.target.value})} 
                    required
                  >
                    <option value="healthy">Healthy</option>
                    <option value="sick">Sick / Under Treatment</option>
                    <option value="pregnant">Pregnant</option>
                    <option value="dry">Dry</option>
                  </select>
                </div>
                <DialogFooter className="pt-4">
                  <Button type="submit" className="w-full h-12 bg-[#0052cc] hover:bg-blue-800 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20">
                    Register Cow
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={openMilk} onOpenChange={setOpenMilk}>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-12 w-12 rounded-2xl border-gray-200 shadow-sm text-gray-600 hover:text-[#0052cc] hover:bg-blue-50 transition-all p-0 flex items-center justify-center flex-shrink-0" title="Log Milk Yield">
                <Milk className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px] rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden">
              <div className="bg-gradient-to-br from-emerald-400 to-teal-500 p-6 text-white">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black">Log Milk Production</DialogTitle>
                  <p className="text-emerald-50 text-sm mt-1">Record the latest milking session data.</p>
                </DialogHeader>
              </div>
              <form onSubmit={handleAddMilk} className="p-6 space-y-4 bg-white">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Select Cow</Label>
                  <select 
                    className="flex h-12 w-full rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                    value={milkData.cowId} 
                    onChange={e => setMilkData({...milkData, cowId: e.target.value})} 
                    required
                  >
                    <option value="">Select Cow...</option>
                    {cows.map(c => <option key={c._id} value={c._id}>{c.cowCode} ({c.breed})</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Yield (Liters)</Label>
                    <Input type="number" step="0.1" min="0" placeholder="0.0" value={milkData.yieldLiters} onChange={e => setMilkData({...milkData, yieldLiters: e.target.value})} className="h-12 bg-gray-50 border-gray-100 rounded-xl focus:bg-white focus:border-emerald-500" required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Shift</Label>
                    <select 
                      className="flex h-12 w-full rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                      value={milkData.shift} 
                      onChange={e => setMilkData({...milkData, shift: e.target.value})} 
                      required
                    >
                      <option value="morning">Morning</option>
                      <option value="evening">Evening</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Milking Date</Label>
                    <Input type="date" value={milkData.date} onChange={e => setMilkData({...milkData, date: e.target.value})} className="h-12 bg-gray-50 border-gray-100 rounded-xl focus:bg-white focus:border-emerald-500" required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Fat Content (%)</Label>
                    <Input type="number" step="0.1" min="0" max="100" placeholder="e.g. 4.2" value={milkData.fatContent} onChange={e => setMilkData({...milkData, fatContent: e.target.value})} className="h-12 bg-gray-50 border-gray-100 rounded-xl focus:bg-white focus:border-emerald-500" />
                  </div>
                </div>
                <DialogFooter className="pt-4">
                  <Button type="submit" className="w-full h-12 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl shadow-lg shadow-teal-500/20">
                    Save Production
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
          { label: 'Total Herd Size', value: totalCows, trend: 'Registered', color: 'from-[#0052cc] to-[#0073e6]', icon: PawPrint },
          { label: 'Health Score', value: `${healthyPercentage}%`, trend: `${healthyCows} healthy`, color: 'from-emerald-400 to-teal-500', icon: Activity },
          { label: 'Under Treatment', value: sickCows, trend: 'Needs care', color: 'from-red-400 to-pink-500', icon: Syringe },
          { label: 'Avg Daily Yield', value: totalCows > 0 ? `${(cows.reduce((s: number, c: any) => s + (c.averageMilkOutput || 0), 0) / totalCows).toFixed(1)}L` : '—', trend: 'Per cow', color: 'from-amber-400 to-orange-500', icon: Milk },
        ].map((kpi, i) => (
          <Card key={i} className={`relative overflow-hidden border-none shadow-xl bg-gradient-to-br ${kpi.color} text-white rounded-[2rem] hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}>
            <div className="absolute top-0 right-0 p-6 opacity-20 transform group-hover:scale-110 transition-transform">
              <kpi.icon className="h-12 w-12" />
            </div>
            <CardContent className="p-8">
              <p className="text-white/80 font-bold text-[10px] uppercase tracking-widest mb-4">{kpi.label}</p>
              <div className="flex items-baseline gap-2 mb-2">
                <h3 className="text-4xl font-black">{kpi.value}</h3>
              </div>
              <div className="text-[10px] font-black bg-white/20 w-fit px-2 py-1 rounded-md uppercase">
                {kpi.trend}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Livestock Grid ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
          <div>
            <h3 className="text-2xl font-black text-gray-900">Herd Profiles</h3>
            <p className="text-sm text-gray-500 font-medium mt-1">Showing {filteredCows.length} registered animals</p>
          </div>
          <div className="flex items-center gap-2">
             <Button variant="outline" className="rounded-xl border-gray-100 text-gray-500 font-bold flex items-center gap-2 h-10 hover:bg-gray-50">
               <Filter className="h-4 w-4" /> Filter
             </Button>
             <Button variant="outline" className="rounded-xl border-gray-100 text-gray-500 font-bold flex items-center gap-2 h-10 hover:bg-gray-50">
               Sort: ID <ChevronDown className="h-4 w-4 ml-1" />
             </Button>
          </div>
        </div>

        {filteredCows.length === 0 ? (
          <div className="text-center py-20 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
            <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <PawPrint className="h-8 w-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No cows found</h3>
            <p className="text-gray-500 text-sm mt-1">Try adjusting your search or add a new cow to your herd.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredCows.map((c) => {
              const isHealthy = c.healthStatus === 'healthy';
              const statusColors = {
                healthy: 'text-green-700 bg-green-100',
                sick: 'text-red-700 bg-red-100',
                pregnant: 'text-blue-700 bg-blue-100',
                dry: 'text-orange-700 bg-orange-100'
              };
              const statusColor = statusColors[c.healthStatus as keyof typeof statusColors] || statusColors.healthy;

              return (
                <div key={c._id} className="group relative bg-white border border-gray-100 rounded-3xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                  {/* Decorative accent top border */}
                  <div className={`absolute top-0 left-0 right-0 h-1.5 ${isHealthy ? 'bg-green-400' : 'bg-red-400'}`}></div>
                  
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-[#0052cc] group-hover:text-white transition-colors">
                        <PawPrint className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-black text-xl text-gray-900">{c.cowCode}</h4>
                        <p className="text-sm text-gray-500 font-medium">{c.breed} • {c.age} Yrs</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                        <Activity className="h-3.5 w-3.5" /> Status
                      </span>
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest flex items-center gap-1 shadow-sm ${statusColor}`}>
                        {!isHealthy && <AlertTriangle className="h-3 w-3" />}
                        {isHealthy && <CheckCircle2 className="h-3 w-3" />}
                        {c.healthStatus || 'HEALTHY'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-2xl border border-gray-100 bg-white group-hover:border-[#0052cc]/20 transition-colors">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> Acquired
                        </p>
                        <p className="font-bold text-sm text-gray-900 truncate">
                          {c.purchaseOrBirthDate ? new Date(c.purchaseOrBirthDate).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div className="p-3 rounded-2xl border border-gray-100 bg-white group-hover:border-[#0052cc]/20 transition-colors">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
                          <Milk className="h-3 w-3" /> Avg Yield
                        </p>
                        <p className="font-bold text-sm text-gray-900 truncate">
                          {c.averageMilkOutput ? `${c.averageMilkOutput} L` : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
