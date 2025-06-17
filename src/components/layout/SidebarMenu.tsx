
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Package, Truck, Home, Clock, Users, Wallet, BarChart3, Settings, Ticket } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarMenuProps {
  collapsed: boolean;
  onNavigate?: () => void;
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
      icon: <Home className="h-5 w-5" />,
      path: '/'
    }, 
    {
      label: 'Orders',
      icon: <Package className="h-5 w-5" />,
      path: '/orders'
    }, 
    {
      label: 'Pickups',
      icon: <Clock className="h-5 w-5" />,
      path: '/pickups'
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
    },
    {
      label: 'Support',
      icon: <Ticket className="h-5 w-5" />,
      path: '/support'
    }
  ];

  return (
    <div className="px-6">
      <div className="space-y-2">
        {mainMenuItems.map(item => (
          <MenuItem 
            key={item.path} 
            collapsed={collapsed} 
            item={item} 
            isActive={location.pathname === item.path}
            onNavigate={onNavigate}
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
}

const MenuItem: React.FC<MenuItemProps> = ({ item, isActive, collapsed, onNavigate }) => {
  return (
    <Link to={item.path} onClick={onNavigate}>
      <div 
        className={cn(
          "relative flex items-center gap-4 px-4 py-4 rounded-xl text-sm font-medium transition-all duration-200 group",
          isActive 
            ? "text-[#DC291E] bg-gray-50 dark:bg-gray-800/50" 
            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50/50 dark:hover:bg-gray-800/30"
        )}
      >
        <span className={cn(
          "flex items-center justify-center transition-colors",
          isActive ? "text-[#DC291E]" : "text-gray-500 dark:text-gray-400"
        )}>
          {item.icon}
        </span>
        
        <span className="transition-colors text-base">
          {item.label}
        </span>
      </div>
    </Link>
  );
};

export default SidebarMenu;
