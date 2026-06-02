import { Request, Response, NextFunction } from 'express';
import Invoice from '../../models/Invoice';

export const getInvoices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const farmerId = req.user?.id;
    const filter: any = { farmerId };
    
    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.customerId) {
      filter.customerId = req.query.customerId;
    }

    const invoices = await Invoice.find(filter)
      .populate('customerId', 'name address phone')
      .sort('-createdAt');
      
    res.status(200).json({ count: invoices.length, data: invoices });
  } catch (error) {
    next(error);
  }
};

export const createInvoice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const farmerId = req.user?.id;
    const pendingAmount = req.body.totalAmount;
    const invoice = await Invoice.create({ 
      ...req.body, 
      farmerId,
      pendingAmount
    });
    res.status(201).json({ data: invoice });
  } catch (error) {
    next(error);
  }
};

export const updateInvoice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const invoice = await Invoice.findOneAndUpdate(
      { _id: req.params.id, farmerId: req.user?.id },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!invoice) {
      res.status(404);
      throw new Error('Invoice not found');
    }
    res.status(200).json({ data: invoice });
  } catch (error) {
    next(error);
  }
};
