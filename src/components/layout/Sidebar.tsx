
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft, Moon, Sun, Package, Truck, Home, Clock, Users, Wallet, BarChart3, Settings, Phone, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import SidebarMenu from './SidebarMenu';

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  className
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <aside 
      className={cn(
        "flex flex-col border-r border-border/10 bg-sidebar h-screen transition-all duration-300 shadow-md relative z-20",
        collapsed ? "w-[70px]" : "w-[260px]", 
        className
      )}
    >
      <div className="flex h-16 items-center px-4 border-b border-border/10">
        <Link to="/" className="flex items-center gap-2.5 mx-auto">
          {!collapsed ? (
            <div className="flex items-center">
              <div className="bg-topspeed-600 text-white h-8 w-8 rounded-md flex items-center justify-center">
                <Truck className="h-4 w-4" />
              </div>
              <span className="tracking-tight text-topspeed-600 font-bold text-xl px-2">
                Topspeed
              </span>
            </div>
          ) : (
            <div className="w-9 h-9 rounded-md bg-topspeed-600 flex items-center justify-center text-white">
              <Truck className="h-5 w-5" />
            </div>
          )}
        </Link>
        
        <button 
          onClick={() => setCollapsed(!collapsed)} 
          className={cn(
            "absolute -right-3 top-20 rounded-full p-1 bg-white border border-border/20 shadow-md text-gray-500 transition-colors hover:text-topspeed-600",
            "h-6 w-6 flex items-center justify-center"
          )} 
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft className={cn("h-3.5 w-3.5 transition-transform duration-300", collapsed && "transform rotate-180")} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-3">
        <SidebarMenu collapsed={collapsed} />
      </div>
      
      <div className="p-3 border-t border-border/10 flex flex-col gap-2">
        <button
          onClick={toggleDarkMode}
          className={cn(
            "flex items-center gap-3 w-full p-2.5 rounded-lg text-sm font-medium",
            "hover:bg-muted/80 transition-colors",
            collapsed ? "justify-center" : ""
          )}
        >
          {darkMode ? (
            <>
              <Sun className="h-4 w-4 text-amber-500" />
              {!collapsed && <span>Light Mode</span>}
            </>
          ) : (
            <>
              <Moon className="h-4 w-4 text-indigo-500" />
              {!collapsed && <span>Dark Mode</span>}
            </>
          )}
        </button>
        
        <button
          className={cn(
            "flex items-center gap-3 w-full p-2.5 rounded-lg text-sm font-medium text-topspeed-600",
            "hover:bg-topspeed-50 transition-colors",
            collapsed ? "justify-center" : ""
          )}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
