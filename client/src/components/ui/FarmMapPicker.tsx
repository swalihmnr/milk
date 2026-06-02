import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LocateFixed } from 'lucide-react';

// Fix Leaflet default icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export interface MapCoords {
  lat: number;
  lon: number;
}

interface FarmMapPickerProps {
  center?: MapCoords;
  pin?: MapCoords | null;
  onChange?: (coords: MapCoords) => void;
  onPinMove?: (coords: MapCoords) => void;
}

export default function FarmMapPicker({ center, pin, onChange, onPinMove }: FarmMapPickerProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLocating, setIsLocating] = useState(false);

  const defaultCenter: MapCoords = center ?? { lat: 20.5937, lon: 78.9629 };

  const handleLocateMe = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!('geolocation' in navigator)) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const coords = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };
        
        if (mapRef.current && markerRef.current) {
          const latlng: [number, number] = [coords.lat, coords.lon];
          markerRef.current.setLatLng(latlng);
          mapRef.current.setView(latlng, 18, { animate: true }); // Zoom in close for exact location
          markerRef.current.openPopup();
        }
        
        onChange?.(coords);
        onPinMove?.(coords);
      },
      (error) => {
        setIsLocating(false);
        console.error('Error getting exact location:', error);
        alert('Could not get your exact location. Please ensure location services are enabled in your browser/device and try again.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [defaultCenter.lat, defaultCenter.lon],
      zoom: center ? 14 : 5,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    const marker = L.marker([defaultCenter.lat, defaultCenter.lon], {
      draggable: true,
      title: 'Drag to exact location',
    }).addTo(map);

    marker.bindPopup('<b>📍 Delivery Location</b><br>Drag to set exact house').openPopup();

    marker.on('dragend', () => {
      const { lat, lng } = marker.getLatLng();
      const coords = { lat, lon: lng };
      onPinMove?.(coords);
      onChange?.(coords);
    });

    map.on('click', (e: L.LeafletMouseEvent) => {
      marker.setLatLng(e.latlng);
      const coords = { lat: e.latlng.lat, lon: e.latlng.lng };
      onPinMove?.(coords);
      onChange?.(coords);
      marker.openPopup();
    });

    mapRef.current = map;
    markerRef.current = marker;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !markerRef.current || !center) return;
    const latlng: [number, number] = [center.lat, center.lon];
    markerRef.current.setLatLng(latlng);
    mapRef.current.setView(latlng, 14, { animate: true });
    markerRef.current.openPopup();
  }, [center?.lat, center?.lon]);

  return (
    <div className="relative rounded-xl overflow-hidden border border-gray-200 shadow-sm h-full w-full">
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-[999] bg-white/90 backdrop-blur-sm border border-gray-200 text-[10px] font-bold text-gray-700 px-3 py-1 rounded-full shadow-sm whitespace-nowrap pointer-events-none uppercase tracking-wider">
        📍 Drag pin to exact house
      </div>
      <button
        type="button"
        onClick={handleLocateMe}
        disabled={isLocating}
        title="Get my exact location"
        className="absolute bottom-4 right-4 z-[999] bg-white text-blue-600 p-2.5 rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 hover:text-blue-700 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all flex items-center justify-center"
      >
        <LocateFixed className={`w-5 h-5 ${isLocating ? 'animate-pulse text-blue-400' : ''}`} />
      </button>
      <div ref={containerRef} className="h-full w-full min-h-[180px] z-0" />
    </div>
  );
}
