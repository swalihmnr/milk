import express from 'express';
import { getSubscriptions, getSubscription, createSubscription, updateSubscription, deleteSubscription, pauseSubscription, resumeSubscription, getCustomerSubscriptions } from './subscription.controller';
import { validate } from '../../middleware/validate.middleware';
import { createSubscriptionSchema, updateSubscriptionSchema } from './subscription.validation';
import { protect } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';

const router = express.Router();

router.use(protect);
router.use(authorize('farmer', 'admin'));

router.get('/customer/:customerId', getCustomerSubscriptions);

router.route('/')
  .get(getSubscriptions)
  .post(validate(createSubscriptionSchema), createSubscription);

router.route('/:id')
  .get(getSubscription)
  .put(validate(updateSubscriptionSchema), updateSubscription)
  .delete(deleteSubscription);

router.post('/:id/pause', pauseSubscription);
router.post('/:id/resume', resumeSubscription);

export default router;
