
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import SignIn from "./pages/SignIn";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Client Dashboard Pages
import OrdersList from "./pages/OrdersList";
import CreateOrder from "./pages/CreateOrder";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Support from "./pages/Support";
import Pickups from "./pages/Pickups";
import Customers from "./pages/Customers";
import Wallet from "./pages/Wallet";

// Admin Dashboard Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminClients from "./pages/admin/AdminClients";
import AdminCouriers from "./pages/admin/AdminCouriers";
import AdminDispatch from "./pages/admin/AdminDispatch";
import AdminPricing from "./pages/admin/AdminPricing";
import AdminTickets from "./pages/admin/AdminTickets";
import AdminActivity from "./pages/admin/AdminActivity";
import AdminSettings from "./pages/admin/AdminSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner position="top-right" closeButton toastOptions={{
          classNames: {
            toast: "group border-border/10 shadow-lg",
            title: "font-medium text-foreground",
            description: "text-muted-foreground",
            actionButton: "bg-topspeed-600 text-white",
            cancelButton: "text-muted-foreground",
            error: "bg-white border-l-4 border-l-topspeed-600",
            success: "bg-white border-l-4 border-l-green-600",
            warning: "bg-white border-l-4 border-l-amber-600",
            info: "bg-white border-l-4 border-l-blue-600",
          }
        }} />
        <BrowserRouter>
          <Routes>
            {/* Public Auth Route */}
            <Route path="/auth" element={<SignIn />} />
            
            {/* Client Dashboard Routes (Protected) */}
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
            <Route path="/pickups" element={
              <ProtectedRoute requiredRole="client">
                <Pickups />
              </ProtectedRoute>
            } />
            <Route path="/customers" element={
              <ProtectedRoute requiredRole="client">
                <Customers />
              </ProtectedRoute>
            } />
            <Route path="/wallet" element={
              <ProtectedRoute requiredRole="client">
                <Wallet />
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute requiredRole="client">
                <Analytics />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute requiredRole="client">
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="/support" element={
              <ProtectedRoute requiredRole="client">
                <Support />
              </ProtectedRoute>
            } />
            
            {/* Admin Dashboard Routes (Protected) */}
            <Route path="/dashboard/admin" element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/orders" element={
              <ProtectedRoute requiredRole="admin">
                <AdminOrders />
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
            <Route path="/admin/pricing" element={
              <ProtectedRoute requiredRole="admin">
                <AdminPricing />
              </ProtectedRoute>
            } />
            <Route path="/admin/tickets" element={
              <ProtectedRoute requiredRole="admin">
                <AdminTickets />
              </ProtectedRoute>
            } />
            <Route path="/admin/activity" element={
              <ProtectedRoute requiredRole="admin">
                <AdminActivity />
              </ProtectedRoute>
            } />
            <Route path="/admin/settings" element={
              <ProtectedRoute requiredRole="admin">
                <AdminSettings />
              </ProtectedRoute>
            } />
            
            {/* Root redirect */}
            <Route path="/" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
