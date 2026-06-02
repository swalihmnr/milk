import express from 'express';
import { getAdminStats, getVendorStats } from './dashboard.controller';

const router = express.Router();

router.get('/admin', getAdminStats);
router.get('/vendor/:vendorId', getVendorStats);

export default router;
