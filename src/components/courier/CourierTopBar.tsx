import React, { useState, useRef, useEffect } from 'react';
import { Bell, Menu, Plus, Package, Calendar, Ticket, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { useScreenSize } from '@/hooks/useScreenSize';
import useLayoutStore from '@/stores/layoutStore';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const CourierTopBar: React.FC = () => {
  const { isMobile, isTablet } = useScreenSize();
  const { toggleSidebar } = useLayoutStore();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [mobileCreateOpen, setMobileCreateOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const createRef = useRef<HTMLDivElement>(null);

  const createActions = [
    {
      icon: <Ticket className="w-5 h-5 text-purple-600" />,
      label: 'Create Ticket',
      description: 'Submit a support request',
      action: () => navigate('/courier/support'),
    },
  ];

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (createRef.current && !createRef.current.contains(event.target as Node)) {
        setShowCreateMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreateAction = (action: () => void) => {
    action();
    setShowCreateMenu(false);
    setMobileCreateOpen(false);
  };

  if (isMobile) {
    return (
      <>
        <motion.header 
          className="bg-white/98 dark:bg-gray-900/98 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-800/50 h-16 sticky top-0 z-40"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="h-full flex items-center justify-between px-4 gap-3">
            {/* Left - Menu Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleSidebar}
              className="rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 shrink-0 w-10 h-10"
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            {/* Center - Search Bar */}
            <div className="flex-1 min-w-0 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search..."
                className="w-full pl-10 pr-4 bg-gray-100 dark:bg-gray-800 border-transparent hover:border-gray-200 dark:hover:border-gray-700 focus-visible:border-gray-300 dark:focus-visible:border-gray-600 focus-visible:ring-0 rounded-lg h-10 transition-all"
              />
            </div>
            
            {/* Right - Notifications + Create Button */}
            <div className="flex items-center gap-2 shrink-0">
              <div ref={notificationRef} className="relative">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 w-10 h-10"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <Bell className="h-5 w-5" />
                </Button>
                
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 z-[60]"
                    >
                      <div className="text-center">
                        <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          No notifications yet. This feature will be enabled soon.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <Button 
                size="icon"
                className="bg-[#DC291E] hover:bg-[#DC291E]/90 text-white rounded-xl w-10 h-10 shadow-lg"
                onClick={() => setMobileCreateOpen(true)}
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </motion.header>

        {/* Mobile Create Menu - Bottom Drawer */}
        <AnimatePresence>
          {mobileCreateOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-[55]"
                onClick={() => setMobileCreateOpen(false)}
              />
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-3xl p-6 z-[60] safe-area-pb"
              >
                <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-6" />
                <h3 className="text-xl font-bold mb-6 text-center">Create New</h3>
                <div className="space-y-4">
                  {createActions.map((action) => (
                    <button
                      key={action.label}
                      onClick={() => handleCreateAction(action.action)}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                    >
                      <div className="w-10 h-10 rounded-lg bg-white dark:bg-gray-700 flex items-center justify-center shadow-sm">
                        {action.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 dark:text-gray-100">
                          {action.label}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {action.description}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <motion.header 
      className="bg-white/98 dark:bg-gray-900/98 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-800/50 h-16 sticky top-0 z-40"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="h-full flex items-center justify-between px-4 sm:px-6 gap-3 sm:gap-4">
        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
          {/* Menu Button for Tablet */}
          {isTablet && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleSidebar}
              className="rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 shrink-0 w-10 h-10"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          
          {/* Search Bar */}
          <div className="flex-1 min-w-0 relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search orders, assignments..."
              className="w-full pl-10 pr-4 bg-gray-100 dark:bg-gray-800 border-transparent hover:border-gray-200 dark:hover:border-gray-700 focus-visible:border-gray-300 dark:focus-visible:border-gray-600 focus-visible:ring-0 rounded-lg h-10 transition-all"
            />
          </div>
        </div>
        
        {/* Right Side Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Notification Bell */}
          <div ref={notificationRef} className="relative">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 w-10 h-10"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="h-5 w-5" />
            </Button>
            
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 z-[60]"
                >
                  <div className="text-center">
                    <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No notifications yet. This feature will be enabled soon.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Create Button */}
          <div ref={createRef} className="relative">
            <Button
              className="bg-[#DC291E] hover:bg-[#DC291E]/90 text-white rounded-xl px-4 sm:px-6 h-10 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
              onMouseEnter={() => setShowCreateMenu(true)}
              onMouseLeave={() => setShowCreateMenu(false)}
            >
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Create</span>
            </Button>
            
            <AnimatePresence>
              {showCreateMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-[60]"
                  onMouseEnter={() => setShowCreateMenu(true)}
                  onMouseLeave={() => setShowCreateMenu(false)}
                >
                  {createActions.map((action) => (
                    <button
                      key={action.label}
                      onClick={() => handleCreateAction(action.action)}
                      className="w-full flex items-center gap-4 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 text-left transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                        {action.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 dark:text-gray-100">
                          {action.label}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {action.description}
                        </div>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default CourierTopBar;