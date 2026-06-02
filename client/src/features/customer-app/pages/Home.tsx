import React, { useState } from 'react';
import { Search, ChevronRight, Droplets, Star, TrendingUp, Milk, Loader2, Sparkles, MapPin } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useProducts, useCategories } from '../../../hooks/useApi';
import { useAuth } from '../../../contexts/AuthContext';
import { useCart } from '../../../contexts/CartContext';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: categories, loading: catLoading } = useCategories();
  const { data: popularProducts, loading: prodLoading } = useProducts({ popular: true });
  const { addToCart } = useCart();
  const [searchQuery, setSearchQuery] = useState('');

  const greetingHour = new Date().getHours();
  const greeting = greetingHour < 12 ? 'Good Morning' : greetingHour < 17 ? 'Good Afternoon' : 'Good Evening';

  const filteredProducts = popularProducts?.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-5xl mx-auto animate-in fade-in duration-500">
      
      {/* ── HEADER & GREETINGS ── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-slate-500 text-sm font-bold tracking-wide">
            <span>{greeting}, {user?.name?.split(' ')[0] || 'Friend'}</span>
            <span className="animate-bounce">👋</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mt-1 leading-tight">
            Fresh dairy, <br className="md:hidden" />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">delivered daily.</span>
          </h1>
        </div>

        {/* Desktop/Mobile Search */}
        <div className="relative group w-full md:w-80 shrink-0">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search milk, paneer, curd..." 
            className="w-full h-12 bg-white border border-slate-100 rounded-2xl pl-12 pr-4 shadow-sm hover:shadow-md focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-semibold text-sm placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* ── PROMOTIONAL HERO BANNER ── */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-lg shadow-indigo-500/10">
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-radial from-white/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="relative z-10 max-w-lg space-y-4">
          <span className="inline-flex items-center gap-1 bg-white/20 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full backdrop-blur-md">
            <Sparkles className="h-3 w-3" /> Special Promo
          </span>
          <h2 className="text-2xl md:text-3xl font-black leading-tight tracking-tight">
            Get 20% Off <br />Your First Month Subscription
          </h2>
          <p className="text-blue-100/90 text-xs md:text-sm font-medium max-w-sm">
            Subscribe to our premium A2 Buffalo or Cow Milk plans. Clean, farm-fresh milk delivered to your door.
          </p>
          <div className="pt-2">
            <button 
              onClick={() => navigate('/my-app/products')}
              className="bg-white text-indigo-700 hover:text-indigo-800 font-extrabold py-3 px-6 rounded-xl text-sm shadow-md shadow-indigo-900/20 hover:scale-105 active:scale-95 transition-all"
            >
              Subscribe Now
            </button>
          </div>
        </div>
      </div>

      {/* ── FIND LOCAL FARMER LINK ── */}
      <div>
        <Link 
          to="/my-app/farmers" 
          className="flex items-center justify-between p-5 bg-gradient-to-r from-emerald-500/10 to-teal-500/5 hover:from-emerald-500/15 border border-emerald-500/10 hover:border-emerald-500/20 rounded-3xl active:scale-[0.98] transition-all group shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-emerald-600">
              <MapPin className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-base md:text-lg tracking-tight">Browse Local Farmers</h3>
              <p className="text-xs text-emerald-700 font-bold mt-0.5">Order directly from verified farms in your area</p>
            </div>
          </div>
          <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
            <ChevronRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>
      </div>

      {/* ── CATEGORIES ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-lg text-slate-800 tracking-tight">Dairy Categories</h3>
        </div>
        
        {catLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-none">
            {categories?.map((cat, i) => (
              <button 
                key={cat._id} 
                onClick={() => navigate(`/my-app/products?category=${cat._id}`)}
                className="flex flex-col items-center gap-2 shrink-0 group active:scale-95 transition-transform"
              >
                <div className="h-16 w-16 bg-white border border-slate-100 group-hover:border-blue-200 group-hover:bg-blue-50/30 rounded-2xl flex items-center justify-center shadow-sm transition-all duration-200">
                  {cat.imageUrl ? (
                    <img src={cat.imageUrl} alt={cat.name} className="h-9 w-9 object-contain" />
                  ) : (
                    <Droplets className="h-6 w-6 text-blue-600" />
                  )}
                </div>
                <span className="text-xs font-bold text-slate-600 group-hover:text-blue-600 transition-colors">{cat.name}</span>
              </button>
            ))}
            {(!categories || categories.length === 0) && (
              <p className="text-slate-400 text-sm py-2">No categories found.</p>
            )}
          </div>
        )}
      </div>

      {/* ── POPULAR PRODUCTS ── */}
      <div className="space-y-4">
        <h3 className="font-black text-lg text-slate-800 tracking-tight flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-emerald-500" /> Popular Right Now
        </h3>
        
        {prodLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts?.map(product => (
              <div 
                key={product._id} 
                className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex flex-col h-full hover:shadow-md hover:border-slate-200 transition-all duration-300 group"
              >
                {/* Product Image Container */}
                <div className="h-28 bg-slate-50 border border-slate-50 rounded-2xl mb-3 flex items-center justify-center overflow-hidden shrink-0 relative">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <Milk className="h-10 w-10 text-blue-200/80" />
                  )}
                  {product.stockQuantity < 5 && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white font-extrabold text-[8px] uppercase tracking-wider px-2 py-0.5 rounded-full">
                      Low Stock
                    </span>
                  )}
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-1.5">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-[10px] font-extrabold text-slate-500">{product.rating || '4.8'}</span>
                </div>

                {/* Info */}
                <div className="flex-1 space-y-1">
                  <h4 className="font-extrabold text-sm text-slate-800 line-clamp-2 tracking-tight group-hover:text-blue-600 transition-colors">
                    {product.name}
                  </h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{product.unit}</p>
                </div>

                {/* Footer Action */}
                <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Price</p>
                    <span className="font-black text-slate-800 text-base">₹{product.price}</span>
                  </div>
                  <button 
                    onClick={() => addToCart(product)}
                    className="h-9 px-3 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-1 font-bold text-xs rounded-xl shadow-sm hover:shadow active:scale-95 transition-all"
                  >
                    Add +
                  </button>
                </div>
              </div>
            ))}
            {(!filteredProducts || filteredProducts.length === 0) && (
              <div className="col-span-2 md:col-span-3 lg:col-span-4 text-center py-12 bg-white rounded-3xl border border-slate-100 shadow-sm">
                <Milk className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-400 text-sm font-semibold">No popular products found.</p>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
