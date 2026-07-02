"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDeliverySchema = exports.createDeliverySchema = void 0;
const zod_1 = require("zod");
exports.createDeliverySchema = zod_1.z.object({
    body: zod_1.z.object({
        customerId: zod_1.z.string().min(1, 'Customer ID is required'),
        routeId: zod_1.z.string().min(1, 'Route ID is required'),
        deliveryBoyId: zod_1.z.string().optional(),
        date: zod_1.z.string().transform(str => new Date(str)),
        shift: zod_1.z.enum(['morning', 'evening']),
        quantity: zod_1.z.number().positive(),
        status: zod_1.z.enum(['pending', 'delivered', 'missed']).optional(),
        notes: zod_1.z.string().optional()
    })
});
exports.updateDeliverySchema = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.enum(['pending', 'delivered', 'missed']).optional(),
        missedReason: zod_1.z.string().optional(),
        quantity: zod_1.z.number().positive().optional(),
        notes: zod_1.z.string().optional(),
        proofImageUrl: zod_1.z.string().optional(),
        deliveryLat: zod_1.z.number().optional(),
        deliveryLon: zod_1.z.number().optional(),
        handoverOtp: zod_1.z.string().optional()
    })
});
