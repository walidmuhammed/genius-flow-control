import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/hooks/useAuth';

// Import public pages
import Index from '@/pages/Index';
import SignIn from '@/pages/SignIn';
import ClientSignIn from '@/pages/auth/ClientSignIn';
import ClientSignUp from '@/pages/auth/ClientSignUp';
import AdminSignIn from '@/pages/auth/AdminSignIn';
import NotFound from '@/pages/NotFound';

// Import client pages
import Dashboard from '@/pages/Dashboard';
import OrdersList from '@/pages/OrdersList';
import CreateOrder from '@/pages/CreateOrder';
import Pickups from '@/pages/Pickups';
import SchedulePickup from '@/pages/SchedulePickup';
import Customers from '@/pages/Customers';
import Wallet from '@/pages/Wallet';
import Support from '@/pages/Support';
import Analytics from '@/pages/Analytics';
import Settings from '@/pages/Settings';

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
import AdminWallet from '@/pages/admin/AdminWallet';
import AdminCreateOrder from '@/pages/admin/AdminCreateOrder';

// Import protected route component
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-right" />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Navigate to="/auth/client-signup" replace />} />
            <Route path="/auth/signin" element={<ClientSignIn />} />
            <Route path="/auth/client-signin" element={<ClientSignIn />} />
            <Route path="/auth/client-signup" element={<ClientSignUp />} />
            <Route path="/auth/admin-signin" element={<AdminSignIn />} />

            {/* Protected client routes */}
            <Route element={<ProtectedRoute requiredRole="client" />}>
              <Route path="/dashboard/client" element={<Dashboard />} />
              <Route path="/dashboard/client/orders" element={<OrdersList />} />
              <Route path="/dashboard/client/create-order" element={<CreateOrder />} />
              <Route path="/dashboard/client/pickups" element={<Pickups />} />
              <Route path="/dashboard/client/schedule-pickup" element={<SchedulePickup />} />
              <Route path="/dashboard/client/customers" element={<Customers />} />
              <Route path="/dashboard/client/wallet" element={<Wallet />} />
              <Route path="/dashboard/client/support" element={<Support />} />
              <Route path="/dashboard/client/analytics" element={<Analytics />} />
              <Route path="/dashboard/client/settings" element={<Settings />} />
            </Route>

            {/* Backward compatibility redirects */}
            <Route element={<ProtectedRoute requiredRole="client" />}>
              <Route path="/dashboard" element={<Navigate to="/dashboard/client" replace />} />
              <Route path="/orders" element={<Navigate to="/dashboard/client/orders" replace />} />
              <Route path="/create-order" element={<Navigate to="/dashboard/client/create-order" replace />} />
              <Route path="/pickups" element={<Navigate to="/dashboard/client/pickups" replace />} />
              <Route path="/schedule-pickup" element={<Navigate to="/dashboard/client/schedule-pickup" replace />} />
              <Route path="/customers" element={<Navigate to="/dashboard/client/customers" replace />} />
              <Route path="/wallet" element={<Navigate to="/dashboard/client/wallet" replace />} />
              <Route path="/support" element={<Navigate to="/dashboard/client/support" replace />} />
              <Route path="/analytics" element={<Navigate to="/dashboard/client/analytics" replace />} />
              <Route path="/settings" element={<Navigate to="/dashboard/client/settings" replace />} />
            </Route>

            {/* Protected admin routes */}
            <Route element={<ProtectedRoute requiredRole="admin" />}>
              <Route path="/dashboard/admin" element={<AdminDashboard />} />
              <Route path="/dashboard/admin/orders" element={<AdminOrders />} />
              <Route path="/dashboard/admin/create-order" element={<AdminCreateOrder />} />
              <Route path="/dashboard/admin/pickups" element={<AdminPickups />} />
              <Route path="/dashboard/admin/couriers" element={<AdminCouriers />} />
              <Route path="/dashboard/admin/customers" element={<AdminCustomers />} />
              <Route path="/dashboard/admin/wallet" element={<AdminWallet />} />
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
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
