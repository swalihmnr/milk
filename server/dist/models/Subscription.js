"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const SubscriptionSchema = new mongoose_1.Schema({
    customerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Customer', required: true },
    planName: { type: String, required: true },
    planType: { type: String, enum: ['daily', 'monthly', 'custom'], required: true },
    frequency: { type: String, enum: ['daily', 'weekly', 'alternate_day', 'custom'], default: 'daily' },
    deliveryDays: [{ type: Number, min: 0, max: 6 }],
    quantity: { type: Number, required: true },
    billingCycle: { type: String, enum: ['weekly', 'monthly', 'prepaid'], default: 'monthly' },
    price: { type: Number, required: true },
    status: { type: String, enum: ['active', 'paused', 'cancelled', 'expired'], default: 'active' },
    renewalDate: { type: Date },
    autoRenewal: { type: Boolean, default: true },
    vacationMode: { type: Boolean, default: false },
    pauseStartDate: { type: Date },
    pauseEndDate: { type: Date }
}, {
    timestamps: true
});
exports.default = mongoose_1.default.model('Subscription', SubscriptionSchema);
