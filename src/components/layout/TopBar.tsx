
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
        "bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-800/50 h-16 flex items-center justify-between sticky top-0 z-40",
        isMobile ? "px-3" : "px-4 md:px-6"
      )}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {(isMobile || isTablet) && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar}
            className="rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 shrink-0"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        
        {!isMobile && (
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input 
              placeholder="Search orders, customers..." 
              className="pl-10 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-[#DC291E] focus:border-[#DC291E]" 
            />
          </div>
        )}

        {isMobile && (
          <div className="flex-1 text-center">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
              Topspeed
            </h1>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2 shrink-0">
        {/* Create Button - only show on desktop */}
        {!isMobile && <CreateButton />}
        
        {isMobile && (
          <Button variant="ghost" size="icon" className="rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
            <Search className="h-5 w-5" />
          </Button>
        )}
        
        <Button variant="ghost" size="icon" className="relative rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
          <Bell className="h-5 w-5" />
          <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 bg-[#DC291E] hover:bg-[#DC291E] text-xs flex items-center justify-center">
            3
          </Badge>
        </Button>
        
        <Button variant="ghost" size="icon" className="rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
          <User className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Mobile Create Button */}
      {isMobile && <CreateButton />}
    </motion.header>
  );
};

export default TopBar;
