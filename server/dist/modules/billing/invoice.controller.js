"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateInvoice = exports.createInvoice = exports.getInvoices = void 0;
const Invoice_1 = __importDefault(require("../../models/Invoice"));
const getInvoices = async (req, res, next) => {
    try {
        const farmerId = req.user?.id;
        const filter = { farmerId };
        if (req.query.status) {
            filter.status = req.query.status;
        }
        if (req.query.customerId) {
            filter.customerId = req.query.customerId;
        }
        const invoices = await Invoice_1.default.find(filter)
            .populate('customerId', 'name address phone')
            .sort('-createdAt');
        res.status(200).json({ count: invoices.length, data: invoices });
    }
    catch (error) {
        next(error);
    }
};
exports.getInvoices = getInvoices;
const createInvoice = async (req, res, next) => {
    try {
        const farmerId = req.user?.id;
        const pendingAmount = req.body.totalAmount;
        const invoice = await Invoice_1.default.create({
            ...req.body,
            farmerId,
            pendingAmount
        });
        res.status(201).json({ data: invoice });
    }
    catch (error) {
        next(error);
    }
};
exports.createInvoice = createInvoice;
const updateInvoice = async (req, res, next) => {
    try {
        const invoice = await Invoice_1.default.findOneAndUpdate({ _id: req.params.id, farmerId: req.user?.id }, req.body, { new: true, runValidators: true });
        if (!invoice) {
            res.status(404);
            throw new Error('Invoice not found');
        }
        res.status(200).json({ data: invoice });
    }
    catch (error) {
        next(error);
    }
};
exports.updateInvoice = updateInvoice;
