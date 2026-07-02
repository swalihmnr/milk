import { Request, Response, NextFunction } from 'express';
import User from '../../models/User';
import DeliveryBoy from '../../models/DeliveryBoy';
import Role from '../../models/Role';
import UserRole from '../../models/UserRole';
import { hashPassword } from '../../utils/hash';

/**
 * GET /api/delivery-boys
 * Returns all delivery boys created by the farmer (vendorId = farmerId)
 */
export const getDeliveryBoys = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const farmerId = req.user?.id;
    const boys = await DeliveryBoy.find({ vendorId: farmerId })
      .populate('userId', 'name phone email status')
      .sort('-createdAt');

    const data = boys.map((b: any) => ({
      _id: b._id,
      userId: b.userId?._id,
      name: b.userId?.name,
      phone: b.userId?.phone,
      email: b.userId?.email,
      status: b.userId?.status,
      vehicleType: b.vehicleType,
      licenseNumber: b.licenseNumber,
      isActive: b.isActive,
      totalDeliveries: b.totalDeliveries,
      rating: b.rating,
      createdAt: b.createdAt,
    }));

    res.status(200).json({ count: data.length, data });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/delivery-boys
 * Farmer registers a new delivery boy:
 *   1. Creates a User account
 *   2. Creates a DeliveryBoy profile linked to farmer
 *   3. Assigns 'delivery_boy' role
 */
export const registerDeliveryBoy = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const farmerId = req.user?.id;
    const { name, phone, password, vehicleType, licenseNumber } = req.body;

    // Check phone not already taken
    const existing = await User.findOne({ phone });
    if (existing) {
      res.status(400);
      throw new Error('A user with this phone number already exists');
    }

    // Create user
    const passwordHash = await hashPassword(password);
    const user = await User.create({
      name,
      phone,
      passwordHash,
      status: 'active',
    });

    // Ensure delivery_boy role exists
    let role = await Role.findOne({ name: 'delivery_boy' });
    if (!role) {
      role = await Role.create({ name: 'delivery_boy', description: 'Delivery personnel', permissions: [] });
    }

    // Assign role
    await UserRole.create({ userId: user._id, roleId: role._id });

    // Create DeliveryBoy profile
    const deliveryBoy = await DeliveryBoy.create({
      userId: user._id,
      vendorId: farmerId,
      vehicleType: vehicleType || 'Bicycle',
      licenseNumber: licenseNumber || undefined,
      isActive: true,
    });

    res.status(201).json({
      data: {
        _id: deliveryBoy._id,
        userId: user._id,
        name: user.name,
        phone: user.phone,
        vehicleType: deliveryBoy.vehicleType,
        licenseNumber: deliveryBoy.licenseNumber,
        isActive: deliveryBoy.isActive,
        totalDeliveries: 0,
        rating: 5.0,
        createdAt: deliveryBoy.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle active status
// @route   PATCH /api/delivery-boys/:id/toggle
export const toggleDeliveryBoy = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const farmerId = req.user?.id;
    const boy = await DeliveryBoy.findOne({ _id: req.params.id, vendorId: farmerId });
    if (!boy) {
      res.status(404);
      throw new Error('Delivery boy not found');
    }
    boy.isActive = !boy.isActive;
    await boy.save();
    // Mirror on user status
    await User.findByIdAndUpdate(boy.userId, { status: boy.isActive ? 'active' : 'inactive' });
    res.status(200).json({ data: { isActive: boy.isActive } });
  } catch (error) {
    next(error);
  }
};

// @desc    Unassign delivery boy (sets vendorId to null instead of deleting user)
// @route   DELETE /api/delivery-boys/:id
export const removeDeliveryBoy = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const farmerId = req.user?.id;
    const boy = await DeliveryBoy.findOne({ _id: req.params.id, vendorId: farmerId });
    if (!boy) {
      res.status(404);
      throw new Error('Delivery boy not found');
    }
    
    boy.vendorId = null as any;
    boy.isActive = false;
    await boy.save();
    
    res.status(200).json({ data: {} });
  } catch (error) {
    next(error);
  }
};

// @desc    Search all delivery boys by name or phone
// @route   GET /api/delivery-boys/search
export const searchDeliveryBoys = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(200).json({ data: [] });
    }

    // Find all users with a delivery role
    const deliveryRoles = await Role.find({ name: { $in: ['delivery', 'delivery_boy'] } });
    const roleIds = deliveryRoles.map(r => r._id);
    const userRoles = await UserRole.find({ roleId: { $in: roleIds } });
    const userIds = userRoles.map(ur => ur.userId);

    const users = await User.find({
      _id: { $in: userIds },
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { phone: { $regex: query, $options: 'i' } }
      ]
    } as any).select('name phone email status');

    const matchedUserIds = users.map(u => u._id);
    const boys = await DeliveryBoy.find({ userId: { $in: matchedUserIds } });

    const data = users.map((u: any) => {
      const dboy = boys.find(b => b.userId.toString() === u._id.toString());
      return {
        _id: dboy?._id,
        userId: u._id,
        name: u.name,
        phone: u.phone,
        email: u.email,
        vehicleType: dboy?.vehicleType || 'Bicycle',
        licenseNumber: dboy?.licenseNumber,
        isVerified: dboy?.isVerified || false,
        isActive: dboy?.isActive || false,
        vendorId: dboy?.vendorId
      };
    });

    res.status(200).json({ data });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign a registered delivery boy to a farmer
// @route   PATCH /api/delivery-boys/:id/assign
export const assignDeliveryBoy = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const farmerId = req.user?.id;
    let boy = await DeliveryBoy.findById(req.params.id);
    if (!boy) {
      // Check if it's a User ID instead
      const user = await User.findById(req.params.id);
      if (user) {
        boy = await DeliveryBoy.findOne({ userId: user._id });
        if (!boy) {
          boy = await DeliveryBoy.create({
            userId: user._id,
            vendorId: farmerId,
            vehicleType: 'Bicycle',
            isActive: true,
            isVerified: true
          });
        } else {
          boy.vendorId = farmerId as any;
          boy.isVerified = true;
          boy.isActive = true;
          await boy.save();
        }
      } else {
        res.status(404);
        throw new Error('Delivery boy not found');
      }
    } else {
      boy.vendorId = farmerId as any;
      boy.isVerified = true;
      boy.isActive = true;
      await boy.save();
    }

    const user = await User.findById(boy.userId).select('name phone email status');

    res.status(200).json({
      success: true,
      data: {
        _id: boy._id,
        userId: boy.userId,
        name: user?.name,
        phone: user?.phone,
        vehicleType: boy.vehicleType,
        licenseNumber: boy.licenseNumber,
        isActive: boy.isActive,
        isVerified: boy.isVerified,
        totalDeliveries: boy.totalDeliveries,
        rating: boy.rating,
        createdAt: boy.createdAt,
      }
    });
  } catch (error) {
    next(error);
  }
};
