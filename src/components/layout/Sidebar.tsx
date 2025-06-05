
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Moon, Sun, Package, Truck, Home, Clock, Users, Wallet, BarChart3, Settings, LogOut } from 'lucide-react';
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
  const { isMobile } = useScreenSize();
  const { signOut } = useAuth();
  const { sidebarOpen, closeSidebar } = useLayoutStore();
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

  // Mobile overlay
  if (isMobile) {
    return (
      <>
        {/* Backdrop */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={closeSidebar}
          />
        )}
        
        {/* Mobile Sidebar */}
        <motion.aside 
          className={cn(
            "fixed top-0 left-0 h-full w-72 bg-white dark:bg-gray-950 z-50 lg:hidden",
            "border-r border-gray-100 dark:border-gray-800 shadow-xl",
            className
          )}
          initial={{ x: '-100%' }}
          animate={{ x: sidebarOpen ? 0 : '-100%' }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <SidebarContent 
            darkMode={darkMode}
            toggleDarkMode={toggleDarkMode}
            handleSignOut={handleSignOut}
            location={location}
          />
        </motion.aside>
      </>
    );
  }

  // Desktop sidebar
  return (
    <motion.aside 
      className={cn(
        "fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white dark:bg-gray-950 z-30",
        "border-r border-gray-100 dark:border-gray-800",
        className
      )}
      initial={{ x: 0 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
    >
      <SidebarContent 
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        handleSignOut={handleSignOut}
        location={location}
      />
    </motion.aside>
  );
};

// Shared sidebar content component
const SidebarContent: React.FC<{
  darkMode: boolean;
  toggleDarkMode: () => void;
  handleSignOut: () => void;
  location: any;
}> = ({ darkMode, toggleDarkMode, handleSignOut, location }) => {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex h-16 items-center px-6 border-b border-gray-100 dark:border-gray-800">
        <Link to="/" className="flex items-center gap-3">
          <div className="bg-[#DC291E] h-8 w-8 rounded-lg flex items-center justify-center">
            <Truck className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-lg text-gray-900 dark:text-gray-100">
            Topspeed
          </span>
        </Link>
      </div>
      
      {/* Menu */}
      <div className="flex-1 overflow-y-auto py-6 px-4">
        <SidebarMenu collapsed={false} />
      </div>
      
      {/* Footer */}
      <div className="border-t border-gray-100 dark:border-gray-800 p-4 space-y-1">
        {/* Settings */}
        <Link to="/settings">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "flex items-center gap-3 w-full p-3 rounded-lg text-sm font-medium transition-all duration-200",
              "hover:bg-gray-50 dark:hover:bg-gray-900",
              location.pathname === '/settings'
                ? "bg-gray-100 dark:bg-gray-800 text-[#DC291E]"
                : "text-gray-700 dark:text-gray-300"
            )}
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </motion.div>
        </Link>
        
        {/* Dark Mode Toggle */}
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={toggleDarkMode}
          className="flex items-center gap-3 w-full p-3 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all duration-200"
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
        
        {/* Sign Out */}
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full p-3 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all duration-200"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </motion.button>
      </div>
    </div>
  );
};

export default Sidebar;
