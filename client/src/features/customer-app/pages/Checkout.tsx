import React, { useState, useEffect } from 'react';
import { ChevronLeft, MapPin, CreditCard, Wallet, Banknote, ShieldCheck, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../../contexts/CartContext';
import { useAuth } from '../../../contexts/AuthContext';
import { api } from '../../../lib/api';

export default function Checkout() {
  const navigate = useNavigate();
  const { cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [address, setAddress] = useState(user?.addressLine || 'Flat 402, Building A, Green Meadows, Pune, Maharashtra');
  const [walletBalance, setWalletBalance] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await api.get('/wallet/me');
        setWalletBalance(res.data.balance || 0);
      } catch (err) {
        console.error('Failed to load wallet balance:', err);
      }
    };
    fetchBalance();
  }, []);

  const handlePay = async () => {
    if (paymentMethod === 'wallet' && walletBalance < cartTotal) {
      alert('Insufficient Wallet Balance. Please top up your wallet or choose another payment method.');
      return;
    }

    setIsProcessing(true);

    try {
      if (paymentMethod === 'wallet') {
        // Charge the backend wallet
        await api.post('/wallet/pay', { amount: cartTotal });
        setWalletBalance(prev => prev - cartTotal);
      }

      // Simulate payment processing for other mock gateways
      if (paymentMethod !== 'wallet') {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      setIsProcessing(false);
      setShowSuccess(true);
      clearCart();
    } catch (err: any) {
      setIsProcessing(false);
      alert(err.response?.data?.message || err.message || 'Payment processing failed');
    }
  };

  return (
    <div className="bg-slate-50/30 min-h-screen flex flex-col md:p-8 max-w-5xl mx-auto animate-in fade-in duration-500 relative">
      
      {/* ── HEADER ── */}
      <div className="sticky top-0 md:relative z-40 bg-white md:bg-transparent border-b md:border-b-0 border-slate-100 px-4 py-4 md:px-0 md:py-0 mb-6 flex items-center gap-4">
        <Link to="/my-app/cart" className="h-10 w-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-600 active:scale-95 transition-all shadow-sm hover:shadow">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="font-black text-xl md:text-2xl text-slate-900 tracking-tight">Checkout</h1>
          <p className="hidden md:block text-slate-400 text-xs mt-0.5">Secure payment & delivery options</p>
        </div>
      </div>

      <div className="p-4 md:p-0 flex-1 flex flex-col lg:flex-row gap-8 items-start pb-32">
        
        {/* Left Side: Address & Payment */}
        <div className="flex-1 w-full space-y-6">
          
          {/* Delivery Address Card */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 relative overflow-hidden transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-50/50 rounded-bl-full pointer-events-none"></div>
            
            <div className="flex items-start gap-4 relative z-10">
              <div className="h-12 w-12 bg-white border border-slate-100 rounded-xl shrink-0 flex items-center justify-center text-blue-600 shadow-sm">
                <MapPin className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-black text-slate-800 text-sm md:text-base">Delivery Address</h3>
                  <button 
                    onClick={() => setIsEditingAddress(!isEditingAddress)}
                    className="text-xs font-black text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/70 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    {isEditingAddress ? 'Done' : 'Change'}
                  </button>
                </div>
                
                {isEditingAddress ? (
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-3 text-xs md:text-sm font-semibold outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none h-20"
                    placeholder="Enter full delivery address..."
                  />
                ) : (
                  <>
                    <p className="font-extrabold text-xs md:text-sm text-slate-700">{user?.name || 'Customer'}</p>
                    <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                      {address}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Payment Methods Choice */}
          <div className="space-y-4">
            <h3 className="font-black text-lg text-slate-800 tracking-tight">Payment Method</h3>
            <div className="grid grid-cols-1 gap-3">
              
              {/* UPI */}
              <button 
                onClick={() => setPaymentMethod('upi')}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                  paymentMethod === 'upi' 
                    ? 'border-blue-500 bg-blue-50/20' 
                    : 'border-slate-100 bg-white hover:border-slate-200 shadow-sm'
                }`}
              >
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  paymentMethod === 'upi' ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-400'
                }`}>
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-extrabold text-sm text-slate-800">UPI Instant Payment</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">GPay, PhonePe, Paytm, BHIM</p>
                </div>
                <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  paymentMethod === 'upi' ? 'border-blue-500' : 'border-slate-300'
                }`}>
                  {paymentMethod === 'upi' && <div className="h-2.5 w-2.5 rounded-full bg-blue-600"></div>}
                </div>
              </button>

              {/* Wallet */}
              <button 
                onClick={() => setPaymentMethod('wallet')}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                  paymentMethod === 'wallet' 
                    ? 'border-blue-500 bg-blue-50/20' 
                    : 'border-slate-100 bg-white hover:border-slate-200 shadow-sm'
                }`}
              >
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  paymentMethod === 'wallet' ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-400'
                }`}>
                  <Wallet className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-extrabold text-sm text-slate-800">MilkFlow Wallet</p>
                  <p className="text-[10px] font-bold mt-0.5 uppercase tracking-wider text-slate-400">
                    Wallet Balance:{' '}
                    <span className={walletBalance < cartTotal ? 'text-red-500' : 'text-slate-700'}>
                      ₹{walletBalance.toFixed(2)}
                    </span>
                  </p>
                </div>
                <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  paymentMethod === 'wallet' ? 'border-blue-500' : 'border-slate-350'
                }`}>
                  {paymentMethod === 'wallet' && <div className="h-2.5 w-2.5 rounded-full bg-blue-600"></div>}
                </div>
              </button>

              {/* Cash On Delivery */}
              <button 
                onClick={() => setPaymentMethod('cod')}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                  paymentMethod === 'cod' 
                    ? 'border-blue-500 bg-blue-50/20' 
                    : 'border-slate-100 bg-white hover:border-slate-200 shadow-sm'
                }`}
              >
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  paymentMethod === 'cod' ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-400'
                }`}>
                  <Banknote className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-extrabold text-sm text-slate-800">Cash on Delivery</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Pay at your doorstep</p>
                </div>
                <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  paymentMethod === 'cod' ? 'border-blue-500' : 'border-slate-300'
                }`}>
                  {paymentMethod === 'cod' && <div className="h-2.5 w-2.5 rounded-full bg-blue-600"></div>}
                </div>
              </button>

            </div>
          </div>

        </div>

        {/* Right Side: Billing Recap */}
        <div className="w-full lg:w-80 shrink-0 space-y-4">
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
            <h3 className="font-black text-slate-900 tracking-tight text-base pb-3 border-b border-slate-50">Order Summary</h3>
            
            <div className="flex justify-between text-xs md:text-sm font-semibold">
              <span className="text-slate-500">Subtotal</span>
              <span className="text-slate-800">₹{cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs md:text-sm font-semibold">
              <span className="text-slate-500">Shipping</span>
              <span className="text-emerald-600 font-extrabold">FREE</span>
            </div>
            
            <div className="w-full h-px bg-slate-50 my-1"></div>
            
            <div className="flex justify-between items-center text-sm md:text-base pb-3">
              <span className="font-black text-slate-900">Total Payable</span>
              <span className="font-black text-blue-600 text-lg">₹{cartTotal.toFixed(2)}</span>
            </div>

            {/* Payment Button */}
            <button 
              onClick={handlePay}
              disabled={isProcessing || (paymentMethod === 'wallet' && walletBalance < cartTotal)}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md shadow-blue-500/10 active:scale-95 transition-all"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin text-white" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>Pay ₹{cartTotal.toFixed(2)}</span>
              )}
            </button>

            {/* Trust badge */}
            <div className="pt-2 flex items-center justify-center gap-1.5 text-slate-400 text-[10px] font-bold">
              <ShieldCheck className="h-4 w-4 text-emerald-500" /> Secure SSL Encrypted Payments
            </div>

          </div>
        </div>

      </div>

      {/* ── SUCCESS DIALOG OVERLAY ── */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full text-center shadow-2xl animate-in scale-in duration-350 flex flex-col items-center">
            
            <div className="h-16 w-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-5 border border-emerald-100">
              <CheckCircle2 className="h-10 w-10 animate-pulse" />
            </div>

            <h2 className="text-xl font-black text-slate-950 leading-tight">Order Placed Successfully!</h2>
            <p className="text-xs text-slate-400 font-semibold mt-2">
              Thank you for ordering. Your fresh dairy delivery is scheduled for tomorrow morning.
            </p>

            <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 my-6 text-left space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-500">
                <span>Method</span>
                <span className="uppercase text-slate-800">{paymentMethod}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-slate-500">
                <span>Amount Paid</span>
                <span className="text-blue-600 font-black">₹{cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-slate-500">
                <span>Delivery Address</span>
                <span className="text-slate-800 max-w-[150px] truncate" title={address}>{address}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setShowSuccess(false);
                navigate('/my-app');
              }}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm rounded-xl shadow-sm active:scale-95 transition-all"
            >
              Back to Home
            </button>

          </div>
        </div>
      )}

    </div>
  );
}
