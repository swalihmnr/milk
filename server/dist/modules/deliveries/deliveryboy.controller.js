"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignDeliveryBoy = exports.searchDeliveryBoys = exports.removeDeliveryBoy = exports.toggleDeliveryBoy = exports.registerDeliveryBoy = exports.getDeliveryBoys = void 0;
const User_1 = __importDefault(require("../../models/User"));
const DeliveryBoy_1 = __importDefault(require("../../models/DeliveryBoy"));
const Role_1 = __importDefault(require("../../models/Role"));
const UserRole_1 = __importDefault(require("../../models/UserRole"));
const hash_1 = require("../../utils/hash");
/**
 * GET /api/delivery-boys
 * Returns all delivery boys created by the farmer (vendorId = farmerId)
 */
const getDeliveryBoys = async (req, res, next) => {
    try {
        const farmerId = req.user?.id;
        const boys = await DeliveryBoy_1.default.find({ vendorId: farmerId })
            .populate('userId', 'name phone email status')
            .sort('-createdAt');
        const data = boys.map((b) => ({
            _id: b._id,
            userId: b.userId?._id,
            name: b.userId?.name,
            phone: b.userId?.phone,
            email: b.userId?.email,
            status: b.userId?.status,
            vehicleType: b.vehicleType,
            licenseNumber: b.licenseNumber,
            isActive: b.isActive,
            totalDeliveries: b.totalDeliveries,
            rating: b.rating,
            createdAt: b.createdAt,
        }));
        res.status(200).json({ count: data.length, data });
    }
    catch (error) {
        next(error);
    }
};
exports.getDeliveryBoys = getDeliveryBoys;
/**
 * POST /api/delivery-boys
 * Farmer registers a new delivery boy:
 *   1. Creates a User account
 *   2. Creates a DeliveryBoy profile linked to farmer
 *   3. Assigns 'delivery_boy' role
 */
