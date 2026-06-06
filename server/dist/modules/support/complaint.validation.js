"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateComplaintSchema = exports.createComplaintSchema = void 0;
const zod_1 = require("zod");
exports.createComplaintSchema = zod_1.z.object({
    body: zod_1.z.object({
        customerId: zod_1.z.string().min(1, 'Customer ID is required'),
        title: zod_1.z.string().min(2, 'Title is required'),
        description: zod_1.z.string().min(5, 'Description is required'),
        priority: zod_1.z.enum(['low', 'medium', 'high']).optional(),
        assignedTo: zod_1.z.string().optional()
    })
});
exports.updateComplaintSchema = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.enum(['open', 'in_progress', 'resolved', 'closed']).optional(),
        priority: zod_1.z.enum(['low', 'medium', 'high']).optional(),
        assignedTo: zod_1.z.string().optional(),
        refundAmount: zod_1.z.number().optional()
    })
});
