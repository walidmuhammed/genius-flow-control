
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft, Moon, Sun, Package, Truck, Home, Clock, Users, Wallet, BarChart3, Settings, Phone, LogOut } from 'lucide-react';
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
        "fixed top-0 left-0 flex flex-col w-[260px] h-screen bg-gradient-to-b from-topspeed-600 to-topspeed-700 text-white shadow-2xl z-50",
        className
      )}
      layout
      transition={{
        duration: 0.2,
        ease: "easeInOut"
      }}
    >
      <div className="flex h-16 items-center px-5 border-b border-white/10">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="bg-white h-9 w-9 rounded-xl flex items-center justify-center shadow-lg">
            <Truck className="h-5 w-5 text-topspeed-600" />
          </div>
          <span className="tracking-tight font-bold text-xl text-white px-1">
            Topspeed
          </span>
        </Link>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-3">
        <SidebarMenu />
      </div>
      
      <div className="p-3 border-t border-white/10 flex flex-col gap-2">
        <button
          onClick={toggleDarkMode}
          className={cn(
            "flex items-center gap-3 w-full p-2.5 rounded-xl text-sm font-medium",
            "hover:bg-white/10 transition-all duration-300",
          )}
        >
          {darkMode ? (
            <>
              <Sun className="h-4 w-4 text-amber-300" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="h-4 w-4 text-blue-200" />
              <span>Dark Mode</span>
            </>
          )}
        </button>
        
        <button
          className={cn(
            "flex items-center gap-3 w-full p-2.5 rounded-xl text-sm font-medium text-white",
            "hover:bg-white/10 transition-all duration-300",
          )}
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
