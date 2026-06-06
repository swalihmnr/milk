"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const production_controller_1 = require("./production.controller");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const production_validation_1 = require("./production.validation");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const rbac_middleware_1 = require("../../middleware/rbac.middleware");
const router = express_1.default.Router();
router.use(auth_middleware_1.protect);
router.use((0, rbac_middleware_1.authorize)('farmer', 'admin', 'vendor'));
router.route('/')
    .get(production_controller_1.getProductions)
    .post((0, validate_middleware_1.validate)(production_validation_1.createProductionSchema), production_controller_1.createProduction);
router.route('/:id')
    .get(production_controller_1.getProduction)
    .put((0, validate_middleware_1.validate)(production_validation_1.updateProductionSchema), production_controller_1.updateProduction)
    .delete(production_controller_1.deleteProduction);
exports.default = router;
