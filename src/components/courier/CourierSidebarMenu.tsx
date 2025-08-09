import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Package, MapPin, Wallet, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CourierSidebarMenuProps {
  collapsed: boolean;
  onNavigate?: () => void;
}

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  path: string;
}

const CourierSidebarMenu: React.FC<CourierSidebarMenuProps> = ({ collapsed, onNavigate }) => {
  const location = useLocation();

  const mainMenuItems: MenuItem[] = [
    { label: 'Dashboard', icon: <Home className="h-5 w-5" />, path: '/dashboard/courier' },
    { label: 'Orders', icon: <Package className="h-5 w-5" />, path: '/dashboard/courier/orders' },
    { label: 'Pickups', icon: <MapPin className="h-5 w-5" />, path: '/dashboard/courier/pickups' },
    { label: 'Wallet', icon: <Wallet className="h-5 w-5" />, path: '/dashboard/courier/wallet' },
    { label: 'Support', icon: <MessageCircle className="h-5 w-5" />, path: '/dashboard/courier/support' },
  ];

  return (
    <div className="space-y-2">
      {mainMenuItems.map((item) => (
        <CourierMenuItem
          key={item.path}
          item={item}
          isActive={location.pathname === item.path}
          collapsed={collapsed}
          onNavigate={onNavigate}
        />
      ))}
    </div>
  );
};

interface CourierMenuItemProps {
  item: MenuItem;
  isActive: boolean;
  collapsed: boolean;
  onNavigate?: () => void;
}

const CourierMenuItem: React.FC<CourierMenuItemProps> = ({ item, isActive, collapsed, onNavigate }) => {
  return (
    <Link to={item.path} onClick={onNavigate}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200",
          isActive 
            ? "bg-gray-200 dark:bg-gray-800 text-[#DC291E] dark:text-[#DC291E]" 
            : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800",
          collapsed && "justify-center px-2"
        )}
      >
        <div className={cn(
          "flex items-center justify-center",
          collapsed ? "w-6 h-6" : "w-5 h-5"
        )}>
          {item.icon}
        </div>
        {!collapsed && (
          <span className="font-medium tracking-tight">
            {item.label}
          </span>
        )}
      </motion.div>
    </Link>
  );
};

export default CourierSidebarMenu;