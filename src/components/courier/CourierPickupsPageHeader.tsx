import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Calendar, Package } from 'lucide-react';
import { DateRangePicker } from '@/components/orders/DateRangePicker';

interface CourierPickupsPageHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  packageTypeFilter: string;
  onPackageTypeChange: (type: string) => void;
  dateRange: { from?: Date; to?: Date } | undefined;
  onDateRangeChange: (range: { from?: Date; to?: Date } | undefined) => void;
}

const CourierPickupsPageHeader: React.FC<CourierPickupsPageHeaderProps> = ({
  searchQuery,
  onSearchChange,
  packageTypeFilter,
  onPackageTypeChange,
  dateRange,
  onDateRangeChange,
}) => {
  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">My Pickups</h1>
          <p className="text-muted-foreground mt-1">
            Manage your assigned pickup requests
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by Pickup ID, Client Name, or Phone..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Package Type Filter */}
        <Select value={packageTypeFilter} onValueChange={onPackageTypeChange}>
          <SelectTrigger className="w-full lg:w-48">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <SelectValue placeholder="Package Type" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="parcel">Parcel</SelectItem>
            <SelectItem value="document">Document</SelectItem>
            <SelectItem value="bulky">Bulky</SelectItem>
          </SelectContent>
        </Select>

        {/* Date Range Filter */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <DateRangePicker
            onDateChange={onDateRangeChange}
          />
        </div>
      </div>
    </>
  );
};

export default CourierPickupsPageHeader;