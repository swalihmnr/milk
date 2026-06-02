import { Request, Response, NextFunction } from 'express';
import Product from '../../models/Product';
import Category from '../../models/Category';

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { popular, category, vendorId } = req.query;
    
    let query: any = {};
    if (popular === 'true') query.isPopular = true;
    if (category) query.categoryId = category;
    if (vendorId) query.vendorId = vendorId;

    const products = await Product.find(query).populate('categoryId', 'name slug');
    res.status(200).json({ count: products.length, data: products });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private (Vendor/Admin)
export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let { categoryId, ...productData } = req.body;
    if (!categoryId) {
      let defaultCat = await Category.findOne({ name: 'Milk' });
      if (!defaultCat) {
        defaultCat = await Category.create({ name: 'Milk', slug: 'milk' });
      }
      categoryId = defaultCat._id;
    }
    const product = await Product.create({ ...productData, categoryId });
    res.status(201).json({ data: product });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private (Vendor/Admin)
export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }
    res.status(200).json({ data: product });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private (Vendor/Admin)
export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }
    res.status(200).json({ data: {} });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all categories
// @route   GET /api/products/categories
// @access  Public
export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let categories = await Category.find();
    if (categories.length === 0) {
      const defaultCat = await Category.create({ name: 'Milk', slug: 'milk' });
      categories = [defaultCat];
    }
    res.status(200).json({ count: categories.length, data: categories });
  } catch (error) {
    next(error);
  }
};
