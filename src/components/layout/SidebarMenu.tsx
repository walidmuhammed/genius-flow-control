
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Package, Truck, Home, Clock, Users, Wallet, BarChart3, Settings, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface SidebarMenuProps {
  collapsed: boolean;
}

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: number | string;
}

const SidebarMenu: React.FC<SidebarMenuProps> = ({
  collapsed
}) => {
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
      path: '/orders',
      badge: 12
    }, 
    {
      label: 'Pickups',
      icon: <Clock className="h-4 w-4" />,
      path: '/pickups',
      badge: 5
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
    }
  ];
  
  const secondaryMenuItems: MenuItem[] = [
    {
      label: 'Settings',
      icon: <Settings className="h-4 w-4" />,
      path: '/settings'
    }, 
    {
      label: 'Support',
      icon: <Phone className="h-4 w-4" />,
      path: '/support'
    }
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-1">
        <div className="mb-2">
          <h3 className="text-xs font-medium text-white/70 px-4">
            Main
          </h3>
        </div>
        
        {mainMenuItems.map(item => <MenuItem key={item.path} collapsed={collapsed} item={item} isActive={location.pathname === item.path} />)}
      </div>
      
      <div className="space-y-1">
        <div className="mb-2">
          <h3 className="text-xs font-medium text-white/70 px-4">
            System
          </h3>
        </div>
        
        {secondaryMenuItems.map(item => <MenuItem key={item.path} collapsed={collapsed} item={item} isActive={location.pathname === item.path} />)}
      </div>
    </div>
  );
};

interface MenuItemProps {
  item: MenuItem;
  isActive: boolean;
  collapsed: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({
  item,
  isActive,
  collapsed
}) => {
  return (
    <Link to={item.path}>
      <motion.div 
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium mb-1 transition-all", 
          isActive 
            ? "bg-white/15 text-white shadow-lg" 
            : "text-white/80 hover:text-white hover:bg-white/10"
        )} 
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.98 }}
      >
        <span className={cn(
          "flex items-center justify-center", 
          isActive 
            ? "text-white" 
            : "text-white/80"
        )}>
          {item.icon}
        </span>
        
        <span className={cn(
          "transition-all",
          isActive 
            ? "font-medium" 
            : ""
        )}>
          {item.label}
        </span>
        
        {item.badge && (
          <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-white/20 text-white text-[10px] font-medium px-1.5">
            {item.badge}
          </span>
        )}
      </motion.div>
    </Link>
  );
};

export default SidebarMenu;
