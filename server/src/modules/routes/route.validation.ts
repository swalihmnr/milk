import { z } from 'zod';

export const createRouteSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Route name is required'),
    area: z.string().min(2, 'Area is required'),
    deliveryBoyId: z.string().optional()
  })
});

export const updateRouteSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    area: z.string().optional(),
    deliveryBoyId: z.string().optional(),
    status: z.enum(['active', 'inactive']).optional()
  })
});
