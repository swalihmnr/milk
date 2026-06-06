import React, { useState, lazy, Suspense } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import AddressAutocomplete, { type ParsedAddress } from '@/components/ui/AddressAutocomplete';
import type { MapCoords } from '@/components/ui/FarmMapPicker';
import {
  Eye, EyeOff, Phone, Lock, User, ArrowRight, Droplets,
  CheckCircle2, BarChart3, Truck, Home, Hash, ChevronLeft,
  MapPin, Navigation
} from 'lucide-react';

// Lazy-load Leaflet map only on step 2 (heavy)
const FarmMapPicker = lazy(() => import('@/components/ui/FarmMapPicker'));

// ─── Left panel content per step ───────────────────────────────────────────
const STEP_META = [
  {
    step: 1,
    headline: ['Join thousands of', 'dairy farmers'],
    sub: "Modernize your dairy with tools built for India's farming community.",
    bullets: [
      { icon: CheckCircle2, text: 'Set up in under 5 minutes' },
      { icon: BarChart3,   text: 'Real-time production analytics' },
      { icon: Truck,       text: 'Automated delivery scheduling' },
      { icon: Droplets,    text: 'Herd health monitoring & alerts' },
    ],
  },
  {
    step: 2,
    headline: ['Pin your farm on', 'the map'],
    sub: 'Help us set up your delivery routes and logistics by marking your exact farm location.',
    bullets: [
      { icon: MapPin,      text: 'Precise route planning' },
      { icon: Truck,       text: 'Faster delivery scheduling' },
      { icon: Navigation,  text: 'GPS-verified farm location' },
      { icon: CheckCircle2, text: 'Coordinates stored securely' },
    ],
  },
];

