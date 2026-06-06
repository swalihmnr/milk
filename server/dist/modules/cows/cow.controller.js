"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCow = exports.updateCow = exports.createCow = exports.getCow = exports.getCows = void 0;
const Cow_1 = __importDefault(require("../../models/Cow"));
const getCows = async (req, res, next) => {
    try {
        const farmerId = req.user?.id;
        const cows = await Cow_1.default.find({ farmerId }).sort('-createdAt');
        res.status(200).json({ count: cows.length, data: cows });
    }
    catch (error) {
        next(error);
    }
};
exports.getCows = getCows;
const getCow = async (req, res, next) => {
    try {
        const cow = await Cow_1.default.findOne({ _id: req.params.id, farmerId: req.user?.id });
        if (!cow) {
            res.status(404);
            throw new Error('Cow not found');
        }
        res.status(200).json({ data: cow });
    }
    catch (error) {
        next(error);
    }
};
exports.getCow = getCow;
const createCow = async (req, res, next) => {
    try {
        const farmerId = req.user?.id;
        const cow = await Cow_1.default.create({ ...req.body, farmerId });
        res.status(201).json({ data: cow });
    }
    catch (error) {
        next(error);
    }
};
exports.createCow = createCow;
const updateCow = async (req, res, next) => {
    try {
        const cow = await Cow_1.default.findOneAndUpdate({ _id: req.params.id, farmerId: req.user?.id }, req.body, { new: true, runValidators: true });
        if (!cow) {
            res.status(404);
            throw new Error('Cow not found');
        }
        res.status(200).json({ data: cow });
    }
    catch (error) {
        next(error);
    }
};
exports.updateCow = updateCow;
const deleteCow = async (req, res, next) => {
    try {
        const cow = await Cow_1.default.findOneAndDelete({ _id: req.params.id, farmerId: req.user?.id });
        if (!cow) {
            res.status(404);
            throw new Error('Cow not found');
        }
        res.status(200).json({ data: {} });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteCow = deleteCow;
