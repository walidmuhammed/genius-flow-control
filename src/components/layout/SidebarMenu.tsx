
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Package, Truck, Home, Clock, Users, Wallet, BarChart3, Ticket } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface SidebarMenuProps {
  collapsed: boolean;
}

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  path: string;
}

const SidebarMenu: React.FC<SidebarMenuProps> = ({ collapsed }) => {
  const location = useLocation();
  
  const mainMenuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: <Home className="h-4 w-4" />,
      path: '/'
    }, 
    {
      label: 'Orders',
      icon: <Package className="h-4 w-4" />,
      path: '/orders'
    }, 
    {
      label: 'Pickups',
      icon: <Clock className="h-4 w-4" />,
      path: '/pickups'
    }, 
    {
      label: 'Customers',
      icon: <Users className="h-4 w-4" />,
      path: '/customers'
    }, 
    {
      label: 'Wallet',
      icon: <Wallet className="h-4 w-4" />,
      path: '/wallet'
    }, 
    {
      label: 'Analytics',
      icon: <BarChart3 className="h-4 w-4" />,
      path: '/analytics'
    },
    {
      label: 'Support',
      icon: <Ticket className="h-4 w-4" />,
      path: '/support'
    }
  ];

  return (
    <div className="space-y-1">
      <div className="mb-4">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 mb-2 uppercase tracking-wider">
          Main
        </h3>
      </div>
      
      {mainMenuItems.map(item => (
        <MenuItem 
          key={item.path} 
          collapsed={collapsed} 
          item={item} 
          isActive={location.pathname === item.path} 
        />
      ))}
    </div>
  );
};

interface MenuItemProps {
  item: MenuItem;
  isActive: boolean;
  collapsed: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({ item, isActive, collapsed }) => {
  return (
    <Link to={item.path}>
      <motion.div 
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 mx-1 rounded-lg text-sm font-medium transition-all duration-200",
          isActive 
            ? "bg-[#DC291E]/10 text-[#DC291E] border-r-2 border-[#DC291E]" 
            : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-white"
        )} 
        whileHover={{ 
          x: isActive ? 0 : 4,
          transition: { duration: 0.2 }
        }}
        whileTap={{ scale: 0.98 }}
      >
        <span className={cn(
          "flex items-center justify-center transition-colors duration-200",
          isActive 
            ? "text-[#DC291E]" 
            : "text-gray-500 dark:text-gray-400"
        )}>
          {item.icon}
        </span>
        
        <span className="font-medium">
          {item.label}
        </span>
      </motion.div>
    </Link>
  );
};

export default SidebarMenu;
