
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import SidebarMenu from './SidebarMenu';

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const [collapsed, setCollapsed] = useState(false);

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
              <span className="text-xl font-semibold tracking-tight text-orange-500">
                GENIUS
              </span>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white font-bold text-sm">
              G
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
        <SidebarMenu collapsed={collapsed} />
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
