import express from 'express';
import { getCows, getCow, createCow, updateCow, deleteCow } from './cow.controller';
import { validate } from '../../middleware/validate.middleware';
import { createCowSchema, updateCowSchema } from './cow.validation';
import { protect } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';

const router = express.Router();

router.use(protect);
router.use(authorize('farmer', 'admin'));

router.route('/')
  .get(getCows)
  .post(validate(createCowSchema), createCow);

router.route('/:id')
  .get(getCow)
  .put(validate(updateCowSchema), updateCow)
  .delete(deleteCow);

export default router;
