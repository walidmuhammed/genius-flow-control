
import React from 'react';
import { Bell, Plus, Search, Settings, LifeBuoy, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const TopBar: React.FC = () => {
  const userName = 'MK';

  return (
    <header className="h-16 border-b border-border/5 bg-white px-6 flex items-center justify-between shadow-[0_1px_3px_0_rgba(0,0,0,0.05)]">
      <div className="flex items-center w-1/3">
        <div className="relative hidden md:flex max-w-md w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder="Search anything..." 
            className="pl-10 h-9 border-none shadow-sm bg-muted/20 focus-visible:ring-primary/20 w-full rounded-full"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative rounded-full h-9 w-9 transition-all hover:bg-muted/30"
            >
              <Bell className="h-[18px] w-[18px] text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-primary"></span>
              <span className="sr-only">Notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 shadow-lg border-border/10 rounded-xl p-2">
            <DropdownMenuLabel className="text-xs font-medium text-muted-foreground px-2">Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border/5 my-2" />
            <div className="py-8 px-3 text-sm text-center text-muted-foreground">
              <p>No new notifications</p>
              <p className="text-xs mt-1 text-muted-foreground/70">You're all caught up!</p>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              className="h-9 gap-2 border-primary/10 bg-primary/5 text-primary hover:bg-primary/10 font-medium rounded-full px-4"
            >
              <span>Create</span>
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="shadow-lg border-border/10 rounded-xl p-1.5 min-w-[180px]">
            <DropdownMenuItem asChild className="rounded-lg py-1.5 px-2.5 hover:bg-muted/50">
              <Link to="/orders/new" className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span className="font-medium">New Order</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="rounded-lg py-1.5 px-2.5 hover:bg-muted/50">
              <Link to="/orders/bulk" className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span className="font-medium">Bulk Orders</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="rounded-lg py-1.5 px-2.5 hover:bg-muted/50">
              <Link to="/pickups/new" className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span className="font-medium">Schedule Pickup</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="relative h-9 w-9 rounded-full flex items-center justify-center p-0 transition-all hover:bg-muted/30"
            >
              <Avatar className="h-9 w-9 border border-border/10 ring-2 ring-white">
                <AvatarImage src="https://i.pravatar.cc/100?img=13" alt="Mohammed Khatib" />
                <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">{userName}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="shadow-lg border-border/10 rounded-xl p-2 min-w-[240px]">
            <div className="flex items-center gap-3 px-2 py-2">
              <Avatar className="h-10 w-10 ring-2 ring-white">
                <AvatarImage src="https://i.pravatar.cc/100?img=13" alt="Mohammed Khatib" />
                <AvatarFallback className="bg-primary/10 text-primary">{userName}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">Mohammed Khatib</p>
                <p className="text-xs text-muted-foreground">m.khatib@genius.co.lb</p>
              </div>
            </div>
            <DropdownMenuSeparator className="bg-border/5 my-2" />
            <DropdownMenuItem asChild className="rounded-lg py-1.5 px-2.5 hover:bg-muted/50">
              <Link to="/settings" className="flex items-center gap-2.5">
                <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="rounded-lg py-1.5 px-2.5 hover:bg-muted/50">
              <Link to="/support" className="flex items-center gap-2.5">
                <LifeBuoy className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Support</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border/5 my-2" />
            <DropdownMenuItem className="rounded-lg py-1.5 px-2.5 hover:bg-red-50 hover:text-red-600 focus:bg-red-50 focus:text-red-600">
              <div className="flex items-center gap-2.5 w-full text-muted-foreground">
                <LogOut className="h-3.5 w-3.5" />
                <span>Log out</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default TopBar;
