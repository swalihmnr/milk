import { Request, Response, NextFunction } from 'express';
import User from '../../models/User';
import Vendor from '../../models/Vendor';
import UserRole from '../../models/UserRole';
import Role from '../../models/Role';
import Invoice from '../../models/Invoice';
import Delivery from '../../models/Delivery';

// @desc    Get all platform vendors
// @route   GET /api/admin/vendors
// @access  Private (Admin)
export const getVendors = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vendors = await Vendor.find()
      .populate('userId', 'name phone email status')
      .sort('-createdAt');
    res.status(200).json({ success: true, data: vendors });
  } catch (error) {
    next(error);
  }
};

// @desc    Update vendor approval status
// @route   PATCH /api/admin/vendors/:id/status
// @access  Private (Admin)
export const updateVendorStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { approvalStatus } = req.body;

    if (!['pending', 'approved', 'suspended'].includes(approvalStatus)) {
      res.status(400);
      throw new Error('Invalid approval status');
    }

    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      { approvalStatus },
      { new: true }
    ).populate('userId', 'name phone email status');

    if (!vendor) {
      res.status(404);
      throw new Error('Vendor not found');
    }

    // Mirror suspension on the User model status
    if (vendor.userId) {
      const userStatus = approvalStatus === 'suspended' ? 'inactive' : 'active';
      await User.findByIdAndUpdate(vendor.userId._id, { status: userStatus });
    }

    res.status(200).json({ success: true, data: vendor });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all platform users with roles
// @route   GET /api/admin/users
// @access  Private (Admin)
export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.find().select('-passwordHash').sort('-createdAt');
    
    const usersWithRoles = await Promise.all(
      users.map(async (user) => {
        const userRoles = await UserRole.find({ userId: user._id }).populate('roleId', 'name');
        return {
          ...user.toObject(),
          roles: userRoles.map((ur: any) => ur.roleId?.name || '')
        };
      })
    );

    res.status(200).json({ success: true, data: usersWithRoles });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all platform invoices (Orders)
// @route   GET /api/admin/invoices
// @access  Private (Admin)
export const getAllInvoices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const invoices = await Invoice.find()
      .populate('farmerId', 'name farmName')
      .populate('customerId', 'name phone')
      .sort('-createdAt');
    res.status(200).json({ success: true, data: invoices });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all platform deliveries
// @route   GET /api/admin/deliveries
// @access  Private (Admin)
export const getAllDeliveries = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deliveries = await Delivery.find()
      .populate('farmerId', 'name farmName')
      .populate('customerId', 'name phone')
      .populate('deliveryBoyId', 'name phone')
      .sort('-createdAt');
    res.status(200).json({ success: true, data: deliveries });
  } catch (error) {
    next(error);
  }
};
