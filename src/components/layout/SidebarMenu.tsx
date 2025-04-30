
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, Home, Package, Clock, Box, Wallet, BarChart, Archive, LifeBuoy, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

type SidebarItemType = {
  icon: React.ReactNode;
  label: string;
  href: string;
  children?: Omit<SidebarItemType, 'children' | 'icon'>[];
};

interface SidebarMenuProps {
  collapsed?: boolean;
}

const SidebarMenu: React.FC<SidebarMenuProps> = ({ collapsed = false }) => {
  const [openDropdowns, setOpenDropdowns] = React.useState<Record<string, boolean>>({
    orders: false,
    pickups: false,
    wallet: false,
  });
  
  const location = useLocation();
  
  const toggleDropdown = (key: string) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

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
    <div className="space-y-1">
      {menuItems.map((item) => {
        const isActive = location.pathname === item.href || 
                        (item.href !== '/' && location.pathname.startsWith(item.href));
        
        return (
          <div key={item.href}>
            <Link
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
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
            </Link>
          </div>
        );
      })}
    </div>
  );
};

export default SidebarMenu;
