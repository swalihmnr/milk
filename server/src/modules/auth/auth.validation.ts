import { z } from 'zod';

export const signupSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    phone: z.string().min(10, 'Phone must be at least 10 characters'),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.string().min(2, 'Role is required')
  })
});

export const loginSchema = z.object({
  body: z.object({
    phone: z.string().min(10, 'Phone is required'),
    password: z.string().min(6, 'Password is required')
  })
});

export const otpLoginSchema = z.object({
  body: z.object({
    phone: z.string().min(10, 'Phone is required'),
    otp: z.string().length(6, 'OTP must be 6 digits')
  })
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    phone: z.string().min(10, 'Phone is required')
  })
});

export const resetPasswordSchema = z.object({
  body: z.object({
    phone: z.string().min(10, 'Phone is required'),
    otp: z.string().length(6, 'OTP must be 6 digits'),
    password: z.string().min(6, 'Password must be at least 6 characters')
  })
});
