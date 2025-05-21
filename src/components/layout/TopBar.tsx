
import React, { useState } from 'react';
import { Bell, Search, Plus, ChevronDown } from 'lucide-react';
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

const TopBar: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="sticky top-0 z-30 h-16 flex items-center justify-between px-4 md:px-6 bg-white dark:bg-gray-950">
      <div className="flex items-center gap-2 lg:gap-4 w-full">
        <form className="hidden md:flex items-center w-3/5 max-w-md relative">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Search orders, customers, or couriers..." 
            className="w-full pl-10 bg-gray-50 dark:bg-gray-900 border-transparent hover:border-gray-200 dark:hover:border-gray-700 focus-visible:border-gray-300 dark:focus-visible:border-gray-600 focus-visible:ring-0 rounded-lg h-10 transition-all" 
          />
        </form>
      </div>
      
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Button 
                variant="default" 
                size="sm" 
                className="rounded-lg gap-1 bg-[#DC291E] hover:bg-[#DC291E]/90 transition-all duration-300"
              >
                <Plus className="h-4 w-4 mr-1" /> 
                Create 
                <ChevronDown className="h-3 w-3 ml-1 opacity-70" />
              </Button>
            </motion.div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 mt-1 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-lg">
            <Link to="/orders/new">
              <DropdownMenuItem className="cursor-pointer rounded-lg transition-colors my-1 focus:bg-gray-100 dark:focus:bg-gray-800">
                <Plus className="h-4 w-4 mr-2 text-[#DC291E]" />
                <span>Create Order</span>
              </DropdownMenuItem>
            </Link>
            <Link to="/pickups">
              <DropdownMenuItem className="cursor-pointer rounded-lg transition-colors my-1 focus:bg-gray-100 dark:focus:bg-gray-800">
                <Plus className="h-4 w-4 mr-2 text-[#26A4DB]" />
                <span>Schedule Pickup</span>
              </DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}>
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-lg relative bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all" 
            aria-label="Notifications"
          >
            <Bell className="h-[1.2rem] w-[1.2rem] text-gray-700 dark:text-gray-200" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#DC291E] text-[10px] font-bold flex items-center justify-center text-white">3</span>
          </Button>
        </motion.div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Button 
                variant="ghost" 
                className="relative h-10 w-10 rounded-lg bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all" 
                aria-label="User menu"
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage src="/avatars/01.png" alt="User" />
                  <AvatarFallback className="bg-[#26A4DB]/10 text-[#26A4DB] font-medium">TS</AvatarFallback>
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
                <p className="text-sm font-medium leading-none">Admin User</p>
                <p className="text-xs leading-none text-muted-foreground">admin@topspeed.com</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
            <DropdownMenuItem className="rounded-lg transition-colors focus:bg-gray-100 dark:focus:bg-gray-800 my-0.5">Profile</DropdownMenuItem>
            <DropdownMenuItem className="rounded-lg transition-colors focus:bg-gray-100 dark:focus:bg-gray-800 my-0.5">Settings</DropdownMenuItem>
            <DropdownMenuItem className="rounded-lg transition-colors focus:bg-gray-100 dark:focus:bg-gray-800 my-0.5">Support</DropdownMenuItem>
            <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
            <DropdownMenuItem className="rounded-lg transition-colors focus:bg-gray-100 dark:focus:bg-gray-800 my-0.5 text-[#DC291E] hover:text-[#DC291E]">
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default TopBar;
