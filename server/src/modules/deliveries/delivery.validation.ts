import { z } from 'zod';

export const createDeliverySchema = z.object({
  body: z.object({
    customerId: z.string().min(1, 'Customer ID is required'),
    routeId: z.string().min(1, 'Route ID is required'),
    deliveryBoyId: z.string().optional(),
    date: z.string().transform(str => new Date(str)),
    shift: z.enum(['morning', 'evening']),
    quantity: z.number().positive(),
    status: z.enum(['pending', 'delivered', 'missed']).optional(),
    notes: z.string().optional()
  })
});

export const updateDeliverySchema = z.object({
  body: z.object({
    status: z.enum(['pending', 'delivered', 'missed']).optional(),
    missedReason: z.string().optional(),
    quantity: z.number().positive().optional(),
    notes: z.string().optional(),
    proofImageUrl: z.string().optional(),
    deliveryLat: z.number().optional(),
    deliveryLon: z.number().optional(),
    handoverOtp: z.string().optional()
  })
});
