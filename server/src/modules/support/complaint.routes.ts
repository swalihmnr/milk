import express from 'express';
import { getComplaints, createComplaint, updateComplaint } from './complaint.controller';
import { validate } from '../../middleware/validate.middleware';
import { createComplaintSchema, updateComplaintSchema } from './complaint.validation';
import { protect } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';

const router = express.Router();

router.use(protect);
router.use(authorize('farmer', 'admin', 'customer'));

router.route('/')
  .get(getComplaints)
  .post(validate(createComplaintSchema), createComplaint);

router.route('/:id')
  .patch(validate(updateComplaintSchema), updateComplaint);

export default router;
