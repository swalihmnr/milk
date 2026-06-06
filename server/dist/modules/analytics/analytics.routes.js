"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const analytics_controller_1 = require("./analytics.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const rbac_middleware_1 = require("../../middleware/rbac.middleware");
const router = express_1.default.Router();
router.use(auth_middleware_1.protect);
router.use((0, rbac_middleware_1.authorize)('farmer', 'admin'));
router.get('/dashboard-stats', analytics_controller_1.getDashboardStats);
exports.default = router;
