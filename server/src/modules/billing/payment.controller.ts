import { Request, Response, NextFunction } from 'express';
import Payment from '../../models/Payment';
import Invoice from '../../models/Invoice';

export const getPayments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const farmerId = req.user?.id;
    const payments = await Payment.find({ farmerId })
      .populate('customerId', 'name')
      .populate('collectedBy', 'name')
      .sort('-paidAt');
      
    res.status(200).json({ count: payments.length, data: payments });
  } catch (error) {
    next(error);
  }
};

export const createPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const farmerId = req.user?.id;
    const collectedBy = req.user?.id;
    
    const payment = await Payment.create({ 
      ...req.body, 
      farmerId,
      collectedBy
    });

    // If an invoice is attached, update the invoice paidAmount and status
    if (req.body.invoiceId) {
      const invoice = await Invoice.findById(req.body.invoiceId);
      if (invoice) {
        invoice.paidAmount += req.body.amount;
        invoice.pendingAmount -= req.body.amount;
        if (invoice.pendingAmount <= 0) {
          invoice.status = 'paid';
          invoice.pendingAmount = 0;
        } else {
          invoice.status = 'partial';
        }
        await invoice.save();
      }
    }

    res.status(201).json({ data: payment });
  } catch (error) {
    next(error);
  }
};
