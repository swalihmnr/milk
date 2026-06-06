"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.otpLoginSchema = exports.loginSchema = exports.signupSchema = void 0;
const zod_1 = require("zod");
exports.signupSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
        phone: zod_1.z.string().min(10, 'Phone must be at least 10 characters'),
        email: zod_1.z.string().email('Invalid email').optional().or(zod_1.z.literal('')),
        password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
        role: zod_1.z.string().min(2, 'Role is required')
    })
});
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        phone: zod_1.z.string().min(10, 'Phone is required'),
        password: zod_1.z.string().min(6, 'Password is required')
    })
});
exports.otpLoginSchema = zod_1.z.object({
    body: zod_1.z.object({
        phone: zod_1.z.string().min(10, 'Phone is required'),
        otp: zod_1.z.string().length(6, 'OTP must be 6 digits')
    })
});
exports.forgotPasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        phone: zod_1.z.string().min(10, 'Phone is required')
    })
});
exports.resetPasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        phone: zod_1.z.string().min(10, 'Phone is required'),
        otp: zod_1.z.string().length(6, 'OTP must be 6 digits'),
        password: zod_1.z.string().min(6, 'Password must be at least 6 characters')
    })
});
