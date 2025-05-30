
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Package, Clock, Wallet, MoreHorizontal, Users, BarChart3, Ticket, Settings, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useAuth } from '@/hooks/useAuth';

const MobileNavigation: React.FC = () => {
  const location = useLocation();
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const { signOut } = useAuth();
  
  const mainNavItems = [
    {
      icon: <Package className="h-5 w-5" />,
      label: 'Orders',
      path: '/orders',
    },
    {
      icon: <Clock className="h-5 w-5" />,
      label: 'Pickups',
      path: '/pickups',
    },
    {
      icon: <Home className="h-6 w-6" />,
      label: 'Home',
      path: '/',
      isHome: true,
    },
    {
      icon: <Wallet className="h-5 w-5" />,
      label: 'Wallet',
      path: '/wallet',
    },
    {
      icon: <MoreHorizontal className="h-5 w-5" />,
      label: 'More',
      path: '#',
      isMore: true,
    }
  ];

  const moreMenuItems = [
    {
      icon: <Users className="h-5 w-5" />,
      label: 'Customers',
      path: '/customers',
    },
    {
      icon: <BarChart3 className="h-5 w-5" />,
      label: 'Analytics',
      path: '/analytics'
    },
    {
      icon: <Ticket className="h-5 w-5" />,
      label: 'Support',
      path: '/support'
    },
    {
      icon: <Settings className="h-5 w-5" />,
      label: 'Settings',
      path: '/settings'
    }
  ];

  const handleMoreClick = () => {
    setMoreMenuOpen(true);
  };

  const handleSignOut = () => {
    signOut();
    setMoreMenuOpen(false);
  };

  return (
    <>
      <motion.div 
        className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-800/50 px-2 py-2 z-50 safe-area-pb"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.4, 0.0, 0.2, 1] }}
      >
        <nav className="flex justify-around items-end relative">
          {mainNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            if (item.isHome) {
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex flex-col items-center justify-center relative -mt-6"
                >
                  <motion.div 
                    className={cn(
                      "w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg",
                      isActive 
                        ? "bg-[#DC291E] text-white shadow-[#DC291E]/25" 
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                    )}
                    whileTap={{ scale: 0.9 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    {item.icon}
                  </motion.div>
                  <span className={cn(
                    "text-xs mt-1 font-medium",
                    isActive ? "text-[#DC291E]" : "text-gray-500 dark:text-gray-400"
                  )}>
                    {item.label}
                  </span>
                </Link>
              );
            }
            
            if (item.isMore) {
              return (
                <button
                  key="more"
                  onClick={handleMoreClick}
                  className="flex flex-col items-center justify-center py-2 px-3 min-w-0 flex-1"
                >
                  <motion.div 
                    className="flex flex-col items-center justify-center rounded-xl px-3 py-2 transition-all duration-200 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    whileTap={{ scale: 0.95 }}
                  >
                    {item.icon}
                    <span className="text-xs mt-1 font-medium">{item.label}</span>
                  </motion.div>
                </button>
              );
            }
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex flex-col items-center justify-center py-2 px-3 min-w-0 flex-1"
              >
                <motion.div 
                  className={cn(
                    "flex flex-col items-center justify-center rounded-xl px-3 py-2 transition-all duration-200",
                    isActive 
                      ? "text-[#DC291E]" 
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  )}
                  whileTap={{ scale: 0.95 }}
                >
                  {item.icon}
                  <span className="text-xs mt-1 font-medium">{item.label}</span>
                </motion.div>
              </Link>
            );
          })}
        </nav>
      </motion.div>

      {/* More Menu Sheet */}
      <Sheet open={moreMenuOpen} onOpenChange={setMoreMenuOpen}>
        <SheetContent side="bottom" className="h-auto rounded-t-3xl border-0 bg-white dark:bg-gray-900">
          <SheetHeader className="pb-6">
            <SheetTitle className="text-lg font-semibold">More Options</SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-2 gap-4 pb-6">
            {moreMenuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMoreMenuOpen(false)}
                className="flex flex-col items-center p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-white dark:bg-gray-900 flex items-center justify-center mb-3 shadow-sm">
                  {item.icon}
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.label}</span>
              </Link>
            ))}
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl h-12"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Sign Out
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default MobileNavigation;
