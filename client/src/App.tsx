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
import VetDashboard from '@/features/support/VetDashboard';
import VetGovtSchemes from '@/features/support/VetGovtSchemes';
import VetBreedingTracker from '@/features/support/VetBreedingTracker';
import VetMessages from '@/features/support/VetMessages';
import VetAppLayout from '@/features/support/components/VetAppLayout';
import RouteManager from '@/features/deliveries/RouteManager';
import DeliveryBoysManager from '@/features/deliveries/DeliveryBoysManager';
import JobManager from '@/features/farmer/pages/JobManager';
import FarmerProfile from '@/features/farmer/FarmerProfile';

// User App Pages
import UserAppLayout from '@/features/customer-app/components/UserAppLayout';
import Home from '@/features/customer-app/pages/Home';
import ProductList from '@/features/customer-app/pages/ProductList';
import Cart from '@/features/customer-app/pages/Cart';
import Checkout from '@/features/customer-app/pages/Checkout';
import MySubscriptions from '@/features/customer-app/pages/MySubscriptions';
import JobApplications from '@/features/customer-app/pages/JobApplications';
import Profile from '@/features/customer-app/pages/Profile';
import FarmersList from '@/features/customer-app/pages/FarmersList';

// Delivery App Pages
import DeliveryAppLayout from '@/features/delivery-app/components/DeliveryAppLayout';
import RouteMap from '@/features/delivery-app/pages/RouteMap';
import AgentDeliveryList from '@/features/delivery-app/pages/DeliveryList';
import DeliveryConfirmation from '@/features/delivery-app/pages/DeliveryConfirmation';
import EarningsDashboard from '@/features/delivery-app/pages/EarningsDashboard';
import JobBoard from '@/features/delivery-app/pages/JobBoard';

// Admin & Vendor Pages
import AdminDashboardLayout from '@/features/admin-app/components/AdminDashboardLayout';
import VendorDashboardLayout from '@/features/admin-app/components/VendorDashboardLayout';
import AdminOverview from '@/features/admin-app/pages/AdminOverview';
import VendorDashboard from '@/features/admin-app/pages/VendorDashboard';
import ProductManager from '@/features/admin-app/pages/ProductManager';
import VendorManager from '@/features/admin-app/pages/VendorManager';
import UserManager from '@/features/admin-app/pages/UserManager';
import OrderManager from '@/features/admin-app/pages/OrderManager';
import AdminDeliveryManager from '@/features/admin-app/pages/AdminDeliveryManager';
import AdminApprovals from '@/features/admin-app/pages/AdminApprovals';

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
          <Route path="products" element={<ProductManager />} />
          <Route path="deliveries" element={<RouteManager />} />
          <Route path="delivery-boys" element={<DeliveryBoysManager />} />
          <Route path="jobs" element={<JobManager />} />
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
          <Route path="applications" element={<JobApplications />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Delivery App Route */}
        <Route path="/delivery-app" element={<DeliveryAppLayout />}>
          <Route index element={<AgentDeliveryList />} />
          <Route path="map" element={<RouteMap />} />
          <Route path="earnings" element={<EarningsDashboard />} />
          <Route path="jobs" element={<JobBoard />} />
        </Route>
        <Route path="/delivery-app/confirm/:id" element={<DeliveryConfirmation />} />

        {/* Admin & Vendor App Route */}
        <Route path="/admin-app" element={<AdminDashboardLayout />}>
          <Route index element={<AdminOverview />} />
          <Route path="vendors" element={<VendorManager />} />
          <Route path="users" element={<UserManager />} />
          <Route path="products" element={<ProductManager />} />
          <Route path="orders" element={<OrderManager />} />
          <Route path="deliveries" element={<AdminDeliveryManager />} />
          <Route path="approvals" element={<AdminApprovals />} />
          <Route path="settings" element={<div className="p-6 font-bold">Settings (Coming Soon)</div>} />
        </Route>

        {/* Vendor App Route */}
        <Route path="/vendor-app" element={<VendorDashboardLayout />}>
          <Route index element={<VendorDashboard />} />
          <Route path="products" element={<ProductManager />} />
          <Route path="orders" element={<OrderManager />} />
          <Route path="deliveries" element={<AdminDeliveryManager />} />
          <Route path="settings" element={<div className="p-6 font-bold">Settings (Coming Soon)</div>} />
        </Route>

        {/* Vet App Route */}
        <Route path="/vet-app" element={<VetAppLayout />}>
          <Route index element={<VetDashboard />} />
          <Route path="schemes" element={<VetGovtSchemes />} />
          <Route path="breeding" element={<VetBreedingTracker />} />
          <Route path="messages" element={<VetMessages />} />
          <Route path="profile" element={<div className="p-6 font-bold">Doctor Profile (Coming Soon)</div>} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
