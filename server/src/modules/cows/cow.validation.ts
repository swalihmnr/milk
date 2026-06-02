import { z } from 'zod';

export const createCowSchema = z.object({
  body: z.object({
    cowCode: z.string().min(1, 'Cow Code is required'),
    breed: z.string().min(2, 'Breed is required'),
    age: z.number().positive(),
    purchaseOrBirthDate: z.string().transform(str => new Date(str)),
    healthStatus: z.enum(['healthy', 'sick', 'pregnant', 'dry']).optional(),
    pregnancyStatus: z.string().optional(),
    averageMilkOutput: z.number().min(0).optional(),
    feedType: z.string().optional(),
    vetName: z.string().optional(),
    notes: z.string().optional()
  })
});

export const updateCowSchema = z.object({
  body: z.object({
    cowCode: z.string().optional(),
    breed: z.string().optional(),
    age: z.number().positive().optional(),
    healthStatus: z.enum(['healthy', 'sick', 'pregnant', 'dry']).optional(),
    pregnancyStatus: z.string().optional(),
    feedType: z.string().optional(),
    vetName: z.string().optional(),
    notes: z.string().optional()
  })
});
