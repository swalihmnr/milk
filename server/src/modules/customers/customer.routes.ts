import express from 'express';
import { getCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer, assignCustomersToRoute } from './customer.controller';
import { validate } from '../../middleware/validate.middleware';
import { createCustomerSchema, updateCustomerSchema } from './customer.validation';
import { protect } from '../../middleware/auth.middleware';
import { authorize as rbacAuthorize } from '../../middleware/rbac.middleware';

const router = express.Router();

router.use(protect);
// Assuming 'farmer' and 'admin' can access customer data
router.use(rbacAuthorize('farmer', 'admin'));

router.route('/')
  .get(getCustomers)
  .post(validate(createCustomerSchema), createCustomer);

router.post('/assign-to-route', assignCustomersToRoute);

router.route('/:id')
  .get(getCustomer)
  .put(validate(updateCustomerSchema), updateCustomer)
  .delete(deleteCustomer);

export default router;

