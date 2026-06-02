import { Request, Response, NextFunction } from 'express';
import MilkProduction from '../../models/MilkProduction';

export const getProductions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const farmerId = req.user?.id;
    const productions = await MilkProduction.find({ farmerId }).sort('-date');
    res.status(200).json({ count: productions.length, data: productions });
  } catch (error) {
    next(error);
  }
};

export const getProduction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const production = await MilkProduction.findOne({ _id: req.params.id, farmerId: req.user?.id });
    if (!production) {
      res.status(404);
      throw new Error('Production record not found');
    }
    res.status(200).json({ data: production });
  } catch (error) {
    next(error);
  }
};

export const createProduction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const farmerId = req.user?.id;
    const production = await MilkProduction.create({ ...req.body, farmerId });
    res.status(201).json({ data: production });
  } catch (error) {
    next(error);
  }
};

export const updateProduction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const production = await MilkProduction.findOneAndUpdate(
      { _id: req.params.id, farmerId: req.user?.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!production) {
      res.status(404);
      throw new Error('Production record not found');
    }
    res.status(200).json({ data: production });
  } catch (error) {
    next(error);
  }
};

export const deleteProduction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const production = await MilkProduction.findOneAndDelete({ _id: req.params.id, farmerId: req.user?.id });
    if (!production) {
      res.status(404);
      throw new Error('Production record not found');
    }
    res.status(200).json({ data: {} });
  } catch (error) {
    next(error);
  }
};
