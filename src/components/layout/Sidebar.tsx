
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

const Sidebar: React.FC<SidebarProps> = ({
  className
}) => {
  const [darkMode, setDarkMode] = useState(false);
  const { isMobile, isTablet } = useScreenSize();
  const { signOut } = useAuth();
  const location = useLocation();
  const { closeSidebar } = useLayoutStore();

  // Memoize closeSidebar to avoid extra renders
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
    <motion.aside
      className={cn(
        "fixed top-0 left-0 flex flex-col h-screen w-[260px] min-w-[260px]",
        "bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl",
        "border-r border-gray-100 dark:border-gray-800 z-30",
        className
      )}
      layout
      transition={{
        duration: 0.2,
        ease: "easeInOut"
      }}
    >
      {/* Main flex column: logo at top, menu in middle, actions at bottom */}
      <div className="flex flex-col h-full">
        {/* Enhanced Logo/Header */}
        <div className="flex h-16 items-center px-6 flex-shrink-0 border-b border-gray-50 dark:border-gray-800/50">
          <Link to="/" className="flex items-center gap-3" onClick={handleMenuClick}>
            <motion.div
              className="flex items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-gradient-to-br from-[#DC291E] to-[#c0211a] h-10 w-10 rounded-xl flex items-center justify-center shadow-lg shadow-[#DC291E]/20">
                <Truck className="h-5 w-5 text-white" />
              </div>
              <span className="ml-3 text-gray-900 dark:text-gray-100 font-bold text-xl tracking-tight">
                Topspeed
              </span>
            </motion.div>
          </Link>
        </div>
        
        {/* Enhanced Scrollable Menu */}
        <div className="flex-1 min-h-0 overflow-y-auto py-6 px-4 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
          <SidebarMenu collapsed={false} onNavigate={handleMenuClick} />
        </div>

        {/* Enhanced Footer Actions */}
        <div className="flex flex-col gap-2 border-t border-gray-50 dark:border-gray-800/50 px-4 py-4 flex-shrink-0 bg-gray-25/50 dark:bg-gray-900/50">
          <Link to="/settings" onClick={handleMenuClick}>
            <motion.div
              whileHover={{ scale: 1.02, x: 2 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium",
                "transition-all duration-200 ease-out",
                location.pathname === '/settings'
                  ? "bg-[#DC291E]/10 text-[#DC291E] dark:bg-[#DC291E]/20 shadow-sm"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/70 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </motion.div>
          </Link>
          
          <motion.button
            whileHover={{ scale: 1.02, x: 2 }}
            whileTap={{ scale: 0.98 }}
            onClick={toggleDarkMode}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/70 hover:text-gray-900 dark:hover:text-white transition-all duration-200 ease-out"
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
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02, x: 2 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 ease-out"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </motion.button>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
