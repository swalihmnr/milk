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
    deliveryLon: z.number().optional()
  }).refine((data) => {
    if (data.status === 'delivered') {
      return !!data.proofImageUrl && data.deliveryLat !== undefined && data.deliveryLon !== undefined;
    }
    return true;
  }, {
    message: "proofImageUrl, deliveryLat, and deliveryLon are required when marking as delivered",
    path: ["status"]
  })
});
