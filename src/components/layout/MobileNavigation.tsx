
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Package, Clock, Users, Wallet, BarChart3, Ticket } from 'lucide-react';
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
    },
    {
      icon: <Clock className="h-5 w-5" />,
      label: 'Pickups',
      path: '/pickups',
    },
    {
      icon: <BarChart3 className="h-5 w-5" />,
      label: 'Analytics',
      path: '/analytics'
    },
    {
      icon: <Ticket className="h-5 w-5" />,
      label: 'Support',
      path: '/support'
    }
  ];

  return (
    <motion.div 
      className="fixed bottom-4 left-4 right-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200/50 dark:border-gray-800/50 rounded-2xl px-2 py-2 z-50 shadow-2xl"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.4, 0.0, 0.2, 1] }}
    >
      <nav className="flex justify-around items-center">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center py-2 px-3 relative min-w-0 flex-1"
            >
              <motion.div 
                className={cn(
                  "flex flex-col items-center justify-center rounded-xl px-3 py-2 transition-all duration-200",
                  isActive 
                    ? "bg-[#DC291E]/10 text-[#DC291E]" 
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                )}
                whileTap={{ scale: 0.95 }}
              >
                <div className="relative">
                  {item.icon}
                </div>
                <span className="text-xs mt-1 font-medium truncate max-w-full">{item.label}</span>
              </motion.div>
            </Link>
          );
        })}
      </nav>
    </motion.div>
  );
};

export default MobileNavigation;
