
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Moon, Sun, Package, Truck, Home, Clock, Users, Wallet, BarChart3, Settings, Phone, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import SidebarMenu from './SidebarMenu';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
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
    <motion.aside 
      className={cn(
        "flex flex-col w-[260px] min-w-[260px] bg-gray-50 dark:bg-gray-900 h-screen relative border-r border-gray-200 dark:border-gray-800",
        className
      )}
      layout
      transition={{
        duration: 0.2,
        ease: "easeInOut"
      }}
    >
      <div className="flex h-16 items-center px-5">
        <Link to="/" className="flex items-center gap-2.5 mx-auto">
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
      
      <div className="flex-1 overflow-y-auto py-6 px-3 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
        <SidebarMenu collapsed={false} />
      </div>
      
      <div className="p-5 flex flex-col gap-3">
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
          className={cn(
            "flex items-center gap-3 w-full p-3 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200", 
            "hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
          )}
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </motion.button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
