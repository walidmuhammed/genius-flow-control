
import React, { useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Moon, Sun, Truck, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import SidebarMenu from './SidebarMenu';
import { motion } from 'framer-motion';
import { useScreenSize } from '@/hooks/useScreenSize';
import { useAuth } from '@/hooks/useAuth';
import useLayoutStore from '@/stores/layoutStore';

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const [darkMode, setDarkMode] = useState(false);
  const { isMobile, isTablet } = useScreenSize();
  const { signOut } = useAuth();
  const location = useLocation();
  const { closeSidebar } = useLayoutStore();

  const handleMenuClick = useCallback(() => {
    if (isMobile || isTablet) closeSidebar();
  }, [isMobile, isTablet, closeSidebar]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleSignOut = () => {
    signOut();
    if (isMobile || isTablet) closeSidebar();
  };

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 flex flex-col h-screen w-64 bg-white dark:bg-gray-950 border-r border-gray-100 dark:border-gray-800 z-30",
        className
      )}
    >
      <div className="flex flex-col h-full">
        {/* Logo/Header */}
        <div className="flex h-16 items-center px-6 border-b border-gray-50 dark:border-gray-800">
          <Link to="/" className="flex items-center gap-3" onClick={handleMenuClick}>
            <div className="bg-[#DC291E] h-8 w-8 rounded-lg flex items-center justify-center">
              <Truck className="h-4 w-4 text-white" />
            </div>
            <span className="text-gray-900 dark:text-gray-100 font-semibold text-lg">
              Topspeed
            </span>
          </Link>
        </div>
        
        {/* Menu */}
        <div className="flex-1 overflow-y-auto py-6">
          <SidebarMenu collapsed={false} onNavigate={handleMenuClick} />
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-50 dark:border-gray-800 p-4 space-y-1">
          <Link to="/settings" onClick={handleMenuClick}>
            <div
              className={cn(
                "flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                "hover:bg-gray-50 dark:hover:bg-gray-900",
                location.pathname === '/settings'
                  ? "text-[#DC291E] bg-gray-50 dark:bg-gray-900"
                  : "text-gray-700 dark:text-gray-300"
              )}
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </div>
          </Link>
          
          <button
            onClick={toggleDarkMode}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
          >
            {darkMode ? (
              <>
                <Sun className="h-4 w-4" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="h-4 w-4" />
                <span>Dark Mode</span>
              </>
            )}
          </button>
          
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
