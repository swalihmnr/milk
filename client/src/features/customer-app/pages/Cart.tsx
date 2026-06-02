import React from 'react';
import { ChevronLeft, ArrowRight, Minus, Plus, Trash2, TicketPercent, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../../../contexts/CartContext';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart();

  return (
    <div className="bg-slate-50/30 min-h-screen flex flex-col md:p-8 max-w-5xl mx-auto animate-in fade-in duration-500">
      
      {/* ── HEADER ── */}
      <div className="sticky top-0 md:relative z-40 bg-white md:bg-transparent border-b md:border-b-0 border-slate-100 px-4 py-4 md:px-0 md:py-0 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/my-app" className="h-10 w-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-600 active:scale-95 transition-all shadow-sm hover:shadow">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="font-black text-xl md:text-2xl text-slate-900 tracking-tight">Shopping Cart</h1>
            <p className="hidden md:block text-slate-400 text-xs mt-0.5">Review items in your delivery basket</p>
          </div>
        </div>
        {cart.length > 0 && (
          <button 
            onClick={clearCart} 
            className="text-xs font-black uppercase tracking-wider text-red-500 bg-red-50 hover:bg-red-100 px-3.5 py-2 rounded-xl active:scale-95 transition-all"
          >
            Clear All
          </button>
        )}
      </div>

      {/* ── CART BODY ── */}
      <div className="flex-1 p-4 md:p-0">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-slate-100 shadow-sm max-w-lg mx-auto mt-8">
            <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
              <ShoppingCart className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-black text-slate-950 mb-2">Your basket is empty</h2>
            <p className="text-xs text-slate-400 font-bold max-w-xs mb-6">Looks like you haven't added any fresh dairy products to your cart yet.</p>
            <Link 
              to="/my-app/products" 
              className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-6 py-3 rounded-xl text-sm shadow-md shadow-blue-500/10 hover:scale-105 active:scale-95 transition-all"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Items Column */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item, i) => (
                <div 
                  key={item.product._id} 
                  className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex gap-4 hover:border-slate-200 transition-all animate-in fade-in slide-in-from-bottom-4" 
                  style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}
                >
                  {/* Item Image */}
                  <div className="h-20 w-20 bg-slate-50 border border-slate-50 rounded-2xl shrink-0 flex items-center justify-center overflow-hidden">
                    {item.product.imageUrl ? (
                      <img src={item.product.imageUrl} alt={item.product.name} className="h-full w-full object-cover" />
                    ) : (
                      <ShoppingCart className="h-8 w-8 text-blue-200" />
                    )}
                  </div>

                  {/* Item Info */}
                  <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <h3 className="font-extrabold text-slate-800 text-sm md:text-base leading-snug truncate">{item.product.name}</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{item.product.unit}</p>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.product._id)} 
                        className="text-slate-400 hover:text-red-500 transition-colors p-1"
                        title="Remove product"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <span className="font-black text-blue-600 text-base">₹{item.product.price * item.quantity}</span>
                      
                      {/* Quantity Controller */}
                      <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-100 rounded-xl px-1.5 py-1">
                        <button 
                          onClick={() => updateQuantity(item.product._id, item.quantity - 1)} 
                          className="h-7 w-7 bg-white rounded-lg flex items-center justify-center text-slate-600 shadow-sm active:scale-90 transition-transform"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="font-black text-xs text-slate-700 w-4 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.product._id, item.quantity + 1)} 
                          className="h-7 w-7 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm active:scale-90 transition-transform"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Billing Summary Column */}
            <div className="space-y-6">
              
              {/* Coupon Card */}
              <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex items-center gap-3 cursor-pointer hover:border-emerald-200 active:scale-[0.98] transition-all group">
                <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shrink-0 border border-emerald-50">
                  <TicketPercent className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-extrabold text-sm text-slate-800">Apply Promo Code</h4>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5">Check available discounts</p>
                </div>
                <ChevronLeft className="h-5 w-5 text-slate-400 rotate-180 group-hover:translate-x-0.5 transition-transform" />
              </div>

              {/* Bill Details */}
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
                <h3 className="font-black text-slate-900 tracking-tight text-base pb-3 border-b border-slate-50">Bill Details</h3>
                <div className="flex justify-between text-xs md:text-sm font-semibold">
                  <span className="text-slate-500">Basket Value</span>
                  <span className="text-slate-800">₹{cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs md:text-sm font-semibold">
                  <span className="text-slate-500">Delivery Fee</span>
                  <span className="text-emerald-600 font-extrabold">FREE</span>
                </div>
                <div className="w-full h-px bg-slate-50 my-1"></div>
                <div className="flex justify-between items-center text-sm md:text-base">
                  <span className="font-black text-slate-900">Grand Total</span>
                  <span className="font-black text-blue-600 text-lg">₹{cartTotal.toFixed(2)}</span>
                </div>

                {/* Checkout CTA */}
                <div className="pt-3">
                  <Link 
                    to="/my-app/checkout" 
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center justify-center gap-2 text-white font-extrabold text-sm shadow-md shadow-blue-500/10 active:scale-95 transition-all"
                  >
                    Proceed to Pay <ArrowRight className="h-4.5 w-4.5" />
                  </Link>
                </div>
              </div>

            </div>

          </div>
        )}
      </div>
    </div>
  );
}
