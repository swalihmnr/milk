"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const customer_controller_1 = require("./customer.controller");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const customer_validation_1 = require("./customer.validation");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const rbac_middleware_1 = require("../../middleware/rbac.middleware");
const router = express_1.default.Router();
router.use(auth_middleware_1.protect);
// Assuming 'farmer' and 'admin' can access customer data
router.use((0, rbac_middleware_1.authorize)('farmer', 'admin'));
router.route('/')
    .get(customer_controller_1.getCustomers)
    .post((0, validate_middleware_1.validate)(customer_validation_1.createCustomerSchema), customer_controller_1.createCustomer);
router.post('/assign-to-route', customer_controller_1.assignCustomersToRoute);
router.route('/:id')
    .get(customer_controller_1.getCustomer)
    .put((0, validate_middleware_1.validate)(customer_validation_1.updateCustomerSchema), customer_controller_1.updateCustomer)
    .delete(customer_controller_1.deleteCustomer);
exports.default = router;
