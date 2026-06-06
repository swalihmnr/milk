"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const subscription_controller_1 = require("./subscription.controller");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const subscription_validation_1 = require("./subscription.validation");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const rbac_middleware_1 = require("../../middleware/rbac.middleware");
const router = express_1.default.Router();
router.use(auth_middleware_1.protect);
router.use((0, rbac_middleware_1.authorize)('farmer', 'admin'));
router.get('/customer/:customerId', subscription_controller_1.getCustomerSubscriptions);
router.route('/')
    .get(subscription_controller_1.getSubscriptions)
    .post((0, validate_middleware_1.validate)(subscription_validation_1.createSubscriptionSchema), subscription_controller_1.createSubscription);
router.route('/:id')
    .get(subscription_controller_1.getSubscription)
    .put((0, validate_middleware_1.validate)(subscription_validation_1.updateSubscriptionSchema), subscription_controller_1.updateSubscription)
    .delete(subscription_controller_1.deleteSubscription);
router.post('/:id/pause', subscription_controller_1.pauseSubscription);
router.post('/:id/resume', subscription_controller_1.resumeSubscription);
exports.default = router;
