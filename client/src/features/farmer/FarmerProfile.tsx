import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, MapPin, Home, Tractor, Save, Loader2, CheckCircle2, Camera, Navigation } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import FarmMapPicker from '@/components/ui/FarmMapPicker';
import type { MapCoords } from '@/components/ui/FarmMapPicker';

export default function FarmerProfile() {
  const { user, login } = useAuth();

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    farmName: user?.farmName || '',
    addressLine: user?.addressLine || '',
    village: user?.village || '',
    city: user?.city || '',
    state: user?.state || '',
    herdSize: user?.herdSize || '',
    lat: user?.lat || null as number | null,
    lon: user?.lon || null as number | null,
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [mapCenter, setMapCenter] = useState<MapCoords | undefined>(
    user?.lat && user?.lon ? { lat: user.lat, lon: user.lon } : undefined
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setSaved(false);
  };

  const handleMapChange = (coords: MapCoords) => {
    setForm((prev) => ({ ...prev, lat: coords.lat, lon: coords.lon }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put('/auth/profile', form);
      // Update context with fresh data
      login({ ...user!, ...res.data.data });
      setSaved(true);
      toast.success('Profile updated successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  const inputCls = 'w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-[#0052cc] focus:ring-4 focus:ring-[#0052cc]/10 transition-all placeholder:text-gray-400';
  const labelCls = 'block text-xs font-black text-gray-500 uppercase tracking-widest mb-2';

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      {/* Header Card */}
      <div className="bg-gradient-to-br from-[#0052cc] to-[#0073e6] rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl shadow-blue-500/20">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl" />
        <div className="absolute -left-8 -bottom-16 w-48 h-48 bg-white opacity-5 rounded-full blur-2xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
          {/* Avatar */}
          <div className="relative group w-fit">
            <div className="h-24 w-24 rounded-3xl bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center text-3xl font-black text-white shadow-lg">
              {initials}
            </div>
            <div className="absolute inset-0 rounded-3xl bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-all">
              <Camera className="h-6 w-6 text-white" />
            </div>
          </div>

          <div>
            <p className="text-blue-100 font-bold text-xs uppercase tracking-widest mb-1">Farmer Profile</p>
            <h1 className="text-3xl font-black">{user?.name || 'Your Name'}</h1>
            <p className="text-blue-100 text-sm mt-1 font-medium">{user?.farmName || 'Add your farm name below'}</p>
            <div className="flex items-center gap-4 mt-3 text-sm text-blue-100 font-medium">
              {user?.phone && (
                <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />{user.phone}</span>
              )}
              {user?.email && (
                <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />{user.email}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Personal Info */}
        <Card className="border-gray-100 shadow-sm rounded-[2rem]">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-xl font-black text-gray-900 flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-50 rounded-2xl flex items-center justify-center">
                <User className="h-5 w-5 text-[#0052cc]" />
              </div>
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="px-8 pb-8 space-y-5">
            <div>
              <label className={labelCls}>Full Name</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Your full name" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Phone Number</label>
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="+91 XXXXX XXXXX" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Email Address</label>
              <input name="email" value={form.email} onChange={handleChange} placeholder="your@email.com" className={inputCls} type="email" />
            </div>
          </CardContent>
        </Card>

        {/* Farm Info */}
        <Card className="border-gray-100 shadow-sm rounded-[2rem]">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-xl font-black text-gray-900 flex items-center gap-3">
              <div className="h-10 w-10 bg-green-50 rounded-2xl flex items-center justify-center">
                <Tractor className="h-5 w-5 text-green-600" />
              </div>
              Farm Details
            </CardTitle>
          </CardHeader>
          <CardContent className="px-8 pb-8 space-y-5">
            <div>
              <label className={labelCls}>Farm Name</label>
              <input name="farmName" value={form.farmName} onChange={handleChange} placeholder="e.g. Shree Krishna Dairy Farm" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Herd Size (No. of Cows)</label>
              <input name="herdSize" value={form.herdSize} onChange={handleChange} placeholder="e.g. 25" className={inputCls} type="number" min="0" />
            </div>
          </CardContent>
        </Card>

        {/* Farm Address & Map */}
        <Card className="border-gray-100 shadow-sm rounded-[2rem] lg:col-span-2 overflow-hidden">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-xl font-black text-gray-900 flex items-center gap-3">
              <div className="h-10 w-10 bg-orange-50 rounded-2xl flex items-center justify-center">
                <MapPin className="h-5 w-5 text-orange-500" />
              </div>
              Farm Address & Location
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="px-8 pb-4 space-y-5">
              <div>
                <label className={labelCls}>Address Line</label>
                <input name="addressLine" value={form.addressLine} onChange={handleChange} placeholder="House No., Street, Landmark" className={inputCls} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>Village / Area</label>
                  <input name="village" value={form.village} onChange={handleChange} placeholder="Village name" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>City / Town</label>
                  <input name="city" value={form.city} onChange={handleChange} placeholder="City" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>State</label>
                  <input name="state" value={form.state} onChange={handleChange} placeholder="State" className={inputCls} />
                </div>
              </div>
            </div>

            {/* Map Section */}
            <div className="border-t border-gray-100 mt-4 bg-gray-50/50">
              <div className="p-8 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest">Pin Farm Location</h4>
                    <p className="text-xs text-gray-500 mt-1 font-medium">Precision location helps with route planning and deliveries.</p>
                  </div>
                </div>
                
                <div className="h-72 w-full rounded-3xl overflow-hidden border border-gray-200 shadow-inner bg-white relative">
                  <FarmMapPicker 
                    center={mapCenter} 
                    pin={form.lat && form.lon ? { lat: form.lat, lon: form.lon } : null}
                    onChange={handleMapChange} 
                  />
                </div>
                
                {form.lat && form.lon && (
                  <div className="flex items-center gap-2 text-[10px] font-bold text-blue-600 bg-blue-50 w-fit px-3 py-1.5 rounded-xl border border-blue-100">
                    <Navigation className="h-3 w-3" />
                    GPS: {form.lat.toFixed(6)}, {form.lon.toFixed(6)}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4">
        <Button
          onClick={handleSave}
          disabled={saving}
          className={`h-14 px-12 rounded-[1.5rem] font-black text-lg shadow-xl transition-all active:scale-95 ${
            saved
              ? 'bg-green-500 hover:bg-green-600 shadow-green-500/20'
              : 'bg-[#0052cc] hover:bg-[#003d99] shadow-blue-500/20'
          }`}
        >
          {saving ? (
            <><Loader2 className="h-6 w-6 animate-spin mr-3" /> Saving...</>
          ) : saved ? (
            <><CheckCircle2 className="h-6 w-6 mr-3" /> Changes Saved</>
          ) : (
            <><Save className="h-6 w-6 mr-3" /> Update Profile</>
          )}
        </Button>
      </div>
    </div>
  );
}
