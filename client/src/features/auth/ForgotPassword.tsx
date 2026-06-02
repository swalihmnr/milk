import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { Phone, Lock, ArrowRight, ArrowLeft, Droplets, Shield, KeyRound, CheckCircle2, RotateCcw } from 'lucide-react';

// Validation schemas
const phoneSchema = z.object({
  phone: z.string().min(10, 'Enter a valid phone number'),
});

const resetSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PhoneForm = z.infer<typeof phoneSchema>;
type ResetForm = z.infer<typeof resetSchema>;

const OTP_TTL_SECONDS = 600; // 10 minutes
const STORAGE_KEY = 'forgot_password_otp_target';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState('');
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  const phoneForm = useForm<PhoneForm>({ resolver: zodResolver(phoneSchema) });
  const resetForm = useForm<ResetForm>({ resolver: zodResolver(resetSchema) });

  // Timer logic
  useEffect(() => {
    const calculateTimeLeft = () => {
      const targetTimeStr = localStorage.getItem(STORAGE_KEY);
      if (targetTimeStr) {
        const targetTime = parseInt(targetTimeStr, 10);
        const current = new Date().getTime();
        const diff = Math.floor((targetTime - current) / 1000);
        return diff > 0 ? diff : 0;
      }
      return 0;
    };

    if (step === 2) {
      setTimeLeft(calculateTimeLeft());
      const timer = setInterval(() => {
        const newTimeLeft = calculateTimeLeft();
        setTimeLeft(newTimeLeft);
        if (newTimeLeft <= 0) {
          clearInterval(timer);
          localStorage.removeItem(STORAGE_KEY);
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step]);

  const startTimer = () => {
    const targetTime = new Date().getTime() + OTP_TTL_SECONDS * 1000;
    localStorage.setItem(STORAGE_KEY, targetTime.toString());
    setTimeLeft(OTP_TTL_SECONDS);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const onPhoneSubmit = async (data: PhoneForm) => {
    setServerError('');
    setIsLoading(true);
    try {
      // If timer is active from a previous request for the SAME flow, we could skip this,
      // but usually users click "Request OTP" again if they reload step 1.
      // We will ALWAYS request a new OTP if they are on Step 1 submitting phone.
      const res = await api.post('/auth/forgot-password', data);
      
      // Optionally show the OTP in development
      if (res.data.otp) {
        console.log('DEV ONLY - OTP is:', res.data.otp);
      }

      setPhone(data.phone);
      startTimer();
      setStep(2);
    } catch (error: any) {
      setServerError(error?.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const onResetSubmit = async (data: ResetForm) => {
    setServerError('');
    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', {
        phone,
        otp: data.otp,
        password: data.password
      });
      localStorage.removeItem(STORAGE_KEY);
      setSuccessMessage('Password reset successfully. You can now log in.');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error: any) {
      setServerError(error?.response?.data?.message || 'Invalid or expired OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setServerError('');
    setIsLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { phone });
      if (res.data.otp) {
        console.log('DEV ONLY - Resent OTP is:', res.data.otp);
      }
      startTimer();
    } catch (error: any) {
      setServerError(error?.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* ── Left Panel ── */}
      <div className="hidden lg:flex lg:w-[52%] bg-gradient-to-br from-[#0052cc] to-[#003d99] flex-col justify-between p-12 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-white blur-3xl mix-blend-overlay" />
          <div className="absolute bottom-10 left-10 w-72 h-72 rounded-full bg-blue-400 blur-3xl mix-blend-overlay" />
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <Link to="/login" className="flex items-center gap-3 w-max group">
            <div className="h-10 w-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center transition-transform group-hover:scale-105">
              <Droplets className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-none">Embaric DairyOS</p>
              <p className="text-blue-200 text-xs">Enterprise Portal</p>
            </div>
          </Link>
        </div>

        {/* Headline */}
        <div className="relative z-10 space-y-8">
          <div>
            <div className="h-14 w-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/20">
              <KeyRound className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white leading-tight mb-4">
              Secure Account <br />
              <span className="text-blue-200">Recovery.</span>
            </h1>
            <p className="text-blue-100 text-lg leading-relaxed max-w-md">
              We ensure your farm data is protected. Use your registered mobile number to securely reset your password.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Shield className="h-5 w-5 text-green-300" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Bank-Grade Security</p>
              <p className="text-blue-200 text-xs">256-bit encryption for all operations</p>
            </div>
          </div>
        </div>
        
        {/* Placeholder spacer */}
        <div />
      </div>

      {/* ── Right Panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-[#f8fafc] relative">
        <div className="w-full max-w-md relative z-10">
          
          <Link to="/login" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-8 group">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back to login
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {step === 1 ? 'Forgot Password?' : 'Reset Password'}
            </h2>
            <p className="text-gray-500">
              {step === 1 
                ? 'Enter your registered phone number to receive an OTP.'
                : `We sent a 6-digit code to +91 ${phone}`
              }
            </p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-4 rounded-2xl text-sm flex items-start gap-3 shadow-sm animate-in slide-in-from-top-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{successMessage}</p>
                <p className="text-green-600/80 text-xs mt-1">Redirecting to login...</p>
              </div>
            </div>
          )}

          {/* Server error */}
          {serverError && !successMessage && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm flex items-center gap-2 shadow-sm animate-in fade-in">
              <div className="h-2 w-2 rounded-full bg-red-500 flex-shrink-0" />
              {serverError}
            </div>
          )}

          {!successMessage && step === 1 && (
            <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">Phone Number</Label>
                <div className="relative group">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-[#0052cc] transition-colors" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    className={`pl-10 h-12 bg-white border-gray-200 shadow-sm rounded-xl focus:border-[#0052cc] focus:ring-[#0052cc] text-gray-900 placeholder:text-gray-400 transition-shadow ${phoneForm.formState.errors.phone ? 'border-red-400 ring-1 ring-red-400' : ''}`}
                    {...phoneForm.register('phone')}
                  />
                </div>
                {phoneForm.formState.errors.phone && <p className="text-xs text-red-500 font-medium">⚠ {phoneForm.formState.errors.phone.message}</p>}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-[#0052cc] hover:bg-blue-800 text-white font-semibold rounded-xl shadow-md shadow-blue-500/20 transition-all duration-200 flex items-center justify-center gap-2 mt-4 group"
              >
                {isLoading ? (
                  <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <>Send OTP <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></>
                )}
              </Button>
            </form>
          )}

          {!successMessage && step === 2 && (
            <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label htmlFor="otp" className="text-sm font-semibold text-gray-700">6-Digit OTP</Label>
                  <span className={`text-xs font-mono font-medium px-2 py-0.5 rounded-md ${timeLeft <= 30 ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-[#0052cc]'}`}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
                <Input
                  id="otp"
                  type="text"
                  maxLength={6}
                  placeholder="• • • • • •"
                  className={`h-12 text-center text-lg tracking-[0.5em] font-medium bg-white border-gray-200 shadow-sm rounded-xl focus:border-[#0052cc] focus:ring-[#0052cc] text-gray-900 transition-shadow ${resetForm.formState.errors.otp ? 'border-red-400 ring-1 ring-red-400' : ''}`}
                  {...resetForm.register('otp')}
                />
                {resetForm.formState.errors.otp && <p className="text-xs text-red-500 font-medium">⚠ {resetForm.formState.errors.otp.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-semibold text-gray-700">New Password</Label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-[#0052cc] transition-colors" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter new password"
                    className={`pl-10 h-12 bg-white border-gray-200 shadow-sm rounded-xl focus:border-[#0052cc] focus:ring-[#0052cc] text-gray-900 transition-shadow ${resetForm.formState.errors.password ? 'border-red-400 ring-1 ring-red-400' : ''}`}
                    {...resetForm.register('password')}
                  />
                </div>
                {resetForm.formState.errors.password && <p className="text-xs text-red-500 font-medium">⚠ {resetForm.formState.errors.password.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">Confirm Password</Label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-[#0052cc] transition-colors" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    className={`pl-10 h-12 bg-white border-gray-200 shadow-sm rounded-xl focus:border-[#0052cc] focus:ring-[#0052cc] text-gray-900 transition-shadow ${resetForm.formState.errors.confirmPassword ? 'border-red-400 ring-1 ring-red-400' : ''}`}
                    {...resetForm.register('confirmPassword')}
                  />
                </div>
                {resetForm.formState.errors.confirmPassword && <p className="text-xs text-red-500 font-medium">⚠ {resetForm.formState.errors.confirmPassword.message}</p>}
              </div>

              <div className="pt-2 flex flex-col gap-3">
                <Button
                  type="submit"
                  disabled={isLoading || timeLeft === 0}
                  className="w-full h-12 bg-[#0052cc] hover:bg-blue-800 text-white font-semibold rounded-xl shadow-md shadow-blue-500/20 transition-all duration-200 group"
                >
                  {isLoading ? (
                    <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  ) : (
                    <>Reset Password <CheckCircle2 className="h-4 w-4 ml-2 transition-transform group-hover:scale-110" /></>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResend}
                  disabled={timeLeft > 0 || isLoading}
                  className="w-full h-12 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl border-gray-200 transition-all duration-200 group"
                >
                  {isLoading && timeLeft === 0 ? (
                    <span className="h-4 w-4 rounded-full border-2 border-gray-400 border-t-transparent animate-spin" />
                  ) : (
                    <><RotateCcw className={`h-4 w-4 mr-2 ${timeLeft === 0 ? 'text-[#0052cc]' : 'text-gray-400'} transition-transform group-hover:-rotate-90`} /> Resend OTP</>
                  )}
                </Button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
