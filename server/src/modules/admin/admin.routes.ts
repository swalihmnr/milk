import express from 'express';
import { getUsers, getVendors, updateVendorStatus, getAllInvoices, getAllDeliveries } from './admin.controller';
import { protect } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/users', getUsers);
router.get('/vendors', getVendors);
router.patch('/vendors/:id/status', updateVendorStatus);
router.get('/invoices', getAllInvoices);
router.get('/deliveries', getAllDeliveries);

export default router;
