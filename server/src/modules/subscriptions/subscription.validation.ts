import { z } from 'zod';

export const createSubscriptionSchema = z.object({
  body: z.object({
    customerId: z.string().min(1, 'Customer ID is required'),
    planName: z.string().min(2, 'Plan Name is required'),
    planType: z.enum(['daily', 'monthly', 'custom']),
    frequency: z.enum(['daily', 'weekly', 'alternate_day', 'custom']).optional(),
    deliveryDays: z.array(z.number().min(0).max(6)).optional(),
    quantity: z.number().positive(),
    billingCycle: z.enum(['weekly', 'monthly', 'prepaid']),
    price: z.number().positive(),
    autoRenewal: z.boolean().optional(),
    renewalDate: z.string().optional()
  })
});

export const updateSubscriptionSchema = z.object({
  body: z.object({
    planName: z.string().optional(),
    planType: z.enum(['daily', 'monthly', 'custom']).optional(),
    frequency: z.enum(['daily', 'weekly', 'alternate_day', 'custom']).optional(),
    deliveryDays: z.array(z.number().min(0).max(6)).optional(),
    quantity: z.number().positive().optional(),
    billingCycle: z.enum(['weekly', 'monthly', 'prepaid']).optional(),
    price: z.number().positive().optional(),
    status: z.enum(['active', 'paused', 'cancelled', 'expired']).optional(),
    autoRenewal: z.boolean().optional(),
    vacationMode: z.boolean().optional(),
    pauseStartDate: z.string().optional(),
    pauseEndDate: z.string().optional()
  })
});
