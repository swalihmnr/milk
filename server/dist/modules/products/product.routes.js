"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const product_controller_1 = require("./product.controller");
const router = express_1.default.Router();
// Categories
router.get('/categories', product_controller_1.getCategories);
// Products
router.route('/')
    .get(product_controller_1.getProducts)
    .post(product_controller_1.createProduct);
router.route('/:id')
    .put(product_controller_1.updateProduct)
    .delete(product_controller_1.deleteProduct);
exports.default = router;
