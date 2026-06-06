"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateComplaint = exports.createComplaint = exports.getComplaints = void 0;
const Complaint_1 = __importDefault(require("../../models/Complaint"));
const Customer_1 = __importDefault(require("../../models/Customer"));
const User_1 = __importDefault(require("../../models/User"));
const Wallet_1 = __importDefault(require("../../models/Wallet"));
const Refund_1 = __importDefault(require("../../models/Refund"));
const getComplaints = async (req, res, next) => {
    try {
        const farmerId = req.user?.id;
        const complaints = await Complaint_1.default.find({ farmerId })
            .populate('customerId', 'name phone')
            .sort('-createdAt');
        res.status(200).json({ count: complaints.length, data: complaints });
    }
    catch (error) {
        next(error);
    }
};
exports.getComplaints = getComplaints;
const createComplaint = async (req, res, next) => {
    try {
        const farmerId = req.user?.id;
        const complaint = await Complaint_1.default.create({ ...req.body, farmerId });
        res.status(201).json({ data: complaint });
    }
    catch (error) {
        next(error);
    }
};
exports.createComplaint = createComplaint;
const updateComplaint = async (req, res, next) => {
    try {
        const { status, priority, assignedTo, refundAmount } = req.body;
        const updateData = {};
        if (status)
            updateData.status = status;
        if (priority)
            updateData.priority = priority;
        if (assignedTo)
            updateData.assignedTo = assignedTo;
        if (status === 'resolved' || status === 'closed') {
            updateData.resolvedAt = new Date();
        }
        const complaint = await Complaint_1.default.findOneAndUpdate({ _id: req.params.id, farmerId: req.user?.id }, updateData, { new: true, runValidators: true });
        if (!complaint) {
            res.status(404);
            throw new Error('Complaint not found');
        }
        // Process refund if requested and approved
        if (refundAmount && refundAmount > 0 && status === 'resolved') {
            const customer = await Customer_1.default.findById(complaint.customerId);
            if (customer) {
                const customerUser = await User_1.default.findOne({ phone: customer.phone });
                if (customerUser) {
                    // 1. Create Refund record
                    await Refund_1.default.create({
                        userId: customerUser._id,
                        amount: refundAmount,
                        status: 'completed',
                        reason: `Refund for complaint: ${complaint.title}`
                    });
                    // 2. Credit Customer Wallet
                    let wallet = await Wallet_1.default.findOne({ userId: customerUser._id });
                    if (!wallet) {
                        wallet = new Wallet_1.default({ userId: customerUser._id, balance: 0, transactions: [] });
                    }
                    wallet.balance += Number(refundAmount);
                    wallet.transactions.push({
                        amount: Number(refundAmount),
                        type: 'credit',
                        description: `Refund Approved for Complaint: ${complaint.title}`,
                        date: new Date()
                    });
                    await wallet.save();
                }
            }
        }
        res.status(200).json({ data: complaint });
    }
    catch (error) {
        next(error);
    }
};
exports.updateComplaint = updateComplaint;
