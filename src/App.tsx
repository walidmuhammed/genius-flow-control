
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import { AuthProvider } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// Lazy load components
const OrdersList = lazy(() => import("./pages/OrdersList"));
const CreateOrder = lazy(() => import("./pages/CreateOrder"));
const Customers = lazy(() => import("./pages/Customers"));
const Pickups = lazy(() => import("./pages/Pickups"));
const SchedulePickup = lazy(() => import("./pages/SchedulePickup"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Wallet = lazy(() => import("./pages/Wallet"));
const Support = lazy(() => import("./pages/Support"));
const Settings = lazy(() => import("./pages/Settings"));
const SignIn = lazy(() => import("./pages/SignIn"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Admin pages
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminClients = lazy(() => import("./pages/admin/AdminClients"));
const AdminCouriers = lazy(() => import("./pages/admin/AdminCouriers"));
const AdminDispatch = lazy(() => import("./pages/admin/AdminDispatch"));
const AdminTickets = lazy(() => import("./pages/admin/AdminTickets"));
const AdminActivity = lazy(() => import("./pages/admin/AdminActivity"));
const AdminPricing = lazy(() => import("./pages/admin/AdminPricing"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));

// Auth pages
const ClientSignIn = lazy(() => import("./pages/auth/ClientSignIn"));
const ClientSignUp = lazy(() => import("./pages/auth/ClientSignUp"));
const AdminSignIn = lazy(() => import("./pages/auth/AdminSignIn"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <BrowserRouter>
            <Suspense fallback={<div>Loading...</div>}>
              <Routes>
                {/* Public auth routes */}
                <Route path="/auth" element={<SignIn />} />
                <Route path="/auth/client" element={<ClientSignIn />} />
                <Route path="/auth/client/signup" element={<ClientSignUp />} />
                <Route path="/auth/admin" element={<AdminSignIn />} />

                {/* Protected client routes */}
                <Route path="/" element={
                  <ProtectedRoute requiredRole="client">
                    <Index />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/client" element={
                  <ProtectedRoute requiredRole="client">
                    <Index />
                  </ProtectedRoute>
                } />
                <Route path="/orders" element={
                  <ProtectedRoute requiredRole="client">
                    <OrdersList />
                  </ProtectedRoute>
                } />
                <Route path="/orders/new" element={
                  <ProtectedRoute requiredRole="client">
                    <CreateOrder />
                  </ProtectedRoute>
                } />
                <Route path="/customers" element={
                  <ProtectedRoute requiredRole="client">
                    <Customers />
                  </ProtectedRoute>
                } />
                <Route path="/pickups" element={
                  <ProtectedRoute requiredRole="client">
                    <Pickups />
                  </ProtectedRoute>
                } />
                <Route path="/pickups/new" element={
                  <ProtectedRoute requiredRole="client">
                    <SchedulePickup />
                  </ProtectedRoute>
                } />
                <Route path="/analytics" element={
                  <ProtectedRoute requiredRole="client">
                    <Analytics />
                  </ProtectedRoute>
                } />
                <Route path="/wallet" element={
                  <ProtectedRoute requiredRole="client">
                    <Wallet />
                  </ProtectedRoute>
                } />
                <Route path="/support" element={
                  <ProtectedRoute requiredRole="client">
                    <Support />
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute requiredRole="client">
                    <Settings />
                  </ProtectedRoute>
                } />

                {/* Protected admin routes */}
                <Route path="/dashboard/admin" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/admin/orders" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminOrders />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/admin/clients" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminClients />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/admin/couriers" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminCouriers />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/admin/dispatch" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDispatch />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/admin/pickups" element={
                  <ProtectedRoute requiredRole="admin">
                    <Pickups />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/admin/tickets" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminTickets />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/admin/activity" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminActivity />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/admin/pricing" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminPricing />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/admin/settings" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminSettings />
                  </ProtectedRoute>
                } />

                {/* Fallback route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            <Toaster />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
