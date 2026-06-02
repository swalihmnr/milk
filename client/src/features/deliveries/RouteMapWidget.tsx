// Isolated Leaflet component — loaded lazily to prevent ESM issues with Vite
import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon, DivIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Customer { _id: string; name: string; address: string; lat?: number; lon?: number; }

const selectedPin = new DivIcon({
  className: '',
  html: `<div style="background:#0052cc;width:16px;height:16px;border-radius:50%;border:2.5px solid white;box-shadow:0 2px 6px rgba(0,82,204,0.5)"></div>`,
  iconSize: [16, 16], iconAnchor: [8, 8],
});
const unselectedPin = new DivIcon({
  className: '',
  html: `<div style="background:#94a3b8;width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.2)"></div>`,
  iconSize: [14, 14], iconAnchor: [7, 7],
});

interface Props {
  customers: Customer[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}

export default function RouteMapWidget({ customers, selectedIds, onToggle }: Props) {
  const mappable = customers.filter(c => c.lat && c.lon);
  const center = useMemo<[number, number]>(() =>
    mappable.length > 0
      ? [mappable[0].lat!, mappable[0].lon!]
      : [20.5937, 78.9629],
    [mappable.length]
  );

  return (
    <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      {mappable.map(c => (
        <Marker
          key={c._id}
          position={[c.lat!, c.lon!]}
          icon={selectedIds.includes(c._id) ? selectedPin : unselectedPin}
          eventHandlers={{ click: () => onToggle(c._id) }}
        >
          <Popup><strong>{c.name}</strong><br /><span className="text-xs">{c.address}</span></Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
