
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Package, 
  Clock, 
  Users, 
  BarChart3, 
  Settings, 
  Phone, 
  Wallet,
  Truck,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { signOut } = useAuth();

  const menuItems = [
    {
      icon: Home,
      label: 'Dashboard',
      path: '/dashboard',
    },
    {
      icon: Package,
      label: 'Orders',
      path: '/orders',
    },
    {
      icon: Clock,
      label: 'Pickups',
      path: '/pickups',
    },
    {
      icon: Users,
      label: 'Customers',
      path: '/customers',
    },
    {
      icon: BarChart3,
      label: 'Analytics',
      path: '/analytics',
    },
    {
      icon: Wallet,
      label: 'Wallet',
      path: '/wallet',
    },
    {
      icon: Phone,
      label: 'Support',
      path: '/support',
    },
    {
      icon: Settings,
      label: 'Settings',
      path: '/settings',
    },
  ];

  const handleSignOut = () => {
    signOut();
  };

  return (
    <motion.aside 
      className="flex flex-col w-full sm:w-[260px] sm:min-w-[260px] bg-white h-full relative border-r border-gray-200"
      layout
      transition={{
        duration: 0.2,
        ease: "easeInOut"
      }}
    >
      <div className="flex h-16 items-center px-5">
        <Link to="/dashboard" className="flex items-center gap-2.5 mx-auto">
          <motion.div 
            className="flex items-center" 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-[#DC291E] h-9 w-9 rounded-lg flex items-center justify-center">
              <Truck className="h-5 w-5 text-white" />
            </div>
            <span className="tracking-tight text-gray-900 font-bold text-xl px-2">
              Topspeed
            </span>
          </motion.div>
        </Link>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-3">
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <motion.div
                key={item.path}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-[#DC291E] text-white shadow-sm"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              </motion.div>
            );
          })}
        </nav>
      </div>
      
      <div className="p-5">
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full p-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all duration-200"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </motion.button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
