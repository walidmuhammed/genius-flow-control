
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

const Sidebar: React.FC<SidebarProps> = ({
  className
}) => {
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
        "flex flex-col w-[260px] min-w-[260px] border-r border-white/5 bg-gradient-to-b from-[#DC291E] to-[#B01E18] h-screen shadow-xl relative z-20",
        className
      )}
      layout
      transition={{
        duration: 0.2,
        ease: "easeInOut"
      }}
    >
      <div className="flex h-16 items-center px-5 border-b border-white/10">
        <Link to="/" className="flex items-center gap-2.5 mx-auto">
          <motion.div 
            className="flex items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-white text-[#DC291E] h-8 w-8 rounded-md flex items-center justify-center shadow-md">
              <Truck className="h-4 w-4" />
            </div>
            <span className="tracking-tight text-white font-bold text-xl px-2">
              Topspeed
            </span>
          </motion.div>
        </Link>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-3">
        <SidebarMenu collapsed={false} />
      </div>
      
      <div className="p-4 border-t border-white/10 flex flex-col gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={toggleDarkMode}
          className={cn(
            "flex items-center gap-3 w-full p-3 rounded-lg text-sm font-medium",
            "hover:bg-white/10 transition-colors text-white/90"
          )}
        >
          {darkMode ? (
            <>
              <Sun className="h-4 w-4 text-white" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="h-4 w-4 text-white" />
              <span>Dark Mode</span>
            </>
          )}
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "flex items-center gap-3 w-full p-3 rounded-lg text-sm font-medium text-white",
            "hover:bg-white/10 transition-colors"
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
