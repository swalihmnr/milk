import React, { useState } from 'react';
import { ChevronLeft, MapPin, Phone, Star, Search, Loader2, Award, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useVendors } from '../../../hooks/useApi';

export default function FarmersList() {
  const { data: vendors, loading, error } = useVendors();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredVendors = vendors?.filter(vendor => {
    const term = searchQuery.toLowerCase();
    const company = vendor.companyName?.toLowerCase() || '';
    const city = vendor.userId?.city?.toLowerCase() || '';
    const farmerName = vendor.userId?.name?.toLowerCase() || '';
    return company.includes(term) || city.includes(term) || farmerName.includes(term);
  });

  return (
    <div className="bg-slate-50/30 min-h-screen pb-24 md:p-8 max-w-5xl mx-auto animate-in fade-in duration-500">
      
      {/* ── HEADER ── */}
      <div className="sticky top-0 md:relative z-40 bg-white md:bg-transparent border-b md:border-b-0 border-slate-100 px-4 py-4 md:px-0 md:py-0 mb-6 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <Link to="/my-app" className="h-10 w-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-600 active:scale-95 transition-all shadow-sm hover:shadow">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="font-black text-xl md:text-2xl text-slate-900 tracking-tight">Nearby Dairy Farmers</h1>
            <p className="hidden md:block text-slate-400 text-xs mt-0.5">Order fresh milk directly from local producers</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by farm, farmer name, or location..." 
            className="w-full h-12 bg-white border border-slate-100 rounded-2xl pl-12 pr-4 shadow-sm hover:shadow-md focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-semibold text-sm placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* ── FARMERS GRID ── */}
      <div className="p-4 md:p-0">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-red-50 border border-red-100 rounded-3xl p-6 text-red-500 font-bold">
            {error}
          </div>
        ) : filteredVendors && filteredVendors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredVendors.map((vendor, i) => (
              <div 
                key={vendor._id} 
                className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all duration-300 flex flex-col justify-between animate-in fade-in slide-in-from-bottom-4" 
                style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'both' }}
              >
                <div className="flex gap-4">
                  {/* Farm Logo block */}
                  <div className="h-16 w-16 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-md shadow-blue-500/10 font-black text-2xl">
                    {vendor.companyName?.charAt(0) || 'F'}
                  </div>
                  
                  {/* Farm Info */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-extrabold text-slate-800 text-base leading-tight truncate">
                        {vendor.companyName}
                      </h3>
                      <div className="bg-amber-50 px-2 py-0.5 rounded-lg flex items-center gap-1 border border-amber-100 shrink-0">
                        <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                        <span className="text-[10px] font-black text-amber-700">4.9</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" /> 
                      {vendor.userId?.city || 'Local Area'}
                    </p>
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                      <Award className="h-3 w-3" /> Verified Partner
                    </span>
                  </div>
                </div>

                {/* Footer Details & Navigation */}
                <div className="mt-6 pt-5 border-t border-slate-50 flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Farmer</p>
                    <p className="text-sm font-bold text-slate-800">{vendor.userId?.name || 'Verified Farmer'}</p>
                  </div>
                  <div className="flex gap-2">
                    {vendor.userId?.phone && (
                      <a 
                        href={`tel:${vendor.userId.phone}`} 
                        title="Call Farmer"
                        className="h-10 w-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-100 active:scale-95 transition-all"
                      >
                        <Phone className="h-4.5 w-4.5" />
                      </a>
                    )}
                    <Link 
                      to={`/my-app/products?vendorId=${vendor._id}`} 
                      className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-all"
                    >
                      View Dairy <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <MapPin className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-400 font-bold">No dairy farmers found near you.</p>
          </div>
        )}
      </div>

    </div>
  );
}
