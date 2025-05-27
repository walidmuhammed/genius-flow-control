
import React, { useState } from 'react';
import { Bell, Search, Plus, ChevronDown, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useAuth } from '@/hooks/useAuth';
import useLayoutStore from '@/stores/layoutStore';
import { useScreenSize } from '@/hooks/useScreenSize';

const AdminTopBar: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const { user, signOut } = useAuth();
  const { toggleSidebar } = useLayoutStore();
  const { isMobile, isTablet } = useScreenSize();

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark');
  };

  const handleSignOut = () => {
    signOut();
  };

  const notificationItems = [
    { 
      id: 1, 
      title: 'New Order #12345', 
      description: 'A new order has been placed', 
      time: '10 minutes ago',
      unread: true
    },
    { 
      id: 2, 
      title: 'Pickup Scheduled', 
      description: 'Pickup has been scheduled for Order #12340', 
      time: '30 minutes ago',
      unread: true
    },
    { 
      id: 3, 
      title: 'Order Delivered', 
      description: 'Order #12335 has been delivered successfully', 
      time: '2 hours ago',
      unread: true
    }
  ];

  return (
    <div className="sticky top-0 z-30 h-16 flex items-center justify-between px-4 md:px-6 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
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
              placeholder="Search orders, clients, couriers..." 
              className="w-full pl-10 bg-gray-100 dark:bg-gray-800 border-transparent hover:border-gray-200 dark:hover:border-gray-700 focus-visible:border-gray-300 dark:focus-visible:border-gray-600 focus-visible:ring-0 rounded-lg h-10 transition-all" 
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
            onClick={() => {}}
          >
            <Search className="h-5 w-5" />
          </Button>
        )}
        
        <Popover>
          <PopoverTrigger asChild>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Button 
                variant="default" 
                size={isMobile ? "icon" : "sm"}
                className={cn(
                  "rounded-lg gap-1 bg-[#DC291E] hover:bg-[#DC291E]/90 transition-all duration-300",
                  isMobile ? "w-10 h-10 p-0" : ""
                )}
              >
                {isMobile ? (
                  <Plus className="h-5 w-5" />
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-1" /> 
                    Create 
                    <ChevronDown className="h-3 w-3 ml-1 opacity-70" />
                  </>
                )}
              </Button>
            </motion.div>
          </PopoverTrigger>
          <PopoverContent 
            className="w-48 p-0 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-lg shadow-lg"
            align="end"
          >
            <div className="flex flex-col py-1">
              <Link to="/admin/orders" className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2 text-sm transition-colors rounded-md mx-1 my-0.5">
                <Plus className="h-4 w-4 text-[#DC291E]" />
                <span>Create Order</span>
              </Link>
              <Link to="/admin/clients" className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2 text-sm transition-colors rounded-md mx-1 my-0.5">
                <Plus className="h-4 w-4 text-[#26A4DB]" />
                <span>Add Client</span>
              </Link>
            </div>
          </PopoverContent>
        </Popover>
        
        <Popover>
          <PopoverTrigger asChild>
            <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-lg relative bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all" 
                aria-label="Notifications"
              >
                <Bell className="h-[1.2rem] w-[1.2rem] text-gray-700 dark:text-gray-200" />
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#DC291E] text-[10px] font-bold flex items-center justify-center text-white">3</span>
              </Button>
            </motion.div>
          </PopoverTrigger>
          <PopoverContent 
            className="w-[calc(100vw-32px)] sm:w-80 p-0 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-lg shadow-lg"
            align="end"
          >
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <h3 className="text-sm font-semibold">Notifications</h3>
              <Button variant="ghost" size="sm" className="text-xs h-auto py-1 px-2 hover:bg-gray-100 dark:hover:bg-gray-800">
                Mark all as read
              </Button>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notificationItems.map(notification => (
                <div 
                  key={notification.id} 
                  className={cn(
                    "px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 border-l-2 flex flex-col gap-0.5 transition-colors",
                    notification.unread ? "border-l-[#DC291E]" : "border-l-transparent"
                  )}
                >
                  <div className="flex justify-between items-start">
                    <p className="font-medium text-sm">{notification.title}</p>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{notification.time}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{notification.description}</p>
                </div>
              ))}
            </div>
            <div className="p-2 border-t border-gray-100 dark:border-gray-800 text-center">
              <Button variant="ghost" size="sm" className="text-xs w-full hover:bg-gray-100 dark:hover:bg-gray-800 text-[#DC291E]">
                View all notifications
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Button 
                variant="ghost" 
                className="relative h-9 w-9 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all p-0" 
                aria-label="User menu"
              >
                <Avatar className="h-full w-full">
                  <AvatarImage src="/avatars/admin.png" alt="Admin" />
                  <AvatarFallback className="bg-[#DC291E]/10 text-[#DC291E] font-medium">
                    {user?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'A'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </motion.div>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            className="w-56 mt-1 mr-1 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-lg" 
            align="end" 
            forceMount
          >
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.full_name || user?.email?.split('@')[0] || 'Admin User'}
                </p>
                <p className="text-xs leading-none text-muted-foreground">System Administrator</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
            <DropdownMenuItem className="rounded-lg transition-colors focus:bg-gray-100 dark:focus:bg-gray-800 my-0.5">Profile</DropdownMenuItem>
            <DropdownMenuItem className="rounded-lg transition-colors focus:bg-gray-100 dark:focus:bg-gray-800 my-0.5">Settings</DropdownMenuItem>
            <DropdownMenuItem className="rounded-lg transition-colors focus:bg-gray-100 dark:focus:bg-gray-800 my-0.5">Support</DropdownMenuItem>
            <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
            <DropdownMenuItem 
              onClick={handleSignOut}
              className="rounded-lg transition-colors focus:bg-gray-100 dark:focus:bg-gray-800 my-0.5 text-[#DC291E] hover:text-[#DC291E]"
            >
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default AdminTopBar;
