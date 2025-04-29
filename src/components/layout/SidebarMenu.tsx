
import React from 'react';
import { Link } from 'react-router-dom';
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
  const [openDropdowns, setOpenDropdowns] = React.useState<Record<string, boolean>>({
    orders: false,
    pickups: false,
    wallet: false,
  });

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
      isActive: true,
    },
    {
      icon: <Package className="h-5 w-5" />,
      label: 'Orders',
      href: '/orders',
      children: [
        { label: 'New Orders', href: '/orders/new' },
        { label: 'In Progress Orders', href: '/orders/in-progress' },
        { label: 'Heading to Customer', href: '/orders/heading-to-customer' },
        { label: 'Awaiting Action', href: '/orders/awaiting-action' },
        { label: 'Detailed Orders List', href: '/orders/list' },
      ],
    },
    {
      icon: <Clock className="h-5 w-5" />,
      label: 'Pickups',
      href: '/pickups',
      children: [
        { label: 'Upcoming Pickups', href: '/pickups/upcoming' },
        { label: 'Pickup History', href: '/pickups/history' },
      ],
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
      children: [
        { label: 'Overview', href: '/wallet' },
        { label: 'Transactions', href: '/wallet/transactions' },
      ],
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
        const hasChildren = item.children && item.children.length > 0;
        const isOpen = hasChildren && openDropdowns[item.label.toLowerCase()];

        return (
          <div key={item.href}>
            <Link
              to={!hasChildren ? item.href : '#'}
              onClick={hasChildren ? () => toggleDropdown(item.label.toLowerCase()) : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
                item.isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}
            >
              <div className={cn(
                "flex items-center justify-center rounded-md",
                item.isActive ? "text-primary" : "text-muted-foreground"
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
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
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
