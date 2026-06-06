import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import User from '../../models/User';
import Delivery from '../../models/Delivery';
import Product from '../../models/Product';
import Vendor from '../../models/Vendor';
import Role from '../../models/Role';
import UserRole from '../../models/UserRole';

// @desc    Get admin overview stats
// @route   GET /api/dashboard/admin
// @access  Private (Admin)
export const getAdminStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customerRole = await Role.findOne({ name: 'customer' });
    let totalUsers = 0;
    if (customerRole) {
      totalUsers = await UserRole.countDocuments({ roleId: customerRole._id });
    }
    const totalOrders = await Delivery.countDocuments();
    const pendingVendors = await Vendor.find({ approvalStatus: 'pending' }).limit(5).populate('userId', 'name phone email');
    
    // Mocking revenue for now since we don't have a generic "Order" or "Payment" model fully tracking all inflows yet
    const totalRevenue = 124500; 

    res.status(200).json({
      data: {
        totalRevenue,
        totalUsers,
        totalOrders,
        pendingVendors
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get vendor dashboard stats
// @route   GET /api/dashboard/vendor/:vendorId
// @access  Private (Vendor)
export const getVendorStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { vendorId } = req.params;
    const vIdString = Array.isArray(vendorId) ? vendorId[0] : vendorId;
    let targetVendorId = vIdString;

    if (!vIdString || !mongoose.Types.ObjectId.isValid(vIdString)) {
      const firstVendor = await Vendor.findOne();
      if (firstVendor) {
        targetVendorId = firstVendor._id.toString();
      }
    }

    const lowStockProducts = await Product.find({ vendorId: targetVendorId, stockQuantity: { $lt: 10 } });
    const activeProducts = await Product.countDocuments({ vendorId: targetVendorId, isActive: true });
    
    // Mocking recent orders
    const recentOrders = [
      { id: 'ORD-2021', items: 3, total: 450, status: 'Packing' },
      { id: 'ORD-2022', items: 1, total: 60, status: 'Packing' },
      { id: 'ORD-2023', items: 2, total: 180, status: 'Packing' },
    ];

    res.status(200).json({
      data: {
        todaySales: 12450,
        activeSubscriptions: 450,
        pendingOrders: 45,
        lowStockProducts,
        recentOrders
      }
    });
  } catch (error) {
    next(error);
  }
};
