import { Request, Response, NextFunction } from 'express';
import User from '../../models/User';
import Delivery from '../../models/Delivery';
import Product from '../../models/Product';
import Vendor from '../../models/Vendor';

// @desc    Get admin overview stats
// @route   GET /api/dashboard/admin
// @access  Private (Admin)
export const getAdminStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'customer' });
    const totalOrders = await Delivery.countDocuments();
    const pendingVendors = await Vendor.find({ isApproved: false }).limit(5);
    
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

    const lowStockProducts = await Product.find({ vendorId, stockQuantity: { $lt: 10 } });
    const activeProducts = await Product.countDocuments({ vendorId, isActive: true });
    
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
