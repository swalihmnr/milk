"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const invoice_controller_1 = require("./invoice.controller");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const invoice_validation_1 = require("./invoice.validation");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const rbac_middleware_1 = require("../../middleware/rbac.middleware");
const router = express_1.default.Router();
router.use(auth_middleware_1.protect);
router.use((0, rbac_middleware_1.authorize)('farmer', 'admin'));
router.route('/')
    .get(invoice_controller_1.getInvoices)
    .post((0, validate_middleware_1.validate)(invoice_validation_1.createInvoiceSchema), invoice_controller_1.createInvoice);
router.route('/:id')
    .patch((0, validate_middleware_1.validate)(invoice_validation_1.updateInvoiceSchema), invoice_controller_1.updateInvoice);
exports.default = router;
