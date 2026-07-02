"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rejectJobRequest = exports.approveJobRequest = exports.rejectApplication = exports.acceptApplication = exports.verifyApplication = exports.getJobApplications = exports.withdrawApplication = exports.getMyApplications = exports.getAllApplications = exports.applyJob = exports.getNearbyJobs = exports.getJobs = exports.createJob = void 0;
const DeliveryJob_1 = __importDefault(require("../../models/DeliveryJob"));
const JobApplication_1 = __importDefault(require("../../models/JobApplication"));
const User_1 = __importDefault(require("../../models/User"));
const Notification_1 = __importDefault(require("../../models/Notification"));
const Role_1 = __importDefault(require("../../models/Role"));
const UserRole_1 = __importDefault(require("../../models/UserRole"));
const DeliveryBoy_1 = __importDefault(require("../../models/DeliveryBoy"));
const mongoose_1 = __importDefault(require("mongoose"));
// POST /api/jobs (Farmer creates a job)
const createJob = async (req, res, next) => {
    try {
        const { title, description } = req.body;
        // Validate farmer
        const farmer = await User_1.default.findById(req.user?.id);
        if (!farmer || farmer.lat == null || farmer.lon == null) {
            res.status(400);
            throw new Error('Farmer must have a registered location to post a job. Please go to Profile Settings to update your farm location.');
        }
        // Set expiration to 24 hours from now
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);
        const job = await DeliveryJob_1.default.create({
            farmerId: req.user?.id,
            title,
            description,
            expiresAt,
            location: {
                type: 'Point',
                coordinates: [farmer.lon, farmer.lat]
            }
        });
        res.status(201).json({ success: true, data: job });
    }
    catch (error) {
        next(error);
    }
};
exports.createJob = createJob;
// GET /api/jobs (Admin/Farmer view)
const getJobs = async (req, res, next) => {
    try {
        const role = req.user?.roles?.[0]; // Assume first role for simplicity
        let query = {};
        if (role === 'farmer') {
            query.farmerId = req.user?.id;
        }
        else if (role === 'customer' || role === 'delivery_boy') {
            query.status = 'open';
        }
        else if (role !== 'admin') {
            res.status(403);
            throw new Error('Unauthorized');
        }
        const jobs = await DeliveryJob_1.default.find(query)
            .populate('farmerId', 'name phone farmName')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: jobs });
    }
    catch (error) {
        next(error);
    }
};
exports.getJobs = getJobs;
// GET /api/jobs/nearby (Driver view)
const getNearbyJobs = async (req, res, next) => {
    try {
        const driver = await User_1.default.findById(req.user?.id);
        if (!driver || driver.lat === undefined || driver.lon === undefined) {
            res.status(400);
            throw new Error('You must have a registered location to view nearby jobs.');
        }
        const jobs = await DeliveryJob_1.default.find({
            status: 'open',
            location: {
                $nearSphere: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [driver.lon, driver.lat]
                    },
                    // Find within 50 km (50000 meters)
                    $maxDistance: 50000
                }
            }
        }).populate('farmerId', 'name farmName phone');
        res.status(200).json({ success: true, data: jobs });
    }
    catch (error) {
        next(error);
    }
};
exports.getNearbyJobs = getNearbyJobs;
// POST /api/jobs/:id/apply
const applyJob = async (req, res, next) => {
    try {
        const jobId = req.params.id;
        const driverId = req.user?.id;
        const job = await DeliveryJob_1.default.findById(jobId);
        if (!job || job.status !== 'open') {
            res.status(400);
            throw new Error('Job is not available.');
        }
        const application = await JobApplication_1.default.create({
            jobId: new mongoose_1.default.Types.ObjectId(jobId),
            driverId: new mongoose_1.default.Types.ObjectId(driverId)
        });
        res.status(201).json({ success: true, data: application });
    }
    catch (error) {
        if (error.code === 11000) {
            res.status(400);
            return next(new Error('You have already applied for this job.'));
        }
        next(error);
    }
};
exports.applyJob = applyJob;
// GET /api/jobs/applications/all (Admin only)
const getAllApplications = async (req, res, next) => {
    try {
        if (!req.user?.roles?.includes('admin')) {
            res.status(403);
            throw new Error('Unauthorized');
        }
        const applications = await JobApplication_1.default.find()
            .populate('driverId', 'name phone email lat lon')
            .populate({
            path: 'jobId',
            select: 'title farmerId',
            populate: { path: 'farmerId', select: 'name farmName phone' }
        })
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: applications });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllApplications = getAllApplications;
// GET /api/jobs/applications/me (Driver/Customer view)
const getMyApplications = async (req, res, next) => {
    try {
        const applications = await JobApplication_1.default.find({ driverId: req.user?.id })
            .populate({
            path: 'jobId',
            select: 'title description farmerId',
            populate: { path: 'farmerId', select: 'name farmName phone' }
        })
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: applications });
    }
    catch (error) {
        next(error);
    }
};
exports.getMyApplications = getMyApplications;
// DELETE /api/jobs/applications/:id (Driver/Customer withdraws application)
const withdrawApplication = async (req, res, next) => {
    try {
        const application = await JobApplication_1.default.findOneAndDelete({
            _id: req.params.id,
            driverId: req.user?.id,
            status: { $in: ['pending', 'verified_by_admin'] } // Can't withdraw if accepted/rejected
        });
        if (!application) {
            res.status(404);
            throw new Error('Application not found or cannot be withdrawn');
        }
        res.status(200).json({ success: true, data: {} });
    }
    catch (error) {
        next(error);
    }
};
exports.withdrawApplication = withdrawApplication;
// GET /api/jobs/:id/applications
const getJobApplications = async (req, res, next) => {
    try {
        const jobId = req.params.id;
        const role = req.user?.roles?.[0];
        // Only admin or the owning farmer can view applications
        const job = await DeliveryJob_1.default.findById(jobId);
        if (!job) {
            res.status(404);
            throw new Error('Job not found');
        }
        if (role === 'farmer' && job.farmerId.toString() !== req.user?.id) {
            res.status(403);
            throw new Error('Unauthorized');
        }
        const applications = await JobApplication_1.default.find({ jobId }).populate('driverId', 'name phone email lat lon');
        res.status(200).json({ success: true, data: applications });
    }
    catch (error) {
        next(error);
    }
};
exports.getJobApplications = getJobApplications;
// PATCH /api/jobs/:id/applications/:appId/verify (Admin verifies)
const verifyApplication = async (req, res, next) => {
    try {
        if (!req.user?.roles?.includes('admin')) {
            res.status(403);
            throw new Error('Only admin can verify applications');
        }
        const application = await JobApplication_1.default.findOneAndUpdate({ _id: req.params.appId, jobId: req.params.id, status: 'pending' }, { status: 'verified_by_admin' }, { new: true });
        if (!application) {
            res.status(404);
            throw new Error('Application not found or already processed');
        }
        res.status(200).json({ success: true, data: application });
    }
    catch (error) {
        next(error);
    }
};
exports.verifyApplication = verifyApplication;
// PATCH /api/jobs/:id/applications/:appId/accept (Farmer accepts)
const acceptApplication = async (req, res, next) => {
    try {
        const { id: jobId, appId } = req.params;
        const job = await DeliveryJob_1.default.findById(jobId);
        if (!job || job.farmerId.toString() !== req.user?.id) {
            throw new Error('Job not found or unauthorized');
        }
        if (job.status !== 'open') {
            throw new Error('Job is already closed or filled');
        }
        const application = await JobApplication_1.default.findOne({ _id: appId, jobId });
        if (!application || application.status !== 'verified_by_admin') {
            throw new Error('Application not found or not verified by admin');
        }
        // 1. Accept this application
        application.status = 'accepted';
        await application.save();
        // 2. Reject all other applications for this job
        await JobApplication_1.default.updateMany({ jobId, _id: { $ne: appId } }, { status: 'rejected' });
        // 3. Mark job as filled
        job.status = 'filled';
        await job.save();
        // Link the driver to the farmer's DeliveryBoy records and verify them
        let deliveryBoy = await DeliveryBoy_1.default.findOne({ userId: application.driverId });
        if (!deliveryBoy) {
            deliveryBoy = await DeliveryBoy_1.default.create({
                userId: application.driverId,
                vendorId: job.farmerId,
                vehicleType: 'Bicycle',
                isActive: true,
                isVerified: true
            });
        }
        else {
            deliveryBoy.vendorId = job.farmerId;
            deliveryBoy.isVerified = true;
            await deliveryBoy.save();
        }
        res.status(200).json({ success: true, data: application });
    }
    catch (error) {
        res.status(400);
        next(error);
    }
};
exports.acceptApplication = acceptApplication;
// PATCH /api/jobs/:id/applications/:appId/reject (Farmer or Admin rejects)
const rejectApplication = async (req, res, next) => {
    try {
        const { id: jobId, appId } = req.params;
        const role = req.user?.roles?.[0];
        const job = await DeliveryJob_1.default.findById(jobId);
        if (!job) {
            res.status(404);
            throw new Error('Job not found');
        }
        if (role !== 'admin' && job.farmerId.toString() !== req.user?.id) {
            res.status(403);
            throw new Error('Unauthorized');
        }
        const application = await JobApplication_1.default.findOneAndUpdate({ _id: appId, jobId, status: { $in: ['pending', 'verified_by_admin'] } }, { status: 'rejected' }, { new: true });
        if (!application) {
            res.status(404);
            throw new Error('Application not found or cannot be rejected');
        }
        res.status(200).json({ success: true, data: application });
    }
    catch (error) {
        next(error);
    }
};
exports.rejectApplication = rejectApplication;
// PATCH /api/jobs/:id/approve (Admin approves job request)
const approveJobRequest = async (req, res, next) => {
    try {
        const job = await DeliveryJob_1.default.findOneAndUpdate({ _id: req.params.id, status: 'pending' }, { status: 'open' }, { new: true }).populate('farmerId');
        if (!job) {
            res.status(404);
            throw new Error('Job not found or already processed');
        }
        // Notify nearby users about the new vacancy
        const farmer = job.farmerId;
        if (farmer) {
            // Find the customer role to only notify customers
            const customerRole = await Role_1.default.findOne({ name: 'customer' });
            let targetUserIds = [];
            if (customerRole) {
                const userRoles = await UserRole_1.default.find({ roleId: customerRole._id });
                targetUserIds = userRoles.map(ur => ur.userId);
            }
            // Notify customers only
            const nearbyUsers = await User_1.default.find({
                _id: { $in: targetUserIds, $ne: farmer._id }
            });
            const notifications = nearbyUsers.map(u => ({
                userId: u._id,
                title: 'New Delivery Job Available!',
                message: `${farmer.farmName || farmer.name} has posted a delivery job vacancy near you. Interested? Check the Job Board!`,
                type: 'info'
            }));
            if (notifications.length > 0) {
                await Notification_1.default.insertMany(notifications);
            }
        }
        res.status(200).json({ success: true, data: job });
    }
    catch (error) {
        next(error);
    }
};
exports.approveJobRequest = approveJobRequest;
// PATCH /api/jobs/:id/admin-reject (Admin rejects job request)
const rejectJobRequest = async (req, res, next) => {
    try {
        const job = await DeliveryJob_1.default.findOneAndUpdate({ _id: req.params.id, status: 'pending' }, { status: 'rejected' }, { new: true });
        if (!job) {
            res.status(404);
            throw new Error('Job not found or already processed');
        }
        res.status(200).json({ success: true, data: job });
    }
    catch (error) {
        next(error);
    }
};
exports.rejectJobRequest = rejectJobRequest;
