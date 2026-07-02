import { Request, Response, NextFunction } from 'express';
import DeliveryJob from '../../models/DeliveryJob';
import JobApplication from '../../models/JobApplication';
import User from '../../models/User';
import Notification from '../../models/Notification';
import Role from '../../models/Role';
import UserRole from '../../models/UserRole';
import DeliveryBoy from '../../models/DeliveryBoy';
import mongoose from 'mongoose';

// POST /api/jobs (Farmer creates a job)
export const createJob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description } = req.body;
    
    // Validate farmer
    const farmer = await User.findById(req.user?.id);
    if (!farmer || farmer.lat == null || farmer.lon == null) {
      res.status(400);
      throw new Error('Farmer must have a registered location to post a job. Please go to Profile Settings to update your farm location.');
    }

    // Set expiration to 24 hours from now
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const job = await DeliveryJob.create({
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
  } catch (error) {
    next(error);
  }
};

// GET /api/jobs (Admin/Farmer view)
export const getJobs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const role = req.user?.roles?.[0]; // Assume first role for simplicity
    let query: any = {};

    if (role === 'farmer') {
      query.farmerId = req.user?.id;
    } else if (role === 'customer' || role === 'delivery_boy') {
      query.status = 'open';
    } else if (role !== 'admin') {
      res.status(403);
      throw new Error('Unauthorized');
    }

    const jobs = await DeliveryJob.find(query)
      .populate('farmerId', 'name phone farmName')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: jobs });
  } catch (error) {
    next(error);
  }
};

// GET /api/jobs/nearby (Driver view)
export const getNearbyJobs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const driver = await User.findById(req.user?.id);
    if (!driver || driver.lat === undefined || driver.lon === undefined) {
      res.status(400);
      throw new Error('You must have a registered location to view nearby jobs.');
    }

    const jobs = await DeliveryJob.find({
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
  } catch (error) {
    next(error);
  }
};

// POST /api/jobs/:id/apply
export const applyJob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const jobId = req.params.id;
    const driverId = req.user?.id;

    const job = await DeliveryJob.findById(jobId);
    if (!job || job.status !== 'open') {
      res.status(400);
      throw new Error('Job is not available.');
    }

    const application = await JobApplication.create({
      jobId: new mongoose.Types.ObjectId(jobId as string),
      driverId: new mongoose.Types.ObjectId(driverId as string)
    });

    res.status(201).json({ success: true, data: application });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400);
      return next(new Error('You have already applied for this job.'));
    }
    next(error);
  }
};

// GET /api/jobs/applications/all (Admin only)
export const getAllApplications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.roles?.includes('admin')) {
      res.status(403);
      throw new Error('Unauthorized');
    }

    const applications = await JobApplication.find()
      .populate('driverId', 'name phone email lat lon')
      .populate({
        path: 'jobId',
        select: 'title farmerId',
        populate: { path: 'farmerId', select: 'name farmName phone' }
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: applications });
  } catch (error) {
    next(error);
  }
};

// GET /api/jobs/applications/me (Driver/Customer view)
export const getMyApplications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const applications = await JobApplication.find({ driverId: req.user?.id })
      .populate({
        path: 'jobId',
        select: 'title description farmerId',
        populate: { path: 'farmerId', select: 'name farmName phone' }
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: applications });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/jobs/applications/:id (Driver/Customer withdraws application)
export const withdrawApplication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const application = await JobApplication.findOneAndDelete({
      _id: req.params.id,
      driverId: req.user?.id,
      status: { $in: ['pending', 'verified_by_admin'] } // Can't withdraw if accepted/rejected
    });

    if (!application) {
      res.status(404);
      throw new Error('Application not found or cannot be withdrawn');
    }

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// GET /api/jobs/:id/applications
export const getJobApplications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const jobId = req.params.id;
    const role = req.user?.roles?.[0];
    
    // Only admin or the owning farmer can view applications
    const job = await DeliveryJob.findById(jobId);
    if (!job) {
      res.status(404);
      throw new Error('Job not found');
    }

    if (role === 'farmer' && job.farmerId.toString() !== req.user?.id) {
      res.status(403);
      throw new Error('Unauthorized');
    }

    const applications = await JobApplication.find({ jobId }).populate('driverId', 'name phone email lat lon');
    res.status(200).json({ success: true, data: applications });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/jobs/:id/applications/:appId/verify (Admin verifies)
