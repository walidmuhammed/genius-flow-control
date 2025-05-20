
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
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
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<Index />} />
          <Route path="/orders" element={<OrdersList />} />
          <Route path="/orders/new" element={<CreateOrder />} />
          <Route path="/pickups" element={<Pickups />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/support" element={<Support />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
