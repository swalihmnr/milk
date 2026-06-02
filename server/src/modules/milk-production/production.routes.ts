import express from 'express';
import { getProductions, getProduction, createProduction, updateProduction, deleteProduction } from './production.controller';
import { validate } from '../../middleware/validate.middleware';
import { createProductionSchema, updateProductionSchema } from './production.validation';
import { protect } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';

const router = express.Router();

router.use(protect);
router.use(authorize('farmer', 'admin', 'vendor'));

router.route('/')
  .get(getProductions)
  .post(validate(createProductionSchema), createProduction);

router.route('/:id')
  .get(getProduction)
  .put(validate(updateProductionSchema), updateProduction)
  .delete(deleteProduction);

export default router;
