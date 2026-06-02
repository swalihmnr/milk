import express from 'express';
import { getProducts, createProduct, updateProduct, deleteProduct, getCategories } from './product.controller';

const router = express.Router();

// Categories
router.get('/categories', getCategories);

// Products
router.route('/')
  .get(getProducts)
  .post(createProduct);

router.route('/:id')
  .put(updateProduct)
  .delete(deleteProduct);

export default router;
