
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
        // Modern glassy styled sidebar
        "fixed top-0 left-0 flex flex-col h-screen w-[264px] min-w-[264px] bg-white/75 dark:bg-gray-900/80 border-r border-gray-200 dark:border-gray-800 z-30 shadow-xl backdrop-blur-[8px] rounded-tr-2xl rounded-br-xl",
        "transition-all duration-300",
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
        <div className="flex h-[78px] items-center px-6 pt-2 flex-shrink-0 border-b border-transparent mb-2">
          <Link to="/" className="flex items-center gap-3">
            <motion.div
              className="flex items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-[#DC291E] h-10 w-10 rounded-xl flex items-center justify-center shadow-lg shadow-[#dc291e]/10 border border-white/50 ring-1 ring-[#dc291e]/10">
                <Truck className="h-6 w-6 text-white" />
              </div>
              <span className="tracking-tight text-gray-900 dark:text-gray-100 font-extrabold text-2xl px-2 font-sans drop-shadow-sm select-none">
                Topspeed
              </span>
            </motion.div>
          </Link>
        </div>
        
        {/* Scrollable Menu */}
        <div className="flex-1 min-h-0 overflow-y-auto py-5 px-3 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
          <SidebarMenu collapsed={false} />
        </div>

        {/* Footer: Settings, Dark Mode, Sign Out - always at bottom */}
        <div className="flex flex-col gap-3 border-t border-transparent px-6 py-6 flex-shrink-0">
          <Link to="/settings">
            <motion.div
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className={cn(
                "flex items-center gap-4 w-full p-3 rounded-xl text-base font-semibold shadow-none",
                "hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-all duration-200",
                location.pathname === '/settings'
                  ? "bg-[#f4eded] dark:bg-[#251010] text-[#DC291E] dark:text-[#DC291E]"
                  : "text-gray-700 dark:text-gray-200"
              )}
            >
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </motion.div>
          </Link>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={toggleDarkMode}
            className={cn(
              "flex items-center gap-4 w-full p-3 rounded-xl text-base font-semibold shadow-none",
              "hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-all duration-200 text-gray-700 dark:text-gray-200"
            )}
          >
            {darkMode ? (
              <>
                <Sun className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                <span>Dark Mode</span>
              </>
            )}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSignOut}
            className={cn(
              "flex items-center gap-4 w-full p-3 rounded-xl text-base font-semibold text-red-600 dark:text-red-400 border border-transparent hover:border-red-100 dark:hover:border-red-800/40",
              "hover:bg-red-50/60 dark:hover:bg-red-900/20 transition-all duration-200"
            )}
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </motion.button>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;