const registerDeliveryBoy = async (req, res, next) => {
    try {
        const farmerId = req.user?.id;
        const { name, phone, password, vehicleType, licenseNumber } = req.body;
        // Check phone not already taken
        const existing = await User_1.default.findOne({ phone });
        if (existing) {
            res.status(400);
            throw new Error('A user with this phone number already exists');
        }
        // Create user
        const passwordHash = await (0, hash_1.hashPassword)(password);
        const user = await User_1.default.create({
            name,
            phone,
            passwordHash,
            status: 'active',
        });
        // Ensure delivery_boy role exists
        let role = await Role_1.default.findOne({ name: 'delivery_boy' });
        if (!role) {
            role = await Role_1.default.create({ name: 'delivery_boy', description: 'Delivery personnel', permissions: [] });
        }
        // Assign role
        await UserRole_1.default.create({ userId: user._id, roleId: role._id });
        // Create DeliveryBoy profile
        const deliveryBoy = await DeliveryBoy_1.default.create({
            userId: user._id,
            vendorId: farmerId,
            vehicleType: vehicleType || 'Bicycle',
            licenseNumber: licenseNumber || undefined,
            isActive: true,
        });
        res.status(201).json({
            data: {
                _id: deliveryBoy._id,
                userId: user._id,
                name: user.name,
                phone: user.phone,
                vehicleType: deliveryBoy.vehicleType,
                licenseNumber: deliveryBoy.licenseNumber,
                isActive: deliveryBoy.isActive,
                totalDeliveries: 0,
                rating: 5.0,
                createdAt: deliveryBoy.createdAt,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.registerDeliveryBoy = registerDeliveryBoy;
// @desc    Toggle active status
// @route   PATCH /api/delivery-boys/:id/toggle
const toggleDeliveryBoy = async (req, res, next) => {
    try {
        const farmerId = req.user?.id;
        const boy = await DeliveryBoy_1.default.findOne({ _id: req.params.id, vendorId: farmerId });
        if (!boy) {
            res.status(404);
            throw new Error('Delivery boy not found');
        }
        boy.isActive = !boy.isActive;
        await boy.save();
        // Mirror on user status
        await User_1.default.findByIdAndUpdate(boy.userId, { status: boy.isActive ? 'active' : 'inactive' });
        res.status(200).json({ data: { isActive: boy.isActive } });
    }
    catch (error) {
        next(error);
    }
};
exports.toggleDeliveryBoy = toggleDeliveryBoy;
// @desc    Unassign delivery boy (sets vendorId to null instead of deleting user)
// @route   DELETE /api/delivery-boys/:id
const removeDeliveryBoy = async (req, res, next) => {
    try {
        const farmerId = req.user?.id;
        const boy = await DeliveryBoy_1.default.findOne({ _id: req.params.id, vendorId: farmerId });
        if (!boy) {
            res.status(404);
            throw new Error('Delivery boy not found');
        }
        boy.vendorId = null;
        boy.isActive = false;
        await boy.save();
        res.status(200).json({ data: {} });
    }
    catch (error) {
        next(error);
    }
};
exports.removeDeliveryBoy = removeDeliveryBoy;
// @desc    Search all delivery boys by name or phone
// @route   GET /api/delivery-boys/search
const searchDeliveryBoys = async (req, res, next) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(200).json({ data: [] });
        }
        // Find all users with a delivery role
        const deliveryRoles = await Role_1.default.find({ name: { $in: ['delivery', 'delivery_boy'] } });
        const roleIds = deliveryRoles.map(r => r._id);
        const userRoles = await UserRole_1.default.find({ roleId: { $in: roleIds } });
        const userIds = userRoles.map(ur => ur.userId);
        const users = await User_1.default.find({
            _id: { $in: userIds },
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { phone: { $regex: query, $options: 'i' } }
            ]
        }).select('name phone email status');
        const matchedUserIds = users.map(u => u._id);
        const boys = await DeliveryBoy_1.default.find({ userId: { $in: matchedUserIds } });
        const data = users.map((u) => {
            const dboy = boys.find(b => b.userId.toString() === u._id.toString());
            return {
                _id: dboy?._id,
                userId: u._id,
                name: u.name,
                phone: u.phone,
                email: u.email,
                vehicleType: dboy?.vehicleType || 'Bicycle',
                licenseNumber: dboy?.licenseNumber,
                isVerified: dboy?.isVerified || false,
                isActive: dboy?.isActive || false,
                vendorId: dboy?.vendorId
            };
        });
        res.status(200).json({ data });
    }
    catch (error) {
        next(error);
    }
};
exports.searchDeliveryBoys = searchDeliveryBoys;
// @desc    Assign a registered delivery boy to a farmer
// @route   PATCH /api/delivery-boys/:id/assign
const assignDeliveryBoy = async (req, res, next) => {
    try {
        const farmerId = req.user?.id;
        let boy = await DeliveryBoy_1.default.findById(req.params.id);
        if (!boy) {
            // Check if it's a User ID instead
            const user = await User_1.default.findById(req.params.id);
            if (user) {
                boy = await DeliveryBoy_1.default.findOne({ userId: user._id });
                if (!boy) {
                    boy = await DeliveryBoy_1.default.create({
                        userId: user._id,
                        vendorId: farmerId,
                        vehicleType: 'Bicycle',
                        isActive: true,
                        isVerified: true
                    });
                }
                else {
                    boy.vendorId = farmerId;
                    boy.isVerified = true;
                    boy.isActive = true;
                    await boy.save();
                }
            }
            else {
                res.status(404);
                throw new Error('Delivery boy not found');
            }
        }
        else {
            boy.vendorId = farmerId;
            boy.isVerified = true;
            boy.isActive = true;
            await boy.save();
        }
        const user = await User_1.default.findById(boy.userId).select('name phone email status');
        res.status(200).json({
            success: true,
            data: {
                _id: boy._id,
                userId: boy.userId,
                name: user?.name,
                phone: user?.phone,
                vehicleType: boy.vehicleType,
                licenseNumber: boy.licenseNumber,
                isActive: boy.isActive,
                isVerified: boy.isVerified,
                totalDeliveries: boy.totalDeliveries,
                rating: boy.rating,
                createdAt: boy.createdAt,
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.assignDeliveryBoy = assignDeliveryBoy;
