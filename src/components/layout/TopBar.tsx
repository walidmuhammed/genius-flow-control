
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
        // New glass effect and shadow, extra padding!
        "bg-white/80 dark:bg-gray-900/70 backdrop-blur-lg border-b border-gray-100/60 dark:border-gray-800/60 h-[72px] flex items-center justify-between sticky top-0 z-40 shadow-md shadow-black/5",
        isMobile ? "px-3" : "px-8 md:px-11"
      )}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{ minHeight: 64 }}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {(isMobile || isTablet) && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar}
            className="rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 shrink-0 shadow-none"
          >
            <Menu className="h-6 w-6" />
          </Button>
        )}
        
        {!isMobile && (
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input 
              placeholder="Search orders, customers..." 
              className="pl-12 border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-[#DC291E] focus:border-[#DC291E] text-base h-12 bg-gray-50/60 dark:bg-gray-800/70"
            />
          </div>
        )}

        {isMobile && (
          <div className="flex-1 text-center">
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 truncate font-sans">Topspeed</h1>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-3 shrink-0">
        {/* Create Button - only show on desktop */}
        {!isMobile && <CreateButton />}
        
        {isMobile && (
          <Button variant="ghost" size="icon" className="rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
            <Search className="h-5 w-5" />
          </Button>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "relative rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 shadow-none transition-all",
            "group"
          )}
        >
          <Bell className="h-6 w-6" />
          <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 bg-[#DC291E] hover:bg-[#DC291E] text-xs flex items-center justify-center shadow-md shadow-[#DC291E]/15 group-hover:scale-110 transition-transform">
            3
          </Badge>
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 shadow-none"
        >
          <User className="h-6 w-6" />
        </Button>
      </div>
      
      {/* Mobile Create Button */}
      {isMobile && <CreateButton />}
    </motion.header>
  );
};

export default TopBar;

