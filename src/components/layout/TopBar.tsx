
import React, { useState } from 'react';
import { Bell, Plus, Search, Settings, LifeBuoy, LogOut, ChevronDown, Command, Menu, MoreHorizontal, Package, Clock, Wallet, BarChart, Box, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from '@/components/ui/command';

const TopBar: React.FC = () => {
  const userName = 'MK';
  const [open, setOpen] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [quickCreateDialogOpen, setQuickCreateDialogOpen] = useState(false);
  
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(open => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);
  
  return (
    <>
      <header className="h-16 border-b border-border/10 bg-white px-6 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-4 lg:w-1/3">
          <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9" onClick={() => setShowMobileMenu(!showMobileMenu)}>
            <Menu className="h-[18px] w-[18px]" />
          </Button>
          
          <div className="relative hidden lg:flex max-w-md w-full">
            <Button 
              variant="outline" 
              onClick={() => setOpen(true)} 
              className="w-full justify-between h-10 border-border/20 shadow-sm bg-background hover:bg-muted/20 focus-visible:ring-primary/20 gap-2 px-4 text-base font-normal rounded-xl"
            >
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground text-sm">Search anything...</span>
              </div>
              <div className="hidden md:flex items-center gap-1">
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border/20 bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </div>
            </Button>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative rounded-full h-9 w-9 transition-all hover:bg-muted/30">
                <Bell className="h-[18px] w-[18px] text-muted-foreground" />
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-topspeed-600 animate-pulse"></span>
                <span className="sr-only">Notifications</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[380px] shadow-lg border-border/10 rounded-xl p-0">
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/5">
                <h4 className="font-medium">Notifications</h4>
                <Button variant="ghost" className="h-7 px-2 text-xs font-medium hover:bg-muted/50 hover:text-muted-foreground">
                  Mark all as read
                </Button>
              </div>
              <div className="max-h-[420px] overflow-y-auto py-1">
                <div className="bg-muted/5 border-l-2 border-topspeed-600 px-4 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-9 w-9 mt-0.5">
                        <AvatarImage src="https://i.pravatar.cc/100?img=11" />
                        <AvatarFallback className="bg-topspeed-100 text-topspeed-600">JD</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">
                          Order #1234 Delivered
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Order for Hassan Barakat was successfully delivered to Hamra, Beirut
                        </p>
                        <div className="flex items-center gap-1 mt-1.5">
                          <span className="text-[10px] text-muted-foreground">10 minutes ago</span>
                          <span className="w-1 h-1 rounded-full bg-muted-foreground/30"></span>
                          <span className="text-[10px] text-topspeed-600 font-medium">Orders</span>
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full">
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="min-w-[180px] shadow-lg border-border/10 rounded-lg p-1">
                        <DropdownMenuItem className="rounded-md py-1.5 px-2.5 cursor-pointer">Mark as read</DropdownMenuItem>
                        <DropdownMenuItem className="rounded-md py-1.5 px-2.5 cursor-pointer">Mute notifications</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                
                <div className="px-4 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-9 w-9 mt-0.5">
                        <AvatarImage src="https://i.pravatar.cc/100?img=12" />
                        <AvatarFallback className="bg-blue-500/10 text-blue-500">RK</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">
                          New pickup request
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Sara Khalil has requested a new pickup from Achrafieh
                        </p>
                        <div className="flex items-center gap-1 mt-1.5">
                          <span className="text-[10px] text-muted-foreground">1 hour ago</span>
                          <span className="w-1 h-1 rounded-full bg-muted-foreground/30"></span>
                          <span className="text-[10px] text-blue-500 font-medium">Pickups</span>
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full">
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="min-w-[180px] shadow-lg border-border/10 rounded-lg p-1">
                        <DropdownMenuItem className="rounded-md py-1.5 px-2.5 cursor-pointer">Mark as read</DropdownMenuItem>
                        <DropdownMenuItem className="rounded-md py-1.5 px-2.5 cursor-pointer">Mute notifications</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
              <div className="border-t border-border/5 p-2 flex justify-center">
                <Button variant="ghost" size="sm" className="w-full text-sm font-medium text-muted-foreground hover:text-topspeed-600 hover:bg-muted/30 justify-center">
                  View all notifications
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-2 border-topspeed-200 bg-topspeed-50 text-topspeed-600 hover:bg-topspeed-100 hover:border-topspeed-300 font-medium rounded-full px-4">
                <span>Create</span>
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="shadow-lg border-border/10 rounded-xl p-1.5 min-w-[180px]">
              <DropdownMenuItem asChild className="rounded-lg py-1.5 px-2.5 hover:bg-muted/50 cursor-pointer">
                <Link to="/orders/new" className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-topspeed-600" />
                  <span className="font-medium">New Order</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg py-1.5 px-2.5 hover:bg-muted/50 cursor-pointer">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  <span className="font-medium">Schedule Pickup</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg py-1.5 px-2.5 hover:bg-muted/50 cursor-pointer">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  <span className="font-medium">Add Customer</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="h-9 w-9 rounded-full bg-muted/50 border border-border/10 flex items-center justify-center overflow-hidden">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://i.pravatar.cc/100?img=20" alt="User" />
                  <AvatarFallback className="bg-topspeed-100 text-topspeed-700 text-sm font-medium">
                    {userName}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 shadow-lg border-border/10 rounded-xl p-1.5">
              <div className="flex flex-col space-y-4 p-2">
                <p className="text-sm font-medium">Mohammed Kareem</p>
                <p className="text-xs text-muted-foreground">m.kareem@example.com</p>
              </div>
              <DropdownMenuSeparator className="bg-border/10 my-1" />
              <DropdownMenuItem className="rounded-lg py-1.5 px-2.5 gap-3 cursor-pointer">
                <Settings className="h-4 w-4 text-gray-500" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg py-1.5 px-2.5 gap-3 cursor-pointer">
                <LifeBuoy className="h-4 w-4 text-gray-500" />
                <span>Support</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border/10 my-1" />
              <DropdownMenuItem className="rounded-lg py-1.5 px-2.5 gap-3 text-topspeed-600 hover:text-topspeed-700 cursor-pointer">
                <LogOut className="h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search for orders, customers, or help..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Orders">
            <CommandItem className="flex items-center gap-2 py-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span>Find an order</span>
              <CommandShortcut>O</CommandShortcut>
            </CommandItem>
            <CommandItem className="flex items-center gap-2 py-2">
              <Plus className="h-4 w-4 text-muted-foreground" />
              <span>Create new order</span>
              <CommandShortcut>N</CommandShortcut>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Pickups">
            <CommandItem className="flex items-center gap-2 py-2">
              <Truck className="h-4 w-4 text-muted-foreground" />
              <span>View all pickups</span>
            </CommandItem>
            <CommandItem className="flex items-center gap-2 py-2">
              <Plus className="h-4 w-4 text-muted-foreground" />
              <span>Schedule a pickup</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Quick Actions">
            <CommandItem className="flex items-center gap-2 py-2">
              <BarChart className="h-4 w-4 text-muted-foreground" />
              <span>View analytics</span>
            </CommandItem>
            <CommandItem className="flex items-center gap-2 py-2">
              <Wallet className="h-4 w-4 text-muted-foreground" />
              <span>Check wallet balance</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
};

export default TopBar;
