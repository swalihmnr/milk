"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPayment = exports.getPayments = void 0;
const Payment_1 = __importDefault(require("../../models/Payment"));
const Invoice_1 = __importDefault(require("../../models/Invoice"));
const getPayments = async (req, res, next) => {
    try {
        const farmerId = req.user?.id;
        const payments = await Payment_1.default.find({ farmerId })
            .populate('customerId', 'name')
            .populate('collectedBy', 'name')
            .sort('-paidAt');
        res.status(200).json({ count: payments.length, data: payments });
    }
    catch (error) {
        next(error);
    }
};
exports.getPayments = getPayments;
const createPayment = async (req, res, next) => {
    try {
        const farmerId = req.user?.id;
        const collectedBy = req.user?.id;
        const payment = await Payment_1.default.create({
            ...req.body,
            farmerId,
            collectedBy
        });
        // If an invoice is attached, update the invoice paidAmount and status
        if (req.body.invoiceId) {
            const invoice = await Invoice_1.default.findById(req.body.invoiceId);
            if (invoice) {
                invoice.paidAmount += req.body.amount;
                invoice.pendingAmount -= req.body.amount;
                if (invoice.pendingAmount <= 0) {
                    invoice.status = 'paid';
                    invoice.pendingAmount = 0;
                }
                else {
                    invoice.status = 'partial';
                }
                await invoice.save();
            }
        }
        res.status(201).json({ data: payment });
    }
    catch (error) {
        next(error);
    }
};
exports.createPayment = createPayment;
