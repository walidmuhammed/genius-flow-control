
import React from 'react';
import { Bell, Menu, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { useScreenSize } from '@/hooks/useScreenSize';
import useLayoutStore from '@/stores/layoutStore';
import { cn } from '@/lib/utils';
import CreateButton from '@/components/ui/create-button';

const TopBar: React.FC = () => {
  const { isMobile, isTablet } = useScreenSize();
  const { toggleSidebar } = useLayoutStore();

  return (
    <motion.header 
      className={cn(
        "bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl",
        "border-b border-gray-100 dark:border-gray-800",
        "h-16 flex items-center justify-between sticky top-0 z-40",
        "shadow-sm shadow-gray-900/5 dark:shadow-gray-100/5",
        isMobile ? "px-4" : "px-6"
      )}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {(isMobile || isTablet) && (
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleSidebar}
              className="rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 shrink-0 h-10 w-10"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </motion.div>
        )}
        
        {!isMobile && (
          <motion.div 
            className="relative flex-1 max-w-lg"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search orders, customers, deliveries..." 
              className={cn(
                "pl-11 pr-4 h-10 w-full",
                "bg-gray-50/80 dark:bg-gray-800/50",
                "border-gray-200/50 dark:border-gray-700/50",
                "rounded-xl transition-all duration-200",
                "focus:bg-white dark:focus:bg-gray-800",
                "focus:border-[#DC291E]/30 focus:ring-[#DC291E]/20",
                "placeholder:text-gray-400 dark:placeholder:text-gray-500"
              )}
            />
          </motion.div>
        )}

        {isMobile && (
          <div className="flex-1 text-center">
            <motion.h1 
              className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              Topspeed
            </motion.h1>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-3 shrink-0">
        {/* Create Button - only show on desktop */}
        {!isMobile && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            <CreateButton />
          </motion.div>
        )}
        
        {isMobile && (
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 h-10 w-10"
            >
              <Search className="h-5 w-5" />
            </Button>
          </motion.div>
        )}
        
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 h-10 w-10"
          >
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 bg-[#DC291E] hover:bg-[#DC291E] text-xs flex items-center justify-center border-2 border-white dark:border-gray-900">
              3
            </Badge>
          </Button>
        </motion.div>
        
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        >
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 h-10 w-10"
          >
            <User className="h-5 w-5" />
          </Button>
        </motion.div>
      </div>
      
      {/* Mobile Create Button */}
      {isMobile && <CreateButton />}
    </motion.header>
  );
};

export default TopBar;
