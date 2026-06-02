import { z } from 'zod';

export const createProductionSchema = z.object({
  body: z.object({
    cowId: z.string().optional(),
    date: z.string().transform(str => new Date(str)),
    morningLiters: z.number().min(0).optional(),
    eveningLiters: z.number().min(0).optional(),
    totalLiters: z.number().min(0),
    fatPercentage: z.number().min(0).max(100).optional(),
    notes: z.string().optional()
  })
});

export const updateProductionSchema = z.object({
  body: z.object({
    morningLiters: z.number().min(0).optional(),
    eveningLiters: z.number().min(0).optional(),
    totalLiters: z.number().min(0).optional(),
    fatPercentage: z.number().min(0).max(100).optional(),
    notes: z.string().optional()
  })
});
