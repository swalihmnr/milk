import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { Eye, EyeOff, Phone, Lock, ArrowRight, Droplets, TrendingUp, Users, Shield, Tractor } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const loginSchema = z.object({
  phone: z.string().min(10, 'Enter a valid phone number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

const features = [
  { icon: Droplets, label: 'Smart Milk Tracking', desc: 'Monitor daily yield across your entire herd' },
  { icon: TrendingUp, label: 'Revenue Analytics', desc: 'Real-time financial insights and forecasting' },
  { icon: Users, label: 'Customer Management', desc: 'Manage subscriptions, routes, and billing' },
  { icon: Shield, label: 'Enterprise Security', desc: 'Bank-grade data protection for your farm' },
];

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [selectedRole, setSelectedRole] = useState<'farmer' | 'customer'>('farmer');

  const demoPortals = [
    {
      name: 'Farmer ERP',
      desc: 'Herd, production & yields',
      icon: '🌾',
      path: '/dashboard',
      role: 'farmer',
      userData: {
        _id: 'mock_farmer_id',
        name: 'Arjun Sunrise',
        phone: '9876543210',
        role: 'farmer' as const,
        farmName: 'Sunrise Dairy Farm',
        herdSize: 45
      }
    },
    {
      name: 'Customer App',
      desc: 'Subscriptions & Calendar',
      icon: '🛍️',
      path: '/my-app',
      role: 'customer',
      userData: {
        _id: 'mock_customer_id',
        name: 'Aditya Sen',
        phone: '9999988888',
        role: 'customer' as const
      }
    },
    {
      name: 'Delivery App',
      desc: 'Route Maps & Earnings',
      icon: '🚚',
      path: '/delivery-app',
      role: 'delivery',
      userData: {
        _id: 'mock_delivery_id',
        name: 'Rajesh Kumar',
        phone: '9555544444',
        role: 'delivery' as const
      }
    },
    {
      name: 'Platform Admin',
      desc: 'Approvals & Logs',
      icon: '🛡️',
      path: '/admin-app',
      role: 'admin',
      userData: {
        _id: 'mock_admin_id',
        name: 'Super Admin',
        phone: '9000000000',
        role: 'admin' as const
      }
    },
    {
      name: 'Vendor Panel',
      desc: 'Milk plans & CRM',
      icon: '🏪',
      path: '/vendor-app',
      role: 'vendor',
      userData: {
        _id: 'mock_vendor_id',
        name: 'Green Meadows Inc',
        phone: '9111122222',
        role: 'vendor' as const,
        vendorId: 'vendor_001'
      }
    },
    {
      name: 'Veterinary Desk',
      desc: 'Cattle consultations',
      icon: '🩺',
      path: '/vet-app',
      role: 'vet',
      userData: {
        _id: 'mock_vet_id',
        name: 'Dr. Sarah Verghese',
        phone: '9333322222',
        role: 'vet' as const,
        farmName: 'Veterinary Care Unit'
      }
    }
  ];

  const handleQuickLogin = (portal: typeof demoPortals[0]) => {
    localStorage.setItem('mockUser', JSON.stringify(portal.userData));
    localStorage.setItem('token', 'mock-token-' + encodeURIComponent(JSON.stringify(portal.userData)));
    login(portal.userData as any);
    navigate(portal.path);
  };

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setServerError('');
    try {
      const response = await api.post('/auth/login', { ...data, role: selectedRole });
      const loggedInUser = response.data.user;
      login(loggedInUser);
      
      const role = loggedInUser.roles?.[0] || loggedInUser.role;
      if (role === 'customer') navigate('/my-app');
      else if (role === 'delivery' || role === 'delivery_boy') navigate('/delivery-app');
      else if (role === 'vendor') navigate('/vendor-app');
      else if (role === 'vet') navigate('/vet-app');
      else if (role === 'admin') navigate('/admin-app');
      else navigate('/dashboard');
    } catch (error: any) {
      setServerError(error?.response?.data?.message || 'Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* ── Left Panel ── */}
      <div className="hidden lg:flex lg:w-[52%] bg-[#0052cc] flex-col justify-between p-12 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute top-1/3 -right-32 w-80 h-80 bg-white/5 rounded-full" />
        <div className="absolute -bottom-20 left-1/4 w-64 h-64 bg-white/5 rounded-full" />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <Droplets className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-none">Embaric DairyOS</p>
              <p className="text-blue-200 text-xs">Enterprise Portal</p>
            </div>
          </div>
        </div>

        {/* Headline */}
        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-5xl font-bold text-white leading-tight mb-4">
              Dairy operations,<br />
              <span className="text-blue-200">reimagined.</span>
            </h1>
            <p className="text-blue-100 text-lg leading-relaxed max-w-md">
              The enterprise platform powering modern dairy farms — from herd health to customer delivery.
            </p>
          </div>

          {/* Feature list */}
          <div className="grid grid-cols-1 gap-4">
            {features.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-start gap-3">
                <div className="h-8 w-8 bg-white/15 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{label}</p>
                  <p className="text-blue-200 text-xs">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <div className="relative z-10 bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
          <p className="text-white text-sm leading-relaxed italic">
            "DairyOS cut our billing time by 80% and gave us full visibility into every delivery. It's the backbone of our operation."
          </p>
          <div className="flex items-center gap-3 mt-3">
            <div className="h-8 w-8 rounded-full bg-blue-400/40 flex items-center justify-center text-white font-bold text-xs">AK</div>
            <div>
              <p className="text-white font-semibold text-xs">Arjun Kumar</p>
              <p className="text-blue-200 text-xs">Owner, Sunrise Dairy Farm</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-[#f8fafc]">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="h-9 w-9 bg-[#0052cc] rounded-xl flex items-center justify-center">
              <Droplets className="h-5 w-5 text-white" />
            </div>
            <p className="text-gray-900 font-bold text-lg">Embaric DairyOS</p>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h2>
            <p className="text-gray-500">Sign in to your enterprise account</p>
          </div>

          {/* Server error */}
          {serverError && (
            <div className="mb-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-red-500 flex-shrink-0" />
              {serverError}
            </div>
          )}

          {/* Role Selector */}
          <div className="space-y-1.5 mb-5">
            <Label className="text-sm font-semibold text-gray-700">Sign in as</Label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
              {[
                { value: 'farmer' as const, label: '🌾 Farmer', desc: 'Farm portal' },
                { value: 'customer' as const, label: '🛍️ Customer', desc: 'Shop portal' },
              ].map(({ value, label, desc }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSelectedRole(value as any)}
                  className={`flex flex-col items-center py-2.5 px-2 rounded-lg transition-all duration-150 text-center ${
                    selectedRole === value
                      ? 'bg-white shadow-sm text-[#0052cc] border border-gray-200'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <span className="text-sm font-semibold whitespace-nowrap">{label}</span>
                  <span className="text-[10px] text-gray-400 mt-0.5 whitespace-nowrap">{desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Phone */}
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">
                Phone Number
              </Label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  className={`pl-10 h-12 bg-white border-gray-200 shadow-sm rounded-xl focus:border-[#0052cc] focus:ring-[#0052cc] text-gray-900 placeholder:text-gray-400 ${errors.phone ? 'border-red-400' : ''}`}
                  {...register('phone')}
                />
              </div>
              {errors.phone && <p className="text-xs text-red-500 flex items-center gap-1"><span>⚠</span> {errors.phone.message}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                  Password
                </Label>
                <Link to="/forgot-password" className="text-xs text-[#0052cc] hover:text-blue-800 font-medium transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className={`pl-10 pr-10 h-12 bg-white border-gray-200 shadow-sm rounded-xl focus:border-[#0052cc] focus:ring-[#0052cc] text-gray-900 placeholder:text-gray-400 ${errors.password ? 'border-red-400' : ''}`}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 flex items-center gap-1"><span>⚠</span> {errors.password.message}</p>}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-[#0052cc] hover:bg-blue-800 text-white font-semibold rounded-xl shadow-md shadow-blue-500/20 transition-all duration-200 flex items-center justify-center gap-2 mt-2"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign In <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[#f8fafc] px-3 text-gray-400 font-medium">or continue with</span>
            </div>
          </div>

          {/* Quick Access Demo Portals Grid */}
          <div className="space-y-3">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Quick Access Demo Portals</p>
            <div className="grid grid-cols-2 gap-2">
              {demoPortals.map((portal) => (
                <button
                  key={portal.name}
                  type="button"
                  onClick={() => handleQuickLogin(portal)}
                  className="bg-white border border-slate-150 hover:border-blue-500 hover:shadow-sm rounded-2xl p-3 text-left transition-all active:scale-95 group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base group-hover:scale-110 transition-transform">{portal.icon}</span>
                    <span className="text-xs font-black text-slate-800 group-hover:text-blue-600 transition-colors">{portal.name}</span>
                  </div>
                  <p className="text-[9px] font-bold text-slate-450 leading-tight">{portal.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Sign up link */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#0052cc] font-semibold hover:text-blue-800 transition-colors">
              Create free account →
            </Link>
          </p>

          <p className="text-center text-xs text-gray-400 mt-8">
            By signing in you agree to our{' '}
            <span className="text-gray-500 hover:underline cursor-pointer">Terms of Service</span>
            {' & '}
            <span className="text-gray-500 hover:underline cursor-pointer">Privacy Policy</span>
          </p>

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
            <Link to="/signup?role=delivery" className="h-8 px-4 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg flex items-center justify-center transition-colors">
              Apply Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
