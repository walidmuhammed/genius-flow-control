
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Moon, Sun, Truck, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import SidebarMenu from './SidebarMenu';
import { motion } from 'framer-motion';
import { useScreenSize } from '@/hooks/useScreenSize';
import { useAuth } from '@/hooks/useAuth';

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  className
}) => {
  const [darkMode, setDarkMode] = useState(false);
  const { isMobile } = useScreenSize();
  const { signOut } = useAuth();
  const location = useLocation();

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
  };

  return (
    <motion.aside
      className={cn(
        // Fixed width (260px) on all screen sizes - let parent handle overlay
        "fixed top-0 left-0 flex flex-col h-screen w-[260px] min-w-[260px] bg-gray-50 dark:bg-gray-900 z-30", // removed border-r border-gray-200 dark:border-gray-800
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
        {/* Logo/Header */}
        <div className="flex h-16 items-center px-5 flex-shrink-0">
          <Link to="/" className="flex items-center gap-2.5">
            <motion.div
              className="flex items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-[#DC291E] h-9 w-9 rounded-lg flex items-center justify-center">
                <Truck className="h-5 w-5 text-white" />
              </div>
              <span className="tracking-tight text-gray-900 dark:text-gray-100 font-bold text-xl px-2">
                Topspeed
              </span>
            </motion.div>
          </Link>
        </div>
        
        {/* Scrollable Menu */}
        <div className="flex-1 min-h-0 overflow-y-auto py-6 px-3 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
          <SidebarMenu collapsed={false} />
        </div>

        {/* Footer: Settings, Dark Mode, Sign Out - always at bottom */}
        <div className="flex flex-col gap-3 border-t border-gray-200 dark:border-gray-800 px-5 py-5 flex-shrink-0">
          <Link to="/settings">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "flex items-center gap-3 w-full p-3 rounded-lg text-sm font-medium",
                "hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200",
                location.pathname === '/settings'
                  ? "bg-gray-200 dark:bg-gray-800 text-[#DC291E] dark:text-[#DC291E]"
                  : "text-gray-700 dark:text-gray-200"
              )}
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </motion.div>
          </Link>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={toggleDarkMode}
            className={cn(
              "flex items-center gap-3 w-full p-3 rounded-lg text-sm font-medium",
              "hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 text-gray-700 dark:text-gray-200"
            )}
          >
            {darkMode ? (
              <>
                <Sun className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                <span>Dark Mode</span>
              </>
            )}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSignOut}
            className={cn(
              "flex items-center gap-3 w-full p-3 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200",
              "hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
            )}
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

