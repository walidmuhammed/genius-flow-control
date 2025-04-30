
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Package, Clock, Box, Wallet, BarChart, Archive, LifeBuoy, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

type SidebarItemType = {
  icon: React.ReactNode;
  label: string;
  href: string;
};

interface SidebarMenuProps {
  collapsed?: boolean;
}

const SidebarMenu: React.FC<SidebarMenuProps> = ({ collapsed = false }) => {
  const location = useLocation();
  
  const menuItems: SidebarItemType[] = [
    {
      icon: <Home className="h-5 w-5" />,
      label: 'Home',
      href: '/',
    },
    {
      icon: <Package className="h-5 w-5" />,
      label: 'Orders',
      href: '/orders',
    },
    {
      icon: <Clock className="h-5 w-5" />,
      label: 'Pickups',
      href: '/pickups',
    },
    {
      icon: <Box className="h-5 w-5" />,
      label: 'Products',
      href: '/products',
    },
    {
      icon: <Wallet className="h-5 w-5" />,
      label: 'Wallet',
      href: '/wallet',
    },
    {
      icon: <BarChart className="h-5 w-5" />,
      label: 'Analytics',
      href: '/analytics',
    },
    {
      icon: <Archive className="h-5 w-5" />,
      label: 'Packaging',
      href: '/packaging',
    },
    {
      icon: <LifeBuoy className="h-5 w-5" />,
      label: 'Support',
      href: '/support',
    },
    {
      icon: <Settings className="h-5 w-5" />,
      label: 'Settings',
      href: '/settings',
    },
  ];

  return (
    <div className="space-y-1.5">
      {menuItems.map((item) => {
        const isActive = location.pathname === item.href || 
                        (item.href !== '/' && location.pathname.startsWith(item.href));
        
        return (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all",
              isActive
                ? "bg-primary/10 text-primary font-medium shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <div className={cn(
              "flex items-center justify-center",
              isActive ? "text-primary" : "text-muted-foreground"
            )}>
              {item.icon}
            </div>
            {!collapsed && (
              <span className="flex-1">{item.label}</span>
            )}
            {isActive && !collapsed && (
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
            )}
          </Link>
        );
      })}
    </div>
  );
};

export default SidebarMenu;
