
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
        <div className="flex-1 overflow-y-auto py-8">
          <SidebarMenu collapsed={false} onNavigate={handleMenuClick} />
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-50 dark:border-gray-800 p-6 space-y-2">
          <Link to="/settings" onClick={handleMenuClick}>
            <div
              className={cn(
                "flex items-center gap-4 w-full px-4 py-4 rounded-xl text-sm font-medium transition-all duration-200",
                "hover:bg-gray-50/50 dark:hover:bg-gray-800/30",
                location.pathname === '/settings'
                  ? "text-[#DC291E] bg-gray-50 dark:bg-gray-800/50"
                  : "text-gray-600 dark:text-gray-400"
              )}
            >
              <Settings className="h-5 w-5" />
              <span className="text-base">Settings</span>
            </div>
          </Link>
          
          <button
            onClick={toggleDarkMode}
            className="flex items-center gap-4 w-full px-4 py-4 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 hover:text-gray-900 dark:hover:text-gray-200 transition-all duration-200"
          >
            {darkMode ? (
              <>
                <Sun className="h-5 w-5" />
                <span className="text-base">Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="h-5 w-5" />
                <span className="text-base">Dark Mode</span>
              </>
            )}
          </button>
          
          <button
            onClick={handleSignOut}
            className="flex items-center gap-4 w-full px-4 py-4 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 hover:text-gray-900 dark:hover:text-gray-200 transition-all duration-200"
          >
            <LogOut className="h-5 w-5" />
            <span className="text-base">Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
