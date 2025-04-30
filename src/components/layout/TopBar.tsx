
import React from 'react';
import { Bell, User, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';

const TopBar: React.FC = () => {
  const userName = 'WM';

  return (
    <header className="h-16 border-b border-border/40 bg-white px-6 flex items-center justify-between">
      <div className="flex items-center w-1/3">
        <div className="relative hidden md:flex max-w-md w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder="Search" 
            className="pl-10 h-9 border-none shadow-sm bg-muted/30 focus-visible:ring-primary/20 w-full"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-primary"></span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
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
              className="h-9 gap-2 border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 font-medium"
            >
              <span>Create</span>
              <Plus className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to="/orders/new">
                Single Order
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/orders/bulk">
                Multiple Orders
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/pickups/new">
                Schedule Pickup
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              className="h-9 w-9 rounded-full bg-primary/10 text-primary border-primary/20 font-medium"
            >
              {userName}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/support">Support</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default TopBar;
