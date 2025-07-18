import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import Dashboard from '@/pages/Dashboard';
import Orders from '@/pages/Orders';
import Pickups from '@/pages/Pickups';
import Customers from '@/pages/Customers';
import Support from '@/pages/Support';
import Pricing from '@/pages/Pricing';
import Wallet from '@/pages/Wallet';
import Activity from '@/pages/Activity';
import Settings from '@/pages/Settings';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminOrders from '@/pages/admin/AdminOrders';
import AdminPickups from '@/pages/admin/AdminPickups';
import AdminCustomers from '@/pages/admin/AdminCustomers';
import AdminClients from '@/pages/admin/AdminClients';
import AdminCouriers from '@/pages/admin/AdminCouriers';
import AdminPricing from '@/pages/admin/AdminPricing';
import AdminWallet from '@/pages/admin/AdminWallet';
import AdminActivity from '@/pages/admin/AdminActivity';
import AdminSettings from '@/pages/admin/AdminSettings';
import AdminTickets from '@/pages/admin/AdminTickets';

function App() {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Client Routes */}
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/pickups" element={<ProtectedRoute><Pickups /></ProtectedRoute>} />
          <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
          <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
          <Route path="/pricing" element={<ProtectedRoute><Pricing /></ProtectedRoute>} />
          <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
          <Route path="/activity" element={<ProtectedRoute><Activity /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/orders" element={<ProtectedRoute><AdminOrders /></ProtectedRoute>} />
          <Route path="/admin/pickups" element={<ProtectedRoute><AdminPickups /></ProtectedRoute>} />
          <Route path="/admin/customers" element={<ProtectedRoute><AdminCustomers /></ProtectedRoute>} />
          <Route path="/admin/clients" element={<ProtectedRoute><AdminClients /></ProtectedRoute>} />
          <Route path="/admin/couriers" element={<ProtectedRoute><AdminCouriers /></ProtectedRoute>} />
          <Route path="/admin/support" element={<ProtectedRoute><AdminTickets /></ProtectedRoute>} />
          <Route path="/admin/pricing" element={<ProtectedRoute><AdminPricing /></ProtectedRoute>} />
          <Route path="/admin/wallet" element={<ProtectedRoute><AdminWallet /></ProtectedRoute>} />
          <Route path="/admin/activity" element={<ProtectedRoute><AdminActivity /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
