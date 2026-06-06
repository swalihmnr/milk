"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.payWithWallet = exports.configureAutoRecharge = exports.topupWallet = exports.getMyWallet = void 0;
const Wallet_1 = __importDefault(require("../../models/Wallet"));
// @desc    Get current user's wallet
// @route   GET /api/wallet/me
// @access  Private (Customer)
const getMyWallet = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        let wallet = await Wallet_1.default.findOne({ userId });
        if (!wallet) {
            wallet = await Wallet_1.default.create({
                userId,
                balance: 0,
                transactions: []
            });
        }
        res.status(200).json({ success: true, data: wallet });
    }
    catch (error) {
        next(error);
    }
};
exports.getMyWallet = getMyWallet;
// @desc    Top up user's wallet
// @route   POST /api/wallet/topup
// @access  Private (Customer)
const topupWallet = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const { amount } = req.body;
        if (!amount || amount <= 0) {
            res.status(400);
            throw new Error('Please provide a valid top-up amount');
        }
        let wallet = await Wallet_1.default.findOne({ userId });
        if (!wallet) {
            wallet = new Wallet_1.default({ userId, balance: 0, transactions: [] });
        }
        wallet.balance += Number(amount);
        wallet.transactions.push({
            amount: Number(amount),
            type: 'credit',
            description: 'Prepaid Wallet Top-Up (Simulated UPI/Card)',
            date: new Date()
        });
        await wallet.save();
        res.status(200).json({ success: true, data: wallet });
    }
    catch (error) {
        next(error);
    }
};
exports.topupWallet = topupWallet;
// @desc    Simulate auto-recharge settings
// @route   POST /api/wallet/auto-recharge
// @access  Private (Customer)
const configureAutoRecharge = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const { enabled, threshold, amount, cardDetails } = req.body;
        let wallet = await Wallet_1.default.findOne({ userId });
        if (!wallet) {
            wallet = new Wallet_1.default({ userId, balance: 0, transactions: [] });
        }
        wallet.autoRecharge = {
            enabled: !!enabled,
            threshold: Number(threshold) || 200,
            amount: Number(amount) || 500
        };
        if (cardDetails) {
            wallet.cardDetails = {
                number: cardDetails.number || '',
                expiry: cardDetails.expiry || '',
                cvv: cardDetails.cvv || ''
            };
        }
        await wallet.save();
        res.status(200).json({
            success: true,
            message: 'Auto-recharge settings saved successfully',
            data: wallet
        });
    }
    catch (error) {
        next(error);
    }
};
exports.configureAutoRecharge = configureAutoRecharge;
// @desc    Deduct amount from wallet for purchase
// @route   POST /api/wallet/pay
// @access  Private (Customer)
const payWithWallet = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const { amount, description } = req.body;
        if (!amount || amount <= 0) {
            res.status(400);
            throw new Error('Please provide a valid payment amount');
        }
        const wallet = await Wallet_1.default.findOne({ userId });
        if (!wallet || wallet.balance < amount) {
            res.status(400);
            throw new Error('Insufficient wallet balance');
        }
        wallet.balance -= Number(amount);
        wallet.transactions.push({
            amount: Number(amount),
            type: 'debit',
            description: description || 'Checkout payment',
            date: new Date()
        });
        // Check if auto-recharge needs to be triggered
        let autoRecharged = false;
        let autoAmount = 0;
        if (wallet.autoRecharge?.enabled && wallet.balance < wallet.autoRecharge.threshold) {
            autoAmount = wallet.autoRecharge.amount;
            wallet.balance += autoAmount;
            wallet.transactions.push({
                amount: autoAmount,
                type: 'credit',
                description: `Auto-Recharge replenishment (Card ending in ${wallet.cardDetails?.number?.slice(-4) || 'XXXX'})`,
                date: new Date()
            });
            autoRecharged = true;
        }
        await wallet.save();
        res.status(200).json({
            success: true,
            data: wallet,
            autoRecharged,
            autoAmount
        });
    }
    catch (error) {
        next(error);
    }
};
exports.payWithWallet = payWithWallet;
