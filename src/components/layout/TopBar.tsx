
import React, { useState, useRef, useEffect } from 'react';
import { Bell, Menu, Plus, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { useScreenSize } from '@/hooks/useScreenSize';
import useLayoutStore from '@/stores/layoutStore';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import GlobalSearch from '@/components/ui/global-search';

const TopBar: React.FC = () => {
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
      icon: <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">📦</div>,
      label: 'Create Order',
      description: 'Create a new delivery order',
      action: () => navigate('/create-order'),
    },
    {
      icon: <div className="w-6 h-6 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">🚚</div>,
      label: 'Schedule Pickup',
      description: 'Schedule a new pickup',
      action: () => navigate('/schedule-pickup'),
    },
    {
      icon: <div className="w-6 h-6 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">🎫</div>,
      label: 'Create Ticket',
      description: 'Submit a support request',
      action: () => navigate('/support'),
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
          className="bg-white/98 dark:bg-gray-900/98 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-800/50 h-16 flex items-center justify-between px-4 sticky top-0 z-40"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Left - Menu Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar}
            className="rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 shrink-0 w-10 h-10"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          {/* Center - Logo */}
          <div className="flex-1 flex justify-center">
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Topspeed
            </h1>
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
                    className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 z-50"
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
        </motion.header>

        {/* Mobile Create Menu - Bottom Drawer */}
        <AnimatePresence>
          {mobileCreateOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-50"
                onClick={() => setMobileCreateOpen(false)}
              />
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-3xl p-6 z-50 safe-area-pb"
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
                      {action.icon}
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
      className="bg-white/98 dark:bg-gray-900/98 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-800/50 h-16 flex items-center justify-between px-6 sticky top-0 z-40"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-6 flex-1">
        {/*  Menu Button for Tablet */}
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
        
        {/* Enhanced Global Search Bar */}
        <GlobalSearch 
          className="flex-1"
          placeholder="Search orders, customers, pickups, invoices..."
        />
      </div>
      
      <div className="flex items-center gap-3 shrink-0 ml-4">
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
                className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 z-50"
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
            className="bg-[#DC291E] hover:bg-[#DC291E]/90 text-white rounded-xl px-6 h-10 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
            onMouseEnter={() => setShowCreateMenu(true)}
            onMouseLeave={() => setShowCreateMenu(false)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create
          </Button>
          
          <AnimatePresence>
            {showCreateMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50"
                onMouseEnter={() => setShowCreateMenu(true)}
                onMouseLeave={() => setShowCreateMenu(false)}
              >
                {createActions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => handleCreateAction(action.action)}
                    className="w-full flex items-center gap-4 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 text-left transition-colors"
                  >
                    {action.icon}
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.header>
  );
};

export default TopBar;
