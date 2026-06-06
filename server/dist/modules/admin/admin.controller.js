"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllDeliveries = exports.getAllInvoices = exports.getUsers = exports.updateVendorStatus = exports.getVendors = void 0;
const User_1 = __importDefault(require("../../models/User"));
const Vendor_1 = __importDefault(require("../../models/Vendor"));
const UserRole_1 = __importDefault(require("../../models/UserRole"));
const Invoice_1 = __importDefault(require("../../models/Invoice"));
const Delivery_1 = __importDefault(require("../../models/Delivery"));
// @desc    Get all platform vendors
// @route   GET /api/admin/vendors
// @access  Private (Admin)
const getVendors = async (req, res, next) => {
    try {
        const vendors = await Vendor_1.default.find()
            .populate('userId', 'name phone email status')
            .sort('-createdAt');
        res.status(200).json({ success: true, data: vendors });
    }
    catch (error) {
        next(error);
    }
};
exports.getVendors = getVendors;
// @desc    Update vendor approval status
// @route   PATCH /api/admin/vendors/:id/status
// @access  Private (Admin)
const updateVendorStatus = async (req, res, next) => {
    try {
        const { approvalStatus } = req.body;
        if (!['pending', 'approved', 'suspended'].includes(approvalStatus)) {
            res.status(400);
            throw new Error('Invalid approval status');
        }
        const vendor = await Vendor_1.default.findByIdAndUpdate(req.params.id, { approvalStatus }, { new: true }).populate('userId', 'name phone email status');
        if (!vendor) {
            res.status(404);
            throw new Error('Vendor not found');
        }
        // Mirror suspension on the User model status
        if (vendor.userId) {
            const userStatus = approvalStatus === 'suspended' ? 'inactive' : 'active';
            await User_1.default.findByIdAndUpdate(vendor.userId._id, { status: userStatus });
        }
        res.status(200).json({ success: true, data: vendor });
    }
    catch (error) {
        next(error);
    }
};
exports.updateVendorStatus = updateVendorStatus;
// @desc    Get all platform users with roles
// @route   GET /api/admin/users
// @access  Private (Admin)
const getUsers = async (req, res, next) => {
    try {
        const users = await User_1.default.find().select('-passwordHash').sort('-createdAt');
        const usersWithRoles = await Promise.all(users.map(async (user) => {
            const userRoles = await UserRole_1.default.find({ userId: user._id }).populate('roleId', 'name');
            return {
                ...user.toObject(),
                roles: userRoles.map((ur) => ur.roleId?.name || '')
            };
        }));
        res.status(200).json({ success: true, data: usersWithRoles });
    }
    catch (error) {
        next(error);
    }
};
exports.getUsers = getUsers;
// @desc    Get all platform invoices (Orders)
// @route   GET /api/admin/invoices
// @access  Private (Admin)
const getAllInvoices = async (req, res, next) => {
    try {
        const invoices = await Invoice_1.default.find()
            .populate('farmerId', 'name farmName')
            .populate('customerId', 'name phone')
            .sort('-createdAt');
        res.status(200).json({ success: true, data: invoices });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllInvoices = getAllInvoices;
// @desc    Get all platform deliveries
// @route   GET /api/admin/deliveries
// @access  Private (Admin)
const getAllDeliveries = async (req, res, next) => {
    try {
        const deliveries = await Delivery_1.default.find()
            .populate('farmerId', 'name farmName')
            .populate('customerId', 'name phone')
            .populate('deliveryBoyId', 'name phone')
            .sort('-createdAt');
        res.status(200).json({ success: true, data: deliveries });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllDeliveries = getAllDeliveries;
