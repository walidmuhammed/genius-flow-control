
import React, { useState } from 'react';
import { Bell, Search, Plus, Sun, Moon, ChevronDown } from 'lucide-react';
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
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const TopBar: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const navigate = useNavigate();
  
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark');
  };
  
  return (
    <div className="sticky top-0 z-30 h-16 flex items-center justify-between px-4 md:px-6 border-b border-border/10 bg-background/30 backdrop-blur-2xl">
      <div className="flex items-center gap-3 lg:gap-4 w-full">
        <div className="font-bold text-xl text-[#DC291E] hidden md:block">Topspeed</div>
        
        <form className="hidden md:flex items-center w-3/5 max-w-md relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search orders, customers, or couriers..." 
            className="w-full pl-10 bg-background/20 backdrop-blur-lg border-muted/20 focus:border-[#DC291E]/40 rounded-full h-9 transition-all" 
          />
        </form>
      </div>
      
      <div className="flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full hover:bg-background/50" 
          onClick={toggleTheme} 
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? 
            <Moon className="h-[1.2rem] w-[1.2rem] text-muted-foreground" /> : 
            <Sun className="h-[1.2rem] w-[1.2rem] text-amber-300" />
          }
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full hover:bg-background/50 relative" 
          aria-label="Notifications"
        >
          <Bell className="h-[1.2rem] w-[1.2rem] text-muted-foreground" />
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#DC291E] text-[10px] font-bold flex items-center justify-center text-white animate-pulse">3</span>
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="default" 
              size="sm" 
              className="rounded-full gap-1 bg-gradient-to-r from-[#DC291E] to-[#26A4DB] hover:shadow-lg transition-all duration-300"
            >
              <Plus className="h-4 w-4" /> 
              Create
              <ChevronDown className="h-3 w-3 opacity-70" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48 mt-1" align="end">
            <DropdownMenuItem 
              className="cursor-pointer flex items-center gap-2 py-2 hover:bg-[#DC291E]/5" 
              onClick={() => navigate('/orders/create')}
            >
              <Plus className="h-4 w-4 text-[#DC291E]" /> Create Order
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="cursor-pointer flex items-center gap-2 py-2 hover:bg-[#26A4DB]/5" 
              onClick={() => navigate('/pickups/create')}
            >
              <Plus className="h-4 w-4 text-[#26A4DB]" /> Schedule Pickup
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full" aria-label="User menu">
              <Avatar className="h-9 w-9 border border-border/20 shadow-sm shadow-[#DC291E]/10">
                <AvatarImage src="/avatars/01.png" alt="User" />
                <AvatarFallback className="bg-[#DC291E]/5 text-[#DC291E] font-medium">TS</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 mt-1 mr-1 bg-background/95 backdrop-blur-md border-border/10 shadow-xl" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Admin User</p>
                <p className="text-xs leading-none text-muted-foreground">admin@topspeed.com</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border/10" />
            <DropdownMenuItem className="cursor-pointer hover:bg-[#DC291E]/5">Profile</DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer hover:bg-[#DC291E]/5">Settings</DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer hover:bg-[#DC291E]/5">Support</DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border/10" />
            <DropdownMenuItem className="cursor-pointer text-[#DC291E] hover:bg-[#DC291E]/5 focus:bg-[#DC291E]/5">Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default TopBar;
