import { z } from 'zod';

export const createPaymentSchema = z.object({
  body: z.object({
    customerId: z.string().min(1, 'Customer ID is required'),
    invoiceId: z.string().optional(),
    amount: z.number().positive('Amount must be positive'),
    method: z.enum(['cash', 'upi', 'bank_transfer', 'other']),
    transactionId: z.string().optional(),
    notes: z.string().optional()
  })
});
