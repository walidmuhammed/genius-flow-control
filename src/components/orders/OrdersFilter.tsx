
import React, { useState } from 'react';
import { Filter, Search, Download, ChevronDown, X, Calendar as CalendarIcon, Info, Check, Clock, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface OrdersFilterProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  statusFilter: string[];
  handleStatusFilterChange: (status: string) => void;
}

const OrdersFilter: React.FC<OrdersFilterProps> = ({
  searchQuery,
  setSearchQuery,
  date,
  setDate,
  statusFilter,
  handleStatusFilterChange
}) => {
  const [priceRange, setPriceRange] = useState<number[]>([0, 100]);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  
  // Calculate the active filters count
  React.useEffect(() => {
    let count = 0;
    if (date) count++;
    if (statusFilter.length > 0) count++;
    if (priceRange[0] > 0 || priceRange[1] < 100) count++;
    setActiveFiltersCount(count);
  }, [date, statusFilter, priceRange]);
  
  const clearAllFilters = () => {
    setDate(undefined);
    setPriceRange([0, 100]);
    // Reset status filter, create a set of all statuses then clear it
    handleStatusFilterChange('Successful');
    handleStatusFilterChange('Returned');
    handleStatusFilterChange('Delayed');
    handleStatusFilterChange('Pending');
    handleStatusFilterChange('In Progress');
  };

  return (
    <div className="flex flex-col gap-4 mt-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-none sm:max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder="Search by order ID, phone, or customer name" 
            className="pl-10 border-border/10 focus-visible:ring-primary/20 rounded-lg shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-1.5 top-1/2 transform -translate-y-1/2 h-7 w-7 rounded-full hover:bg-muted"
              onClick={() => setSearchQuery('')}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Popover open={isFilterMenuOpen} onOpenChange={setIsFilterMenuOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2 h-10 border-border/10 shadow-sm rounded-lg relative">
                <Filter className="h-4 w-4" />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-1 bg-primary text-white rounded-full h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                    {activeFiltersCount}
                  </Badge>
                )}
                <ChevronDown className="h-3.5 w-3.5 opacity-50 ml-1" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 shadow-lg rounded-xl border-border/10 overflow-hidden" align="end">
              <div className="bg-muted/20 px-4 py-3 border-b border-border/5 flex items-center justify-between">
                <h3 className="font-medium">Filters</h3>
                {activeFiltersCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 text-xs hover:bg-muted px-2"
                    onClick={clearAllFilters}
                  >
                    Clear all
                  </Button>
                )}
              </div>
              <div className="py-3 px-4 border-b border-border/5">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium">Date</h4>
                  {date && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 px-2 text-xs hover:bg-muted"
                      onClick={() => setDate(undefined)}
                    >
                      Clear
                    </Button>
                  )}
                </div>
                <div className="relative">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal border-border/10 shadow-sm h-9 rounded-lg px-3 text-sm ${!date && "text-muted-foreground"}`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, 'PPP') : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 shadow-lg rounded-lg border-border/10" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                        className="p-3 pointer-events-auto rounded-lg"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="py-3 px-4 border-b border-border/5">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium">Price Range (USD)</h4>
                  {(priceRange[0] > 0 || priceRange[1] < 100) && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 px-2 text-xs hover:bg-muted"
                      onClick={() => setPriceRange([0, 100])}
                    >
                      Clear
                    </Button>
                  )}
                </div>
                <div className="pt-4 px-2">
                  <Slider 
                    defaultValue={[0, 100]} 
                    max={100} 
                    step={1} 
                    value={priceRange}
                    onValueChange={setPriceRange}
                    className="mb-6"
                  />
                  <div className="flex items-center justify-between">
                    <div className="bg-muted/50 rounded-md px-2.5 py-1 text-xs font-medium">
                      ${priceRange[0]}
                    </div>
                    <div className="bg-muted/50 rounded-md px-2.5 py-1 text-xs font-medium">
                      ${priceRange[1]}
                    </div>
                  </div>
                </div>
              </div>
              <div className="py-3 px-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium">Status</h4>
                  {statusFilter.length > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 px-2 text-xs hover:bg-muted"
                      onClick={() => {
                        handleStatusFilterChange('Successful');
                        handleStatusFilterChange('Returned');
                        handleStatusFilterChange('Delayed');
                        handleStatusFilterChange('Pending');
                        handleStatusFilterChange('In Progress');
                      }}
                    >
                      Clear
                    </Button>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="successful" 
                      checked={statusFilter.includes('Successful')}
                      onCheckedChange={() => handleStatusFilterChange('Successful')}
                      className="rounded-sm data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                    />
                    <div className="flex items-center gap-1.5">
                      <Check className="h-3 w-3 text-green-600" />
                      <label htmlFor="successful" className="text-sm cursor-pointer">Successful</label>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="returned" 
                      checked={statusFilter.includes('Returned')}
                      onCheckedChange={() => handleStatusFilterChange('Returned')}
                      className="rounded-sm data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                    />
                    <div className="flex items-center gap-1.5">
                      <X className="h-3 w-3 text-amber-500" />
                      <label htmlFor="returned" className="text-sm cursor-pointer">Returned</label>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="delayed" 
                      checked={statusFilter.includes('Delayed')}
                      onCheckedChange={() => handleStatusFilterChange('Delayed')}
                      className="rounded-sm data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
                    />
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3 text-red-500" />
                      <label htmlFor="delayed" className="text-sm cursor-pointer">Delayed</label>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="pending" 
                      checked={statusFilter.includes('Pending')}
                      onCheckedChange={() => handleStatusFilterChange('Pending')}
                      className="rounded-sm data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
                    />
                    <div className="flex items-center gap-1.5">
                      <Info className="h-3 w-3 text-purple-500" />
                      <label htmlFor="pending" className="text-sm cursor-pointer">Pending</label>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="inProgress" 
                      checked={statusFilter.includes('In Progress')}
                      onCheckedChange={() => handleStatusFilterChange('In Progress')}
                      className="rounded-sm data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                    />
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3 text-blue-500" />
                      <label htmlFor="inProgress" className="text-sm cursor-pointer">In Progress</label>
                    </div>
                  </div>
                </div>
              </div>
              <Separator className="my-0" />
              <div className="flex justify-end p-3 bg-muted/5">
                <Button size="sm" className="rounded-lg px-6 shadow-sm" onClick={() => setIsFilterMenuOpen(false)}>
                  Apply Filters
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          <Button 
            variant="outline" 
            className="border-border/10 shadow-sm rounded-lg aspect-square p-0 h-10 w-10"
            title="Download Data"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Active filters display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          {date && (
            <Badge 
              variant="secondary" 
              className="pl-2 pr-1 py-1 gap-1 rounded-lg bg-muted/60 hover:bg-muted border-border/10 h-7"
            >
              <div className="flex items-center gap-1.5">
                <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                <span>{format(date, 'PP')}</span>
              </div>
              <Button 
                variant="ghost" 
                className="h-5 w-5 p-0 rounded-full ml-1 hover:bg-muted-foreground/20"
                onClick={() => setDate(undefined)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {statusFilter.length > 0 && (
            <Badge 
              variant="secondary" 
              className="pl-2 pr-1 py-1 gap-1 rounded-lg bg-muted/60 hover:bg-muted border-border/10 h-7"
            >
              <div className="flex items-center gap-1.5">
                <Filter className="h-3 w-3 text-muted-foreground" />
                <span>{statusFilter.length} statuses</span>
              </div>
              <Button 
                variant="ghost" 
                className="h-5 w-5 p-0 rounded-full ml-1 hover:bg-muted-foreground/20"
                onClick={() => {
                  handleStatusFilterChange('Successful');
                  handleStatusFilterChange('Returned');
                  handleStatusFilterChange('Delayed');
                  handleStatusFilterChange('Pending');
                  handleStatusFilterChange('In Progress');
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {(priceRange[0] > 0 || priceRange[1] < 100) && (
            <Badge 
              variant="secondary" 
              className="pl-2 pr-1 py-1 gap-1 rounded-lg bg-muted/60 hover:bg-muted border-border/10 h-7"
            >
              <div className="flex items-center gap-1.5">
                <Wallet className="h-3 w-3 text-muted-foreground" />
                <span>${priceRange[0]} - ${priceRange[1]}</span>
              </div>
              <Button 
                variant="ghost" 
                className="h-5 w-5 p-0 rounded-full ml-1 hover:bg-muted-foreground/20"
                onClick={() => setPriceRange([0, 100])}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 px-2.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/80"
            onClick={clearAllFilters}
          >
            Clear All
          </Button>
        </div>
      )}
    </div>
  );
};

export default OrdersFilter;
