import { Request, Response, NextFunction } from 'express';
import Customer from '../../models/Customer';

export const getCustomers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const farmerId = req.user?.id;
    const customers = await Customer.find({ farmerId }).sort('-createdAt');
    res.status(200).json({ count: customers.length, data: customers });
  } catch (error) {
    next(error);
  }
};

export const getCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customer = await Customer.findOne({ _id: req.params.id, farmerId: req.user?.id });
    if (!customer) {
      res.status(404);
      throw new Error('Customer not found');
    }
    res.status(200).json({ data: customer });
  } catch (error) {
    next(error);
  }
};

export const createCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const farmerId = req.user?.id;
    const customer = await Customer.create({ ...req.body, farmerId });
    res.status(201).json({ data: customer });
  } catch (error) {
    next(error);
  }
};

export const updateCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customer = await Customer.findOneAndUpdate(
      { _id: req.params.id, farmerId: req.user?.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!customer) {
      res.status(404);
      throw new Error('Customer not found');
    }
    res.status(200).json({ data: customer });
  } catch (error) {
    next(error);
  }
};

export const deleteCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customer = await Customer.findOneAndDelete({ _id: req.params.id, farmerId: req.user?.id });
    if (!customer) {
      res.status(404);
      throw new Error('Customer not found');
    }
    res.status(200).json({ data: {} });
  } catch (error) {
    next(error);
  }
};

// Bulk assign/unassign customers to a route
export const assignCustomersToRoute = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const farmerId = req.user?.id;
    const { routeId, customerIds } = req.body as { routeId: string | null; customerIds: string[] };

    if (!Array.isArray(customerIds)) {
      res.status(400);
      throw new Error('customerIds must be an array');
    }

    // Unassign all existing customers of this route first
    if (routeId) {
      await Customer.updateMany(
        { farmerId, routeId },
        { $unset: { routeId: '' } }
      );
    }

    // Assign selected customers
    if (customerIds.length > 0) {
      await Customer.updateMany(
        { farmerId, _id: { $in: customerIds } },
        { routeId: routeId || null }
      );
    }

    const updated = await Customer.find({ farmerId, routeId });
    res.status(200).json({ count: updated.length, data: updated });
  } catch (error) {
    next(error);
  }
};

