"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSubscription = exports.resumeSubscription = exports.pauseSubscription = exports.updateSubscription = exports.createSubscription = exports.getSubscription = exports.getCustomerSubscriptions = exports.getSubscriptions = void 0;
const Subscription_1 = __importDefault(require("../../models/Subscription"));
const Customer_1 = __importDefault(require("../../models/Customer"));
const getSubscriptions = async (req, res, next) => {
    try {
        const farmerId = req.user?.id;
        // Find customers belonging to this farmer
        const customers = await Customer_1.default.find({ farmerId }).select('_id');
        const customerIds = customers.map(c => c._id);
        const subscriptions = await Subscription_1.default.find({
            customerId: { $in: customerIds }
        }).populate('customerId');
        res.status(200).json({ count: subscriptions.length, data: subscriptions });
    }
    catch (error) {
        next(error);
    }
};
exports.getSubscriptions = getSubscriptions;
const getCustomerSubscriptions = async (req, res, next) => {
    try {
        const { customerId } = req.params;
        const subscriptions = await Subscription_1.default.find({ customerId }).sort('-createdAt');
        res.status(200).json({ count: subscriptions.length, data: subscriptions });
    }
    catch (error) {
        next(error);
    }
};
exports.getCustomerSubscriptions = getCustomerSubscriptions;
const getSubscription = async (req, res, next) => {
    try {
        const subscription = await Subscription_1.default.findById(req.params.id);
        if (!subscription) {
            res.status(404);
            throw new Error('Subscription not found');
        }
        res.status(200).json({ data: subscription });
    }
    catch (error) {
        next(error);
    }
};
exports.getSubscription = getSubscription;
const createSubscription = async (req, res, next) => {
    try {
        const subscription = await Subscription_1.default.create(req.body);
        res.status(201).json({ data: subscription });
    }
    catch (error) {
        next(error);
    }
};
exports.createSubscription = createSubscription;
const updateSubscription = async (req, res, next) => {
    try {
        const subscription = await Subscription_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!subscription) {
            res.status(404);
            throw new Error('Subscription not found');
        }
        res.status(200).json({ data: subscription });
    }
    catch (error) {
        next(error);
    }
};
exports.updateSubscription = updateSubscription;
const pauseSubscription = async (req, res, next) => {
    try {
        const { pauseStartDate, pauseEndDate } = req.body;
        const subscription = await Subscription_1.default.findByIdAndUpdate(req.params.id, {
            status: 'paused',
            vacationMode: true,
            pauseStartDate: new Date(pauseStartDate),
            pauseEndDate: new Date(pauseEndDate)
        }, { new: true, runValidators: true });
        if (!subscription) {
            res.status(404);
            throw new Error('Subscription not found');
        }
        res.status(200).json({ data: subscription });
    }
    catch (error) {
        next(error);
    }
};
exports.pauseSubscription = pauseSubscription;
const resumeSubscription = async (req, res, next) => {
    try {
        const subscription = await Subscription_1.default.findByIdAndUpdate(req.params.id, {
            status: 'active',
            vacationMode: false,
            $unset: { pauseStartDate: 1, pauseEndDate: 1 }
        }, { new: true, runValidators: true });
        if (!subscription) {
            res.status(404);
            throw new Error('Subscription not found');
        }
        res.status(200).json({ data: subscription });
    }
    catch (error) {
        next(error);
    }
};
exports.resumeSubscription = resumeSubscription;
const deleteSubscription = async (req, res, next) => {
    try {
        const subscription = await Subscription_1.default.findByIdAndDelete(req.params.id);
        if (!subscription) {
            res.status(404);
            throw new Error('Subscription not found');
        }
        res.status(200).json({ data: {} });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteSubscription = deleteSubscription;
