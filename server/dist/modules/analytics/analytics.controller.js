"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = void 0;
const getDashboardStats = async (req, res, next) => {
    try {
        const farmerId = req.user?.id;
        // Aggregations would go here. For now, returning mock structure that the UI expects.
        res.status(200).json({
            success: true,
            data: {
                milkProductionTrend: [
                    { name: 'Mon', liters: 240 },
                    { name: 'Tue', liters: 248 }
                ],
                revenueTrend: [
                    { name: 'Week 1', collected: 12000, pending: 4000 }
                ],
                kpis: {
                    totalCustomers: 126,
                    activeSubscriptions: 110,
                    pendingDues: 15500,
                    todaysProduction: 248
                }
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getDashboardStats = getDashboardStats;
