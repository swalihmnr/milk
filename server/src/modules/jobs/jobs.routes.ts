import express from 'express';
import { protect, restrictTo } from '../../middleware/auth.middleware';
import { 
  createJob, 
  getJobs, 
  getNearbyJobs, 
  applyJob, 
  getJobApplications, 
  getAllApplications,
  getMyApplications,
  withdrawApplication,
  verifyApplication, 
  acceptApplication, 
  rejectApplication,
  approveJobRequest,
  rejectJobRequest
} from './jobs.controller';

const router = express.Router();

router.use(protect);

// Driver & Customer routes
router.get('/nearby', restrictTo('delivery_boy', 'delivery', 'customer'), getNearbyJobs);
router.post('/:id/apply', restrictTo('delivery_boy', 'delivery', 'customer'), applyJob);

router.get('/applications/me', restrictTo('delivery_boy', 'delivery', 'customer'), getMyApplications);
router.delete('/applications/:id', restrictTo('delivery_boy', 'delivery', 'customer'), withdrawApplication);

// Admin-only route for fetching all applications across jobs
router.get('/applications/all', restrictTo('admin'), getAllApplications);

// Farmer, Admin & Customer routes
router.route('/')
  .post(restrictTo('farmer'), createJob)
  .get(restrictTo('farmer', 'admin', 'delivery_boy', 'delivery', 'customer'), getJobs);

router.get('/:id/applications', restrictTo('farmer', 'admin'), getJobApplications);
router.patch('/:id/applications/:appId/reject', restrictTo('farmer', 'admin'), rejectApplication);
router.patch('/:id/applications/:appId/accept', restrictTo('farmer'), acceptApplication);

// Admin-only route
router.patch('/:id/applications/:appId/verify', restrictTo('admin'), verifyApplication);

router.patch('/:id/approve', restrictTo('admin'), approveJobRequest);
router.patch('/:id/admin-reject', restrictTo('admin'), rejectJobRequest);

export default router;
