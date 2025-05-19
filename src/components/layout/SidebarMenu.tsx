
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

const SidebarMenu: React.FC<SidebarMenuProps> = ({ collapsed }) => {
  const location = useLocation();
  
  const mainMenuItems: MenuItem[] = [
    { label: 'Dashboard', icon: <Home className="h-4 w-4" />, path: '/' },
    { label: 'Orders', icon: <Package className="h-4 w-4" />, path: '/orders', badge: 12 },
    { label: 'Pickups', icon: <Clock className="h-4 w-4" />, path: '/pickups', badge: 5 },
    { label: 'Customers', icon: <Users className="h-4 w-4" />, path: '/customers' },
    { label: 'Wallet', icon: <Wallet className="h-4 w-4" />, path: '/wallet' },
    { label: 'Analytics', icon: <BarChart3 className="h-4 w-4" />, path: '/analytics' },
  ];
  
  const secondaryMenuItems: MenuItem[] = [
    { label: 'Settings', icon: <Settings className="h-4 w-4" />, path: '/settings' },
    { label: 'Support', icon: <Phone className="h-4 w-4" />, path: '/support' },
  ];
  
  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-1">
        <div className="mb-2">
          <h3 className={cn(
            "text-xs font-medium text-muted-foreground px-4",
            collapsed ? "text-center" : ""
          )}>
            {!collapsed ? "Main" : "—"}
          </h3>
        </div>
        
        {mainMenuItems.map((item) => (
          <MenuItem
            key={item.path}
            collapsed={collapsed}
            item={item}
            isActive={location.pathname === item.path}
          />
        ))}
      </div>
      
      <div className="space-y-1">
        <div className="mb-2">
          <h3 className={cn(
            "text-xs font-medium text-muted-foreground px-4",
            collapsed ? "text-center" : ""
          )}>
            {!collapsed ? "System" : "—"}
          </h3>
        </div>
        
        {secondaryMenuItems.map((item) => (
          <MenuItem
            key={item.path}
            collapsed={collapsed}
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
  collapsed: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({ item, isActive, collapsed }) => {
  return (
    <Link to={item.path}>
      <motion.div
        className={cn(
          "flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium mb-1 transition-colors",
          isActive 
            ? "text-topspeed-600 bg-topspeed-50" 
            : "text-muted-foreground hover:text-foreground hover:bg-muted/80",
          collapsed ? "justify-center px-1.5" : ""
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <span className={cn(
          "flex items-center justify-center",
          isActive ? "text-topspeed-600" : "text-muted-foreground"
        )}>
          {item.icon}
        </span>
        
        {!collapsed && <span>{item.label}</span>}
        
        {!collapsed && item.badge && (
          <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-topspeed-600/10 text-topspeed-600 text-xs font-medium">
            {item.badge}
          </span>
        )}
        
        {collapsed && item.badge && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-topspeed-600 text-white text-[10px] font-medium">
            {item.badge}
          </span>
        )}
      </motion.div>
    </Link>
  );
};

export default SidebarMenu;
