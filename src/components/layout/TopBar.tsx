
import React, { useState } from 'react';
import { Bell, Search, Settings, Plus, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const TopBar: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="sticky top-0 z-30 h-16 flex items-center justify-between px-4 md:px-6 border-b border-border/10 bg-background/80 backdrop-blur-xl">
      <div className="flex items-center gap-2 lg:gap-4 w-full">
        <form className="hidden md:flex items-center w-3/5 max-w-md relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search orders, customers, or couriers..." 
            className="w-full pl-10 bg-muted/40 backdrop-blur-lg border-muted focus:border-muted-foreground rounded-full h-9"
          />
        </form>
        
        {/* Badges/Filters for desktop */}
        <div className="hidden lg:flex items-center gap-2">
          <Badge variant="outline" className="py-1.5 bg-background/80 backdrop-blur-sm">
            Today
          </Badge>
          <Badge variant="outline" className="py-1.5 bg-background/80 backdrop-blur-sm">
            Active
          </Badge>
          <Badge variant="outline" className="py-1.5 bg-background/80 backdrop-blur-sm">
            Beirut
          </Badge>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? <Moon className="h-[1.2rem] w-[1.2rem]" /> : <Sun className="h-[1.2rem] w-[1.2rem]" />}
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full relative"
          aria-label="Notifications"
        >
          <Bell className="h-[1.2rem] w-[1.2rem]" />
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-topspeed-600 text-[10px] font-bold flex items-center justify-center text-white">3</span>
        </Button>
        
        <Button
          variant="default"
          size="sm"
          className="rounded-full hidden md:flex"
        >
          <Plus className="h-4 w-4 mr-1" /> New Order
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full" aria-label="User menu">
              <Avatar className="h-9 w-9 border border-border">
                <AvatarImage src="/avatars/01.png" alt="User" />
                <AvatarFallback className="bg-topspeed-50 text-topspeed-700 font-medium">TS</AvatarFallback>
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
            <DropdownMenuItem className="text-rose-600">Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default TopBar;
