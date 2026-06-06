"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateInvoiceSchema = exports.createInvoiceSchema = void 0;
const zod_1 = require("zod");
exports.createInvoiceSchema = zod_1.z.object({
    body: zod_1.z.object({
        customerId: zod_1.z.string().min(1, 'Customer ID is required'),
        invoiceNumber: zod_1.z.string().min(1, 'Invoice Number is required'),
        billingMonth: zod_1.z.string().regex(/^\d{4}-\d{2}$/, 'Billing month must be YYYY-MM'),
        totalAmount: zod_1.z.number().min(0, 'Total amount must be positive'),
        dueDate: zod_1.z.string().transform(str => new Date(str)),
    })
});
exports.updateInvoiceSchema = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.enum(['paid', 'unpaid', 'partial']).optional(),
        paidAmount: zod_1.z.number().min(0).optional(),
        pendingAmount: zod_1.z.number().min(0).optional(),
    })
});
