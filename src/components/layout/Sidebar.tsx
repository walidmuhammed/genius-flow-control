
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
        "fixed top-0 left-0 flex flex-col h-screen w-[260px] min-w-[260px] bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-r border-gray-200/60 dark:border-gray-800/60 z-30 shadow-sm",
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
        {/* Logo/Header with enhanced styling */}
        <div className="flex h-16 items-center px-6 flex-shrink-0 border-b border-gray-200/40 dark:border-gray-800/40">
          <Link to="/" className="flex items-center gap-3">
            <motion.div
              className="flex items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-gradient-to-br from-[#DC291E] to-[#c0211a] h-10 w-10 rounded-xl flex items-center justify-center shadow-md">
                <Truck className="h-5 w-5 text-white" />
              </div>
              <span className="tracking-tight text-gray-900 dark:text-gray-100 font-bold text-xl ml-3">
                Topspeed
              </span>
            </motion.div>
          </Link>
        </div>
        
        {/* Scrollable Menu with enhanced container */}
        <div className="flex-1 min-h-0 overflow-y-auto py-6 px-4 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
          <div className="bg-gray-50/50 dark:bg-gray-800/30 rounded-xl p-3 backdrop-blur-sm">
            <SidebarMenu collapsed={false} />
          </div>
        </div>

        {/* Footer with enhanced styling */}
        <div className="flex flex-col gap-2 border-t border-gray-200/40 dark:border-gray-800/40 px-4 py-5 flex-shrink-0 bg-gray-50/30 dark:bg-gray-800/20">
          <Link to="/settings">
            <motion.div
              whileHover={{ scale: 1.02, x: 2 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "flex items-center gap-3 w-full p-3 rounded-xl text-sm font-medium",
                "hover:bg-white/60 dark:hover:bg-gray-800/60 hover:shadow-sm transition-all duration-200 backdrop-blur-sm",
                location.pathname === '/settings'
                  ? "bg-white/80 dark:bg-gray-800/80 text-[#DC291E] dark:text-[#DC291E] shadow-sm"
                  : "text-gray-700 dark:text-gray-200"
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
            className={cn(
              "flex items-center gap-3 w-full p-3 rounded-xl text-sm font-medium",
              "hover:bg-white/60 dark:hover:bg-gray-800/60 hover:shadow-sm transition-all duration-200 text-gray-700 dark:text-gray-200 backdrop-blur-sm"
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
            whileHover={{ scale: 1.02, x: 2 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSignOut}
            className={cn(
              "flex items-center gap-3 w-full p-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200",
              "hover:bg-white/60 dark:hover:bg-gray-800/60 hover:shadow-sm transition-all duration-200 backdrop-blur-sm"
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
