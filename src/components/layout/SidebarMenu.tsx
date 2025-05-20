
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Package, Truck, Home, Clock, Users, Wallet, BarChart3, Settings, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface SidebarMenuProps {
  collapsed?: boolean;
}

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: number | string;
}

const SidebarMenu: React.FC<SidebarMenuProps> = ({
  collapsed = false
}) => {
  const location = useLocation();
  
  const mainMenuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: <Home className="h-5 w-5" />,
      path: '/'
    }, 
    {
      label: 'Orders',
      icon: <Package className="h-5 w-5" />,
      path: '/orders',
      badge: 12
    }, 
    {
      label: 'Pickups',
      icon: <Clock className="h-5 w-5" />,
      path: '/pickups',
      badge: 5
    }, 
    {
      label: 'Customers',
      icon: <Users className="h-5 w-5" />,
      path: '/customers'
    }, 
    {
      label: 'Wallet',
      icon: <Wallet className="h-5 w-5" />,
      path: '/wallet'
    }, 
    {
      label: 'Analytics',
      icon: <BarChart3 className="h-5 w-5" />,
      path: '/analytics'
    }
  ];
  
  const secondaryMenuItems: MenuItem[] = [
    {
      label: 'Settings',
      icon: <Settings className="h-5 w-5" />,
      path: '/settings'
    }, 
    {
      label: 'Support',
      icon: <Phone className="h-5 w-5" />,
      path: '/support'
    }
  ];
  
  return (
    <div className="flex flex-col gap-8">
      <div className="space-y-2">
        <div className="mb-2">
          <h3 className="text-sm font-medium uppercase tracking-wider text-white/70 px-4 mb-3">
            Main
          </h3>
        </div>
        
        {mainMenuItems.map(item => (
          <MenuItem 
            key={item.path} 
            item={item} 
            isActive={location.pathname === item.path} 
          />
        ))}
      </div>
      
      <div className="space-y-2">
        <div className="mb-2">
          <h3 className="text-sm font-medium uppercase tracking-wider text-white/70 px-4 mb-3">
            System
          </h3>
        </div>
        
        {secondaryMenuItems.map(item => (
          <MenuItem 
            key={item.path} 
            item={item} 
            isActive={location.pathname === item.path} 
          />
        ))}
      </div>
    </div>
  );
};

interface MenuItemProps {
  item: MenuItem;
  isActive: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({
  item,
  isActive
}) => {
  return (
    <Link to={item.path}>
      <motion.div 
        className={cn(
          "relative flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 mb-1",
          isActive 
            ? "bg-white/15 text-white backdrop-blur-sm shadow-lg" 
            : "text-white/80 hover:bg-white/10 hover:text-white"
        )}
        whileHover={{
          x: 4,
          transition: { duration: 0.2 }
        }}
        whileTap={{
          scale: 0.98
        }}
      >
        <span className={cn(
          "flex items-center justify-center", 
          isActive ? "text-white" : "text-white/80"
        )}>
          {item.icon}
        </span>
        
        <span className="font-medium tracking-wide">{item.label}</span>
        
        {item.badge && (
          <span className="absolute right-3 flex h-5 min-w-5 items-center justify-center rounded-full bg-white text-topspeed-600 text-xs font-bold px-1.5">
            {item.badge}
          </span>
        )}
        
        {isActive && (
          <motion.div
            className="absolute -left-1 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-white shadow-glow"
            layoutId="activeIndicator"
            transition={{ type: "spring", duration: 0.5 }}
          />
        )}
      </motion.div>
    </Link>
  );
};

export default SidebarMenu;
