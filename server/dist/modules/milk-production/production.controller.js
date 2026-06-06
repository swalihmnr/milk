"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduction = exports.updateProduction = exports.createProduction = exports.getProduction = exports.getProductions = void 0;
const MilkProduction_1 = __importDefault(require("../../models/MilkProduction"));
const Cow_1 = __importDefault(require("../../models/Cow"));
const updateCowAverageOutput = async (cowId) => {
    try {
        const logs = await MilkProduction_1.default.find({ cowId });
        if (logs.length === 0) {
            await Cow_1.default.findByIdAndUpdate(cowId, { averageMilkOutput: 0 });
            return;
        }
        const dailyTotals = {};
        logs.forEach(log => {
            if (log.date) {
                const dateStr = new Date(log.date).toISOString().split('T')[0];
                dailyTotals[dateStr] = (dailyTotals[dateStr] || 0) + log.totalLiters;
            }
        });
        const uniqueDays = Object.keys(dailyTotals);
        if (uniqueDays.length === 0) {
            await Cow_1.default.findByIdAndUpdate(cowId, { averageMilkOutput: 0 });
            return;
        }
        const sumOfDailyTotals = uniqueDays.reduce((sum, dateStr) => sum + dailyTotals[dateStr], 0);
        const average = sumOfDailyTotals / uniqueDays.length;
        await Cow_1.default.findByIdAndUpdate(cowId, { averageMilkOutput: Number(average.toFixed(1)) });
    }
    catch (err) {
        console.error("Error updating cow average output:", err);
    }
};
const getProductions = async (req, res, next) => {
    try {
        const farmerId = req.user?.id;
        const productions = await MilkProduction_1.default.find({ farmerId }).sort('-date');
        res.status(200).json({ count: productions.length, data: productions });
    }
    catch (error) {
        next(error);
    }
};
exports.getProductions = getProductions;
const getProduction = async (req, res, next) => {
    try {
        const production = await MilkProduction_1.default.findOne({ _id: req.params.id, farmerId: req.user?.id });
        if (!production) {
            res.status(404);
            throw new Error('Production record not found');
        }
        res.status(200).json({ data: production });
    }
    catch (error) {
        next(error);
    }
};
exports.getProduction = getProduction;
const createProduction = async (req, res, next) => {
    try {
        const farmerId = req.user?.id;
        const production = await MilkProduction_1.default.create({ ...req.body, farmerId });
        if (production.cowId) {
            await updateCowAverageOutput(production.cowId.toString());
        }
        res.status(201).json({ data: production });
    }
    catch (error) {
        next(error);
    }
};
exports.createProduction = createProduction;
const updateProduction = async (req, res, next) => {
    try {
        const production = await MilkProduction_1.default.findOneAndUpdate({ _id: req.params.id, farmerId: req.user?.id }, req.body, { new: true, runValidators: true });
        if (!production) {
            res.status(404);
            throw new Error('Production record not found');
        }
        if (production.cowId) {
            await updateCowAverageOutput(production.cowId.toString());
        }
        res.status(200).json({ data: production });
    }
    catch (error) {
        next(error);
    }
};
exports.updateProduction = updateProduction;
const deleteProduction = async (req, res, next) => {
    try {
        const production = await MilkProduction_1.default.findOneAndDelete({ _id: req.params.id, farmerId: req.user?.id });
        if (!production) {
            res.status(404);
            throw new Error('Production record not found');
        }
        if (production.cowId) {
            await updateCowAverageOutput(production.cowId.toString());
        }
        res.status(200).json({ data: {} });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteProduction = deleteProduction;
