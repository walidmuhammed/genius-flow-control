
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import Dashboard from '@/pages/Dashboard';
import OrdersList from '@/pages/OrdersList';
import Pickups from '@/pages/Pickups';
import Customers from '@/pages/Customers';
import Support from '@/pages/Support';
import Wallet from '@/pages/Wallet';
import Analytics from '@/pages/Analytics';
import Settings from '@/pages/Settings';
import SignIn from '@/pages/SignIn';
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
          <Route path="/auth" element={<SignIn />} />

          {/* Client Routes */}
          <Route path="/" element={<ProtectedRoute requiredRole="client"><Dashboard /></ProtectedRoute>} />
          <Route path="/dashboard/client" element={<ProtectedRoute requiredRole="client"><Dashboard /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute requiredRole="client"><OrdersList /></ProtectedRoute>} />
          <Route path="/pickups" element={<ProtectedRoute requiredRole="client"><Pickups /></ProtectedRoute>} />
          <Route path="/customers" element={<ProtectedRoute requiredRole="client"><Customers /></ProtectedRoute>} />
          <Route path="/support" element={<ProtectedRoute requiredRole="client"><Support /></ProtectedRoute>} />
          <Route path="/wallet" element={<ProtectedRoute requiredRole="client"><Wallet /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute requiredRole="client"><Analytics /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute requiredRole="client"><Settings /></ProtectedRoute>} />
          
          {/* Admin Routes */}
          <Route path="/dashboard/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/orders" element={<ProtectedRoute requiredRole="admin"><AdminOrders /></ProtectedRoute>} />
          <Route path="/admin/pickups" element={<ProtectedRoute requiredRole="admin"><AdminPickups /></ProtectedRoute>} />
          <Route path="/admin/customers" element={<ProtectedRoute requiredRole="admin"><AdminCustomers /></ProtectedRoute>} />
          <Route path="/admin/clients" element={<ProtectedRoute requiredRole="admin"><AdminClients /></ProtectedRoute>} />
          <Route path="/admin/couriers" element={<ProtectedRoute requiredRole="admin"><AdminCouriers /></ProtectedRoute>} />
          <Route path="/admin/support" element={<ProtectedRoute requiredRole="admin"><AdminTickets /></ProtectedRoute>} />
          <Route path="/admin/pricing" element={<ProtectedRoute requiredRole="admin"><AdminPricing /></ProtectedRoute>} />
          <Route path="/admin/wallet" element={<ProtectedRoute requiredRole="admin"><AdminWallet /></ProtectedRoute>} />
          <Route path="/admin/activity" element={<ProtectedRoute requiredRole="admin"><AdminActivity /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute requiredRole="admin"><AdminSettings /></ProtectedRoute>} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