// ─── Progress Indicator ─────────────────────────────────────────────────────
function StepBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <React.Fragment key={i}>
          <div className={`flex items-center justify-center h-8 w-8 rounded-full text-xs font-bold border-2 transition-all duration-300 ${
            i + 1 < current  ? 'bg-[#0052cc] border-[#0052cc] text-white'
            : i + 1 === current ? 'border-[#0052cc] text-[#0052cc] bg-white shadow-md'
            : 'border-gray-200 text-gray-400 bg-white'
          }`}>
            {i + 1 < current ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
          </div>
          {i < total - 1 && (
            <div className={`flex-1 h-0.5 rounded-full transition-all duration-500 ${i + 1 < current ? 'bg-[#0052cc]' : 'bg-gray-200'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── Shared form state ──────────────────────────────────────────────────────
interface Step1Data {
  name: string;
  phone: string;
  password: string;
  role: 'farmer' | 'customer' | 'delivery';
}
interface Step2Data {
  farmName: string;
  addressLine: string;
  village: string;
  city: string;
  state: string;
  herdSize: string;
  lat: number | null;
  lon: number | null;
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function Signup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1 state
  const searchParams = new URLSearchParams(window.location.search);
  const initialRole = (searchParams.get('role') as 'farmer' | 'customer' | 'delivery') || 'farmer';
  const [s1, setS1] = useState<Step1Data>({ name: '', phone: '', password: '', role: initialRole });
  const [showPass, setShowPass] = useState(false);
  const [s1Errors, setS1Errors] = useState<Partial<Step1Data>>({});

  // Step 2 state
  const [s2, setS2] = useState<Step2Data>({ farmName: '', addressLine: '', herdSize: '', village: '', city: '', state: '', lat: null, lon: null });
  const [mapCenter, setMapCenter] = useState<MapCoords | undefined>(undefined);
  const [pinCoords, setPinCoords] = useState<MapCoords | null>(null);

  const meta = STEP_META[step - 1];
  const totalSteps = s1.role === 'farmer' ? 2 : 1;

  // ── Step 1 Validation ───────────────────────────────────────────────────
  const validateStep1 = (): boolean => {
    const errs: Partial<Step1Data> = {};
    if (!s1.name || s1.name.trim().length < 2) errs.name = 'Full name is required';
    if (!s1.phone || s1.phone.replace(/\D/g, '').length < 10) errs.phone = 'Enter a valid 10-digit number';
    if (!s1.password || s1.password.length < 6) errs.password = 'Password must be at least 6 characters';
    setS1Errors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleStep1Next = () => {
    if (!validateStep1()) return;
    if (s1.role === 'customer' || s1.role === 'delivery') {
      // Customers and Drivers skip step 2 — submit directly
      handleFinalSubmit();
    } else {
      setStep(2);
    }
  };

  // ── Address selected from autocomplete ──────────────────────────────────
  const handleAddressSelect = (addr: ParsedAddress) => {
    const addressLine = [addr.houseNumber, addr.road].filter(Boolean).join(', ');
    setS2(prev => ({ 
      ...prev, 
      addressLine: addressLine || prev.addressLine,
      village: addr.village, 
      city: addr.city, 
      state: addr.state, 
      lat: addr.lat, 
      lon: addr.lon 
    }));
    setMapCenter({ lat: addr.lat, lon: addr.lon });
    setPinCoords({ lat: addr.lat, lon: addr.lon });
  };

  // ── Pin dragged / map clicked ────────────────────────────────────────────
  const handlePinMove = (coords: MapCoords) => {
    setPinCoords(coords);
    setS2(prev => ({ ...prev, lat: coords.lat, lon: coords.lon }));
  };

  // ── Final submit ─────────────────────────────────────────────────────────
  const handleFinalSubmit = async () => {
    setServerError('');
    setIsSubmitting(true);
    try {
      const payload = {
        name: s1.name,
        phone: s1.phone,
        password: s1.password,
        role: s1.role,
        ...(s1.role === 'farmer' && {
          farmName: s2.farmName || undefined,
          addressLine: s2.addressLine || undefined,
          herdSize: s2.herdSize || undefined,
          village: s2.village || undefined,
          city: s2.city || undefined,
          state: s2.state || undefined,
          lat: pinCoords?.lat ?? s2.lat ?? undefined,
          lon: pinCoords?.lon ?? s2.lon ?? undefined,
        }),
      };
      await api.post('/auth/signup', payload);
      if (s1.role === 'customer') navigate('/my-app');
      else if (s1.role === 'delivery') navigate('/delivery-app');
      else navigate('/dashboard');
    } catch (error: any) {
      setServerError(error?.response?.data?.message || 'Signup failed. Please try again.');
      setStep(1);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* ── Left Panel ───────────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#f0f7ff] via-[#f8fafc] to-white" />
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#0052cc]/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-[#0052cc]/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-[#0052cc] rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Droplets className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-gray-900 font-bold text-lg leading-none">Embaric DairyOS</p>
              <p className="text-gray-500 text-xs">Enterprise Portal</p>
            </div>
          </div>
        </div>

        {/* Animated content */}
        <div key={step} className="relative z-10 space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-[#0052cc] text-xs font-bold px-3 py-1.5 rounded-full mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0052cc]" />
              Step {step} of {totalSteps}
            </div>
            <h1 className="text-4xl font-bold text-gray-900 leading-tight mb-3">
              {meta.headline[0]}<br />
              <span className="text-[#0052cc]">{meta.headline[1]}</span>
            </h1>
            <p className="text-gray-500 text-base leading-relaxed max-w-sm">{meta.sub}</p>
          </div>
          <div className="space-y-3">
            {meta.bullets.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="h-7 w-7 bg-[#0052cc]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="h-3.5 w-3.5 text-[#0052cc]" />
                </div>
                <span className="text-gray-700 text-sm font-medium">{text}</span>
              </div>
            ))}
          </div>

          {/* Stats (step 1 only) */}
          {step === 1 && (
            <div className="grid grid-cols-3 gap-4">
              {[{ value: '12K+', label: 'Farmers' }, { value: '98%', label: 'Uptime' }, { value: '₹2Cr+', label: 'Tracked daily' }]
                .map(({ value, label }) => (
                  <div key={label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
                    <p className="text-xl font-bold text-gray-900">{value}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                  </div>
                ))}
            </div>
          )}
        </div>

        <div className="relative z-10">
          <p className="text-xs text-gray-400">© 2026 Embaric DairyOS. All rights reserved.</p>
        </div>
      </div>

      {/* ── Right Panel ──────────────────────────────────────────────────── */}
      <div className="flex-1 flex items-start justify-center p-6 sm:p-10 overflow-y-auto bg-white">
        <div className="w-full max-w-md py-4">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-6 lg:hidden">
            <div className="h-9 w-9 bg-[#0052cc] rounded-xl flex items-center justify-center">
              <Droplets className="h-5 w-5 text-white" />
            </div>
            <p className="text-gray-900 font-bold text-lg">Embaric DairyOS</p>
          </div>

          {/* Progress bar */}
          <StepBar current={step} total={totalSteps} />

          {/* Server error */}
          {serverError && (
            <div className="mb-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-red-500 flex-shrink-0" />
              {serverError}
            </div>
          )}

          {/* ══════════════ STEP 1 ══════════════ */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="mb-2">
                <h2 className="text-2xl font-bold text-gray-900">
                  {s1.role === 'delivery' ? 'Delivery Boy Application' : 'Create your account'}
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  {s1.role === 'delivery' ? 'Sign up to start receiving delivery jobs' : 'Start managing your dairy operations today'}
                </p>
              </div>

              {/* Role Selector (Hide if delivery) */}
              {s1.role !== 'delivery' && (
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-gray-700">I am a</Label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
                    {[
                      { value: 'farmer' as const, label: '🌾 Farmer', desc: 'Manage my farm' },
                      { value: 'customer' as const, label: '🛍️ Customer', desc: 'Buy milk daily' },
                    ].map(({ value, label, desc }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setS1(p => ({ ...p, role: value }))}
                        className={`flex flex-col items-center py-2.5 px-3 rounded-lg transition-all duration-150 text-center ${
                          s1.role === value
                            ? 'bg-white shadow-sm text-[#0052cc] border border-gray-200'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        <span className="text-sm font-semibold">{label}</span>
                        <span className="text-[10px] text-gray-400 mt-0.5">{desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Full Name */}
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-gray-700">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="e.g. Arjun Kumar"
                    value={s1.name}
                    onChange={e => setS1(p => ({ ...p, name: e.target.value }))}
                    className={`pl-10 h-12 bg-gray-50 border-gray-200 rounded-xl focus:border-[#0052cc] focus:bg-white text-gray-900 placeholder:text-gray-400 ${s1Errors.name ? 'border-red-400 bg-red-50' : ''}`}
                  />
                </div>
                {s1Errors.name && <p className="text-xs text-red-500">⚠ {s1Errors.name}</p>}
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-gray-700">Phone Number</Label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    <span className="text-sm">🇮🇳</span>
                    <span className="text-gray-300 text-xs">|</span>
                    <Phone className="h-3.5 w-3.5 text-gray-400" />
                  </div>
                  <Input
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={s1.phone}
                    onChange={e => setS1(p => ({ ...p, phone: e.target.value }))}
                    className={`pl-16 h-12 bg-gray-50 border-gray-200 rounded-xl focus:border-[#0052cc] focus:bg-white text-gray-900 placeholder:text-gray-400 ${s1Errors.phone ? 'border-red-400 bg-red-50' : ''}`}
                  />
                </div>
                {s1Errors.phone && <p className="text-xs text-red-500">⚠ {s1Errors.phone}</p>}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-gray-700">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type={showPass ? 'text' : 'password'}
                    placeholder="Min. 6 characters"
                    value={s1.password}
                    onChange={e => setS1(p => ({ ...p, password: e.target.value }))}
                    className={`pl-10 pr-10 h-12 bg-gray-50 border-gray-200 rounded-xl focus:border-[#0052cc] focus:bg-white text-gray-900 placeholder:text-gray-400 ${s1Errors.password ? 'border-red-400 bg-red-50' : ''}`}
                  />
                  <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {s1Errors.password && <p className="text-xs text-red-500">⚠ {s1Errors.password}</p>}
              </div>

              {/* CTA */}
              <Button
                onClick={handleStep1Next}
                disabled={isSubmitting}
                className="w-full h-12 bg-[#0052cc] hover:bg-blue-800 text-white font-semibold rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 mt-2"
              >
                {isSubmitting ? (
                  <><span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> Creating...</>
                ) : s1.role === 'customer' ? (
                  <>Create Account <ArrowRight className="h-4 w-4" /></>
                ) : (
                  <>Continue — Farm Setup <ArrowRight className="h-4 w-4" /></>
                )}
              </Button>

              <p className="text-xs text-gray-400 text-center leading-relaxed">
                By continuing you agree to our{' '}
                <span className="text-gray-600 underline cursor-pointer">Terms</span>
                {' & '}
                <span className="text-gray-600 underline cursor-pointer">Privacy Policy</span>
              </p>

              <div className="relative my-1">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
                <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-gray-400">already registered?</span></div>
              </div>
              <Link to="/login" className="flex items-center justify-center w-full h-11 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:border-[#0052cc] hover:text-[#0052cc] transition-colors">
                Sign in to existing account
              </Link>

              {/* Delivery Boy CTA */}
              <div className="mt-8 bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-amber-100 rounded-full flex items-center justify-center">
                    <span className="text-xl">🛵</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Do you want to be a delivery boy?</p>
                    <p className="text-xs text-gray-500">Sign up here to find nearby farm jobs.</p>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => setS1(p => ({ ...p, role: 'delivery' }))}
                  className="h-8 px-4 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg flex items-center justify-center transition-colors"
                >
                  Apply Now
                </button>
              </div>
            </div>
          )}

          {/* ══════════════ STEP 2 ══════════════ */}
          {step === 2 && (
            <div className="space-y-5">
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Farm Setup</h2>
                  <p className="text-gray-500 text-sm mt-1">Help us locate your farm for route planning</p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <ChevronLeft className="h-3.5 w-3.5" /> Back
                </button>
              </div>

              {/* Who this is for */}
              <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                <div className="h-9 w-9 rounded-full bg-[#0052cc]/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">🌾</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{s1.name}</p>
                  <p className="text-xs text-gray-500">{s1.phone} · Dairy Farmer</p>
                </div>
              </div>

              {/* Farm Name */}
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-gray-700">
                  Farm Name <span className="text-gray-400 font-normal text-xs">(optional)</span>
                </Label>
                <div className="relative">
                  <Home className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="e.g. Sunrise Dairy Farm"
                    value={s2.farmName}
                    onChange={e => setS2(p => ({ ...p, farmName: e.target.value }))}
                    className="pl-10 h-12 bg-gray-50 border-gray-200 rounded-xl focus:border-[#0052cc] focus:bg-white text-gray-900 placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* House No. / Landmark */}
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-gray-700">
                  House No. / Landmark
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="e.g. House No. 42, near Temple"
                    value={s2.addressLine}
                    onChange={e => setS2(p => ({ ...p, addressLine: e.target.value }))}
                    className="pl-10 h-12 bg-gray-50 border-gray-200 rounded-xl focus:border-[#0052cc] focus:bg-white text-gray-900 placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Herd Size */}
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-gray-700">
                  Approx. Herd Size <span className="text-gray-400 font-normal text-xs">(no. of cows)</span>
                </Label>
                <div className="relative">
                  <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="number"
                    min="1"
                    placeholder="e.g. 25"
                    value={s2.herdSize}
                    onChange={e => setS2(p => ({ ...p, herdSize: e.target.value }))}
                    className="pl-10 h-12 bg-gray-50 border-gray-200 rounded-xl focus:border-[#0052cc] focus:bg-white text-gray-900 placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Address Search */}
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-gray-700">
                  Farm Location
                  <span className="ml-2 text-[10px] font-medium text-[#0052cc] bg-blue-50 px-2 py-0.5 rounded-full">📍 Map validated</span>
                </Label>
                <AddressAutocomplete
                  onSelect={handleAddressSelect}
                  placeholder="Search village, city or pin code…"
                  autoDetect={step === 2}
                />
                <p className="text-[11px] text-gray-400">💡 Search your location, then drag the pin for precision</p>
              </div>

              {/* Auto-filled address chips */}
              {(s2.village || s2.city || s2.state) && (
                <div className="flex flex-wrap gap-2">
                  {[['Village', s2.village], ['City', s2.city], ['State', s2.state]].map(([label, val]) =>
                    val ? (
                      <div key={label} className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-1.5">
                        <span className="text-[9px] font-bold text-[#0052cc] uppercase block">{label}</span>
                        <span className="text-xs text-gray-900 font-semibold">{val}</span>
                      </div>
                    ) : null
                  )}
                </div>
              )}

              {/* Interactive Map */}
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-gray-700">
                  Exact Pin Location
                  <span className="ml-2 text-[10px] font-normal text-gray-400">Drag pin or click map</span>
                </Label>
                <Suspense fallback={
                  <div className="h-64 rounded-xl bg-gray-100 flex items-center justify-center border border-gray-200">
                    <div className="text-center space-y-2">
                      <div className="h-6 w-6 rounded-full border-2 border-[#0052cc] border-t-transparent animate-spin mx-auto" />
                      <p className="text-xs text-gray-500">Loading map…</p>
                    </div>
                  </div>
                }>
                  <FarmMapPicker center={mapCenter} onPinMove={handlePinMove} />
                </Suspense>
                {pinCoords && (
                  <p className="text-[11px] text-green-600 font-medium flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 inline-block" />
                    Pinned at {pinCoords.lat.toFixed(5)}, {pinCoords.lon.toFixed(5)}
                  </p>
                )}
              </div>

              {/* Submit */}
              <Button
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="w-full h-12 bg-[#0052cc] hover:bg-blue-800 text-white font-semibold rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <><span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> Creating account...</>
                ) : (
                  <>Complete Registration <ArrowRight className="h-4 w-4" /></>
                )}
              </Button>

              <p className="text-xs text-gray-400 text-center">
                You can update farm details anytime from your dashboard
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
