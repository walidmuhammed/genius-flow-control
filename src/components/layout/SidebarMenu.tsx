
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
      icon: <Home className="h-[18px] w-[18px]" />,
      label: 'Home',
      href: '/',
    },
    {
      icon: <Package className="h-[18px] w-[18px]" />,
      label: 'Orders',
      href: '/orders',
    },
    {
      icon: <Clock className="h-[18px] w-[18px]" />,
      label: 'Pickups',
      href: '/pickups',
    },
    {
      icon: <Box className="h-[18px] w-[18px]" />,
      label: 'Products',
      href: '/products',
    },
    {
      icon: <Wallet className="h-[18px] w-[18px]" />,
      label: 'Wallet',
      href: '/wallet',
    },
    {
      icon: <BarChart className="h-[18px] w-[18px]" />,
      label: 'Analytics',
      href: '/analytics',
    },
    {
      icon: <Archive className="h-[18px] w-[18px]" />,
      label: 'Packaging',
      href: '/packaging',
    },
    {
      icon: <LifeBuoy className="h-[18px] w-[18px]" />,
      label: 'Support',
      href: '/support',
    },
    {
      icon: <Settings className="h-[18px] w-[18px]" />,
      label: 'Settings',
      href: '/settings',
    },
  ];

  return (
    <div className="space-y-1">
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
                : "text-muted-foreground hover:bg-muted/50 hover:text-zinc-900"
            )}
          >
            <div className={cn(
              "flex items-center justify-center",
              isActive ? "text-primary" : "text-muted-foreground"
            )}>
              {item.icon}
            </div>
            {!collapsed && (
              <span className="flex-1 font-medium">{item.label}</span>
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
