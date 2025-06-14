
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const CreateOrder = lazy(() => import("./pages/CreateOrder"));
const EditOrder = lazy(() => import("./pages/EditOrder"));
const OrdersList = lazy(() => import("./pages/OrdersList"));
const Customers = lazy(() => import("./pages/Customers"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Pickups = lazy(() => import("./pages/Pickups"));
const SchedulePickup = lazy(() => import("./pages/SchedulePickup"));
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
const AdminPricing = lazy(() => import("./pages/admin/AdminPricing"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminDispatch = lazy(() => import("./pages/admin/AdminDispatch"));
const AdminTickets = lazy(() => import("./pages/admin/AdminTickets"));
const AdminActivity = lazy(() => import("./pages/admin/AdminActivity"));

// Auth pages
const ClientSignIn = lazy(() => import("./pages/auth/ClientSignIn"));
const ClientSignUp = lazy(() => import("./pages/auth/ClientSignUp"));
const AdminSignIn = lazy(() => import("./pages/auth/AdminSignIn"));

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/sign-in" element={<SignIn />} />
              
              {/* Auth Routes */}
              <Route path="/auth/client/sign-in" element={<ClientSignIn />} />
              <Route path="/auth/client/sign-up" element={<ClientSignUp />} />
              <Route path="/auth/admin/sign-in" element={<AdminSignIn />} />
              
              {/* Client Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><OrdersList /></ProtectedRoute>} />
              <Route path="/orders/new" element={<ProtectedRoute><CreateOrder /></ProtectedRoute>} />
              <Route path="/orders/:id/edit" element={<ProtectedRoute><EditOrder /></ProtectedRoute>} />
              <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
              <Route path="/pickups" element={<ProtectedRoute><Pickups /></ProtectedRoute>} />
              <Route path="/pickups/schedule" element={<ProtectedRoute><SchedulePickup /></ProtectedRoute>} />
              <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
              <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<ProtectedRoute userType="admin"><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/orders" element={<ProtectedRoute userType="admin"><AdminOrders /></ProtectedRoute>} />
              <Route path="/admin/clients" element={<ProtectedRoute userType="admin"><AdminClients /></ProtectedRoute>} />
              <Route path="/admin/couriers" element={<ProtectedRoute userType="admin"><AdminCouriers /></ProtectedRoute>} />
              <Route path="/admin/pricing" element={<ProtectedRoute userType="admin"><AdminPricing /></ProtectedRoute>} />
              <Route path="/admin/settings" element={<ProtectedRoute userType="admin"><AdminSettings /></ProtectedRoute>} />
              <Route path="/admin/dispatch" element={<ProtectedRoute userType="admin"><AdminDispatch /></ProtectedRoute>} />
              <Route path="/admin/tickets" element={<ProtectedRoute userType="admin"><AdminTickets /></ProtectedRoute>} />
              <Route path="/admin/activity" element={<ProtectedRoute userType="admin"><AdminActivity /></ProtectedRoute>} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
