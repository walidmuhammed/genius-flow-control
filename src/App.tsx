
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
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
import AdminCouriers from "./pages/admin/AdminCouriers";
import AdminDispatch from "./pages/admin/AdminDispatch";
import AdminTickets from "./pages/admin/AdminTickets";
import AdminActivity from "./pages/admin/AdminActivity";
import AdminSettings from "./pages/admin/AdminSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
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
          {/* Client Dashboard Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/orders" element={<OrdersList />} />
          <Route path="/orders/new" element={<CreateOrder />} />
          <Route path="/pickups" element={<Pickups />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/support" element={<Support />} />
          
          {/* Admin Dashboard Routes */}
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          <Route path="/dashboard/admin/orders" element={<AdminOrders />} />
          <Route path="/dashboard/admin/couriers" element={<AdminCouriers />} />
          <Route path="/dashboard/admin/dispatch" element={<AdminDispatch />} />
          <Route path="/dashboard/admin/tickets" element={<AdminTickets />} />
          <Route path="/dashboard/admin/activity" element={<AdminActivity />} />
          <Route path="/dashboard/admin/settings" element={<AdminSettings />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