export const verifyApplication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.roles?.includes('admin')) {
      res.status(403);
      throw new Error('Only admin can verify applications');
    }

    const application = await JobApplication.findOneAndUpdate(
      { _id: req.params.appId, jobId: req.params.id, status: 'pending' },
      { status: 'verified_by_admin' },
      { new: true }
    );

    if (!application) {
      res.status(404);
      throw new Error('Application not found or already processed');
    }

    res.status(200).json({ success: true, data: application });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/jobs/:id/applications/:appId/accept (Farmer accepts)
export const acceptApplication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: jobId, appId } = req.params;
    
    const job = await DeliveryJob.findById(jobId);
    if (!job || job.farmerId.toString() !== req.user?.id) {
      throw new Error('Job not found or unauthorized');
    }

    if (job.status !== 'open') {
      throw new Error('Job is already closed or filled');
    }

    const application = await JobApplication.findOne({ _id: appId, jobId });
    if (!application || application.status !== 'verified_by_admin') {
      throw new Error('Application not found or not verified by admin');
    }

    // 1. Accept this application
    application.status = 'accepted';
    await application.save();

    // 2. Reject all other applications for this job
    await JobApplication.updateMany(
      { jobId, _id: { $ne: appId } },
      { status: 'rejected' }
    );

    // 3. Mark job as filled
    job.status = 'filled';
    await job.save();

    // Link the driver to the farmer's DeliveryBoy records and verify them
    let deliveryBoy = await DeliveryBoy.findOne({ userId: application.driverId });
    if (!deliveryBoy) {
      deliveryBoy = await DeliveryBoy.create({
        userId: application.driverId,
        vendorId: job.farmerId,
        vehicleType: 'Bicycle',
        isActive: true,
        isVerified: true
      });
    } else {
      deliveryBoy.vendorId = job.farmerId;
      deliveryBoy.isVerified = true;
      await deliveryBoy.save();
    }

    res.status(200).json({ success: true, data: application });
  } catch (error: any) {
    res.status(400);
    next(error);
  }
};

// PATCH /api/jobs/:id/applications/:appId/reject (Farmer or Admin rejects)
export const rejectApplication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: jobId, appId } = req.params;
    const role = req.user?.roles?.[0];
    
    const job = await DeliveryJob.findById(jobId);
    if (!job) {
      res.status(404);
      throw new Error('Job not found');
    }

    if (role !== 'admin' && job.farmerId.toString() !== req.user?.id) {
      res.status(403);
      throw new Error('Unauthorized');
    }

    const application = await JobApplication.findOneAndUpdate(
      { _id: appId, jobId, status: { $in: ['pending', 'verified_by_admin'] } },
      { status: 'rejected' },
      { new: true }
    );

    if (!application) {
      res.status(404);
      throw new Error('Application not found or cannot be rejected');
    }

    res.status(200).json({ success: true, data: application });
  } catch (error) {
    next(error);
  }
};
// PATCH /api/jobs/:id/approve (Admin approves job request)
export const approveJobRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const job = await DeliveryJob.findOneAndUpdate(
      { _id: req.params.id, status: 'pending' },
      { status: 'open' },
      { new: true }
    ).populate('farmerId');
    
    if (!job) {
      res.status(404);
      throw new Error('Job not found or already processed');
    }

    // Notify nearby users about the new vacancy
    const farmer = job.farmerId as any;
    if (farmer) {
      // Find the customer role to only notify customers
      const customerRole = await Role.findOne({ name: 'customer' });
      let targetUserIds: any[] = [];
      
      if (customerRole) {
        const userRoles = await UserRole.find({ roleId: customerRole._id });
        targetUserIds = userRoles.map(ur => ur.userId);
      }

      // Notify customers only
      const nearbyUsers = await User.find({ 
        _id: { $in: targetUserIds, $ne: farmer._id } 
      });

      const notifications = nearbyUsers.map(u => ({
        userId: u._id,
        title: 'New Delivery Job Available!',
        message: `${farmer.farmName || farmer.name} has posted a delivery job vacancy near you. Interested? Check the Job Board!`,
        type: 'info'
      }));

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    }

    res.status(200).json({ success: true, data: job });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/jobs/:id/admin-reject (Admin rejects job request)
export const rejectJobRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const job = await DeliveryJob.findOneAndUpdate(
      { _id: req.params.id, status: 'pending' },
      { status: 'rejected' },
      { new: true }
    );
    if (!job) {
      res.status(404);
      throw new Error('Job not found or already processed');
    }
    res.status(200).json({ success: true, data: job });
  } catch (error) {
    next(error);
  }
};
