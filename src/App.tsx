
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import OrdersList from "./pages/OrdersList";
import CreateOrder from "./pages/CreateOrder";
import Pickups from "./pages/Pickups";
import SchedulePickup from "./pages/SchedulePickup";
import Customers from "./pages/Customers";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Support from "./pages/Support";
import Wallet from "./pages/Wallet";
import SignIn from "./pages/SignIn";
import NotFound from "./pages/NotFound";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminPickups from "./pages/admin/AdminPickups";
import AdminClients from "./pages/admin/AdminClients";
import AdminCouriers from "./pages/admin/AdminCouriers";
import AdminDispatch from "./pages/admin/AdminDispatch";
import AdminActivity from "./pages/admin/AdminActivity";
import AdminPricing from "./pages/admin/AdminPricing";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminTickets from "./pages/admin/AdminTickets";

// Auth pages
import ClientSignIn from "./pages/auth/ClientSignIn";
import ClientSignUp from "./pages/auth/ClientSignUp";
import AdminSignIn from "./pages/auth/AdminSignIn";

import ProtectedRoute from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <TooltipProvider>
          <Toaster />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<SignIn />} />
            <Route path="/auth/client/signin" element={<ClientSignIn />} />
            <Route path="/auth/client/signup" element={<ClientSignUp />} />
            <Route path="/auth/admin/signin" element={<AdminSignIn />} />
            <Route path="/signin" element={<SignIn />} />

            {/* Protected client routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/orders" element={
              <ProtectedRoute>
                <OrdersList />
              </ProtectedRoute>
            } />
            <Route path="/orders/new" element={
              <ProtectedRoute>
                <CreateOrder />
              </ProtectedRoute>
            } />
            <Route path="/pickups" element={
              <ProtectedRoute>
                <Pickups />
              </ProtectedRoute>
            } />
            <Route path="/schedule-pickup" element={
              <ProtectedRoute>
                <SchedulePickup />
              </ProtectedRoute>
            } />
            <Route path="/customers" element={
              <ProtectedRoute>
                <Customers />
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="/support" element={
              <ProtectedRoute>
                <Support />
              </ProtectedRoute>
            } />
            <Route path="/wallet" element={
              <ProtectedRoute>
                <Wallet />
              </ProtectedRoute>
            } />

            {/* Protected admin routes */}
            <Route path="/admin" element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/orders" element={
              <ProtectedRoute requiredRole="admin">
                <AdminOrders />
              </ProtectedRoute>
            } />
            <Route path="/admin/pickups" element={
              <ProtectedRoute requiredRole="admin">
                <AdminPickups />
              </ProtectedRoute>
            } />
            <Route path="/admin/clients" element={
              <ProtectedRoute requiredRole="admin">
                <AdminClients />
              </ProtectedRoute>
            } />
            <Route path="/admin/couriers" element={
              <ProtectedRoute requiredRole="admin">
                <AdminCouriers />
              </ProtectedRoute>
            } />
            <Route path="/admin/dispatch" element={
              <ProtectedRoute requiredRole="admin">
                <AdminDispatch />
              </ProtectedRoute>
            } />
            <Route path="/admin/activity" element={
              <ProtectedRoute requiredRole="admin">
                <AdminActivity />
              </ProtectedRoute>
            } />
            <Route path="/admin/pricing" element={
              <ProtectedRoute requiredRole="admin">
                <AdminPricing />
              </ProtectedRoute>
            } />
            <Route path="/admin/settings" element={
              <ProtectedRoute requiredRole="admin">
                <AdminSettings />
              </ProtectedRoute>
            } />
            <Route path="/admin/tickets" element={
              <ProtectedRoute requiredRole="admin">
                <AdminTickets />
              </ProtectedRoute>
            } />

            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
