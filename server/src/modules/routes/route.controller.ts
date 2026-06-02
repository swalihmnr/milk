import { Request, Response, NextFunction } from 'express';
import Route from '../../models/Route';
import DeliveryBoy from '../../models/DeliveryBoy';

export const getRoutes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const farmerId = req.user?.id;
    const routes = await Route.find({ farmerId }).populate('deliveryBoyId', 'name phone');
    res.status(200).json({ count: routes.length, data: routes });
  } catch (error) {
    next(error);
  }
};

export const getRoute = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const route = await Route.findOne({ _id: req.params.id, farmerId: req.user?.id });
    if (!route) {
      res.status(404);
      throw new Error('Route not found');
    }
    res.status(200).json({ data: route });
  } catch (error) {
    next(error);
  }
};

export const createRoute = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const farmerId = req.user?.id;
    const route = await Route.create({ ...req.body, farmerId });
    res.status(201).json({ data: route });
  } catch (error) {
    next(error);
  }
};

export const updateRoute = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const route = await Route.findOneAndUpdate(
      { _id: req.params.id, farmerId: req.user?.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!route) {
      res.status(404);
      throw new Error('Route not found');
    }
    res.status(200).json({ data: route });
  } catch (error) {
    next(error);
  }
};

export const deleteRoute = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const route = await Route.findOneAndDelete({ _id: req.params.id, farmerId: req.user?.id });
    if (!route) {
      res.status(404);
      throw new Error('Route not found');
    }
    res.status(200).json({ data: {} });
  } catch (error) {
    next(error);
  }
};

export const assignDeliveryBoy = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { deliveryBoyId } = req.body;
    const route = await Route.findOneAndUpdate(
      { _id: req.params.id, farmerId: req.user?.id },
      { deliveryBoyId: deliveryBoyId || null },
      { new: true, runValidators: true }
    ).populate('deliveryBoyId', 'name phone');
    if (!route) {
      res.status(404);
      throw new Error('Route not found');
    }
    res.status(200).json({ data: route });
  } catch (error) {
    next(error);
  }
};

export const getDeliveryBoys = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const farmerId = req.user?.id;
    const deliveryBoys = await DeliveryBoy.find({ vendorId: farmerId, isActive: true })
      .populate('userId', 'name phone')
      .limit(100);
    const data = deliveryBoys.map((db: any) => ({
      _id: db.userId?._id,
      name: db.userId?.name,
      phone: db.userId?.phone,
      vehicleType: db.vehicleType,
      rating: db.rating,
      totalDeliveries: db.totalDeliveries,
      deliveryBoyDocId: db._id,
    })).filter((d: any) => d._id);
    res.status(200).json({ count: data.length, data });
  } catch (error) {
    next(error);
  }
};
