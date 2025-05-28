
import React from 'react';
import { Bell, Search, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import useLayoutStore from '@/stores/layoutStore';
import { useScreenSize } from '@/hooks/useScreenSize';

const TopBar: React.FC = () => {
  const { user } = useAuth();
  const { toggleSidebar } = useLayoutStore();
  const { isMobile } = useScreenSize();

  return (
    <div className="sticky top-0 z-30 h-16 flex items-center justify-between px-4 md:px-6 bg-white border-b border-gray-200">
      <div className="flex items-center gap-2 lg:gap-4 w-full">
        {isMobile && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="mr-2" 
            onClick={toggleSidebar}
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        
        {!isMobile && (
          <form className="hidden md:flex items-center w-3/5 max-w-md relative">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search orders, customers..." 
              className="w-full pl-10 bg-gray-100 border-transparent hover:border-gray-200 focus-visible:border-gray-300 focus-visible:ring-0 rounded-lg h-10 transition-all" 
            />
          </form>
        )}
      </div>
      
      <div className="flex items-center gap-2 md:gap-4">
        {isMobile && (
          <Button 
            variant="ghost" 
            size="icon"
            className="md:hidden"
          >
            <Search className="h-5 w-5" />
          </Button>
        )}
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-lg relative bg-gray-100 hover:bg-gray-200 transition-all" 
          aria-label="Notifications"
        >
          <Bell className="h-[1.2rem] w-[1.2rem] text-gray-700" />
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#DC291E] text-[10px] font-bold flex items-center justify-center text-white">3</span>
        </Button>
        
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-[#DC291E]/10 text-[#DC291E] font-medium">
            {user?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
};

export default TopBar;
