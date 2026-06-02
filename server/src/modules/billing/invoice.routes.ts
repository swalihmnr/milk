import express from 'express';
import { getInvoices, createInvoice, updateInvoice } from './invoice.controller';
import { validate } from '../../middleware/validate.middleware';
import { createInvoiceSchema, updateInvoiceSchema } from './invoice.validation';
import { protect } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';

const router = express.Router();

router.use(protect);
router.use(authorize('farmer', 'admin'));

router.route('/')
  .get(getInvoices)
  .post(validate(createInvoiceSchema), createInvoice);

router.route('/:id')
  .patch(validate(updateInvoiceSchema), updateInvoice);

export default router;
