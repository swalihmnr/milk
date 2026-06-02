import { Request, Response, NextFunction } from 'express';
import Notification from '../../models/Notification';

export const getNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const notifications = await Notification.find({ userId }).sort('-createdAt').limit(20);
    
    res.status(200).json({ data: notifications });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user?.id },
      { readStatus: true },
      { new: true }
    );
    res.status(200).json({ data: notification });
  } catch (error) {
    next(error);
  }
};
