
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
    <div className="px-4">
      <div className="space-y-1">
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
          "relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group",
          isActive 
            ? "text-[#DC291E] bg-[#DC291E]/5" 
            : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900"
        )}
      >
        {/* Active indicator - clean left border */}
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-[#DC291E] rounded-full" />
        )}
        
        <span className={cn(
          "flex items-center justify-center transition-colors",
          isActive ? "text-[#DC291E]" : "text-gray-500 dark:text-gray-400"
        )}>
          {item.icon}
        </span>
        
        <span className="transition-colors">
          {item.label}
        </span>
      </div>
    </Link>
  );
};

export default SidebarMenu;
