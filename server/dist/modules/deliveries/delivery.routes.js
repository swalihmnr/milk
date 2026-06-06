"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const delivery_controller_1 = require("./delivery.controller");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const delivery_validation_1 = require("./delivery.validation");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const rbac_middleware_1 = require("../../middleware/rbac.middleware");
const router = express_1.default.Router();
router.use(auth_middleware_1.protect);
// Admin, Farmer, and Delivery Boy can access
router.use((0, rbac_middleware_1.authorize)('farmer', 'admin', 'delivery'));
router.route('/')
    .get(delivery_controller_1.getDeliveries)
    .post((0, rbac_middleware_1.authorize)('farmer', 'admin'), (0, validate_middleware_1.validate)(delivery_validation_1.createDeliverySchema), delivery_controller_1.createDelivery);
router.route('/:id')
    .get(delivery_controller_1.getDelivery)
    .patch((0, validate_middleware_1.validate)(delivery_validation_1.updateDeliverySchema), delivery_controller_1.updateDeliveryStatus);
router.route('/:id/status')
    .patch((0, validate_middleware_1.validate)(delivery_validation_1.updateDeliverySchema), delivery_controller_1.updateDeliveryStatus);
exports.default = router;
