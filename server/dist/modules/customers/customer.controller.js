"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignCustomersToRoute = exports.deleteCustomer = exports.updateCustomer = exports.createCustomer = exports.getCustomer = exports.getCustomers = void 0;
const Customer_1 = __importDefault(require("../../models/Customer"));
const getCustomers = async (req, res, next) => {
    try {
        const farmerId = req.user?.id;
        const customers = await Customer_1.default.find({ farmerId }).sort('-createdAt');
        res.status(200).json({ count: customers.length, data: customers });
    }
    catch (error) {
        next(error);
    }
};
exports.getCustomers = getCustomers;
const getCustomer = async (req, res, next) => {
    try {
        const customer = await Customer_1.default.findOne({ _id: req.params.id, farmerId: req.user?.id });
        if (!customer) {
            res.status(404);
            throw new Error('Customer not found');
        }
        res.status(200).json({ data: customer });
    }
    catch (error) {
        next(error);
    }
};
exports.getCustomer = getCustomer;
const createCustomer = async (req, res, next) => {
    try {
        const farmerId = req.user?.id;
        const customer = await Customer_1.default.create({ ...req.body, farmerId });
        res.status(201).json({ data: customer });
    }
    catch (error) {
        next(error);
    }
};
exports.createCustomer = createCustomer;
const updateCustomer = async (req, res, next) => {
    try {
        const customer = await Customer_1.default.findOneAndUpdate({ _id: req.params.id, farmerId: req.user?.id }, req.body, { new: true, runValidators: true });
        if (!customer) {
            res.status(404);
            throw new Error('Customer not found');
        }
        res.status(200).json({ data: customer });
    }
    catch (error) {
        next(error);
    }
};
exports.updateCustomer = updateCustomer;
const deleteCustomer = async (req, res, next) => {
    try {
        const customer = await Customer_1.default.findOneAndDelete({ _id: req.params.id, farmerId: req.user?.id });
        if (!customer) {
            res.status(404);
            throw new Error('Customer not found');
        }
        res.status(200).json({ data: {} });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteCustomer = deleteCustomer;
// Bulk assign/unassign customers to a route
const assignCustomersToRoute = async (req, res, next) => {
    try {
        const farmerId = req.user?.id;
        const { routeId, customerIds } = req.body;
        if (!Array.isArray(customerIds)) {
            res.status(400);
            throw new Error('customerIds must be an array');
        }
        // Unassign all existing customers of this route first
        if (routeId) {
            await Customer_1.default.updateMany({ farmerId, routeId }, { $unset: { routeId: '' } });
        }
        // Assign selected customers
        if (customerIds.length > 0) {
            await Customer_1.default.updateMany({ farmerId, _id: { $in: customerIds } }, { routeId: routeId || null });
        }
        const updated = await Customer_1.default.find({ farmerId, routeId });
        res.status(200).json({ count: updated.length, data: updated });
    }
    catch (error) {
        next(error);
    }
};
exports.assignCustomersToRoute = assignCustomersToRoute;
