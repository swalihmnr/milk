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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startCronJobs = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const Delivery_1 = __importDefault(require("../models/Delivery"));
// Run every 15 minutes to auto-confirm deliveries that have passed their complaint window
const startCronJobs = () => {
    node_cron_1.default.schedule('*/15 * * * *', async () => {
        try {
            console.log('[Cron] Running auto-confirm delivery job...');
            const now = new Date();
            const result = await Delivery_1.default.updateMany({
                status: 'delivered',
                isAutoConfirmed: false,
                complaintWindowEndsAt: { $lt: now }
            }, {
                $set: { isAutoConfirmed: true }
            });
            if (result.modifiedCount > 0) {
                console.log(`[Cron] Auto-confirmed ${result.modifiedCount} deliveries.`);
            }
        }
        catch (error) {
            console.error('[Cron Error] Failed to auto-confirm deliveries:', error);
        }
    });
    // Run every night at midnight to generate deliveries for active subscriptions for the upcoming day
    node_cron_1.default.schedule('0 0 * * *', async () => {
        try {
            console.log('[Cron] Running daily delivery generation job...');
            const Subscription = (await Promise.resolve().then(() => __importStar(require('../models/Subscription')))).default;
            const Customer = (await Promise.resolve().then(() => __importStar(require('../models/Customer')))).default;
            const activeSubscriptions = await Subscription.find({ status: 'active', vacationMode: false });
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
            const tomorrowDay = tomorrow.getDay(); // 0 (Sun) to 6 (Sat)
            let createdCount = 0;
            for (const sub of activeSubscriptions) {
                // Determine if delivery should happen tomorrow
                let shouldDeliver = false;
                if (sub.frequency === 'daily') {
                    shouldDeliver = true;
                }
                else if (sub.frequency === 'weekly' || sub.frequency === 'custom') {
                    if (sub.deliveryDays && sub.deliveryDays.includes(tomorrowDay)) {
                        shouldDeliver = true;
                    }
                }
                else if (sub.frequency === 'alternate_day') {
                    // Simple alternate day logic: check if difference in days since start is even
                    shouldDeliver = tomorrow.getDate() % 2 === 0; // naive implementation
                }
                if (shouldDeliver) {
                    const customer = await Customer.findById(sub.customerId);
                    if (customer && customer.routeId) {
                        await Delivery_1.default.create({
                            farmerId: customer.farmerId,
                            customerId: customer._id,
                            routeId: customer.routeId,
                            date: tomorrow,
                            shift: 'morning',
                            quantity: sub.quantity,
                            status: 'pending'
                        });
                        createdCount++;
                    }
                }
            }
            console.log(`[Cron] Generated ${createdCount} deliveries for ${tomorrow.toDateString()}.`);
        }
        catch (error) {
            console.error('[Cron Error] Failed to generate daily deliveries:', error);
        }
    });
    console.log('[Cron] Background jobs initialized.');
};
exports.startCronJobs = startCronJobs;
