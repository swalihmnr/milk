import { Request, Response, NextFunction } from 'express';
import Complaint from '../../models/Complaint';
import Customer from '../../models/Customer';
import User from '../../models/User';
import Wallet from '../../models/Wallet';
import Refund from '../../models/Refund';

export const getComplaints = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const farmerId = req.user?.id;
    const complaints = await Complaint.find({ farmerId })
      .populate('customerId', 'name phone')
      .sort('-createdAt');
    res.status(200).json({ count: complaints.length, data: complaints });
  } catch (error) {
    next(error);
  }
};

export const createComplaint = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const farmerId = req.user?.id;
    const complaint = await Complaint.create({ ...req.body, farmerId });
    res.status(201).json({ data: complaint });
  } catch (error) {
    next(error);
  }
};

export const updateComplaint = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, priority, assignedTo, refundAmount } = req.body;
    const updateData: any = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (assignedTo) updateData.assignedTo = assignedTo;

    if (status === 'resolved' || status === 'closed') {
      updateData.resolvedAt = new Date();
    }
    
    const complaint = await Complaint.findOneAndUpdate(
      { _id: req.params.id, farmerId: req.user?.id },
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!complaint) {
      res.status(404);
      throw new Error('Complaint not found');
    }

    // Process refund if requested and approved
    if (refundAmount && refundAmount > 0 && status === 'resolved') {
      const customer = await Customer.findById(complaint.customerId);
      if (customer) {
        const customerUser = await User.findOne({ phone: customer.phone });
        if (customerUser) {
          // 1. Create Refund record
          await Refund.create({
            userId: customerUser._id,
            amount: refundAmount,
            status: 'completed',
            reason: `Refund for complaint: ${complaint.title}`
          });

          // 2. Credit Customer Wallet
          let wallet = await Wallet.findOne({ userId: customerUser._id });
          if (!wallet) {
            wallet = new Wallet({ userId: customerUser._id, balance: 0, transactions: [] });
          }
          wallet.balance += Number(refundAmount);
          wallet.transactions.push({
            amount: Number(refundAmount),
            type: 'credit',
            description: `Refund Approved for Complaint: ${complaint.title}`,
            date: new Date()
          });
          await wallet.save();
        }
      }
    }

    res.status(200).json({ data: complaint });
  } catch (error) {
    next(error);
  }
};
