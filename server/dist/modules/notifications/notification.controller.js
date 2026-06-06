"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAsRead = exports.getNotifications = void 0;
const Notification_1 = __importDefault(require("../../models/Notification"));
const getNotifications = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const notifications = await Notification_1.default.find({ userId }).sort('-createdAt').limit(20);
        res.status(200).json({ data: notifications });
    }
    catch (error) {
        next(error);
    }
};
exports.getNotifications = getNotifications;
const markAsRead = async (req, res, next) => {
    try {
        const notification = await Notification_1.default.findOneAndUpdate({ _id: req.params.id, userId: req.user?.id }, { readStatus: true }, { new: true });
        res.status(200).json({ data: notification });
    }
    catch (error) {
        next(error);
    }
};
exports.markAsRead = markAsRead;
