"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategories = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProducts = void 0;
const Product_1 = __importDefault(require("../../models/Product"));
const Category_1 = __importDefault(require("../../models/Category"));
// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
    try {
        const { popular, category, vendorId } = req.query;
        let query = {};
        if (popular === 'true')
            query.isPopular = true;
        if (category)
            query.categoryId = category;
        if (vendorId)
            query.vendorId = vendorId;
        const products = await Product_1.default.find(query).populate('categoryId', 'name slug');
        res.status(200).json({ count: products.length, data: products });
    }
    catch (error) {
        next(error);
    }
};
exports.getProducts = getProducts;
// @desc    Create a product
// @route   POST /api/products
// @access  Private (Vendor/Admin)
const createProduct = async (req, res, next) => {
    try {
        let { categoryId, ...productData } = req.body;
        if (!categoryId) {
            let defaultCat = await Category_1.default.findOne({ name: 'Milk' });
            if (!defaultCat) {
                defaultCat = await Category_1.default.create({ name: 'Milk', slug: 'milk' });
            }
            categoryId = defaultCat._id;
        }
        const product = await Product_1.default.create({ ...productData, categoryId });
        res.status(201).json({ data: product });
    }
    catch (error) {
        next(error);
    }
};
exports.createProduct = createProduct;
// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private (Vendor/Admin)
const updateProduct = async (req, res, next) => {
    try {
        const product = await Product_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!product) {
            res.status(404);
            throw new Error('Product not found');
        }
        res.status(200).json({ data: product });
    }
    catch (error) {
        next(error);
    }
};
exports.updateProduct = updateProduct;
// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private (Vendor/Admin)
const deleteProduct = async (req, res, next) => {
    try {
        const product = await Product_1.default.findByIdAndDelete(req.params.id);
        if (!product) {
            res.status(404);
            throw new Error('Product not found');
        }
        res.status(200).json({ data: {} });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteProduct = deleteProduct;
// @desc    Get all categories
// @route   GET /api/products/categories
// @access  Public
const getCategories = async (req, res, next) => {
    try {
        let categories = await Category_1.default.find();
        if (categories.length === 0) {
            const defaultCat = await Category_1.default.create({ name: 'Milk', slug: 'milk' });
            categories = [defaultCat];
        }
        res.status(200).json({ count: categories.length, data: categories });
    }
    catch (error) {
        next(error);
    }
};
exports.getCategories = getCategories;
