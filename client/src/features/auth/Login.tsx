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
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [selectedRole, setSelectedRole] = useState<'farmer' | 'customer'>('farmer');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setServerError('');
    try {
      await api.post('/auth/login', { ...data, role: selectedRole });
      // Redirect based on role
      navigate(selectedRole === 'customer' ? '/my-app' : '/dashboard');
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
                { value: 'farmer' as const, label: '🌾 Dairy Farmer', desc: 'Farm portal' },
                { value: 'customer' as const, label: '🛍️ Customer', desc: 'Delivery portal' },
              ].map(({ value, label, desc }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSelectedRole(value)}
                  className={`flex flex-col items-center py-2.5 px-3 rounded-lg transition-all duration-150 text-center ${
                    selectedRole === value
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

          {/* Social / Demo button */}
          <button className="w-full h-12 border border-gray-200 bg-white rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm flex items-center justify-center gap-2">
            <span className="text-base">🐄</span>
            Demo Account (farmer@demo.com)
          </button>

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
        </div>
      </div>
    </div>
  );
}
