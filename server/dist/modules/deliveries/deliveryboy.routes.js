"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const deliveryboy_controller_1 = require("./deliveryboy.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const rbac_middleware_1 = require("../../middleware/rbac.middleware");
const router = express_1.default.Router();
router.use(auth_middleware_1.protect);
router.use((0, rbac_middleware_1.authorize)('farmer', 'admin'));
router.get('/search', deliveryboy_controller_1.searchDeliveryBoys);
router.patch('/:id/assign', deliveryboy_controller_1.assignDeliveryBoy);
router.route('/')
    .get(deliveryboy_controller_1.getDeliveryBoys)
    .post(deliveryboy_controller_1.registerDeliveryBoy);
router.patch('/:id/toggle', deliveryboy_controller_1.toggleDeliveryBoy);
router.delete('/:id', deliveryboy_controller_1.removeDeliveryBoy);
exports.default = router;
