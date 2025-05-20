
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
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const TopBar: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [searchFocused, setSearchFocused] = useState(false);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <motion.div 
      className="sticky top-0 z-30 h-16 flex items-center justify-between px-6 ml-[260px] border-b border-border/10 bg-background/50 backdrop-blur-2xl shadow-sm"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-4 w-full">
        <form className="relative w-full max-w-md">
          <Search className={cn(
            "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors duration-200",
            searchFocused ? "text-topspeed-600" : "text-muted-foreground"
          )} />
          <Input 
            placeholder="Search orders, customers, or couriers..." 
            className={cn(
              "w-full pl-10 pr-4 py-2 bg-background/70 border-muted rounded-xl h-10 transition-all duration-300",
              searchFocused ? "ring-2 ring-topspeed-600/20 border-topspeed-600/30 shadow-glow-sm" : "focus:ring-2 focus:ring-topspeed-600/20 focus:border-topspeed-600/30"
            )}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </form>
      </div>
      
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="default" 
              size="sm" 
              className="rounded-xl gap-1 bg-gradient-to-r from-topspeed-600 to-topspeed-700 hover:from-topspeed-700 hover:to-topspeed-800 transition-all duration-300 shadow-lg group"
            >
              <motion.div 
                className="flex items-center"
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Plus className="h-4 w-4 mr-1 group-hover:rotate-90 transition-transform duration-300" /> 
                Create 
                <ChevronDown className="h-3 w-3 ml-1 opacity-70 group-hover:rotate-180 transition-transform duration-300" />
              </motion.div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 mt-1 bg-white/90 backdrop-blur-lg border border-border/20 shadow-xl rounded-xl p-1 animate-in fade-in-50 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2">
            <Link to="/orders/new">
              <DropdownMenuItem className="cursor-pointer rounded-lg flex items-center gap-2 hover:bg-muted/50 transition-colors duration-200">
                <Plus className="h-4 w-4 text-topspeed-600" />
                <span>Create Order</span>
              </DropdownMenuItem>
            </Link>
            <Link to="/pickups">
              <DropdownMenuItem className="cursor-pointer rounded-lg flex items-center gap-2 hover:bg-muted/50 transition-colors duration-200">
                <Plus className="h-4 w-4 text-blue-500" />
                <span>Schedule Pickup</span>
              </DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-xl relative group hover:bg-background/80 transition-colors duration-200" 
          aria-label="Notifications"
        >
          <Bell className="h-[1.3rem] w-[1.3rem] group-hover:scale-110 transition-transform duration-200" />
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-topspeed-600 text-[10px] font-bold flex items-center justify-center text-white shadow-glow-sm">3</span>
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="relative h-10 w-10 rounded-xl group hover:bg-background/80 transition-colors duration-200" 
              aria-label="User menu"
            >
              <Avatar className="h-9 w-9 border-2 border-white/30 group-hover:border-white/50 transition-all duration-200 shadow-md">
                <AvatarImage src="/avatars/01.png" alt="User" className="group-hover:scale-105 transition-transform duration-200" />
                <AvatarFallback className="bg-[#26A4DB]/30 text-[#26A4DB] font-medium">TS</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 mt-1 mr-1 bg-white/90 backdrop-blur-lg border border-border/20 shadow-xl rounded-xl p-1 animate-in fade-in-50" align="end" forceMount>
            <DropdownMenuLabel className="font-normal px-3 py-2">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Admin User</p>
                <p className="text-xs leading-none text-muted-foreground">admin@topspeed.com</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border/10" />
            <DropdownMenuItem className="rounded-lg hover:bg-muted/50 transition-colors duration-200">Profile</DropdownMenuItem>
            <DropdownMenuItem className="rounded-lg hover:bg-muted/50 transition-colors duration-200">Settings</DropdownMenuItem>
            <DropdownMenuItem className="rounded-lg hover:bg-muted/50 transition-colors duration-200">Support</DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border/10" />
            <DropdownMenuItem className="rounded-lg text-topspeed-600 hover:bg-topspeed-50 transition-colors duration-200">Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
};

export default TopBar;
