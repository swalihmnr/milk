import React, { useState } from 'react';
import { Search, Milk, ChevronLeft, Plus, Minus, Loader2, Star, SlidersHorizontal } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useProducts, useCategories, useVendors } from '../../../hooks/useApi';
import { useCart } from '../../../contexts/CartContext';

export default function ProductList() {
  const [searchParams] = useSearchParams();
  const vendorId = searchParams.get('vendorId') || undefined;
  const categoryId = searchParams.get('category') || undefined;
  
  const [activeCat, setActiveCat] = useState<string | null>(categoryId || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc'>('default');

  const { data: products, loading: prodLoading } = useProducts({
    ...(activeCat && { category: activeCat }),
    ...(vendorId && { vendorId })
  });
  const { data: categories } = useCategories();
  const { data: vendors } = useVendors();
  const { cart, addToCart, updateQuantity } = useCart();

  const selectedVendor = vendors?.find(v => v._id === vendorId);

  // Client-side search filtering
  const filteredProducts = products?.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sorting
  const sortedProducts = filteredProducts ? [...filteredProducts] : [];
  if (sortBy === 'price-asc') {
    sortedProducts.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-desc') {
    sortedProducts.sort((a, b) => b.price - a.price);
  }

  return (
    <div className="bg-slate-50/30 min-h-screen pb-24 md:p-8 max-w-5xl mx-auto animate-in fade-in duration-500">
      
      {/* ── HEADER ── */}
      <div className="sticky top-0 md:relative z-40 bg-white md:bg-transparent border-b md:border-b-0 border-slate-100 px-4 py-4 md:px-0 md:py-0 mb-4">
        <div className="flex items-center gap-4 mb-4">
          <Link to="/my-app" className="h-10 w-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-600 active:scale-95 transition-all shadow-sm hover:shadow">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="font-black text-xl md:text-2xl text-slate-900 tracking-tight">
              {selectedVendor ? `${selectedVendor.companyName}'s Dairy` : 'Products Catalog'}
            </h1>
            <p className="hidden md:block text-slate-400 text-xs mt-0.5">Explore premium farm dairy products</p>
          </div>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..." 
              className="w-full h-12 bg-white border border-slate-100 rounded-2xl pl-12 pr-4 shadow-sm hover:shadow-md focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-semibold text-sm placeholder:text-slate-400"
            />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <SlidersHorizontal className="h-4.5 w-4.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-white border border-slate-100 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none cursor-pointer hover:bg-slate-50 transition-colors"
            >
              <option value="default">Default Sort</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── CATEGORY PILLS ── */}
      <div className="px-4 py-3 md:px-0 flex gap-2 overflow-x-auto scrollbar-none sticky top-[128px] md:relative md:top-0 z-35 bg-slate-50/80 md:bg-transparent backdrop-blur-md md:backdrop-blur-none border-b md:border-none border-slate-100/50">
        <button
          onClick={() => setActiveCat(null)}
          className={`shrink-0 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
            activeCat === null 
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10' 
              : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50 hover:text-slate-800 shadow-sm'
          }`}
        >
          All Items
        </button>
        {categories?.map(cat => (
          <button
            key={cat._id}
            onClick={() => setActiveCat(cat._id)}
            className={`shrink-0 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
              activeCat === cat._id 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10' 
                : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50 hover:text-slate-800 shadow-sm'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* ── PRODUCT GRID ── */}
      <div className="p-4 md:p-0 mt-6">
        {prodLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : sortedProducts && sortedProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sortedProducts.map((product, i) => {
              const cartItem = cart.find(item => item.product._id === product._id);
              const quantity = cartItem ? cartItem.quantity : 0;

              return (
                <div 
                  key={product._id} 
                  className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex flex-col h-full hover:shadow-md hover:border-slate-200 transition-all duration-300 group animate-in fade-in slide-in-from-bottom-4" 
                  style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}
                >
                  {/* Image Container */}
                  <div className="h-28 bg-slate-50 border border-slate-50 rounded-2xl mb-3 flex items-center justify-center overflow-hidden shrink-0 relative">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <Milk className="h-10 w-10 text-blue-200/85" />
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
                    <h3 className="font-extrabold text-sm text-slate-800 line-clamp-2 tracking-tight group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{product.unit}</p>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Price</p>
                      <span className="font-black text-blue-600 text-base">₹{product.price}</span>
                    </div>

                    {quantity > 0 ? (
                      <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-1.5 py-1">
                        <button 
                          onClick={() => updateQuantity(product._id, quantity - 1)}
                          className="h-7 w-7 bg-white rounded-lg flex items-center justify-center text-blue-600 shadow-sm active:scale-90 transition-transform"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="font-black text-xs text-blue-700 w-4 text-center">{quantity}</span>
                        <button 
                          onClick={() => updateQuantity(product._id, quantity + 1)}
                          className="h-7 w-7 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm active:scale-90 transition-transform"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => addToCart(product)}
                        className="h-8.5 px-4 bg-white border border-slate-200 hover:border-blue-200 hover:bg-blue-50/20 text-blue-600 font-extrabold text-xs rounded-xl shadow-sm active:scale-95 transition-all"
                      >
                        Add +
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <Milk className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-400 font-bold">No products found.</p>
          </div>
        )}
      </div>

    </div>
  );
}
