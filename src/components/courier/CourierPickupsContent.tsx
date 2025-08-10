import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  useCourierPickupStats, 
  useCourierPickups, 
  useUpdateCourierPickupStatus 
} from '@/hooks/use-courier-pickups';
import { useIsMobile } from '@/hooks/use-mobile';
import CourierPickupKPICards from './CourierPickupKPICards';
import CourierPickupsPageHeader from './CourierPickupsPageHeader';
import CourierPickupsFilterTabs from './CourierPickupsFilterTabs';
import CourierPickupsTable from './CourierPickupsTable';
import CourierPickupsTableMobile from './CourierPickupsTableMobile';

const CourierPickupsContent = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [packageTypeFilter, setPackageTypeFilter] = useState('all');
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date } | undefined>();

  const isMobile = useIsMobile();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: stats, isLoading: statsLoading } = useCourierPickupStats();
  const { data: pickups, isLoading: pickupsLoading } = useCourierPickups({
    status: statusFilter === 'all' ? undefined : statusFilter,
    search: debouncedSearchQuery || undefined,
    dateFrom: dateRange?.from?.toISOString(),
    dateTo: dateRange?.to?.toISOString(),
    packageType: packageTypeFilter === 'all' ? undefined : packageTypeFilter
  });
  const updateStatus = useUpdateCourierPickupStatus();

  const handleStatusUpdate = useCallback((pickupId: string, status: string, reason?: string) => {
    updateStatus.mutate({ pickupId, status, reason });
  }, [updateStatus]);

  const activeFilterCount = useMemo(() => {
    if (statusFilter === 'all') {
      return stats?.totalPickups || 0;
    }
    return pickups?.length || 0;
  }, [statusFilter, stats?.totalPickups, pickups?.length]);

  return (
    <div className="space-y-6">
      <CourierPickupsPageHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        packageTypeFilter={packageTypeFilter}
        onPackageTypeChange={setPackageTypeFilter}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />

      {/* KPI Cards */}
      {stats && (
        <CourierPickupKPICards stats={stats} isLoading={statsLoading} />
      )}

      {/* Single Container: Filters and Table */}
      <Card>
        <CardContent className="p-6 space-y-4">
          {/* Filter Tabs */}
          <CourierPickupsFilterTabs
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            stats={stats}
            isLoading={pickupsLoading}
            activeFilterCount={activeFilterCount}
          />

          {/* Table */}
          {isMobile ? (
            <CourierPickupsTableMobile
              pickups={pickups || []}
              onStatusUpdate={handleStatusUpdate}
              isLoading={pickupsLoading}
            />
          ) : (
            <CourierPickupsTable
              pickups={pickups || []}
              onStatusUpdate={handleStatusUpdate}
              isLoading={pickupsLoading}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CourierPickupsContent;