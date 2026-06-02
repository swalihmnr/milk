import { Request, Response, NextFunction } from 'express';
import Delivery from '../../models/Delivery';

export const getDeliveries = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const farmerId = req.user?.id;
    const filter: any = { farmerId };
    
    if (req.query.date) {
      filter.date = req.query.date;
    }
    if (req.query.routeId) {
      filter.routeId = req.query.routeId;
    }

    const deliveries = await Delivery.find(filter)
      .populate('customerId', 'name address phone')
      .populate('routeId', 'name')
      .populate('deliveryBoyId', 'name');
      
    res.status(200).json({ count: deliveries.length, data: deliveries });
  } catch (error) {
    next(error);
  }
};

export const getDelivery = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const delivery = await Delivery.findOne({ _id: req.params.id, farmerId: req.user?.id });
    if (!delivery) {
      res.status(404);
      throw new Error('Delivery not found');
    }
    res.status(200).json({ data: delivery });
  } catch (error) {
    next(error);
  }
};

export const createDelivery = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const farmerId = req.user?.id;
    const delivery = await Delivery.create({ ...req.body, farmerId });
    res.status(201).json({ data: delivery });
  } catch (error) {
    next(error);
  }
};

export const updateDeliveryStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updateData: any = { ...req.body };
    
    // Proof-based delivery verification
    if (req.body.status === 'delivered') {
      updateData.confirmedAt = new Date();
      updateData.isAutoConfirmed = false;
      
      // Set complaint window to 4 hours from now
      const complaintEnds = new Date();
      complaintEnds.setHours(complaintEnds.getHours() + 4);
      updateData.complaintWindowEndsAt = complaintEnds;
      
      // Coordinates and photo are already in req.body validated by zod
    }
    
    const delivery = await Delivery.findOneAndUpdate(
      { _id: req.params.id, farmerId: req.user?.id },
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!delivery) {
      res.status(404);
      throw new Error('Delivery not found');
    }
    res.status(200).json({ data: delivery });
  } catch (error) {
    next(error);
  }
};
