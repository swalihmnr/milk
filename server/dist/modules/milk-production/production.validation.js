"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProductionSchema = exports.createProductionSchema = void 0;
const zod_1 = require("zod");
exports.createProductionSchema = zod_1.z.object({
    body: zod_1.z.object({
        cowId: zod_1.z.string().optional(),
        date: zod_1.z.string().transform(str => new Date(str)),
        morningLiters: zod_1.z.number().min(0).optional(),
        eveningLiters: zod_1.z.number().min(0).optional(),
        totalLiters: zod_1.z.number().min(0),
        fatPercentage: zod_1.z.number().min(0).max(100).optional(),
        notes: zod_1.z.string().optional()
    })
});
exports.updateProductionSchema = zod_1.z.object({
    body: zod_1.z.object({
        morningLiters: zod_1.z.number().min(0).optional(),
        eveningLiters: zod_1.z.number().min(0).optional(),
        totalLiters: zod_1.z.number().min(0).optional(),
        fatPercentage: zod_1.z.number().min(0).max(100).optional(),
        notes: zod_1.z.string().optional()
    })
});
