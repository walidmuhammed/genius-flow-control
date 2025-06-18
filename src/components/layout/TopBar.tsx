
import React, { useState, useRef, useEffect } from 'react';
import { Bell, Menu, Search, User, Package, Calendar, Ticket, Plus, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { useScreenSize } from '@/hooks/useScreenSize';
import useLayoutStore from '@/stores/layoutStore';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface SearchSuggestion {
  id: string;
  title: string;
  category: string;
  icon: React.ReactNode;
  path: string;
}

const TopBar: React.FC = () => {
  const { isMobile, isTablet } = useScreenSize();
  const { toggleSidebar } = useLayoutStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [mobileCreateOpen, setMobileCreateOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const createRef = useRef<HTMLDivElement>(null);

  // Sample search suggestions
  const suggestions: SearchSuggestion[] = [
    { id: '1', title: 'Create New Order', category: 'Orders', icon: <Package className="h-4 w-4" />, path: '/create-order' },
    { id: '2', title: 'View All Orders', category: 'Orders', icon: <Package className="h-4 w-4" />, path: '/orders' },
    { id: '3', title: 'Schedule Pickup', category: 'Pickups', icon: <Calendar className="h-4 w-4" />, path: '/schedule-pickup' },
    { id: '4', title: 'View Pickups', category: 'Pickups', icon: <Calendar className="h-4 w-4" />, path: '/pickups' },
    { id: '5', title: 'Support Center', category: 'Support', icon: <Ticket className="h-4 w-4" />, path: '/support' },
    { id: '6', title: 'Account Settings', category: 'Settings', icon: <User className="h-4 w-4" />, path: '/settings' },
    { id: '7', title: 'Analytics Dashboard', category: 'Analytics', icon: <Package className="h-4 w-4" />, path: '/analytics' },
    { id: '8', title: 'Customer Management', category: 'Customers', icon: <User className="h-4 w-4" />, path: '/customers' },
  ];

  const filteredSuggestions = suggestions.filter(suggestion =>
    suggestion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    suggestion.category.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 8);

  const createActions = [
    {
      icon: <Package className="h-5 w-5" />,
      label: 'Create Order',
      action: () => navigate('/create-order'),
    },
    {
      icon: <Calendar className="h-5 w-5" />,
      label: 'Schedule Pickup',
      action: () => navigate('/schedule-pickup'),
    },
    {
      icon: <Ticket className="h-5 w-5" />,
      label: 'Create Ticket',
      action: () => navigate('/support'),
    },
  ];

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (filteredSuggestions.length > 0) {
      navigate(filteredSuggestions[0].path);
      setShowSuggestions(false);
      setSearchQuery('');
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    navigate(suggestion.path);
    setShowSuggestions(false);
    setSearchQuery('');
  };

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
            className="rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 shrink-0"
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
                className="rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
                onMouseEnter={() => setShowNotifications(true)}
                onMouseLeave={() => setShowNotifications(false)}
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
                    className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 z-50"
                  >
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                      No notifications yet. This feature will be enabled soon.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <Button 
              size="icon"
              className="bg-[#DC291E] hover:bg-[#DC291E]/90 text-white rounded-xl w-10 h-10"
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
                <h3 className="text-lg font-semibold mb-6 text-center">Create New</h3>
                <div className="space-y-4">
                  {createActions.map((action) => (
                    <button
                      key={action.label}
                      onClick={() => handleCreateAction(action.action)}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="w-12 h-12 rounded-xl bg-[#DC291E]/10 flex items-center justify-center text-[#DC291E]">
                        {action.icon}
                      </div>
                      <span className="text-base font-medium">{action.label}</span>
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
        {/* Menu Button for Tablet */}
        {isTablet && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar}
            className="rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 shrink-0"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        
        {/* Enhanced Search Bar */}
        <div ref={searchRef} className="relative flex-1 max-w-md">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input 
              placeholder="Search orders, customers, pickups, invoices..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(e.target.value.length > 0);
              }}
              onFocus={() => setShowSuggestions(searchQuery.length > 0)}
              className="h-12 pl-12 pr-4 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-[#DC291E] focus:border-[#DC291E] bg-gray-50/50 dark:bg-gray-800/50 text-base"
            />
          </form>
          
          {/* Search Suggestions Dropdown */}
          <AnimatePresence>
            {showSuggestions && filteredSuggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full mt-2 w-full bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50 max-h-80 overflow-y-auto"
              >
                {filteredSuggestions.map((suggestion, index) => (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 text-left transition-colors"
                  >
                    <div className="text-gray-400">
                      {suggestion.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {suggestion.title}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {suggestion.category}
                      </div>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      <div className="flex items-center gap-4 shrink-0">
        {/* Notification Bell */}
        <div ref={notificationRef} className="relative">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 h-10 w-10"
            onMouseEnter={() => setShowNotifications(true)}
            onMouseLeave={() => setShowNotifications(false)}
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
                className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 z-50"
              >
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  No notifications yet. This feature will be enabled soon.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Create Button */}
        <div ref={createRef} className="relative">
          <Button
            className="bg-[#DC291E] hover:bg-[#DC291E]/90 text-white rounded-xl px-6 h-10 font-medium transition-all duration-200"
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
                className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50"
                onMouseEnter={() => setShowCreateMenu(true)}
                onMouseLeave={() => setShowCreateMenu(false)}
              >
                {createActions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => handleCreateAction(action.action)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 text-left transition-colors"
                  >
                    <div className="text-[#DC291E]">
                      {action.icon}
                    </div>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {action.label}
                    </span>
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
