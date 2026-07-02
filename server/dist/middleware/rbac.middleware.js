"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = void 0;
const DeliveryBoy_1 = __importDefault(require("../models/DeliveryBoy"));
const ROLE_EQUIVALENTS = {
    farmer: ['farmer', 'vendor'],
    vendor: ['farmer', 'vendor'],
    delivery: ['delivery', 'delivery_boy'],
    delivery_boy: ['delivery', 'delivery_boy'],
};
const authorize = (...roles) => {
    return async (req, res, next) => {
        if (!req.user || !req.user.roles) {
            res.status(403);
            return next(new Error('Not authorized to access this route'));
        }
        const expandedRequiredRoles = roles.flatMap((role) => ROLE_EQUIVALENTS[role] || [role]);
        const hasRole = req.user.roles.some((role) => expandedRequiredRoles.includes(role));
        if (!hasRole) {
            res.status(403);
            return next(new Error(`User role is not authorized to access this route`));
        }
        // Additional check: if user has a delivery role, they must be verified
        if (req.user.roles.some((role) => ['delivery', 'delivery_boy'].includes(role))) {
            try {
                const dboy = await DeliveryBoy_1.default.findOne({ userId: req.user.id });
                if (!dboy || !dboy.isVerified) {
                    res.status(403);
                    return next(new Error('Your delivery boy account is pending administrator verification.'));
                }
            }
            catch (error) {
                return next(error);
            }
        }
        next();
    };
};
exports.authorize = authorize;
