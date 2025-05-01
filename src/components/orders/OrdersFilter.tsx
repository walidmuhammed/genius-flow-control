
import React from 'react';
import { Filter, Search, Download, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';

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
  return (
    <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input 
          placeholder="Search by order ID, phone, or customer name" 
          className="pl-10 border-border/10 focus-visible:ring-primary/20 rounded-lg"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2 h-10 border-border/10 shadow-sm rounded-lg">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="end">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Date Range</h4>
                <div className="p-1 border rounded-lg">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="pointer-events-auto rounded-md"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Status</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="successful" 
                      checked={statusFilter.includes('Successful')}
                      onCheckedChange={() => handleStatusFilterChange('Successful')}
                      className="rounded-sm data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                    />
                    <label htmlFor="successful" className="text-sm cursor-pointer">Successful</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="returned" 
                      checked={statusFilter.includes('Returned')}
                      onCheckedChange={() => handleStatusFilterChange('Returned')}
                      className="rounded-sm data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                    />
                    <label htmlFor="returned" className="text-sm cursor-pointer">Returned</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="delayed" 
                      checked={statusFilter.includes('Delayed')}
                      onCheckedChange={() => handleStatusFilterChange('Delayed')}
                      className="rounded-sm data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
                    />
                    <label htmlFor="delayed" className="text-sm cursor-pointer">Delayed</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="pending" 
                      checked={statusFilter.includes('Pending')}
                      onCheckedChange={() => handleStatusFilterChange('Pending')}
                      className="rounded-sm data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
                    />
                    <label htmlFor="pending" className="text-sm cursor-pointer">Pending</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="inProgress" 
                      checked={statusFilter.includes('In Progress')}
                      onCheckedChange={() => handleStatusFilterChange('In Progress')}
                      className="rounded-sm data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                    />
                    <label htmlFor="inProgress" className="text-sm cursor-pointer">In Progress</label>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button size="sm" className="rounded-lg">Apply Filters</Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        <Button variant="outline" className="border-border/10 shadow-sm rounded-lg aspect-square p-0 h-10 w-10">
          <Download className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default OrdersFilter;
