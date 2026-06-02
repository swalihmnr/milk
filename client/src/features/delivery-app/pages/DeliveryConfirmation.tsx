import React, { useState } from 'react';
import { Camera, MapPin, CheckCircle2, ChevronLeft, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DeliveryConfirmation() {
  const [photoTaken, setPhotoTaken] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = () => {
    setIsConfirming(true);
    setTimeout(() => {
      // Simulate API call success
      window.history.back();
    }, 1500);
  };

  return (
    <div className="bg-slate-900 min-h-screen text-white flex flex-col">
      <div className="sticky top-0 z-40 bg-slate-800 border-b border-slate-700 px-5 py-4 flex items-center gap-4">
        <Link to="/delivery-app" className="h-10 w-10 bg-slate-700 rounded-xl flex items-center justify-center text-slate-300 active:scale-95 transition-transform">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-black text-xl">Confirm Delivery</h1>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="font-black text-lg">Delivery Location</h2>
              <p className="text-slate-400 text-sm mt-0.5">Customer Name</p>
            </div>
            <div className="text-right">
              <span className="block font-black text-amber-500 text-xl">1.5 L</span>
              <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Cow Milk</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 p-3 rounded-xl border border-emerald-500/20 text-xs font-bold">
            <MapPin className="h-4 w-4 shrink-0" />
            GPS Validated: Within 10m of location
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <h3 className="font-bold text-slate-300 mb-3 text-sm uppercase tracking-widest">Proof of Delivery</h3>
          
          {!photoTaken ? (
            <button 
              onClick={() => setPhotoTaken(true)}
              className="flex-1 min-h-[200px] border-2 border-dashed border-slate-600 rounded-2xl flex flex-col items-center justify-center gap-3 text-slate-400 hover:bg-slate-800/50 hover:text-slate-300 transition-colors active:scale-95"
            >
              <div className="h-16 w-16 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700">
                <Camera className="h-8 w-8" />
              </div>
              <span className="font-bold">Tap to take photo</span>
            </button>
          ) : (
            <div className="flex-1 min-h-[200px] rounded-2xl bg-slate-800 border border-slate-700 relative overflow-hidden flex items-center justify-center">
              {/* Placeholder for captured photo */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-800 opacity-50"></div>
              <PackagePlaceholder />
              <button 
                onClick={() => setPhotoTaken(false)}
                className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur text-white text-xs font-bold px-3 py-1.5 rounded-lg active:scale-95"
              >
                Retake
              </button>
              <div className="absolute bottom-4 left-4 bg-emerald-500 text-slate-900 text-[10px] font-black uppercase px-2 py-1 rounded flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Photo Attached
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800">
          <div className="flex items-start gap-3 mb-6 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-amber-500/80 text-xs font-medium leading-relaxed">
              Ensure the milk packet is clearly visible in front of the door. Marking this delivered will start the 4-hour complaint window.
            </p>
          </div>

          <button 
            onClick={handleConfirm}
            disabled={!photoTaken || isConfirming}
            className={`w-full h-14 rounded-2xl font-black text-lg flex items-center justify-center transition-all shadow-lg ${
              !photoTaken 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                : isConfirming 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-900 active:scale-95 shadow-emerald-500/20'
            }`}
          >
            {isConfirming ? (
              <span className="flex items-center gap-2"><span className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin"></span> Processing...</span>
            ) : (
              'Swipe to Confirm'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function PackagePlaceholder() {
  return (
    <div className="h-32 w-24 bg-blue-100 rounded rotate-12 shadow-2xl relative">
      <div className="absolute inset-x-0 bottom-4 h-8 bg-[#0052cc] opacity-80"></div>
    </div>
  );
}
