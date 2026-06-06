"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeDeliveryBoy = exports.toggleDeliveryBoy = exports.registerDeliveryBoy = exports.getDeliveryBoys = void 0;
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
/**
 * PATCH /api/delivery-boys/:id/toggle
 * Activate or deactivate a delivery boy
 */
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
/**
 * DELETE /api/delivery-boys/:id
 * Removes a delivery boy (DeliveryBoy doc + User account)
 */
const removeDeliveryBoy = async (req, res, next) => {
    try {
        const farmerId = req.user?.id;
        const boy = await DeliveryBoy_1.default.findOneAndDelete({ _id: req.params.id, vendorId: farmerId });
        if (!boy) {
            res.status(404);
            throw new Error('Delivery boy not found');
        }
        // Remove user account and role mapping
        await UserRole_1.default.deleteMany({ userId: boy.userId });
        await User_1.default.findByIdAndDelete(boy.userId);
        res.status(200).json({ data: {} });
    }
    catch (error) {
        next(error);
    }
};
exports.removeDeliveryBoy = removeDeliveryBoy;
