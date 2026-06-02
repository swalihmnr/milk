import { Request, Response, NextFunction } from 'express';
import Cow from '../../models/Cow';

export const getCows = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const farmerId = req.user?.id;
    const cows = await Cow.find({ farmerId }).sort('-createdAt');
    res.status(200).json({ count: cows.length, data: cows });
  } catch (error) {
    next(error);
  }
};

export const getCow = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cow = await Cow.findOne({ _id: req.params.id, farmerId: req.user?.id });
    if (!cow) {
      res.status(404);
      throw new Error('Cow not found');
    }
    res.status(200).json({ data: cow });
  } catch (error) {
    next(error);
  }
};

export const createCow = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const farmerId = req.user?.id;
    const cow = await Cow.create({ ...req.body, farmerId });
    res.status(201).json({ data: cow });
  } catch (error) {
    next(error);
  }
};

export const updateCow = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cow = await Cow.findOneAndUpdate(
      { _id: req.params.id, farmerId: req.user?.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!cow) {
      res.status(404);
      throw new Error('Cow not found');
    }
    res.status(200).json({ data: cow });
  } catch (error) {
    next(error);
  }
};

export const deleteCow = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cow = await Cow.findOneAndDelete({ _id: req.params.id, farmerId: req.user?.id });
    if (!cow) {
      res.status(404);
      throw new Error('Cow not found');
    }
    res.status(200).json({ data: {} });
  } catch (error) {
    next(error);
  }
};
