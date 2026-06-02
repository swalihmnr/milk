import { Request, Response, NextFunction } from 'express';
import Complaint from '../../models/Complaint';

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
    const updateData: any = { ...req.body };
    if (req.body.status === 'resolved' || req.body.status === 'closed') {
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
    res.status(200).json({ data: complaint });
  } catch (error) {
    next(error);
  }
};
