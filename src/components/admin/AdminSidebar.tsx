
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Moon, 
  Sun, 
  Package, 
  Truck, 
  Home, 
  Users, 
  Settings, 
  Phone, 
  LogOut,
  Activity,
  Navigation,
  ShieldCheck,
  DollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';

const AdminSidebar = () => {
  const [darkMode, setDarkMode] = useState(false);
  const location = useLocation();
  const { signOut } = useAuth();
  
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const menuItems = [
    {
      title: "Overview",
      icon: Home,
      path: "/dashboard/admin",
      description: "System overview & metrics"
    },
    {
      title: "Orders",
      icon: Package,
      path: "/admin/orders",
      description: "Manage all client orders"
    },
    {
      title: "Clients",
      icon: Users,
      path: "/admin/clients",
      description: "Manage client accounts"
    },
    {
      title: "Couriers",
      icon: Truck,
      path: "/admin/couriers",
      description: "Manage delivery agents"
    },
    {
      title: "Dispatch Panel",
      icon: Navigation,
      path: "/admin/dispatch",
      description: "Assign & track deliveries"
    },
    {
      title: "Pricing",
      icon: DollarSign,
      path: "/admin/pricing",
      description: "Configure pricing rules"
    },
    {
      title: "Support Tickets",
      icon: Phone,
      path: "/admin/tickets",
      description: "Client support requests"
    },
    {
      title: "Activity Log",
      icon: Activity,
      path: "/admin/activity",
      description: "System activity tracking"
    },
    {
      title: "System Settings",
      icon: Settings,
      path: "/admin/settings",
      description: "Configure system settings"
    }
  ];

  const isActivePath = (path: string) => {
    if (path === "/dashboard/admin") {
      return location.pathname === "/dashboard/admin";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <motion.aside 
      className="flex flex-col w-full sm:w-[280px] sm:min-w-[280px] bg-white dark:bg-gray-900 h-full relative border-r border-gray-200 dark:border-gray-800 shadow-sm"
      layout
      transition={{
        duration: 0.2,
        ease: "easeInOut"
      }}
    >
      <div className="flex h-16 items-center px-5 border-b border-gray-200 dark:border-gray-800">
        <Link to="/dashboard/admin" className="flex items-center gap-3">
          <motion.div 
            className="flex items-center" 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-[#DC291E] h-10 w-10 rounded-lg flex items-center justify-center">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <div className="ml-3">
              <span className="tracking-tight text-gray-900 dark:text-gray-100 font-bold text-lg">
                Admin Panel
              </span>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Delivery Operations
              </div>
            </div>
          </motion.div>
        </Link>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-3 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const isActive = isActivePath(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 w-full p-3 rounded-lg text-sm font-medium transition-all duration-200 group",
                  isActive
                    ? "bg-[#DC291E] text-white shadow-sm"
                    : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                <item.icon className={cn(
                  "h-5 w-5 transition-colors",
                  isActive 
                    ? "text-white" 
                    : "text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200"
                )} />
                <div className="flex-1">
                  <div className="font-medium">{item.title}</div>
                  <div className={cn(
                    "text-xs mt-0.5",
                    isActive 
                      ? "text-white/80" 
                      : "text-gray-500 dark:text-gray-400"
                  )}>
                    {item.description}
                  </div>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="p-5 border-t border-gray-200 dark:border-gray-800 flex flex-col gap-3">
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={toggleDarkMode} 
          className={cn(
            "flex items-center gap-3 w-full p-3 rounded-lg text-sm font-medium", 
            "hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 text-gray-700 dark:text-gray-200"
          )}
        >
          {darkMode ? (
            <>
              <Sun className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              <span>Dark Mode</span>
            </>
          )}
        </motion.button>
        
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSignOut}
          className={cn(
            "flex items-center gap-3 w-full p-3 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200", 
            "hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
          )}
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </motion.button>
      </div>
    </motion.aside>
  );
};

export default AdminSidebar;
