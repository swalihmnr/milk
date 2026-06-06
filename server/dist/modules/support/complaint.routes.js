"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const complaint_controller_1 = require("./complaint.controller");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const complaint_validation_1 = require("./complaint.validation");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const rbac_middleware_1 = require("../../middleware/rbac.middleware");
const router = express_1.default.Router();
router.use(auth_middleware_1.protect);
router.use((0, rbac_middleware_1.authorize)('farmer', 'admin', 'customer'));
router.route('/')
    .get(complaint_controller_1.getComplaints)
    .post((0, validate_middleware_1.validate)(complaint_validation_1.createComplaintSchema), complaint_controller_1.createComplaint);
router.route('/:id')
    .patch((0, validate_middleware_1.validate)(complaint_validation_1.updateComplaintSchema), complaint_controller_1.updateComplaint);
exports.default = router;
