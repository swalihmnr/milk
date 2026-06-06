"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCustomerSchema = exports.createCustomerSchema = void 0;
const zod_1 = require("zod");
exports.createCustomerSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, 'Name is required'),
        phone: zod_1.z.string().min(10, 'Phone is required'),
        email: zod_1.z.string().email('Invalid email').optional().or(zod_1.z.literal('')),
        address: zod_1.z.string().min(5, 'Address is required'),
        houseName: zod_1.z.string().optional(),
        street: zod_1.z.string().optional(),
        area: zod_1.z.string().optional(),
        city: zod_1.z.string().min(2, 'City is required'),
        district: zod_1.z.string().min(2, 'District is required'),
        state: zod_1.z.string().min(2, 'State is required'),
        pincode: zod_1.z.string().min(6, 'Pincode is required'),
        landmark: zod_1.z.string().optional(),
        notes: zod_1.z.string().optional(),
    })
});
exports.updateCustomerSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().optional(),
        phone: zod_1.z.string().optional(),
        email: zod_1.z.string().email().optional().or(zod_1.z.literal('')),
        address: zod_1.z.string().optional(),
        city: zod_1.z.string().optional(),
        district: zod_1.z.string().optional(),
        state: zod_1.z.string().optional(),
        pincode: zod_1.z.string().optional(),
        status: zod_1.z.enum(['active', 'inactive']).optional(),
        notes: zod_1.z.string().optional(),
    })
});
