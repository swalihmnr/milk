"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const payment_controller_1 = require("./payment.controller");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const payment_validation_1 = require("./payment.validation");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const rbac_middleware_1 = require("../../middleware/rbac.middleware");
const router = express_1.default.Router();
router.use(auth_middleware_1.protect);
router.use((0, rbac_middleware_1.authorize)('farmer', 'admin', 'vendor'));
router.route('/')
    .get(payment_controller_1.getPayments)
    .post((0, validate_middleware_1.validate)(payment_validation_1.createPaymentSchema), payment_controller_1.createPayment);
exports.default = router;
