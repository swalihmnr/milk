"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const wallet_controller_1 = require("./wallet.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = express_1.default.Router();
router.use(auth_middleware_1.protect);
router.get('/me', wallet_controller_1.getMyWallet);
router.post('/topup', wallet_controller_1.topupWallet);
router.post('/pay', wallet_controller_1.payWithWallet);
router.post('/auto-recharge', wallet_controller_1.configureAutoRecharge);
exports.default = router;
