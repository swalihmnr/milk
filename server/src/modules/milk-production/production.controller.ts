import { Request, Response, NextFunction } from 'express';
import MilkProduction from '../../models/MilkProduction';
import Cow from '../../models/Cow';

const updateCowAverageOutput = async (cowId: string) => {
  try {
    const logs = await MilkProduction.find({ cowId });
    if (logs.length === 0) {
      await Cow.findByIdAndUpdate(cowId, { averageMilkOutput: 0 });
      return;
    }

    const dailyTotals: { [dateStr: string]: number } = {};
    logs.forEach(log => {
      if (log.date) {
        const dateStr = new Date(log.date).toISOString().split('T')[0];
        dailyTotals[dateStr] = (dailyTotals[dateStr] || 0) + log.totalLiters;
      }
    });

    const uniqueDays = Object.keys(dailyTotals);
    if (uniqueDays.length === 0) {
      await Cow.findByIdAndUpdate(cowId, { averageMilkOutput: 0 });
      return;
    }

    const sumOfDailyTotals = uniqueDays.reduce((sum, dateStr) => sum + dailyTotals[dateStr], 0);
    const average = sumOfDailyTotals / uniqueDays.length;

    await Cow.findByIdAndUpdate(cowId, { averageMilkOutput: Number(average.toFixed(1)) });
  } catch (err) {
    console.error("Error updating cow average output:", err);
  }
};

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
    if (production.cowId) {
      await updateCowAverageOutput(production.cowId.toString());
    }
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
    if (production.cowId) {
      await updateCowAverageOutput(production.cowId.toString());
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
    if (production.cowId) {
      await updateCowAverageOutput(production.cowId.toString());
    }
    res.status(200).json({ data: {} });
  } catch (error) {
    next(error);
  }
};
