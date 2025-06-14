
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Directly import all pages instead of using lazy()
import Index from "./pages/Index";
import SignIn from "./pages/SignIn";
import Dashboard from "./pages/Dashboard";
import OrdersList from "./pages/OrdersList";
import CreateOrder from "./pages/CreateOrder";
import Analytics from "./pages/Analytics";
import Customers from "./pages/Customers";
import Pickups from "./pages/Pickups";
import SchedulePickup from "./pages/SchedulePickup";
import Wallet from "./pages/Wallet";
import Support from "./pages/Support";
import Settings from "./pages/Settings";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminClients from "./pages/admin/AdminClients";
import AdminCouriers from "./pages/admin/AdminCouriers";
import AdminDispatch from "./pages/admin/AdminDispatch";
import AdminTickets from "./pages/admin/AdminTickets";
import AdminActivity from "./pages/admin/AdminActivity";
import AdminPricing from "./pages/admin/AdminPricing";
import AdminSettings from "./pages/admin/AdminSettings";

import NotFound from "./pages/NotFound";

// Remove Suspense and loading spinner logic

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<SignIn />} />
              
              {/* Client protected routes */}
              <Route
                path="/dashboard/client"
                element={
                  <ProtectedRoute requiredRole="client">
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <ProtectedRoute requiredRole="client">
                    <OrdersList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create-order"
                element={
                  <ProtectedRoute requiredRole="client">
                    <CreateOrder />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute requiredRole="client">
                    <Analytics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customers"
                element={
                  <ProtectedRoute requiredRole="client">
                    <Customers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pickups"
                element={
                  <ProtectedRoute requiredRole="client">
                    <Pickups />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/schedule-pickup"
                element={
                  <ProtectedRoute requiredRole="client">
                    <SchedulePickup />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/wallet"
                element={
                  <ProtectedRoute requiredRole="client">
                    <Wallet />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/support"
                element={
                  <ProtectedRoute requiredRole="client">
                    <Support />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute requiredRole="client">
                    <Settings />
                  </ProtectedRoute>
                }
              />

              {/* Admin protected routes */}
              <Route
                path="/dashboard/admin"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/orders"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminOrders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/clients"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminClients />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/couriers"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminCouriers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/dispatch"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDispatch />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/tickets"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminTickets />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/activity"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminActivity />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/pricing"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminPricing />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/settings"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminSettings />
                  </ProtectedRoute>
                }
              />

              {/* Fallback routes */}
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

