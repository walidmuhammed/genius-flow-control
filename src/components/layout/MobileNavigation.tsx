
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Package, Clock, Users, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const MobileNavigation: React.FC = () => {
  const location = useLocation();
  
  const navItems = [
    {
      icon: <Home className="h-5 w-5" />,
      label: 'Home',
      path: '/',
    },
    {
      icon: <Package className="h-5 w-5" />,
      label: 'Orders',
      path: '/orders',
      badge: 12
    },
    {
      icon: <Clock className="h-5 w-5" />,
      label: 'Pickups',
      path: '/pickups',
      badge: 5
    },
    {
      icon: <Users className="h-5 w-5" />,
      label: 'Customers',
      path: '/customers'
    },
    {
      icon: <Wallet className="h-5 w-5" />,
      label: 'Wallet',
      path: '/wallet'
    }
  ];

  return (
    <motion.div 
      className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-2 py-1 z-50"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <nav className="flex justify-around items-center">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center py-2 px-3 relative"
            >
              <div 
                className={cn(
                  "flex flex-col items-center justify-center",
                  isActive ? "text-[#DC291E]" : "text-gray-500 dark:text-gray-400"
                )}
              >
                <div className="relative">
                  {item.icon}
                  {item.badge && (
                    <span className="absolute -top-2 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#DC291E] text-[10px] font-medium text-white px-1">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-xs mt-0.5 font-medium">{item.label}</span>
              </div>
              
              {isActive && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#DC291E]"
                  layoutId="mobile-nav-indicator"
                  transition={{ type: "spring", duration: 0.5 }}
                />
              )}
            </Link>
          );
        })}
      </nav>
    </motion.div>
  );
};

export default MobileNavigation;
