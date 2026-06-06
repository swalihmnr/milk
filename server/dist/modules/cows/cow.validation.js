"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCowSchema = exports.createCowSchema = void 0;
const zod_1 = require("zod");
exports.createCowSchema = zod_1.z.object({
    body: zod_1.z.object({
        cowCode: zod_1.z.string().min(1, 'Cow Code is required'),
        breed: zod_1.z.string().min(2, 'Breed is required'),
        age: zod_1.z.number().positive(),
        purchaseOrBirthDate: zod_1.z.string().transform(str => new Date(str)),
        healthStatus: zod_1.z.enum(['healthy', 'sick', 'pregnant', 'dry']).optional(),
        pregnancyStatus: zod_1.z.string().optional(),
        averageMilkOutput: zod_1.z.number().min(0).optional(),
        feedType: zod_1.z.string().optional(),
        vetName: zod_1.z.string().optional(),
        notes: zod_1.z.string().optional()
    })
});
exports.updateCowSchema = zod_1.z.object({
    body: zod_1.z.object({
        cowCode: zod_1.z.string().optional(),
        breed: zod_1.z.string().optional(),
        age: zod_1.z.number().positive().optional(),
        healthStatus: zod_1.z.enum(['healthy', 'sick', 'pregnant', 'dry']).optional(),
        pregnancyStatus: zod_1.z.string().optional(),
        feedType: zod_1.z.string().optional(),
        vetName: zod_1.z.string().optional(),
        notes: zod_1.z.string().optional()
    })
});
