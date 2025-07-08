import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { QueryClient } from '@tanstack/react-query';

// Import public pages
import Index from '@/pages/Index';
import SignIn from '@/pages/auth/SignIn';
import ClientSignIn from '@/pages/auth/ClientSignIn';
import ClientSignUp from '@/pages/auth/ClientSignUp';
import AdminSignIn from '@/pages/auth/AdminSignIn';
import NotFound from '@/pages/NotFound';

// Import client pages
import Dashboard from '@/pages/client/Dashboard';
import OrdersList from '@/pages/client/OrdersList';
import CreateOrder from '@/pages/client/CreateOrder';
import Pickups from '@/pages/client/Pickups';
import SchedulePickup from '@/pages/client/SchedulePickup';
import Customers from '@/pages/client/Customers';
import Wallet from '@/pages/client/Wallet';
import Support from '@/pages/client/Support';
import Analytics from '@/pages/client/Analytics';
import Settings from '@/pages/client/Settings';

// Import admin pages
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminOrders from '@/pages/admin/AdminOrders';
import AdminPickups from '@/pages/admin/AdminPickups';
import AdminCouriers from '@/pages/admin/AdminCouriers';
import AdminCustomers from '@/pages/admin/AdminCustomers';
import AdminPricing from '@/pages/admin/AdminPricing';
import AdminActivity from '@/pages/admin/AdminActivity';
import AdminTickets from '@/pages/admin/AdminTickets';
import AdminSettings from '@/pages/admin/AdminSettings';
import AdminDispatch from '@/pages/admin/AdminDispatch';
import AdminClients from '@/pages/admin/AdminClients';

// Import protected route component
import ProtectedRoute from '@/components/auth/ProtectedRoute';

function App() {
  return (
    <QueryClient>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Index />} />
          <Route path="/auth/signin" element={<SignIn />} />
          <Route path="/auth/client-signin" element={<ClientSignIn />} />
          <Route path="/auth/client-signup" element={<ClientSignUp />} />
          <Route path="/auth/admin-signin" element={<AdminSignIn />} />

          {/* Protected client routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/orders" element={<OrdersList />} />
            <Route path="/create-order" element={<CreateOrder />} />
            <Route path="/pickups" element={<Pickups />} />
            <Route path="/schedule-pickup" element={<SchedulePickup />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/support" element={<Support />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* Protected admin routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard/admin" element={<AdminDashboard />} />
            <Route path="/dashboard/admin/orders" element={<AdminOrders />} />
            <Route path="/dashboard/admin/pickups" element={<AdminPickups />} />
            <Route path="/dashboard/admin/couriers" element={<AdminCouriers />} />
            <Route path="/dashboard/admin/customers" element={<AdminCustomers />} />
            <Route path="/dashboard/admin/pricing" element={<AdminPricing />} />
            <Route path="/dashboard/admin/analytics" element={<AdminActivity />} />
            <Route path="/dashboard/admin/support" element={<AdminTickets />} />
            <Route path="/dashboard/admin/settings" element={<AdminSettings />} />
            <Route path="/dashboard/admin/dispatch" element={<AdminDispatch />} />
            <Route path="/dashboard/admin/clients" element={<AdminClients />} />
          </Route>

          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </QueryClient>
  );
}

export default App;
