"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRouteSchema = exports.createRouteSchema = void 0;
const zod_1 = require("zod");
exports.createRouteSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, 'Route name is required'),
        area: zod_1.z.string().min(2, 'Area is required'),
        deliveryBoyId: zod_1.z.string().optional()
    })
});
exports.updateRouteSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().optional(),
        area: zod_1.z.string().optional(),
        deliveryBoyId: zod_1.z.string().optional(),
        status: zod_1.z.enum(['active', 'inactive']).optional()
    })
});
