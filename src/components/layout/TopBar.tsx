import React, { useState } from 'react';
import { Bell, Plus, Search, Settings, LifeBuoy, LogOut, ChevronDown, Command, Menu, MoreHorizontal, Package, Clock, Wallet, BarChart, Box } from 'lucide-react';
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
  return <>
      <header className="h-16 border-b border-border/5 bg-white px-6 flex items-center justify-between shadow-[0_1px_3px_0_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-4 lg:w-1/3">
          <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9" onClick={() => setShowMobileMenu(!showMobileMenu)}>
            <Menu className="h-[18px] w-[18px]" />
          </Button>
          
          <div className="relative hidden lg:flex max-w-md w-full">
            <Button variant="outline" onClick={() => setOpen(true)} className="w-full justify-between h-9 border-none shadow-sm bg-muted/20 hover:bg-muted/30 focus-visible:ring-primary/20 gap-2 px-[17px] text-base font-normal rounded-none">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground text-sm">Search anything...</span>
              </div>
              <div className="hidden md:flex items-center gap-1">
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
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
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
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
                <div className="bg-muted/5 border-l-2 border-primary px-4 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-9 w-9 mt-0.5">
                        <AvatarImage src="https://i.pravatar.cc/100?img=11" />
                        <AvatarFallback className="bg-primary/10 text-primary">JD</AvatarFallback>
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
                          <span className="text-[10px] text-primary font-medium">Orders</span>
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
                <Button variant="ghost" size="sm" className="w-full text-sm font-medium text-muted-foreground hover:text-primary hover:bg-muted/30 justify-center">
                  View all notifications
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-2 border-primary/15 bg-primary/5 text-primary hover:bg-primary/10 hover:border-primary/20 font-medium rounded-full px-4">
                <span>Create</span>
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="shadow-lg border-border/10 rounded-xl p-1.5 min-w-[180px]">
              <DropdownMenuItem asChild className="rounded-lg py-1.5 px-2.5 hover:bg-muted/50 cursor-pointer">
                <Link to="/orders/new" className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span className="font-medium">New Order</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-lg py-1.5 px-2.5 hover:bg-muted/50 cursor-pointer">
                
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-lg py-1.5 px-2.5 hover:bg-muted/50 cursor-pointer">
                <Link to="/pickups/new" className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span className="font-medium">Schedule Pickup</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-1 bg-border/10" />
              <Dialog open={quickCreateDialogOpen} onOpenChange={setQuickCreateDialogOpen}>
                <DialogTrigger asChild>
                  
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] rounded-xl p-0 gap-0">
                  <DialogHeader className="p-5 border-b border-border/10">
                    <DialogTitle>Quick Create</DialogTitle>
                    <DialogDescription>
                      Quickly create new orders, pickups, or products.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="p-5 space-y-4">
                    <div className={cn("flex items-center gap-3 p-2.5 rounded-lg border border-border/20 hover:border-primary/20 hover:bg-primary/5 cursor-pointer transition-all", "hover:shadow-sm")}>
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                        <Package className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">New Order</h4>
                        <p className="text-xs text-muted-foreground">Create a new delivery order</p>
                      </div>
                    </div>
                    
                    <div className={cn("flex items-center gap-3 p-2.5 rounded-lg border border-border/20 hover:border-blue-500/20 hover:bg-blue-500/5 cursor-pointer transition-all", "hover:shadow-sm")}>
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                        <Clock className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Schedule Pickup</h4>
                        <p className="text-xs text-muted-foreground">Create a new pickup request</p>
                      </div>
                    </div>
                    
                    <div className={cn("flex items-center gap-3 p-2.5 rounded-lg border border-border/20 hover:border-green-500/20 hover:bg-green-500/5 cursor-pointer transition-all", "hover:shadow-sm")}>
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                        <Box className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">New Product</h4>
                        <p className="text-xs text-muted-foreground">Add a new product to your inventory</p>
                      </div>
                    </div>
                  </div>
                  <DialogFooter className="px-5 py-4 border-t border-border/10">
                    <Button variant="outline" className="w-full rounded-lg">
                      View All Options
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full flex items-center justify-center p-0 transition-all hover:bg-muted/30">
                <Avatar className="h-9 w-9 border border-border/10 ring-2 ring-white">
                  <AvatarImage src="https://i.pravatar.cc/100?img=13" alt="Mohammed Khatib" />
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-medium text-sm">{userName}</AvatarFallback>
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
              <DropdownMenuItem asChild className="rounded-lg py-1.5 px-2.5 hover:bg-muted/50 cursor-pointer">
                <Link to="/profile" className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center bg-muted/50">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src="https://i.pravatar.cc/100?img=13" />
                      <AvatarFallback className="text-[10px]">{userName}</AvatarFallback>
                    </Avatar>
                  </div>
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-lg py-1.5 px-2.5 hover:bg-muted/50 cursor-pointer">
                <Link to="/settings" className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center bg-muted/50">
                    <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-lg py-1.5 px-2.5 hover:bg-muted/50 cursor-pointer">
                <Link to="/support" className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center bg-muted/50">
                    <LifeBuoy className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <span>Support</span>
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator className="bg-border/5 my-2" />
              <DropdownMenuItem className="rounded-lg py-1.5 px-2.5 hover:bg-red-50 hover:text-red-600 focus:bg-red-50 focus:text-red-600 cursor-pointer">
                <div className="flex items-center gap-2.5 w-full text-muted-foreground">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center bg-muted/50">
                    <LogOut className="h-3.5 w-3.5" />
                  </div>
                  <span>Log out</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search across Genius..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem className="py-2">
              <Package className="mr-2 h-4 w-4" />
              <span>Orders</span>
            </CommandItem>
            <CommandItem className="py-2">
              <Clock className="mr-2 h-4 w-4" />
              <span>Pickups</span>
              <CommandShortcut>⌘P</CommandShortcut>
            </CommandItem>
            <CommandItem className="py-2">
              <Wallet className="mr-2 h-4 w-4" />
              <span>Wallet</span>
            </CommandItem>
            <CommandItem className="py-2">
              <BarChart className="mr-2 h-4 w-4" />
              <span>Analytics Dashboard</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Recently Viewed">
            <CommandItem className="py-2">
              <div className="mr-2 h-4 w-4 flex items-center justify-center">
                <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
              </div>
              <span>Order #232940 - محمد الخطيب</span>
            </CommandItem>
            <CommandItem className="py-2">
              <div className="mr-2 h-4 w-4 flex items-center justify-center">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
              </div>
              <span>Pickup #567 - Tripoli Branch</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>;
};
export default TopBar;