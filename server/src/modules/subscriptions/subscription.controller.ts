import { Request, Response, NextFunction } from 'express';
import Subscription from '../../models/Subscription';
import Customer from '../../models/Customer';

export const getSubscriptions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const farmerId = req.user?.id;
    // Find customers belonging to this farmer
    const customers = await Customer.find({ farmerId }).select('_id');
    const customerIds = customers.map(c => c._id);

    const subscriptions = await Subscription.find({ 
      customerId: { $in: customerIds } 
    }).populate('customerId');
    
    res.status(200).json({ count: subscriptions.length, data: subscriptions });
  } catch (error) {
    next(error);
  }
};

export const getCustomerSubscriptions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { customerId } = req.params;
    const subscriptions = await Subscription.find({ customerId }).sort('-createdAt');
    res.status(200).json({ count: subscriptions.length, data: subscriptions });
  } catch (error) {
    next(error);
  }
};

export const getSubscription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const subscription = await Subscription.findById(req.params.id);
    if (!subscription) {
      res.status(404);
      throw new Error('Subscription not found');
    }
    res.status(200).json({ data: subscription });
  } catch (error) {
    next(error);
  }
};

export const createSubscription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const subscription = await Subscription.create(req.body);
    res.status(201).json({ data: subscription });
  } catch (error) {
    next(error);
  }
};

export const updateSubscription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const subscription = await Subscription.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!subscription) {
      res.status(404);
      throw new Error('Subscription not found');
    }
    res.status(200).json({ data: subscription });
  } catch (error) {
    next(error);
  }
};

export const pauseSubscription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pauseStartDate, pauseEndDate } = req.body;
    const subscription = await Subscription.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'paused', 
        vacationMode: true,
        pauseStartDate: new Date(pauseStartDate),
        pauseEndDate: new Date(pauseEndDate)
      },
      { new: true, runValidators: true }
    );
    if (!subscription) {
      res.status(404);
      throw new Error('Subscription not found');
    }
    res.status(200).json({ data: subscription });
  } catch (error) {
    next(error);
  }
};

export const resumeSubscription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const subscription = await Subscription.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'active', 
        vacationMode: false,
        $unset: { pauseStartDate: 1, pauseEndDate: 1 }
      },
      { new: true, runValidators: true }
    );
    if (!subscription) {
      res.status(404);
      throw new Error('Subscription not found');
    }
    res.status(200).json({ data: subscription });
  } catch (error) {
    next(error);
  }
};

export const deleteSubscription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const subscription = await Subscription.findByIdAndDelete(req.params.id);
    if (!subscription) {
      res.status(404);
      throw new Error('Subscription not found');
    }
    res.status(200).json({ data: {} });
  } catch (error) {
    next(error);
  }
};
