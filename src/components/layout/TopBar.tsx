
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

const TopBar: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="sticky top-0 z-30 h-16 flex items-center justify-between px-4 md:px-6 border-b border-border/10 bg-background/70 backdrop-blur-xl">
      <div className="flex items-center gap-2 lg:gap-4 w-full">
        <form className="hidden md:flex items-center w-3/5 max-w-md relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search orders, customers, or couriers..." className="w-full pl-10 bg-muted/40 backdrop-blur-lg border-muted focus:border-muted-foreground rounded-full h-9" />
        </form>
      </div>
      
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="default" 
              size="sm" 
              className="rounded-full gap-1 bg-gradient-to-r from-[#DC291E] to-[#DC291E]/90 hover:from-[#DC291E]/90 hover:to-[#DC291E] transition-all duration-300 shadow-md"
            >
              <Plus className="h-4 w-4 mr-1" /> 
              Create 
              <ChevronDown className="h-3 w-3 ml-1 opacity-70" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 mt-1">
            <Link to="/orders/new">
              <DropdownMenuItem className="cursor-pointer">
                <Plus className="h-4 w-4 mr-2 text-[#DC291E]" />
                <span>Create Order</span>
              </DropdownMenuItem>
            </Link>
            <Link to="/pickups">
              <DropdownMenuItem className="cursor-pointer">
                <Plus className="h-4 w-4 mr-2 text-[#26A4DB]" />
                <span>Schedule Pickup</span>
              </DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button variant="ghost" size="icon" className="rounded-full relative" aria-label="Notifications">
          <Bell className="h-[1.2rem] w-[1.2rem]" />
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#DC291E] text-[10px] font-bold flex items-center justify-center text-white">3</span>
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full" aria-label="User menu">
              <Avatar className="h-9 w-9 border border-border">
                <AvatarImage src="/avatars/01.png" alt="User" />
                <AvatarFallback className="bg-[#26A4DB]/10 text-[#26A4DB] font-medium">TS</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 mt-1 mr-1" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Admin User</p>
                <p className="text-xs leading-none text-muted-foreground">admin@topspeed.com</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Support</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-[#DC291E]">Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default TopBar;
