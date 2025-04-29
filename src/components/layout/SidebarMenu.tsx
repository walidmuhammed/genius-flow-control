
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, Home, Package, Clock, Box, Wallet, BarChart, Archive, LifeBuoy, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

type SidebarItemType = {
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive?: boolean;
  children?: Omit<SidebarItemType, 'children' | 'icon'>[];
};

interface SidebarMenuProps {
  collapsed?: boolean;
}

const SidebarMenu: React.FC<SidebarMenuProps> = ({ collapsed = false }) => {
  const location = useLocation();
  const [openDropdowns, setOpenDropdowns] = React.useState<Record<string, boolean>>({
    orders: location.pathname.startsWith('/orders'),
    pickups: location.pathname.startsWith('/pickups'),
    wallet: location.pathname.startsWith('/wallet'),
  });

  const toggleDropdown = (key: string) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Check if the current path matches the route or is a child route
  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const menuItems: SidebarItemType[] = [
    {
      icon: <Home className="h-5 w-5" />,
      label: 'Home',
      href: '/',
      isActive: isActive('/'),
    },
    {
      icon: <Package className="h-5 w-5" />,
      label: 'Orders',
      href: '/orders',
      isActive: isActive('/orders'),
      children: [
        { label: 'Domestic', href: '/orders/domestic', isActive: isActive('/orders/domestic') },
      ],
    },
    {
      icon: <Clock className="h-5 w-5" />,
      label: 'Pickups',
      href: '/pickups',
      isActive: isActive('/pickups'),
    },
    {
      icon: <Box className="h-5 w-5" />,
      label: 'Products',
      href: '/products',
      isActive: isActive('/products'),
    },
    {
      icon: <Wallet className="h-5 w-5" />,
      label: 'Wallet',
      href: '/wallet',
      isActive: isActive('/wallet'),
    },
    {
      icon: <BarChart className="h-5 w-5" />,
      label: 'Analytics',
      href: '/analytics',
      isActive: isActive('/analytics'),
    },
    {
      icon: <Archive className="h-5 w-5" />,
      label: 'Packaging',
      href: '/packaging',
      isActive: isActive('/packaging'),
    },
    {
      icon: <LifeBuoy className="h-5 w-5" />,
      label: 'Support',
      href: '/support',
      isActive: isActive('/support'),
    },
    {
      icon: <Settings className="h-5 w-5" />,
      label: 'Settings',
      href: '/settings',
      isActive: isActive('/settings'),
    },
  ];

  return (
    <div className="space-y-1">
      {menuItems.map((item) => {
        const hasChildren = item.children && item.children.length > 0;
        const isOpen = hasChildren && openDropdowns[item.label.toLowerCase()];
        const isItemActive = item.isActive || (hasChildren && item.children?.some(child => child.isActive));

        return (
          <div key={item.href} className="mb-1">
            <Link
              to={!hasChildren ? item.href : '#'}
              onClick={hasChildren ? (e) => {
                e.preventDefault();
                toggleDropdown(item.label.toLowerCase());
              } : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
                isItemActive
                  ? "bg-red-50 text-red-600 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <div className={cn(
                "flex items-center justify-center rounded-md",
                isItemActive ? "text-red-600" : "text-gray-500"
              )}>
                {item.icon}
              </div>
              {!collapsed && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {hasChildren && (
                    <ChevronDown
                      className={cn("h-4 w-4 transition-transform", 
                        isOpen ? "transform rotate-180" : ""
                      )}
                    />
                  )}
                </>
              )}
              {item.label === 'Settings' && !collapsed && (
                <span className="bg-red-600 text-white text-xs px-1.5 py-0.5 rounded">NEW</span>
              )}
            </Link>
            {!collapsed && hasChildren && isOpen && (
              <div className="pl-11 mt-1 space-y-1">
                {item.children?.map((child) => (
                  <Link
                    key={child.href}
                    to={child.href}
                    className={cn(
                      "flex items-center rounded-lg px-3 py-2 text-sm transition-all",
                      child.isActive
                        ? "bg-red-50 text-red-600 font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SidebarMenu;
