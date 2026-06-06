import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Loader2, Navigation, X } from 'lucide-react';

interface NominatimResult {
  place_id: number;
  display_name: string;
  address: {
    house_number?: string;
    road?: string;
    village?: string;
    town?: string;
    suburb?: string;
    city?: string;
    district?: string;
    county?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
  lat: string;
  lon: string;
}

export type ParsedAddress = {
  displayName: string;
  houseNumber: string;
  road: string;
  village: string;
  city: string;
  state: string;
  postcode: string;
  lat: number;
  lon: number;
};

interface AddressAutocompleteProps {
  onSelect: (address: ParsedAddress) => void;
  placeholder?: string;
  error?: string;
  autoDetect?: boolean;
  triggerGPS?: number;
}

// Debounce helper
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function parseResult(r: NominatimResult): ParsedAddress {
  const a = r.address;
  return {
    displayName: r.display_name,
    houseNumber: a.house_number || '',
    road: a.road || '',
    village: a.village || a.suburb || a.town || '',
    city: a.city || a.town || a.district || a.county || '',
    state: a.state || '',
    postcode: a.postcode || '',
    lat: parseFloat(r.lat),
    lon: parseFloat(r.lon),
  };
}

export default function AddressAutocomplete({ onSelect, placeholder = 'Search farm address...', error, autoDetect, triggerGPS }: AddressAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState('');
  const [locating, setLocating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const debouncedQuery = useDebounce(query, 350);

  // Auto-detect on mount or trigger
  useEffect(() => {
    if (autoDetect || triggerGPS) {
      handleGPS();
    }
  }, [autoDetect, triggerGPS]);

  // Fetch suggestions
  useEffect(() => {
    if (debouncedQuery.length < 3 || selected === debouncedQuery) {
      setResults([]);
      setOpen(false);
      return;
    }

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    const params = new URLSearchParams({
      q: debouncedQuery,
      format: 'json',
      addressdetails: '1',
      limit: '6',
      countrycodes: 'in',
    });

    fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
      signal: abortRef.current.signal,
      headers: { 'Accept-Language': 'en' },
    })
      .then(r => r.json())
      .then((data: NominatimResult[]) => {
        setResults(data);
        setOpen(data.length > 0);
        setLoading(false);
      })
      .catch(err => {
        if (err.name !== 'AbortError') setLoading(false);
      });

    return () => abortRef.current?.abort();
  }, [debouncedQuery]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = useCallback((r: NominatimResult) => {
    const parsed = parseResult(r);
    // Show a clean short label in the input
    const shortLabel = [parsed.village, parsed.city, parsed.state].filter(Boolean).join(', ');
    setQuery(shortLabel);
    setSelected(shortLabel);
    setOpen(false);
    setResults([]);
    onSelect(parsed);
  }, [onSelect]);

  // GPS auto-detect
  const handleGPS = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        const params = new URLSearchParams({ lat: String(lat), lon: String(lon), format: 'json', addressdetails: '1' });
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?${params}`, { headers: { 'Accept-Language': 'en' } });
          const data: NominatimResult = await res.json();
          const parsed = parseResult(data);
          
          // CRITICAL FIX: Keep the exact user GPS coordinates, 
          // don't let the map API snap it to the city center!
          parsed.lat = lat;
          parsed.lon = lon;

          const shortLabel = [parsed.village, parsed.city, parsed.state].filter(Boolean).join(', ');
          setQuery(shortLabel);
          setSelected(shortLabel);
          onSelect(parsed);
        } catch { /* silent */ }
        setLocating(false);
      },
      (err) => {
        console.error("GPS Error:", err);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleClear = () => {
    setQuery('');
    setSelected('');
    setResults([]);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Input */}
      <div className="relative">
        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setSelected(''); }}
          placeholder={placeholder}
          className={`w-full pl-10 pr-20 h-12 bg-gray-50 border rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:bg-white transition-colors ${
            error ? 'border-red-400 bg-red-50 focus:ring-red-300' : 'border-gray-200 focus:border-[#0052cc] focus:ring-[#0052cc]/20'
          } ${selected ? 'border-green-400 bg-green-50/30' : ''}`}
          autoComplete="off"
        />
        {/* Right icons */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {loading && <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />}
          {query && !loading && (
            <button type="button" onClick={handleClear} className="p-1 text-gray-400 hover:text-gray-600 rounded">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={handleGPS}
            disabled={locating}
            title="Detect my location"
            className="p-1.5 rounded-lg bg-[#0052cc]/10 text-[#0052cc] hover:bg-[#0052cc]/20 transition-colors disabled:opacity-50"
          >
            {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Selected confirmation badge */}
      {selected && (
        <div className="flex items-center gap-1.5 mt-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
          <span className="text-xs text-green-700 font-medium">Address verified via OpenStreetMap</span>
        </div>
      )}

      {/* Error */}
      {error && !selected && (
        <p className="text-xs text-red-500 mt-1">⚠ {error}</p>
      )}

      {/* Dropdown */}
      {open && results.length > 0 && (
        <div className="absolute z-50 top-[calc(100%+6px)] left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
          <div className="px-3 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Select your address</span>
            <span className="text-[10px] text-gray-400">Powered by OpenStreetMap</span>
          </div>
          <ul className="max-h-64 overflow-y-auto divide-y divide-gray-50">
            {results.map((r) => {
              const p = parseResult(r);
              return (
                <li key={r.place_id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(r)}
                    className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors flex items-start gap-3 group"
                  >
                    <MapPin className="h-4 w-4 text-gray-300 group-hover:text-[#0052cc] flex-shrink-0 mt-0.5 transition-colors" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {[p.village, p.city].filter(Boolean).join(', ') || 'Location'}
                      </p>
                      <p className="text-xs text-gray-400 truncate mt-0.5">{p.state} • {p.displayName.split(',').slice(-3).join(',').trim()}</p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
