
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Loader2 } from "lucide-react";

// Lazy load components for better performance
const Index = lazy(() => import("./pages/Index"));
const SignIn = lazy(() => import("./pages/SignIn"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const OrdersList = lazy(() => import("./pages/OrdersList"));
const CreateOrder = lazy(() => import("./pages/CreateOrder"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Customers = lazy(() => import("./pages/Customers"));
const Pickups = lazy(() => import("./pages/Pickups"));
const SchedulePickup = lazy(() => import("./pages/SchedulePickup"));
const Wallet = lazy(() => import("./pages/Wallet"));
const Support = lazy(() => import("./pages/Support"));
const Settings = lazy(() => import("./pages/Settings"));

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

const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: false,
    },
  },
});

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <Loader2 className="h-8 w-8 animate-spin text-[#DB271E] mx-auto mb-4" />
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <Suspense fallback={<LoadingSpinner />}>
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
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
