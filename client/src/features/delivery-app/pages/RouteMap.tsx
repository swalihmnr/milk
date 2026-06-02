import React from 'react';
import { MapPin, Navigation, Package, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

// Note: In a real implementation, we would use react-leaflet or google-maps-react here.
// For the UI mockup, we will use a stylized placeholder.

export default function RouteMap() {
  return (
    <div className="flex flex-col h-full absolute inset-0">
      
      {/* Map Area Mockup */}
      <div className="flex-1 bg-slate-800 relative overflow-hidden flex justify-center items-center">
        {/* Decorative Map Grid */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        
        {/* User Location */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20">
          <div className="h-6 w-6 bg-amber-500 rounded-full border-4 border-slate-900 shadow-lg shadow-amber-500/50"></div>
          <div className="h-12 w-12 rounded-full bg-amber-500/20 absolute animate-ping"></div>
        </div>

        {/* Recenter Button */}
        <button className="absolute bottom-24 right-6 h-12 w-12 bg-slate-700 rounded-full flex items-center justify-center text-white shadow-lg active:scale-95 border border-slate-600">
          <Navigation className="h-5 w-5" />
        </button>
      </div>

      {/* Empty State Overlay */}
      <div className="absolute bottom-20 left-0 w-full px-4 z-30">
        <div className="bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-700 w-full text-center">
          <div className="h-16 w-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-600">
            <Package className="h-8 w-8 text-slate-400" />
          </div>
          <h2 className="text-white font-black text-xl mb-2">No Routes Today</h2>
          <p className="text-slate-400 text-sm mb-0">You have no deliveries assigned for this shift. Enjoy your day off!</p>
        </div>
      </div>
      
    </div>
  );
}
