import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { notFound, errorHandler } from './middleware/error.middleware';
import authRoutes from './modules/auth/auth.routes';
import customerRoutes from './modules/customers/customer.routes';
import cowRoutes from './modules/cows/cow.routes';
import productionRoutes from './modules/milk-production/production.routes';
import subscriptionRoutes from './modules/subscriptions/subscription.routes';
import routeRoutes from './modules/routes/route.routes';
import deliveryRoutes from './modules/deliveries/delivery.routes';
import deliveryBoyRoutes from './modules/deliveries/deliveryboy.routes';
import invoiceRoutes from './modules/billing/invoice.routes';
import paymentRoutes from './modules/billing/payment.routes';
import complaintRoutes from './modules/support/complaint.routes';
import notificationRoutes from './modules/notifications/notification.routes';
import analyticsRoutes from './modules/analytics/analytics.routes';
import productRoutes from './modules/products/product.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import vendorRoutes from './modules/vendors/vendor.routes';
import walletRoutes from './modules/wallet/wallet.routes';
import adminRoutes from './modules/admin/admin.routes';
import jobRoutes from './modules/jobs/jobs.routes';

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors({
  origin: [env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/cows', cowRoutes);
app.use('/api/production', productionRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/delivery-boys', deliveryBoyRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/products', productRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/jobs', jobRoutes);

import { seedDatabase } from './utils/seed';

app.get('/api/health/seed', async (req, res, next) => {
  try {
    await seedDatabase();
    res.status(200).json({ status: 'success', message: 'Database seeded successfully' });
  } catch (error) {
    next(error);
  }
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is running' });
});

// Error Handling
app.use(notFound);
app.use(errorHandler);

export default app;
