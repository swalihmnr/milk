"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentSchema = void 0;
const zod_1 = require("zod");
exports.createPaymentSchema = zod_1.z.object({
    body: zod_1.z.object({
        customerId: zod_1.z.string().min(1, 'Customer ID is required'),
        invoiceId: zod_1.z.string().optional(),
        amount: zod_1.z.number().positive('Amount must be positive'),
        method: zod_1.z.enum(['cash', 'upi', 'bank_transfer', 'other']),
        transactionId: zod_1.z.string().optional(),
        notes: zod_1.z.string().optional()
    })
});
