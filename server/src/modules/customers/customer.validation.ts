import { z } from 'zod';

export const createCustomerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name is required'),
    phone: z.string().min(10, 'Phone is required'),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    address: z.string().min(5, 'Address is required'),
    houseName: z.string().optional(),
    street: z.string().optional(),
    area: z.string().optional(),
    city: z.string().min(2, 'City is required'),
    district: z.string().min(2, 'District is required'),
    state: z.string().min(2, 'State is required'),
    pincode: z.string().min(6, 'Pincode is required'),
    landmark: z.string().optional(),
    notes: z.string().optional(),
  })
});

export const updateCustomerSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
    address: z.string().optional(),
    city: z.string().optional(),
    district: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional(),
    status: z.enum(['active', 'inactive']).optional(),
    notes: z.string().optional(),
  })
});
