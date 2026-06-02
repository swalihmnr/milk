import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  PawPrint, Activity, Syringe, Search, Plus, Milk, 
  CheckCircle2, AlertTriangle, ChevronDown, Filter, Calendar,
  Edit3, Trash2, X, Loader2, ChevronRight
} from 'lucide-react';
import { api } from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import toast from 'react-hot-toast';

export default function CowProductionList() {
  const [cows, setCows] = useState<any[]>([]);
  const [openCow, setOpenCow] = useState(false);
  const [openMilk, setOpenMilk] = useState(false);
  const [selectedCow, setSelectedCow] = useState<any>(null);
  const [openDetails, setOpenDetails] = useState(false);
  
  // Updated cowData to match backend schema
  const [cowData, setCowData] = useState({ 
    cowCode: '', 
    breed: '', 
    age: '', 
    purchaseOrBirthDate: '', 
    healthStatus: 'healthy',
    averageMilkOutput: ''
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
        averageMilkOutput: cowData.averageMilkOutput ? Number(cowData.averageMilkOutput) : 0,
        purchaseOrBirthDate: new Date(cowData.purchaseOrBirthDate).toISOString()
      });
      setOpenCow(false);
      setCowData({ cowCode: '', breed: '', age: '', purchaseOrBirthDate: '', healthStatus: 'healthy', averageMilkOutput: '' });
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

      await api.post('/production', payload);
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

  const [healthFilter, setHealthFilter] = useState<'all' | 'healthy' | 'sick' | 'pregnant' | 'dry'>('all');
  const [sortBy, setSortBy] = useState<'id-asc' | 'id-desc' | 'yield-desc' | 'yield-asc' | 'age-desc' | 'age-asc'>('id-asc');

  const filteredCows = cows
    .filter(c => {
      const matchesSearch = 
        c.cowCode.toLowerCase().includes(searchQuery.toLowerCase()) || 
        c.breed.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesHealth = healthFilter === 'all' || c.healthStatus === healthFilter;
      return matchesSearch && matchesHealth;
    })
    .sort((a, b) => {
      if (sortBy === 'id-asc') return a.cowCode.localeCompare(b.cowCode);
      if (sortBy === 'id-desc') return b.cowCode.localeCompare(a.cowCode);
      if (sortBy === 'yield-desc') return (b.averageMilkOutput || 0) - (a.averageMilkOutput || 0);
      if (sortBy === 'yield-asc') return (a.averageMilkOutput || 0) - (b.averageMilkOutput || 0);
      if (sortBy === 'age-desc') return (b.age || 0) - (a.age || 0);
      if (sortBy === 'age-asc') return (a.age || 0) - (b.age || 0);
      return 0;
    });

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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Date of Birth / Purchase</Label>
                    <Input type="date" value={cowData.purchaseOrBirthDate} onChange={e => setCowData({...cowData, purchaseOrBirthDate: e.target.value})} className="h-12 bg-gray-50 border-gray-100 rounded-xl focus:bg-white focus:border-[#0052cc]" required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Avg Yield (Liters)</Label>
                    <Input type="number" min="0" step="0.1" placeholder="e.g. 15" value={cowData.averageMilkOutput} onChange={e => setCowData({...cowData, averageMilkOutput: e.target.value})} className="h-12 bg-gray-50 border-gray-100 rounded-xl focus:bg-white focus:border-[#0052cc]" />
                  </div>
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
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex items-center bg-gray-50 rounded-2xl border border-transparent focus-within:bg-white focus-within:border-[#0052cc]/20 transition-all px-3 py-1.5">
              <Filter className="h-4 w-4 text-gray-400 mr-2" />
              <select 
                value={healthFilter} 
                onChange={(e: any) => setHealthFilter(e.target.value)}
                className="bg-transparent text-sm font-black text-gray-700 outline-none cursor-pointer pr-1"
              >
                <option value="all">All Statuses</option>
                <option value="healthy">Healthy</option>
                <option value="sick">Sick</option>
                <option value="pregnant">Pregnant</option>
                <option value="dry">Dry</option>
              </select>
            </div>

            <div className="relative flex items-center bg-gray-50 rounded-2xl border border-transparent focus-within:bg-white focus-within:border-[#0052cc]/20 transition-all px-3 py-1.5">
              <span className="text-sm font-black text-gray-400 mr-2">Sort</span>
              <select 
                value={sortBy} 
                onChange={(e: any) => setSortBy(e.target.value)}
                className="bg-transparent text-sm font-black text-gray-700 outline-none cursor-pointer pr-1"
              >
                <option value="id-asc">Tag ID (A-Z)</option>
                <option value="id-desc">Tag ID (Z-A)</option>
                <option value="yield-desc">Yield (High-Low)</option>
                <option value="yield-asc">Yield (Low-High)</option>
                <option value="age-desc">Age (Oldest)</option>
                <option value="age-asc">Age (Youngest)</option>
              </select>
            </div>
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
                <div 
                  key={c._id} 
                  onClick={() => { setSelectedCow(c); setOpenDetails(true); }}
                  className="group relative bg-white border border-gray-100 rounded-3xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer"
                >
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
                          {c.averageMilkOutput !== undefined && c.averageMilkOutput !== null ? `${c.averageMilkOutput} L` : 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 mt-2 border-t border-gray-50 flex justify-end">
                      <Button 
                        variant="ghost" 
                        className="rounded-xl h-10 px-4 text-[#0052cc] font-black hover:bg-blue-50 transition-all flex items-center gap-2"
                      >
                        Details <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      <CowDetailsModal 
        isOpen={openDetails} 
        onClose={() => { setOpenDetails(false); setSelectedCow(null); }} 
        cow={selectedCow} 
        onUpdate={fetchCows} 
      />
    </div>
  );
}

// ─── Detailed Cow Profile Modal ───────────────────────────────────────────────────
function CowDetailsModal({ isOpen, onClose, cow, onUpdate }: { isOpen: boolean; onClose: () => void; cow: any; onUpdate: () => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [productionHistory, setProductionHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const [form, setForm] = useState({
    cowCode: '',
    breed: '',
    age: '',
    purchaseOrBirthDate: '',
    healthStatus: 'healthy',
    pregnancyStatus: '',
    averageMilkOutput: '',
    feedType: '',
    lastVaccinationDate: '',
    nextVaccinationDate: '',
    vetName: '',
    notes: ''
  });

  useEffect(() => {
    if (cow && isOpen) {
      setForm({
        cowCode: cow.cowCode || '',
        breed: cow.breed || '',
        age: cow.age?.toString() || '',
        purchaseOrBirthDate: cow.purchaseOrBirthDate ? new Date(cow.purchaseOrBirthDate).toISOString().split('T')[0] : '',
        healthStatus: cow.healthStatus || 'healthy',
        pregnancyStatus: cow.pregnancyStatus || '',
        averageMilkOutput: cow.averageMilkOutput?.toString() || '',
        feedType: cow.feedType || '',
        lastVaccinationDate: cow.lastVaccinationDate ? new Date(cow.lastVaccinationDate).toISOString().split('T')[0] : '',
        nextVaccinationDate: cow.nextVaccinationDate ? new Date(cow.nextVaccinationDate).toISOString().split('T')[0] : '',
        vetName: cow.vetName || '',
        notes: cow.notes || ''
      });

      // Fetch production history
      setLoadingHistory(true);
      api.get('/production')
        .then(res => {
          const cowLogs = res.data.data.filter((p: any) => p.cowId === cow._id);
          setProductionHistory(cowLogs.slice(0, 5));
        })
        .catch(err => console.error("Failed to load production logs", err))
        .finally(() => setLoadingHistory(false));
    }
  }, [cow, isOpen]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        age: Number(form.age),
        averageMilkOutput: Number(form.averageMilkOutput) || 0,
        purchaseOrBirthDate: form.purchaseOrBirthDate ? new Date(form.purchaseOrBirthDate).toISOString() : undefined,
        lastVaccinationDate: form.lastVaccinationDate ? new Date(form.lastVaccinationDate).toISOString() : undefined,
        nextVaccinationDate: form.nextVaccinationDate ? new Date(form.nextVaccinationDate).toISOString() : undefined,
      };
      await api.put(`/cows/${cow._id}`, payload);
      toast.success("Cow details updated");
      setIsEditing(false);
      onUpdate();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update cow details");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await api.delete(`/cows/${cow._id}`);
      toast.success("Cow removed from herd");
      onClose();
      onUpdate();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete cow");
    } finally {
      setLoading(false);
    }
  };

  if (!cow) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#0052cc] to-[#0073e6] p-8 text-white relative">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-[1.2rem] bg-white/10 flex items-center justify-center text-white text-2xl font-black">
              <PawPrint className="h-8 w-8" />
            </div>
            <div>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-2xl font-black">{isEditing ? "Edit Cow Profile" : `Cow Tag: ${cow.cowCode}`}</DialogTitle>
                  {!isEditing && (
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      cow.healthStatus === 'healthy' ? 'bg-green-500/20 text-green-200' :
                      cow.healthStatus === 'sick' ? 'bg-red-500/20 text-red-200' :
                      cow.healthStatus === 'pregnant' ? 'bg-blue-500/20 text-blue-200' : 'bg-orange-500/20 text-orange-200'
                    }`}>
                      {cow.healthStatus}
                    </span>
                  )}
                </div>
                <p className="text-blue-100 text-xs mt-1">{cow.breed} • {cow.age} Years Old</p>
              </DialogHeader>
            </div>
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleSave} className="p-8 space-y-5 bg-white max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Cow ID / Tag Code</Label>
                <Input value={form.cowCode} onChange={e => setForm({...form, cowCode: e.target.value})} className="h-12 bg-gray-50 border-gray-100 rounded-xl" required />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Breed</Label>
                <Input value={form.breed} onChange={e => setForm({...form, breed: e.target.value})} className="h-12 bg-gray-50 border-gray-100 rounded-xl" required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Age (Years)</Label>
                <Input type="number" step="0.1" value={form.age} onChange={e => setForm({...form, age: e.target.value})} className="h-12 bg-gray-50 border-gray-100 rounded-xl" required />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Acquired Date</Label>
                <Input type="date" value={form.purchaseOrBirthDate} onChange={e => setForm({...form, purchaseOrBirthDate: e.target.value})} className="h-12 bg-gray-50 border-gray-100 rounded-xl" required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Health Status</Label>
                <select 
                  className="flex h-12 w-full rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0052cc] focus:bg-white transition-all"
                  value={form.healthStatus} 
                  onChange={e => setForm({...form, healthStatus: e.target.value})} 
                  required
                >
                  <option value="healthy">Healthy</option>
                  <option value="sick">Sick</option>
                  <option value="pregnant">Pregnant</option>
                  <option value="dry">Dry</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Pregnancy Info (Optional)</Label>
                <Input value={form.pregnancyStatus} disabled={form.healthStatus !== 'pregnant'} onChange={e => setForm({...form, pregnancyStatus: e.target.value})} placeholder="e.g. Month 4" className="h-12 bg-gray-50 border-gray-100 rounded-xl" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Avg Yield (Liters)</Label>
                <Input type="number" step="0.1" value={form.averageMilkOutput} onChange={e => setForm({...form, averageMilkOutput: e.target.value})} className="h-12 bg-gray-50 border-gray-100 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Feed Type</Label>
                <Input value={form.feedType} onChange={e => setForm({...form, feedType: e.target.value})} placeholder="e.g. Dry fodder & mash" className="h-12 bg-gray-50 border-gray-100 rounded-xl" />
              </div>
            </div>

            <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50 space-y-4">
              <h4 className="text-xs font-black text-[#0052cc] uppercase tracking-widest">Medical & Veterinary Details</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Last Vaccination</Label>
                  <Input type="date" value={form.lastVaccinationDate} onChange={e => setForm({...form, lastVaccinationDate: e.target.value})} className="h-10 bg-white border-gray-200 rounded-lg text-xs" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Next Due Date</Label>
                  <Input type="date" value={form.nextVaccinationDate} onChange={e => setForm({...form, nextVaccinationDate: e.target.value})} className="h-10 bg-white border-gray-200 rounded-lg text-xs" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Attending Vet Name</Label>
                <Input value={form.vetName} onChange={e => setForm({...form, vetName: e.target.value})} placeholder="Dr. Sharma" className="h-10 bg-white border-gray-200 rounded-lg text-xs" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">General Notes</Label>
              <Input value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Any behavioral or milking details" className="h-12 bg-gray-50 border-gray-100 rounded-xl" />
            </div>

            <DialogFooter className="pt-4 flex gap-3">
              <Button type="button" variant="ghost" onClick={() => setIsEditing(false)} className="rounded-xl font-bold h-12 text-gray-500 hover:bg-gray-100">
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="h-12 bg-[#0052cc] hover:bg-blue-800 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20">
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="p-8 space-y-6 bg-white max-h-[70vh] overflow-y-auto">
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50/50 border border-blue-100/50 rounded-2xl p-4 text-center">
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Avg Output</span>
                <p className="text-lg font-black text-blue-900 mt-1">{cow.averageMilkOutput || 0} L</p>
              </div>
              <div className="bg-emerald-50/50 border border-emerald-100/50 rounded-2xl p-4 text-center">
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Feed Type</span>
                <p className="text-xs font-black text-emerald-900 mt-2 truncate" title={cow.feedType || "Default fodder"}>{cow.feedType || "Fodder"}</p>
              </div>
              <div className="bg-orange-50/50 border border-orange-100/50 rounded-2xl p-4 text-center">
                <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest">Acquired</span>
                <p className="text-xs font-black text-orange-900 mt-2">
                  {cow.purchaseOrBirthDate ? new Date(cow.purchaseOrBirthDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'N/A'}
                </p>
              </div>
            </div>

            {/* Details Grid */}
            <div className="space-y-4">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Cow Information</h4>
              <div className="grid grid-cols-2 gap-y-3 text-sm bg-gray-50/50 border border-gray-100 rounded-2xl p-4">
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Breed</span>
                  <span className="font-bold text-gray-800">{cow.breed}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Age</span>
                  <span className="font-bold text-gray-800">{cow.age} Years</span>
                </div>
                {cow.healthStatus === 'pregnant' && (
                  <div className="flex flex-col col-span-2 mt-1">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Pregnancy Details</span>
                    <span className="font-bold text-blue-600">{cow.pregnancyStatus || 'Confirmed'}</span>
                  </div>
                )}
                <div className="flex flex-col col-span-2 mt-1">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">General Notes</span>
                  <span className="font-medium text-gray-600 italic">"{cow.notes || 'No notes added yet.'}"</span>
                </div>
              </div>
            </div>

            {/* Medical Info */}
            <div className="space-y-4">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Vaccination & Health Log</h4>
              <div className="grid grid-cols-2 gap-y-3 text-sm bg-gray-50/50 border border-gray-100 rounded-2xl p-4">
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Last Vaccinated</span>
                  <span className="font-bold text-gray-800">{cow.lastVaccinationDate ? new Date(cow.lastVaccinationDate).toLocaleDateString() : 'None Recorded'}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Next Due Date</span>
                  <span className="font-bold text-gray-800">{cow.nextVaccinationDate ? new Date(cow.nextVaccinationDate).toLocaleDateString() : 'Not Set'}</span>
                </div>
                <div className="flex flex-col col-span-2 mt-1">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Attending Vet</span>
                  <span className="font-bold text-gray-800">{cow.vetName || 'No Vet Assigned'}</span>
                </div>
              </div>
            </div>

            {/* Milking History */}
            <div className="space-y-4">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Recent Milking Sessions</h4>
              <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white">
                {loadingHistory ? (
                  <div className="p-8 text-center text-gray-400 flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-[#0052cc]" />
                    <span className="font-bold">Fetching logs...</span>
                  </div>
                ) : productionHistory.length > 0 ? (
                  <div className="divide-y divide-gray-50">
                    {productionHistory.map((log: any) => (
                      <div key={log._id} className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                            <Milk className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-gray-900">{log.totalLiters} Liters Yield</p>
                            <p className="text-[9px] text-gray-400 font-black uppercase mt-0.5">
                              {log.morningLiters > 0 ? "Morning shift" : "Evening shift"} • {new Date(log.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {log.fatPercentage && (
                          <span className="text-[10px] font-black bg-blue-50 text-[#0052cc] px-2 py-0.5 rounded-md">
                            Fat: {log.fatPercentage}%
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="p-8 text-center text-gray-400 font-medium text-xs">No milking session logs found for this cow.</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
              <Button onClick={() => setIsEditing(true)} variant="outline" className="flex-1 rounded-xl font-bold h-12 flex items-center justify-center gap-2 border-gray-200 text-blue-600 hover:bg-blue-50 hover:border-blue-100">
                <Edit3 className="h-4 w-4" /> Edit Profile
              </Button>
              <Button onClick={() => setIsDeleteConfirmOpen(true)} disabled={loading} variant="outline" className="flex-1 rounded-xl font-bold h-12 flex items-center justify-center gap-2 border-gray-200 text-red-600 hover:bg-red-50 hover:border-red-100">
                <Trash2 className="h-4 w-4" /> Delete Cow
              </Button>
            </div>
          </div>
        )}
      </DialogContent>

      {/* Premium Custom Confirmation Modal */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[420px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl bg-white">
          <div className="bg-gradient-to-br from-red-50 to-red-100/50 p-6 text-red-700 border-b border-red-100/30">
            <DialogHeader>
              <DialogTitle className="text-xl font-black flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-red-600 animate-bounce" /> Delete Cow Profile?
              </DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-8 space-y-6">
            <p className="text-gray-600 font-medium text-sm leading-relaxed">
              Are you sure you want to delete Cow <span className="font-bold text-gray-900">{cow.cowCode}</span>? This action cannot be undone.
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
                Delete Cow
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
