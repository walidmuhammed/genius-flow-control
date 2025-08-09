import React from 'react';
import { motion } from 'framer-motion';
import { Settings, Moon, Sun, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import useLayoutStore from '@/stores/layoutStore';
import { useScreenSize } from '@/hooks/useScreenSize';
import CourierSidebarMenu from './CourierSidebarMenu';
import { Link } from 'react-router-dom';

interface CourierSidebarProps {
  className?: string;
}

const CourierSidebar: React.FC<CourierSidebarProps> = ({ className }) => {
  const { signOut } = useAuth();
  const { closeSidebar } = useLayoutStore();
  const { isMobile, isTablet } = useScreenSize();

  const toggleDarkMode = () => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  };

  const handleSignOut = () => {
    signOut();
    if (isMobile || isTablet) {
      closeSidebar();
    }
  };

  return (
    <motion.aside 
      className="w-[260px] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-screen flex flex-col overflow-hidden"
      initial={{ x: -260 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              Courier Portal
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Delivery Management
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        <CourierSidebarMenu collapsed={false} />
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
        <Link to="/dashboard/courier/settings">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start text-gray-600 dark:text-gray-300 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-white"
            onClick={() => { if (isMobile || isTablet) closeSidebar(); }}
          >
            <Settings className="mr-3 h-4 w-4" />
            Settings
          </Button>
        </Link>

        <Button 
          variant="ghost" 
          size="sm" 
          onClick={toggleDarkMode}
          className="w-full justify-start text-gray-600 dark:text-gray-300 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-white"
        >
          <Moon className="mr-3 h-4 w-4 dark:hidden" />
          <Sun className="mr-3 h-4 w-4 hidden dark:block" />
          Theme
        </Button>

        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleSignOut}
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
        >
          <LogOut className="mr-3 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </motion.aside>
  );
};

export default CourierSidebar;