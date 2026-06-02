import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from '@/features/auth/Login';
import Signup from '@/features/auth/Signup';
import ForgotPassword from '@/features/auth/ForgotPassword';
import DashboardLayout from '@/components/layout/DashboardLayout';
import FarmerDashboard from '@/features/farmer/FarmerDashboard';
import CustomerList from '@/features/customers/CustomerList';
import CustomerDetails from '@/features/customers/CustomerDetails';
import CowProductionList from '@/features/cows/CowProductionList';
import SubscriptionList from '@/features/subscriptions/SubscriptionList';
import DeliveryList from '@/features/deliveries/DeliveryList';
import BillingDashboard from '@/features/billing/BillingDashboard';
import CustomerAppDashboard from '@/features/customer-app/CustomerAppDashboard';
import SupportCenter from '@/features/support/SupportCenter';
import RouteManager from '@/features/deliveries/RouteManager';
import DeliveryBoysManager from '@/features/deliveries/DeliveryBoysManager';
import FarmerProfile from '@/features/farmer/FarmerProfile';

// User App Pages
import UserAppLayout from '@/features/customer-app/components/UserAppLayout';
import Home from '@/features/customer-app/pages/Home';
import ProductList from '@/features/customer-app/pages/ProductList';
import Cart from '@/features/customer-app/pages/Cart';
import Checkout from '@/features/customer-app/pages/Checkout';
import MySubscriptions from '@/features/customer-app/pages/MySubscriptions';
import Profile from '@/features/customer-app/pages/Profile';
import FarmersList from '@/features/customer-app/pages/FarmersList';

// Delivery App Pages
import DeliveryAppLayout from '@/features/delivery-app/components/DeliveryAppLayout';
import RouteMap from '@/features/delivery-app/pages/RouteMap';
import DeliveryConfirmation from '@/features/delivery-app/pages/DeliveryConfirmation';
import EarningsDashboard from '@/features/delivery-app/pages/EarningsDashboard';

// Admin & Vendor Pages
import AdminDashboardLayout from '@/features/admin-app/components/AdminDashboardLayout';
import AdminOverview from '@/features/admin-app/pages/AdminOverview';
import VendorDashboard from '@/features/admin-app/pages/VendorDashboard';
import ProductManager from '@/features/admin-app/pages/ProductManager';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Protected dashboard routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<FarmerDashboard />} />
          <Route path="customers" element={<CustomerList />} />
          <Route path="customers/:id" element={<CustomerDetails />} />
          <Route path="cows" element={<CowProductionList />} />
          <Route path="subscriptions" element={<SubscriptionList />} />
          <Route path="deliveries" element={<RouteManager />} />
          <Route path="delivery-boys" element={<DeliveryBoysManager />} />
          <Route path="billing" element={<BillingDashboard />} />
          <Route path="support" element={<SupportCenter />} />
          <Route path="profile" element={<FarmerProfile />} />
        </Route>

        {/* Customer App Route */}
        <Route path="/my-app" element={<UserAppLayout />}>
          <Route index element={<Home />} />
          <Route path="products" element={<ProductList />} />
          <Route path="farmers" element={<FarmersList />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="subscriptions" element={<MySubscriptions />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Delivery App Route */}
        <Route path="/delivery-app" element={<DeliveryAppLayout />}>
          <Route index element={<RouteMap />} />
          <Route path="list" element={<div className="p-5 font-bold text-white mt-16">Delivery List (Coming Soon)</div>} />
          <Route path="earnings" element={<EarningsDashboard />} />
        </Route>
        <Route path="/delivery-app/confirm/:id" element={<DeliveryConfirmation />} />

        {/* Admin & Vendor App Route */}
        <Route path="/admin-app" element={<AdminDashboardLayout />}>
          <Route index element={<AdminOverview />} />
          <Route path="vendors" element={<div className="p-6 font-bold">Vendor List (Coming Soon)</div>} />
          <Route path="users" element={<div className="p-6 font-bold">User Management (Coming Soon)</div>} />
          <Route path="products" element={<ProductManager />} />
          <Route path="orders" element={<div className="p-6 font-bold">Orders (Coming Soon)</div>} />
          <Route path="deliveries" element={<div className="p-6 font-bold">Deliveries (Coming Soon)</div>} />
          <Route path="settings" element={<div className="p-6 font-bold">Settings (Coming Soon)</div>} />
          <Route path="vendor-dashboard" element={<VendorDashboard />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
