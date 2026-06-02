import { z } from 'zod';

export const createComplaintSchema = z.object({
  body: z.object({
    customerId: z.string().min(1, 'Customer ID is required'),
    title: z.string().min(2, 'Title is required'),
    description: z.string().min(5, 'Description is required'),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    assignedTo: z.string().optional()
  })
});

export const updateComplaintSchema = z.object({
  body: z.object({
    status: z.enum(['open', 'in_progress', 'resolved', 'closed']).optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    assignedTo: z.string().optional()
  })
});
