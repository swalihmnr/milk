"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const route_controller_1 = require("./route.controller");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const route_validation_1 = require("./route.validation");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const rbac_middleware_1 = require("../../middleware/rbac.middleware");
const router = express_1.default.Router();
router.use(auth_middleware_1.protect);
router.use((0, rbac_middleware_1.authorize)('farmer', 'admin'));
router.route('/')
    .get(route_controller_1.getRoutes)
    .post((0, validate_middleware_1.validate)(route_validation_1.createRouteSchema), route_controller_1.createRoute);
router.get('/delivery-boys', route_controller_1.getDeliveryBoys);
router.route('/:id')
    .get(route_controller_1.getRoute)
    .put((0, validate_middleware_1.validate)(route_validation_1.updateRouteSchema), route_controller_1.updateRoute)
    .delete(route_controller_1.deleteRoute);
router.patch('/:id/assign', route_controller_1.assignDeliveryBoy);
exports.default = router;
