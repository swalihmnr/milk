import { Request, Response } from 'express';
import Vendor from '../../models/Vendor';
import User from '../../models/User';

export const getApprovedVendors = async (req: Request, res: Response) => {
  try {
    const vendors = await Vendor.find({ approvalStatus: 'approved' }).populate('userId', 'name phone email farmName village city lat lon');
    res.status(200).json({ success: true, data: vendors });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
