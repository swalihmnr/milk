"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const vendor_controller_1 = require("./vendor.controller");
const router = express_1.default.Router();
router.get('/', vendor_controller_1.getApprovedVendors);
exports.default = router;
