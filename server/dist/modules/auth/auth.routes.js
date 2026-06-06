"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("./auth.controller");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const auth_validation_1 = require("./auth.validation");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = express_1.default.Router();
router.post('/signup', (0, validate_middleware_1.validate)(auth_validation_1.signupSchema), auth_controller_1.signup);
router.post('/login', (0, validate_middleware_1.validate)(auth_validation_1.loginSchema), auth_controller_1.login);
router.post('/logout', auth_controller_1.logout);
router.get('/me', auth_middleware_1.protect, auth_controller_1.getMe);
router.put('/profile', auth_middleware_1.protect, auth_controller_1.updateProfile);
router.post('/forgot-password', (0, validate_middleware_1.validate)(auth_validation_1.forgotPasswordSchema), auth_controller_1.forgotPassword);
router.post('/reset-password', (0, validate_middleware_1.validate)(auth_validation_1.resetPasswordSchema), auth_controller_1.resetPassword);
exports.default = router;
