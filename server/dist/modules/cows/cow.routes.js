"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cow_controller_1 = require("./cow.controller");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const cow_validation_1 = require("./cow.validation");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const rbac_middleware_1 = require("../../middleware/rbac.middleware");
const router = express_1.default.Router();
router.use(auth_middleware_1.protect);
router.use((0, rbac_middleware_1.authorize)('farmer', 'admin'));
router.route('/')
    .get(cow_controller_1.getCows)
    .post((0, validate_middleware_1.validate)(cow_validation_1.createCowSchema), cow_controller_1.createCow);
router.route('/:id')
    .get(cow_controller_1.getCow)
    .put((0, validate_middleware_1.validate)(cow_validation_1.updateCowSchema), cow_controller_1.updateCow)
    .delete(cow_controller_1.deleteCow);
exports.default = router;
