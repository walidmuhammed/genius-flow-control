
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft, Home, Package, BarChart, Archive, Users, Settings, LifeBuoy, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const menuItems = [
    {
      icon: <Home className="h-[18px] w-[18px]" />,
      label: 'Dashboard',
      href: '/',
    },
    {
      icon: <BarChart className="h-[18px] w-[18px]" />,
      label: 'Analytics',
      href: '/analytics',
    },
    {
      icon: <Package className="h-[18px] w-[18px]" />,
      label: 'Orders',
      href: '/orders',
      badge: { count: 14 },
    },
    {
      icon: <Archive className="h-[18px] w-[18px]" />,
      label: 'Products',
      href: '/products',
      badge: { count: 297 },
    },
    {
      icon: <Users className="h-[18px] w-[18px]" />,
      label: 'Customer',
      href: '/customers',
      badge: { count: 23 },
    },
  ];

  const secondaryItems = [
    {
      icon: <LifeBuoy className="h-[18px] w-[18px]" />,
      label: 'Feedback',
      href: '/feedback',
    },
    {
      icon: <Settings className="h-[18px] w-[18px]" />,
      label: 'Settings',
      href: '/settings',
    },
  ];

  const renderMenuItem = (item: any) => {
    const isActive = location.pathname === item.href || 
                    (item.href !== '/' && location.pathname.startsWith(item.href));
    
    return (
      <Link
        key={item.href}
        to={item.href}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
          isActive
            ? "bg-gray-100 text-gray-900 font-medium"
            : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
        )}
      >
        <div className={cn(
          "flex items-center justify-center",
          isActive ? "text-gray-900" : "text-gray-400"
        )}>
          {item.icon}
        </div>
        
        {!collapsed && (
          <>
            <span className="font-medium">{item.label}</span>
            {item.badge && (
              <span className={cn(
                "ml-auto flex min-w-[18px] h-[18px] rounded-full text-[10px] items-center justify-center px-1 font-medium",
                "bg-gray-100 text-gray-600"
              )}>
                {item.badge.count}
              </span>
            )}
          </>
        )}
      </Link>
    );
  };

  return (
    <aside
      className={cn(
        "flex flex-col border-r bg-white h-screen transition-all duration-300",
        collapsed ? "w-[60px]" : "w-[240px]",
        className
      )}
    >
      <div className="flex h-16 items-center px-3 border-b">
        <Link to="/" className="flex items-center gap-2">
          {!collapsed ? (
            <div className="flex items-center">
              <span className="text-xl font-semibold tracking-tight">
                Mindweave.
              </span>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center text-white font-bold text-sm">
              M
            </div>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto rounded-full p-1.5 hover:bg-gray-100 text-gray-400 transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft className={cn(
            "h-4 w-4 transition-transform duration-300",
            collapsed && "transform rotate-180"
          )} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4 px-3">
        <div className="space-y-1">
          {menuItems.map(renderMenuItem)}
        </div>

        <div className="mt-8 pt-4 border-t">
          <div className="space-y-1">
            {secondaryItems.map(renderMenuItem)}
          </div>
        </div>
      </div>
      
      <div className="mt-auto border-t p-3">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <span className="text-sm font-medium text-gray-500">Dark mode</span>
          )}
          <button className="flex items-center justify-center p-2 rounded-md hover:bg-gray-100">
            <Moon className="h-4 w-4 text-gray-400" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
