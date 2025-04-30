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
    <header className="h-16 border-b border-border/10 bg-white px-6 flex items-center justify-between shadow-sm">
      <div className="flex items-center w-1/3">
        <div className="relative hidden md:flex max-w-md w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder="Search anything..." 
            className="pl-10 h-9 border-none shadow-sm bg-muted/30 focus-visible:ring-primary/20 w-full"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative rounded-full">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-primary"></span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 shadow-lg border-border/20">
            <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border/10" />
            <div className="py-2 px-3 text-sm text-center text-muted-foreground">
              No new notifications
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              className="h-9 gap-2 border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 font-medium rounded-full"
            >
              <span>Create</span>
              <Plus className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="shadow-lg border-border/20">
            <DropdownMenuItem asChild>
              <Link to="/orders/new" className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary" />
                <span>New Order</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/orders/bulk" className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary" />
                <span>Bulk Orders</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/pickups/new" className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary" />
                <span>Schedule Pickup</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full flex items-center justify-center p-0">
              <Avatar className="h-9 w-9 border border-border/20">
                <AvatarImage src="https://i.pravatar.cc/100?img=13" />
                <AvatarFallback className="bg-primary/10 text-primary font-medium">{userName}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="shadow-lg border-border/20">
            <div className="flex items-center gap-2 p-2">
              <Avatar className="h-10 w-10">
                <AvatarImage src="https://i.pravatar.cc/100?img=13" />
                <AvatarFallback className="bg-primary/10 text-primary">{userName}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">Mohammed Khatib</p>
                <p className="text-xs text-muted-foreground">m.khatib@genius.co.lb</p>
              </div>
            </div>
            <DropdownMenuSeparator className="bg-border/10" />
            <DropdownMenuItem asChild>
              <Link to="/settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/support" className="flex items-center gap-2">
                <LifeBuoy className="h-4 w-4" />
                <span>Support</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border/10" />
            <DropdownMenuItem>
              <div className="flex items-center gap-2 w-full text-destructive">
                <LogOut className="h-4 w-4" />
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

// Adding missing import
import { LogOut, LifeBuoy } from 'lucide-react';
