import express from 'express';
import { getDashboardStats } from './analytics.controller';
import { protect } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';

const router = express.Router();

router.use(protect);
router.use(authorize('farmer', 'admin'));

router.get('/dashboard-stats', getDashboardStats);

export default router;
