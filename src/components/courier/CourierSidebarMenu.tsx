import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Package, 
  Wallet, 
  HeadphonesIcon
} from 'lucide-react';

interface CourierSidebarMenuProps {
  collapsed: boolean;
}

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  path: string;
}

const CourierSidebarMenu: React.FC<CourierSidebarMenuProps> = ({ collapsed }) => {
  const location = useLocation();

  const mainMenuItems: MenuItem[] = [
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
    <nav className="space-y-1 px-2">
      {mainMenuItems.map((item) => (
        <CourierMenuItem 
          key={item.path}
          item={item}
          isActive={location.pathname === item.path}
          collapsed={collapsed}
        />
      ))}
    </nav>
  );
};

interface CourierMenuItemProps {
  item: MenuItem;
  isActive: boolean;
  collapsed: boolean;
}

const CourierMenuItem: React.FC<CourierMenuItemProps> = ({ item, isActive, collapsed }) => {
  return (
    <Link to={item.path}>
      <motion.div
        className={`
          group relative flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer
          ${isActive 
            ? 'bg-primary text-white shadow-sm' 
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
          }
        `}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center">
          {item.icon}
          {!collapsed && (
            <span className="ml-3 truncate">{item.label}</span>
          )}
        </div>
        
        {isActive && (
          <motion.div
            className="absolute right-2 w-2 h-2 bg-white rounded-full"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </motion.div>
    </Link>
  );
};

export default CourierSidebarMenu;