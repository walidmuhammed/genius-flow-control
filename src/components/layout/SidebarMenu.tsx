
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { BarChart3, Clock, Home, Package, Settings, Shield, Truck, Users, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarMenuProps {
  collapsed: boolean;
}

interface MenuItem {
  title: string;
  path: string;
  icon: React.ElementType;
  badge?: number;
}

const SidebarMenu: React.FC<SidebarMenuProps> = ({ collapsed }) => {
  const location = useLocation();
  
  const menuItems: MenuItem[] = [
    {
      title: 'Dashboard',
      path: '/',
      icon: Home,
    },
    {
      title: 'Orders',
      path: '/orders',
      icon: Package,
      badge: 8,
    },
    {
      title: 'Pickups',
      path: '/pickups',
      icon: Truck,
      badge: 3,
    },
    {
      title: 'Customers',
      path: '/customers',
      icon: Users,
    },
    {
      title: 'Wallet',
      path: '/wallet',
      icon: Wallet,
    },
    {
      title: 'Analytics',
      path: '/analytics',
      icon: BarChart3,
    },
  ];
  
  const secondaryMenuItems: MenuItem[] = [
    {
      title: 'Settings',
      path: '/settings',
      icon: Settings,
    },
    {
      title: 'Support',
      path: '/support',
      icon: Shield,
    },
  ];
  
  const renderMenuItems = (items: MenuItem[]) => (
    <div className="space-y-1.5">
      {items.map((item) => {
        const isActive = location.pathname === item.path || 
                        (item.path !== '/' && location.pathname.startsWith(item.path));
        
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
              isActive 
                ? "bg-topspeed-600 text-white font-medium" 
                : "hover:bg-topspeed-50 text-foreground/80 hover:text-topspeed-600",
              collapsed ? "justify-center" : ""
            )}
          >
            <div className={cn(
              "relative flex items-center justify-center",
              isActive ? "text-white" : "text-muted-foreground"
            )}>
              <item.icon className={cn("h-[18px] w-[18px]")} />
              {item.badge && (
                <span className="absolute -top-1 -right-1 h-4 w-4 text-[10px] flex items-center justify-center bg-topspeed-600 text-white rounded-full">
                  {item.badge}
                </span>
              )}
            </div>
            {!collapsed && (
              <span className={cn(
                "text-sm",
                isActive ? "text-white" : "text-foreground/80"
              )}>
                {item.title}
              </span>
            )}
          </NavLink>
        );
      })}
    </div>
  );
  
  return (
    <div className="space-y-6">
      {renderMenuItems(menuItems)}
      
      {!collapsed && <div className="h-px bg-border/10 my-4" />}
      
      {renderMenuItems(secondaryMenuItems)}
    </div>
  );
};

export default SidebarMenu;
