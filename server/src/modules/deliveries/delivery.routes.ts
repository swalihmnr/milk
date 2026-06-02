import express from 'express';
import { getDeliveries, getDelivery, createDelivery, updateDeliveryStatus } from './delivery.controller';
import { validate } from '../../middleware/validate.middleware';
import { createDeliverySchema, updateDeliverySchema } from './delivery.validation';
import { protect } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';

const router = express.Router();

router.use(protect);
// Admin, Farmer, and Delivery Boy can access
router.use(authorize('farmer', 'admin', 'delivery'));

router.route('/')
  .get(getDeliveries)
  .post(authorize('farmer', 'admin'), validate(createDeliverySchema), createDelivery);

router.route('/:id')
  .get(getDelivery)
  .patch(validate(updateDeliverySchema), updateDeliveryStatus);

export default router;
