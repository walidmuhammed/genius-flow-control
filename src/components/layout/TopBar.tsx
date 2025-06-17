
import React from 'react';
import { Bell, Menu, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useScreenSize } from '@/hooks/useScreenSize';
import useLayoutStore from '@/stores/layoutStore';
import { cn } from '@/lib/utils';
import CreateButton from '@/components/ui/create-button';

const TopBar: React.FC = () => {
  const { isMobile, isTablet } = useScreenSize();
  const { toggleSidebar } = useLayoutStore();

  return (
    <header 
      className="h-16 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800 sticky top-0 z-40"
    >
      <div className="h-full flex items-center justify-between px-4 md:px-6">
        {/* Left side */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Mobile menu toggle */}
          {(isMobile || isTablet) && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleSidebar}
              className="shrink-0 hover:bg-gray-50 dark:hover:bg-gray-900"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          
          {/* Search - Desktop only */}
          {!isMobile && (
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input 
                placeholder="Search orders, customers..." 
                className="pl-10 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:bg-white dark:focus:bg-gray-800 transition-colors" 
              />
            </div>
          )}

          {/* Mobile title */}
          {isMobile && (
            <div className="flex-1 text-center">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Topspeed
              </h1>
            </div>
          )}
        </div>
        
        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Mobile search toggle */}
          {isMobile && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="hover:bg-gray-50 dark:hover:bg-gray-900"
            >
              <Search className="h-5 w-5" />
            </Button>
          )}
          
          {/* Create button - Desktop */}
          {!isMobile && <CreateButton />}
          
          {/* Notifications */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative hover:bg-gray-50 dark:hover:bg-gray-900"
          >
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 bg-[#DC291E] hover:bg-[#DC291E] text-xs flex items-center justify-center">
              3
            </Badge>
          </Button>
          
          {/* User */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="hover:bg-gray-50 dark:hover:bg-gray-900"
          >
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {/* Mobile Create Button - Fixed Position */}
      {isMobile && (
        <div className="fixed bottom-6 right-4 z-50">
          <CreateButton />
        </div>
      )}
    </header>
  );
};

export default TopBar;
