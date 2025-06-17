
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Package, Truck, Home, Clock, Users, Wallet, BarChart3, Settings, Ticket } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface SidebarMenuProps {
  collapsed: boolean;
  onNavigate?: () => void; // Added for mobile sidebar close
}

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  path: string;
}

const SidebarMenu: React.FC<SidebarMenuProps> = ({ collapsed, onNavigate }) => {
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
    <div className="flex flex-col gap-8">
      <div className="space-y-2">
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-4">
            Main Menu
          </h3>
        </div>
        
        {mainMenuItems.map((item, index) => (
          <MenuItem 
            key={item.path} 
            collapsed={collapsed} 
            item={item} 
            isActive={location.pathname === item.path}
            onNavigate={onNavigate}
            index={index}
          />
        ))}
      </div>
    </div>
  );
};

interface MenuItemProps {
  item: MenuItem;
  isActive: boolean;
  collapsed: boolean;
  onNavigate?: () => void;
  index: number;
}

const MenuItem: React.FC<MenuItemProps> = ({ item, isActive, collapsed, onNavigate, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link to={item.path} onClick={onNavigate}>
        <motion.div 
          className={cn(
            "flex items-center gap-3 px-4 py-3 mx-2 rounded-xl text-sm font-medium transition-all duration-200 ease-out group relative overflow-hidden", 
            isActive 
              ? "bg-gradient-to-r from-[#DC291E]/10 to-[#DC291E]/5 text-[#DC291E] dark:from-[#DC291E]/20 dark:to-[#DC291E]/10 dark:text-[#DC291E] shadow-sm border-l-2 border-[#DC291E]" 
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white"
          )} 
          whileHover={{ 
            x: isActive ? 0 : 4,
            transition: { duration: 0.2 }
          }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Active indicator */}
          {isActive && (
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-[#DC291E]/5 to-transparent"
              layoutId="activeIndicator"
              transition={{ duration: 0.2 }}
            />
          )}
          
          <span className={cn(
            "flex items-center justify-center transition-all duration-200 relative z-10", 
            isActive 
              ? "text-[#DC291E]" 
              : "text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300"
          )}>
            {item.icon}
          </span>
          
          <span className={cn(
            "transition-all duration-200 relative z-10",
            isActive 
              ? "font-semibold" 
              : "group-hover:font-medium"
          )}>
            {item.label}
          </span>
          
          {/* Hover effect */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-gray-50 to-transparent dark:from-gray-800/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            initial={false}
          />
        </motion.div>
      </Link>
    </motion.div>
  );
};

export default SidebarMenu;
