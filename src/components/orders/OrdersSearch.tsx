
import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface OrdersSearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
  initialValue?: string;
  debounceTime?: number;
}

export const OrdersSearch: React.FC<OrdersSearchProps> = ({
  onSearch,
  placeholder = "Search orders by name, ID, reference, phone...",
  className,
  initialValue = "",
  debounceTime = 300
}) => {
  const [searchQuery, setSearchQuery] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);
  
  // Debouncing implementation for search
  useEffect(() => {
    const handler = setTimeout(() => {
      onSearch(searchQuery);
    }, debounceTime);
    
    return () => clearTimeout(handler);
  }, [searchQuery, onSearch, debounceTime]);
  
  return (
    <div className={cn(
      "relative w-full", 
      className
    )}>
      <div className={cn(
        "absolute left-3.5 top-1/2 transform -translate-y-1/2 text-muted-foreground transition-colors duration-200",
        isFocused && "text-gray-700"
      )}>
        <Search className="h-4 w-4" />
      </div>
      <Input 
        placeholder={placeholder}
        className="pl-10 w-full shadow-sm border-border/20 h-10 transition-all focus-visible:border-gray-400 focus-visible:ring-0"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </div>
  );
};
