
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
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 h-16 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800",
      "flex items-center justify-between px-4 lg:px-6"
    )}>
      {/* Left Section */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {/* Mobile Menu Button */}
        {(isMobile || isTablet) && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar}
            className="h-9 w-9 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        
        {/* Logo - Always visible */}
        <div className="flex items-center gap-2">
          <div className="bg-[#DC291E] h-8 w-8 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">T</span>
          </div>
          {!isMobile && (
            <span className="font-bold text-xl text-gray-900 dark:text-gray-100">
              Topspeed
            </span>
          )}
        </div>
        
        {/* Desktop Search */}
        {!isMobile && (
          <div className="relative max-w-md flex-1 ml-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search orders, customers..." 
              className="pl-10 h-9 bg-gray-50 dark:bg-gray-900 border-0 focus:ring-1 focus:ring-[#DC291E] rounded-lg" 
            />
          </div>
        )}
      </div>
      
      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Mobile Search Button */}
        {isMobile && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Search className="h-4 w-4" />
          </Button>
        )}
        
        {/* Create Button - Desktop only */}
        {!isMobile && <CreateButton />}
        
        {/* Notifications */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative h-9 w-9 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <Bell className="h-4 w-4" />
          <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 bg-[#DC291E] hover:bg-[#DC291E] text-xs flex items-center justify-center">
            3
          </Badge>
        </Button>
        
        {/* User Menu */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <User className="h-4 w-4" />
        </Button>
        
        {/* Mobile Create Button */}
        {isMobile && <CreateButton />}
      </div>
    </header>
  );
};

export default TopBar;
