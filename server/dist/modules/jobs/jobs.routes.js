"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../../middleware/auth.middleware");
const jobs_controller_1 = require("./jobs.controller");
const router = express_1.default.Router();
router.use(auth_middleware_1.protect);
// Driver & Customer routes
router.get('/nearby', (0, auth_middleware_1.restrictTo)('delivery_boy', 'delivery', 'customer'), jobs_controller_1.getNearbyJobs);
router.post('/:id/apply', (0, auth_middleware_1.restrictTo)('delivery_boy', 'delivery', 'customer'), jobs_controller_1.applyJob);
router.get('/applications/me', (0, auth_middleware_1.restrictTo)('delivery_boy', 'delivery', 'customer'), jobs_controller_1.getMyApplications);
router.delete('/applications/:id', (0, auth_middleware_1.restrictTo)('delivery_boy', 'delivery', 'customer'), jobs_controller_1.withdrawApplication);
// Admin-only route for fetching all applications across jobs
router.get('/applications/all', (0, auth_middleware_1.restrictTo)('admin'), jobs_controller_1.getAllApplications);
// Farmer, Admin & Customer routes
router.route('/')
    .post((0, auth_middleware_1.restrictTo)('farmer'), jobs_controller_1.createJob)
    .get((0, auth_middleware_1.restrictTo)('farmer', 'admin', 'delivery_boy', 'delivery', 'customer'), jobs_controller_1.getJobs);
router.get('/:id/applications', (0, auth_middleware_1.restrictTo)('farmer', 'admin'), jobs_controller_1.getJobApplications);
router.patch('/:id/applications/:appId/reject', (0, auth_middleware_1.restrictTo)('farmer', 'admin'), jobs_controller_1.rejectApplication);
router.patch('/:id/applications/:appId/accept', (0, auth_middleware_1.restrictTo)('farmer'), jobs_controller_1.acceptApplication);
// Admin-only route
router.patch('/:id/applications/:appId/verify', (0, auth_middleware_1.restrictTo)('admin'), jobs_controller_1.verifyApplication);
router.patch('/:id/approve', (0, auth_middleware_1.restrictTo)('admin'), jobs_controller_1.approveJobRequest);
router.patch('/:id/admin-reject', (0, auth_middleware_1.restrictTo)('admin'), jobs_controller_1.rejectJobRequest);
exports.default = router;
