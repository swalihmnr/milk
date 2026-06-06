"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dashboard_controller_1 = require("./dashboard.controller");
const router = express_1.default.Router();
router.get('/admin', dashboard_controller_1.getAdminStats);
router.get('/vendor/:vendorId', dashboard_controller_1.getVendorStats);
exports.default = router;
