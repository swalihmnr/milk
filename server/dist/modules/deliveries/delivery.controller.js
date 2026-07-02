"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDeliveryStatus = exports.generateHandoverOtp = exports.createDelivery = exports.getDelivery = exports.getDeliveries = void 0;
const Delivery_1 = __importDefault(require("../../models/Delivery"));
const getDeliveries = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const isDeliveryBoy = req.user?.roles?.includes('delivery_boy') || req.user?.roles?.includes('delivery');
        const filter = isDeliveryBoy ? { deliveryBoyId: userId } : { farmerId: userId };
        if (req.query.date)
            filter.date = req.query.date;
        if (req.query.routeId)
            filter.routeId = req.query.routeId;
        if (req.query.customerId)
            filter.customerId = req.query.customerId;
        const deliveries = await Delivery_1.default.find(filter)
            .populate('customerId', 'name address phone lat lon houseName street area city')
            .populate('routeId', 'name')
            .populate('deliveryBoyId', 'name');
        res.status(200).json({ count: deliveries.length, data: deliveries });
    }
    catch (error) {
        next(error);
    }
};
exports.getDeliveries = getDeliveries;
const getDelivery = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const isDeliveryBoy = req.user?.roles?.includes('delivery_boy') || req.user?.roles?.includes('delivery');
        const strictFilter = isDeliveryBoy
            ? { _id: req.params.id, deliveryBoyId: userId }
            : { _id: req.params.id, farmerId: userId };
        let delivery = await Delivery_1.default.findOne(strictFilter)
            .populate('customerId', 'name address phone lat lon houseName street area city')
            .populate('routeId', 'name');
        if (!delivery) {
            delivery = await Delivery_1.default.findById(req.params.id)
                .populate('customerId', 'name address phone lat lon houseName street area city')
                .populate('routeId', 'name');
        }
        if (!delivery) {
            res.status(404);
            throw new Error('Delivery not found');
        }
        res.status(200).json({ data: delivery });
    }
    catch (error) {
        next(error);
    }
};
exports.getDelivery = getDelivery;
const createDelivery = async (req, res, next) => {
    try {
        const farmerId = req.user?.id;
        const delivery = await Delivery_1.default.create({ ...req.body, farmerId });
        res.status(201).json({ data: delivery });
    }
    catch (error) {
        next(error);
    }
};
exports.createDelivery = createDelivery;
// Generate a 4-digit OTP for in-person handover verification (valid 10 minutes)
const generateHandoverOtp = async (req, res, next) => {
    try {
        const otp = Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min from now
        const delivery = await Delivery_1.default.findByIdAndUpdate(req.params.id, { handoverOtp: otp, handoverOtpExpiresAt: expiresAt }, { new: true }).populate('customerId', 'name phone');
        if (!delivery) {
            res.status(404);
            throw new Error('Delivery not found');
        }
        // In production: send OTP via SMS to delivery.customerId.phone
        // In sandbox/dev: return OTP in response for simulation
        res.status(200).json({
            data: {
                otp, // ONLY returned in dev — remove for production
                expiresAt,
                customerName: delivery.customerId?.name || 'Customer',
                customerPhone: delivery.customerId?.phone || '—',
                message: `OTP sent to customer. Ask them to share the code.`
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.generateHandoverOtp = generateHandoverOtp;
const updateDeliveryStatus = async (req, res, next) => {
    try {
        const updateData = { ...req.body };
        const isHandover = req.body.proofImageUrl === 'handed_over_in_person';
        // OTP verification for in-person handover
        if (isHandover && req.body.status === 'delivered') {
            const { handoverOtp: enteredOtp } = req.body;
            if (!enteredOtp) {
                res.status(400);
                throw new Error('OTP is required for in-person handover confirmation');
            }
            const doc = await Delivery_1.default.findById(req.params.id).select('handoverOtp handoverOtpExpiresAt');
            if (!doc) {
                res.status(404);
                throw new Error('Delivery not found');
            }
            if (!doc.handoverOtp) {
                res.status(400);
                throw new Error('No OTP generated. Please generate an OTP first.');
            }
            if (new Date() > doc.handoverOtpExpiresAt) {
                res.status(400);
                throw new Error('OTP has expired. Please generate a new one.');
            }
            if (doc.handoverOtp !== enteredOtp) {
                res.status(400);
                throw new Error('Incorrect OTP. Please ask the customer to re-check.');
            }
            // Clear OTP after successful use
            updateData.handoverOtp = undefined;
            updateData.handoverOtpExpiresAt = undefined;
        }
        if (req.body.status === 'delivered') {
            updateData.confirmedAt = new Date();
            updateData.isAutoConfirmed = false;
            const complaintEnds = new Date();
            complaintEnds.setHours(complaintEnds.getHours() + 4);
            updateData.complaintWindowEndsAt = complaintEnds;
        }
        const userId = req.user?.id;
        const isDeliveryBoy = req.user?.roles?.includes('delivery_boy') || req.user?.roles?.includes('delivery');
        const strictFilter = isDeliveryBoy
            ? { _id: req.params.id, deliveryBoyId: userId }
            : { _id: req.params.id, farmerId: userId };
        let delivery = await Delivery_1.default.findOneAndUpdate(strictFilter, updateData, { new: true, runValidators: true });
        if (!delivery) {
            delivery = await Delivery_1.default.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
        }
        if (!delivery) {
            res.status(404);
            throw new Error('Delivery not found');
        }
        res.status(200).json({ data: delivery });
    }
    catch (error) {
        next(error);
    }
};
exports.updateDeliveryStatus = updateDeliveryStatus;
