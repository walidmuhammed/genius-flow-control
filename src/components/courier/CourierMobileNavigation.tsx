import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Package, 
  Wallet, 
  HeadphonesIcon
} from 'lucide-react';

const CourierMobileNavigation = () => {
  const location = useLocation();

  const menuItems = [
    {
      label: 'Dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      path: '/dashboard/courier'
    },
    {
      label: 'Orders',
      icon: <Package className="h-5 w-5" />,
      path: '/dashboard/courier/orders'
    },
    {
      label: 'Wallet',
      icon: <Wallet className="h-5 w-5" />,
      path: '/dashboard/courier/wallet'
    },
    {
      label: 'Support',
      icon: <HeadphonesIcon className="h-5 w-5" />,
      path: '/dashboard/courier/support'
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-2 py-1 z-50">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <Link key={item.path} to={item.path} className="flex-1">
              <motion.div
                className={`
                  flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all duration-200
                  ${isActive 
                    ? 'text-primary bg-primary/10' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }
                `}
                whileTap={{ scale: 0.95 }}
              >
                {item.icon}
                <span className="text-xs font-medium mt-1 truncate">
                  {item.label}
                </span>
                
                {isActive && (
                  <motion.div
                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default CourierMobileNavigation;