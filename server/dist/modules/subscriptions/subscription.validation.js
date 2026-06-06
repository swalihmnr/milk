"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSubscriptionSchema = exports.createSubscriptionSchema = void 0;
const zod_1 = require("zod");
exports.createSubscriptionSchema = zod_1.z.object({
    body: zod_1.z.object({
        customerId: zod_1.z.string().min(1, 'Customer ID is required'),
        planName: zod_1.z.string().min(2, 'Plan Name is required'),
        planType: zod_1.z.enum(['daily', 'monthly', 'custom']),
        frequency: zod_1.z.enum(['daily', 'weekly', 'alternate_day', 'custom']).optional(),
        deliveryDays: zod_1.z.array(zod_1.z.number().min(0).max(6)).optional(),
        quantity: zod_1.z.number().positive(),
        billingCycle: zod_1.z.enum(['weekly', 'monthly', 'prepaid']),
        price: zod_1.z.number().positive(),
        autoRenewal: zod_1.z.boolean().optional(),
        renewalDate: zod_1.z.string().optional()
    })
});
exports.updateSubscriptionSchema = zod_1.z.object({
    body: zod_1.z.object({
        planName: zod_1.z.string().optional(),
        planType: zod_1.z.enum(['daily', 'monthly', 'custom']).optional(),
        frequency: zod_1.z.enum(['daily', 'weekly', 'alternate_day', 'custom']).optional(),
        deliveryDays: zod_1.z.array(zod_1.z.number().min(0).max(6)).optional(),
        quantity: zod_1.z.number().positive().optional(),
        billingCycle: zod_1.z.enum(['weekly', 'monthly', 'prepaid']).optional(),
        price: zod_1.z.number().positive().optional(),
        status: zod_1.z.enum(['active', 'paused', 'cancelled', 'expired']).optional(),
        autoRenewal: zod_1.z.boolean().optional(),
        vacationMode: zod_1.z.boolean().optional(),
        pauseStartDate: zod_1.z.string().optional(),
        pauseEndDate: zod_1.z.string().optional()
    })
});
