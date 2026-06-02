import express from 'express';
import { getPayments, createPayment } from './payment.controller';
import { validate } from '../../middleware/validate.middleware';
import { createPaymentSchema } from './payment.validation';
import { protect } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';

const router = express.Router();

router.use(protect);
router.use(authorize('farmer', 'admin', 'vendor'));

router.route('/')
  .get(getPayments)
  .post(validate(createPaymentSchema), createPayment);

export default router;
