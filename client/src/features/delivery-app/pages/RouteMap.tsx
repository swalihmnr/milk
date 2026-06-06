import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Package, Clock, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { api } from '../../../lib/api';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icon paths in Vite builds
const customerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const activeCustomerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

export default function RouteMap() {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [center, setCenter] = useState<[number, number]>([18.5204, 73.8567]); // Default Pune

  const fetchDeliveries = async () => {
    try {
      const res = await api.get('/deliveries');
      const data = res.data.data || [];
      setDeliveries(data);

      // Center on the first pending delivery coordinates if possible
      const nextPending = data.find((d: any) => d.status === 'pending');
      if (nextPending && nextPending.customerId?.lat && nextPending.customerId?.lon) {
        setCenter([nextPending.customerId.lat, nextPending.customerId.lon]);
      } else if (data.length > 0 && data[0].customerId?.lat && data[0].customerId?.lon) {
        setCenter([data[0].customerId.lat, data[0].customerId.lon]);
      }
    } catch (err) {
      console.error('Error fetching route map deliveries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  // Filter out deliveries with valid coordinates
  const deliveriesWithCoords = deliveries.filter(
    d => d.customerId?.lat && d.customerId?.lon
  );

  // Next pending stop
  const nextStop = deliveries.find(d => d.status === 'pending');

  // Route path coordinates list
  const pathCoordinates = deliveriesWithCoords.map(d => [
    d.customerId.lat,
    d.customerId.lon,
  ]) as [number, number][];

  if (loading) {
    return (
      <div className="bg-slate-900 min-h-screen flex items-center justify-center text-white">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500 mx-auto" />
          <p className="font-bold text-sm text-slate-400">Loading Map Route...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full absolute inset-0 bg-slate-900">
      
      {/* Map Area */}
      <div className="flex-1 relative z-10">
        {deliveriesWithCoords.length > 0 ? (
          <MapContainer 
            center={center} 
            zoom={14} 
            style={{ height: '100%', width: '100%', background: '#0f172a' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Draw Path connecting stops */}
            {pathCoordinates.length > 1 && (
              <Polyline 
                positions={pathCoordinates} 
                color="#f59e0b" 
                weight={4} 
                dashArray="5, 10"
              />
            )}

            {/* Display Markers */}
            {deliveriesWithCoords.map((d, index) => {
              const isNext = nextStop && nextStop._id === d._id;
              const pos: [number, number] = [d.customerId.lat, d.customerId.lon];

              return (
                <Marker 
                  key={d._id} 
                  position={pos} 
                  icon={isNext ? activeCustomerIcon : customerIcon}
                >
                  <Popup>
                    <div className="text-slate-900 font-bold p-1">
                      <p className="text-xs uppercase tracking-widest text-slate-500">Stop #{index + 1}</p>
                      <p className="text-sm font-black">{d.customerId.name}</p>
                      <p className="text-[10px] text-slate-500">{d.customerId.address}</p>
                      <p className="text-xs text-amber-600 font-bold mt-1">Quantity: {d.quantity} L</p>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        ) : (
          <div className="h-full w-full flex items-center justify-center text-slate-500 font-bold">
            No coordinates found for today's deliveries.
          </div>
        )}
      </div>

      {/* Info Card Overlay at the Bottom */}
      <div className="absolute bottom-20 left-0 w-full px-4 z-20">
        {nextStop ? (
          <div className="bg-slate-800 rounded-3xl p-5 shadow-2xl border border-slate-700/80 w-full animate-in slide-in-from-bottom-5">
            <div className="flex justify-between items-start gap-4">
              <div className="min-w-0">
                <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest block mb-1">
                  Next Destination
                </span>
                <h3 className="font-extrabold text-lg text-white truncate">
                  {nextStop.customerId?.name}
                </h3>
                <p className="text-slate-400 text-xs truncate mt-0.5">
                  {nextStop.customerId?.address || 'No address details'}
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="block font-black text-amber-500 text-xl">{nextStop.quantity} L</span>
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Morning</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-700/50 flex gap-3">
              {nextStop.customerId?.lat && nextStop.customerId?.lon && (
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${nextStop.customerId.lat},${nextStop.customerId.lon}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 h-11 bg-slate-700 hover:bg-slate-600 text-white text-xs font-black rounded-xl flex items-center justify-center gap-1 active:scale-95 transition-all border border-slate-600"
                >
                  <Navigation className="h-3.5 w-3.5 fill-white" /> Navigate
                </a>
              )}
              <Link
                to={`/delivery-app/confirm/${nextStop._id}`}
                className="flex-1 h-11 bg-amber-500 hover:bg-amber-400 text-slate-900 text-xs font-black rounded-xl flex items-center justify-center gap-1 active:scale-95 transition-all shadow-lg shadow-amber-500/15"
              >
                Deliver Now <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-slate-800 rounded-3xl p-5 shadow-2xl border border-slate-700/80 w-full text-center">
            <div className="h-12 w-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3">
              <Package className="h-6 w-6" />
            </div>
            <h2 className="text-white font-black text-lg">Shift Completed!</h2>
            <p className="text-slate-400 text-xs mt-0.5">All deliveries have been handled successfully.</p>
          </div>
        )}
      </div>
      
    </div>
  );
}
