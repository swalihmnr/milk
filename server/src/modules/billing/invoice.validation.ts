import { z } from 'zod';

export const createInvoiceSchema = z.object({
  body: z.object({
    customerId: z.string().min(1, 'Customer ID is required'),
    invoiceNumber: z.string().min(1, 'Invoice Number is required'),
    billingMonth: z.string().regex(/^\d{4}-\d{2}$/, 'Billing month must be YYYY-MM'),
    totalAmount: z.number().min(0, 'Total amount must be positive'),
    dueDate: z.string().transform(str => new Date(str)),
  })
});

export const updateInvoiceSchema = z.object({
  body: z.object({
    status: z.enum(['paid', 'unpaid', 'partial']).optional(),
    paidAmount: z.number().min(0).optional(),
    pendingAmount: z.number().min(0).optional(),
  })
});
