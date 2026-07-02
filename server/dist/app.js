"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const env_1 = require("./config/env");
const error_middleware_1 = require("./middleware/error.middleware");
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const customer_routes_1 = __importDefault(require("./modules/customers/customer.routes"));
const cow_routes_1 = __importDefault(require("./modules/cows/cow.routes"));
const production_routes_1 = __importDefault(require("./modules/milk-production/production.routes"));
const subscription_routes_1 = __importDefault(require("./modules/subscriptions/subscription.routes"));
const route_routes_1 = __importDefault(require("./modules/routes/route.routes"));
const delivery_routes_1 = __importDefault(require("./modules/deliveries/delivery.routes"));
const deliveryboy_routes_1 = __importDefault(require("./modules/deliveries/deliveryboy.routes"));
const invoice_routes_1 = __importDefault(require("./modules/billing/invoice.routes"));
const payment_routes_1 = __importDefault(require("./modules/billing/payment.routes"));
const complaint_routes_1 = __importDefault(require("./modules/support/complaint.routes"));
const notification_routes_1 = __importDefault(require("./modules/notifications/notification.routes"));
const analytics_routes_1 = __importDefault(require("./modules/analytics/analytics.routes"));
const product_routes_1 = __importDefault(require("./modules/products/product.routes"));
const dashboard_routes_1 = __importDefault(require("./modules/dashboard/dashboard.routes"));
const vendor_routes_1 = __importDefault(require("./modules/vendors/vendor.routes"));
const wallet_routes_1 = __importDefault(require("./modules/wallet/wallet.routes"));
const admin_routes_1 = __importDefault(require("./modules/admin/admin.routes"));
const jobs_routes_1 = __importDefault(require("./modules/jobs/jobs.routes"));
const app = (0, express_1.default)();
// Security Middlewares
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: [env_1.env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
}));
// Body parsing
app.use(express_1.default.json({ limit: '1mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '1mb' }));
app.use((0, cookie_parser_1.default)());
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/customers', customer_routes_1.default);
app.use('/api/cows', cow_routes_1.default);
app.use('/api/production', production_routes_1.default);
app.use('/api/subscriptions', subscription_routes_1.default);
app.use('/api/routes', route_routes_1.default);
app.use('/api/deliveries', delivery_routes_1.default);
app.use('/api/delivery-boys', deliveryboy_routes_1.default);
app.use('/api/invoices', invoice_routes_1.default);
app.use('/api/payments', payment_routes_1.default);
app.use('/api/complaints', complaint_routes_1.default);
app.use('/api/notifications', notification_routes_1.default);
app.use('/api/analytics', analytics_routes_1.default);
app.use('/api/products', product_routes_1.default);
app.use('/api/dashboard', dashboard_routes_1.default);
app.use('/api/vendors', vendor_routes_1.default);
app.use('/api/wallet', wallet_routes_1.default);
app.use('/api/admin', admin_routes_1.default);
app.use('/api/jobs', jobs_routes_1.default);
const seed_1 = require("./utils/seed");
app.get('/api/health/seed', async (req, res, next) => {
    try {
        await (0, seed_1.seedDatabase)();
        res.status(200).json({ status: 'success', message: 'Database seeded successfully' });
    }
    catch (error) {
        next(error);
    }
});
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'API is running' });
});
// Error Handling
app.use(error_middleware_1.notFound);
app.use(error_middleware_1.errorHandler);
exports.default = app;
