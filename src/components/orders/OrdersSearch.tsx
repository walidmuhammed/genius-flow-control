
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
  
  // Debouncing implementation for search
  useEffect(() => {
    const handler = setTimeout(() => {
      onSearch(searchQuery);
    }, debounceTime);
    
    return () => clearTimeout(handler);
  }, [searchQuery, onSearch, debounceTime]);
  
  return (
    <div className={cn("relative flex-1", className)}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input 
        placeholder={placeholder}
        className="pl-10 w-full"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  );
};
