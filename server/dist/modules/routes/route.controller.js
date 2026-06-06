"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDeliveryBoys = exports.assignDeliveryBoy = exports.deleteRoute = exports.updateRoute = exports.createRoute = exports.getRoute = exports.getRoutes = void 0;
const Route_1 = __importDefault(require("../../models/Route"));
const DeliveryBoy_1 = __importDefault(require("../../models/DeliveryBoy"));
const getRoutes = async (req, res, next) => {
    try {
        const farmerId = req.user?.id;
        const routes = await Route_1.default.find({ farmerId }).populate('deliveryBoyId', 'name phone');
        res.status(200).json({ count: routes.length, data: routes });
    }
    catch (error) {
        next(error);
    }
};
exports.getRoutes = getRoutes;
const getRoute = async (req, res, next) => {
    try {
        const route = await Route_1.default.findOne({ _id: req.params.id, farmerId: req.user?.id });
        if (!route) {
            res.status(404);
            throw new Error('Route not found');
        }
        res.status(200).json({ data: route });
    }
    catch (error) {
        next(error);
    }
};
exports.getRoute = getRoute;
const createRoute = async (req, res, next) => {
    try {
        const farmerId = req.user?.id;
        const route = await Route_1.default.create({ ...req.body, farmerId });
        res.status(201).json({ data: route });
    }
    catch (error) {
        next(error);
    }
};
exports.createRoute = createRoute;
const updateRoute = async (req, res, next) => {
    try {
        const route = await Route_1.default.findOneAndUpdate({ _id: req.params.id, farmerId: req.user?.id }, req.body, { new: true, runValidators: true });
        if (!route) {
            res.status(404);
            throw new Error('Route not found');
        }
        res.status(200).json({ data: route });
    }
    catch (error) {
        next(error);
    }
};
exports.updateRoute = updateRoute;
const deleteRoute = async (req, res, next) => {
    try {
        const route = await Route_1.default.findOneAndDelete({ _id: req.params.id, farmerId: req.user?.id });
        if (!route) {
            res.status(404);
            throw new Error('Route not found');
        }
        res.status(200).json({ data: {} });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteRoute = deleteRoute;
const assignDeliveryBoy = async (req, res, next) => {
    try {
        const { deliveryBoyId } = req.body;
        const route = await Route_1.default.findOneAndUpdate({ _id: req.params.id, farmerId: req.user?.id }, { deliveryBoyId: deliveryBoyId || null }, { new: true, runValidators: true }).populate('deliveryBoyId', 'name phone');
        if (!route) {
            res.status(404);
            throw new Error('Route not found');
        }
        res.status(200).json({ data: route });
    }
    catch (error) {
        next(error);
    }
};
exports.assignDeliveryBoy = assignDeliveryBoy;
const getDeliveryBoys = async (req, res, next) => {
    try {
        const farmerId = req.user?.id;
        const deliveryBoys = await DeliveryBoy_1.default.find({ vendorId: farmerId, isActive: true })
            .populate('userId', 'name phone')
            .limit(100);
        const data = deliveryBoys.map((db) => ({
            _id: db.userId?._id,
            name: db.userId?.name,
            phone: db.userId?.phone,
            vehicleType: db.vehicleType,
            rating: db.rating,
            totalDeliveries: db.totalDeliveries,
            deliveryBoyDocId: db._id,
        })).filter((d) => d._id);
        res.status(200).json({ count: data.length, data });
    }
    catch (error) {
        next(error);
    }
};
exports.getDeliveryBoys = getDeliveryBoys;
