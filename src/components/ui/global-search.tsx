
import React, { useState, useRef, useEffect } from 'react';
import { Search, Clock, X, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { useGlobalSearch, SearchResult } from '@/hooks/use-global-search';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface GlobalSearchProps {
  className?: string;
  placeholder?: string;
}

const categoryChips = [
  { label: 'Orders', value: 'orders', color: 'hover:bg-gray-100 dark:hover:bg-gray-800' },
  { label: 'Customers', value: 'customers', color: 'hover:bg-gray-100 dark:hover:bg-gray-800' },
  { label: 'Pickups', value: 'pickups', color: 'hover:bg-gray-100 dark:hover:bg-gray-800' },
  { label: 'Settings', value: 'settings', color: 'hover:bg-gray-100 dark:hover:bg-gray-800' },
];

// Status badge colors matching the system
const getStatusBadgeProps = (status: string) => {
  const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', className: string }> = {
    'New': { variant: 'outline', className: 'bg-blue-50 text-blue-700 border-blue-200' },
    'Pending Pickup': { variant: 'outline', className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    'In Progress': { variant: 'outline', className: 'bg-orange-50 text-orange-700 border-orange-200' },
    'Heading to Customer': { variant: 'outline', className: 'bg-purple-50 text-purple-700 border-purple-200' },
    'Heading to You': { variant: 'outline', className: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    'Successful': { variant: 'outline', className: 'bg-green-50 text-green-700 border-green-200' },
    'Unsuccessful': { variant: 'outline', className: 'bg-red-50 text-red-700 border-red-200' },
    'Scheduled': { variant: 'outline', className: 'bg-blue-50 text-blue-700 border-blue-200' },
    'Completed': { variant: 'outline', className: 'bg-green-50 text-green-700 border-green-200' },
    'Canceled': { variant: 'outline', className: 'bg-gray-50 text-gray-700 border-gray-200' }
  };
  return statusConfig[status] || { variant: 'secondary' as const, className: '' };
};

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ 
  className, 
  placeholder = "Search" 
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const { results, recentSearches, addToRecentSearches, clearRecentSearches } = useGlobalSearch(query);

  // Filter results by active category
  const filteredResults = activeCategory 
    ? results.filter(result => result.category.toLowerCase() === activeCategory)
    : results;

  // Group results by category
  const groupedResults = filteredResults.reduce((acc, result) => {
    if (!acc[result.category]) {
      acc[result.category] = [];
    }
    acc[result.category].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredResults.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && filteredResults[selectedIndex]) {
          handleResultClick(filteredResults[selectedIndex]);
        } else if (query.trim()) {
          addToRecentSearches(query);
          // If no selection, navigate to first result if available
          if (filteredResults.length > 0) {
            handleResultClick(filteredResults[0]);
          }
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleResultClick = (result: SearchResult) => {
    addToRecentSearches(query);
    
    // Enhanced navigation with modal support
    const url = new URL(result.path, window.location.origin);
    const pathWithoutQuery = url.pathname;
    const searchParams = url.searchParams;
    
    // Navigate to the page first
    navigate(pathWithoutQuery + (searchParams.toString() ? '?' + searchParams.toString() : ''));
    
    setIsOpen(false);
    setQuery('');
    setSelectedIndex(-1);
  };

  const handleRecentSearchClick = (recentQuery: string) => {
    setQuery(recentQuery);
    addToRecentSearches(recentQuery);
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 px-0 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <div ref={searchRef} className={cn("relative w-full max-w-2xl", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="h-10 pl-10 pr-4 bg-white/80 backdrop-blur-sm border-gray-200 rounded-xl focus:ring-2 focus:ring-[#DC291E]/20 focus:border-[#DC291E]/50 text-sm transition-all duration-200"
        />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full mt-2 w-full bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 z-50 overflow-hidden"
          >
            {/* Category Chips */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setActiveCategory(null)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                    !activeCategory 
                      ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900" 
                      : "bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                >
                  All
                </button>
                {categoryChips.map((chip) => (
                  <button
                    key={chip.value}
                    onClick={() => setActiveCategory(activeCategory === chip.value ? null : chip.value)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                      activeCategory === chip.value 
                        ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                        : "bg-transparent text-gray-700 dark:text-gray-300",
                      chip.color
                    )}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {query.trim() === '' ? (
                // Show recent searches and welcome state
                <div className="p-6">
                  {recentSearches.length > 0 ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Recent Searches</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearRecentSearches}
                          className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        >
                          Clear
                        </Button>
                      </div>
                      <div className="space-y-1">
                        {recentSearches.map((recent, index) => (
                          <button
                            key={index}
                            onClick={() => handleRecentSearchClick(recent)}
                            className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-left transition-colors"
                          >
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{recent}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">Find anything</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Search orders, customers, pickups, settings and more
                      </p>
                    </div>
                  )}
                </div>
              ) : filteredResults.length > 0 ? (
                // Show search results grouped by category
                <div className="py-2">
                  {Object.entries(groupedResults).map(([category, categoryResults]) => (
                    <div key={category}>
                      <div className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800">
                        {category}
                      </div>
                      {categoryResults.map((result, index) => {
                        const globalIndex = filteredResults.indexOf(result);
                        return (
                          <button
                            key={result.id}
                            onClick={() => handleResultClick(result)}
                            className={cn(
                              "w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-50 dark:border-gray-800 last:border-b-0",
                              selectedIndex === globalIndex && "bg-gray-50 dark:bg-gray-800"
                            )}
                          >
                            <div className="flex-shrink-0 text-gray-400">
                              {result.icon}
                            </div>
                            <div className="flex-1 text-left min-w-0">
                              <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                {highlightMatch(result.title, query)}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                {highlightMatch(result.subtitle, query)}
                              </div>
                              {result.metadata && (
                                <div className="flex items-center gap-2 mt-1">
                                  {result.metadata.status && (
                                    <Badge 
                                      variant={getStatusBadgeProps(result.metadata.status).variant}
                                      className={cn("text-xs", getStatusBadgeProps(result.metadata.status).className)}
                                    >
                                      {result.metadata.status}
                                    </Badge>
                                  )}
                                  {result.metadata.type && (
                                    <span className="text-xs text-gray-400 dark:text-gray-500">{result.metadata.type}</span>
                                  )}
                                  {(result.metadata.amount_usd > 0 || result.metadata.amount_lbp > 0) && (
                                    <div className="flex gap-1 text-xs text-gray-600 dark:text-gray-400">
                                      {result.metadata.amount_usd > 0 && (
                                        <span>${result.metadata.amount_usd}</span>
                                      )}
                                      {result.metadata.amount_lbp > 0 && (
                                        <span>{result.metadata.amount_lbp.toLocaleString()} LBP</span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              ) : (
                // No results state
                <div className="text-center py-8 px-4">
                  <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">No results found</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Try a different keyword or check your spelling
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GlobalSearch;
