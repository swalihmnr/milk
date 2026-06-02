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

/**
 * PATCH /api/delivery-boys/:id/toggle
 * Activate or deactivate a delivery boy
 */
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

/**
 * DELETE /api/delivery-boys/:id
 * Removes a delivery boy (DeliveryBoy doc + User account)
 */
export const removeDeliveryBoy = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const farmerId = req.user?.id;
    const boy = await DeliveryBoy.findOneAndDelete({ _id: req.params.id, vendorId: farmerId });
    if (!boy) {
      res.status(404);
      throw new Error('Delivery boy not found');
    }
    // Remove user account and role mapping
    await UserRole.deleteMany({ userId: boy.userId });
    await User.findByIdAndDelete(boy.userId);
    res.status(200).json({ data: {} });
  } catch (error) {
    next(error);
  }
};
