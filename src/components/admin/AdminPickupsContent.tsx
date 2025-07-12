
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Download, Truck } from 'lucide-react';
import { 
  useAdminPickupStats, 
  useAdminPickupsWithClients, 
  useUpdatePickupStatus 
} from '@/hooks/use-admin-pickups';
import AdminPickupKPICards from './AdminPickupKPICards';
import AdminPickupsTable from './AdminPickupsTable';
import CourierAssignmentDialog from './CourierAssignmentDialog';

const AdminPickupsContent = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [courierAssignDialogOpen, setCourierAssignDialogOpen] = useState(false);
  const [selectedPickupForAssignment, setSelectedPickupForAssignment] = useState<{
    id: string;
    location: string;
  } | null>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: stats, isLoading: statsLoading } = useAdminPickupStats();
  const { data: pickups, isLoading: pickupsLoading } = useAdminPickupsWithClients({
    status: statusFilter === 'all' ? undefined : statusFilter,
    search: debouncedSearchQuery || undefined
  });
  const updateStatus = useUpdatePickupStatus();

  const handleStatusUpdate = useCallback((pickupId: string, status: string) => {
    updateStatus.mutate({ pickupId, status });
  }, [updateStatus]);

  const handleCourierAssign = useCallback((pickupId: string) => {
    const pickup = pickups?.find(p => p.id === pickupId);
    if (pickup) {
      setSelectedPickupForAssignment({
        id: pickupId,
        location: pickup.location
      });
      setCourierAssignDialogOpen(true);
    }
  }, [pickups]);

  const handleExport = useCallback(() => {
    if (!pickups?.length) return;
    
    const csvData = pickups.map(pickup => ({
      'Pickup ID': pickup.pickup_id,
      'Client': pickup.client_business_name,
      'Date': new Date(pickup.pickup_date).toLocaleDateString(),
      'Status': pickup.status,
      'Courier': pickup.courier_name || 'Unassigned',
      'Orders': pickup.total_orders,
      'Location': pickup.location,
      'Contact': pickup.contact_person
    }));
    
    const headers = Object.keys(csvData[0]);
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(h => `"${row[h as keyof typeof row] || ''}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pickups-${statusFilter}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [pickups, statusFilter]);

  const statusFilters = useMemo(() => [
    { value: 'all', label: 'All', count: stats?.totalPickups || 0 },
    { value: 'scheduled', label: 'Scheduled', count: stats?.totalScheduled || 0 },
    { value: 'assigned', label: 'Assigned', count: stats?.totalAssigned || 0 },
    { value: 'in progress', label: 'In Progress', count: stats?.totalInProgress || 0 },
    { value: 'completed', label: 'Completed', count: stats?.totalCompleted || 0 },
    { value: 'canceled', label: 'Canceled', count: stats?.totalCanceled || 0 },
  ], [stats]);

  const activeFilterCount = useMemo(() => {
    if (statusFilter === 'all') {
      return stats?.totalPickups || 0;
    }
    return pickups?.length || 0;
  }, [statusFilter, stats?.totalPickups, pickups?.length]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Pickup Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage all pickup requests from clients globally
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Truck className="h-4 w-4 mr-2" />
            Dispatch Console
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      {stats && (
        <AdminPickupKPICards stats={stats} isLoading={statsLoading} />
      )}

      {/* Single Container: Search, Export, Filters, and Table */}
      <Card>
        <CardContent className="p-6 space-y-4">
          {/* Search and Export Row */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by Pickup ID, Client, Courier, or Location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExport}
              disabled={!pickups?.length}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            {statusFilters.map((filter) => (
              <Button
                key={filter.value}
                variant={statusFilter === filter.value ? "destructive" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(filter.value)}
                className="transition-all duration-200"
                disabled={pickupsLoading}
              >
                {filter.label}
                {statusFilter === filter.value && (
                  <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-destructive-foreground/20 text-destructive-foreground">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            ))}
          </div>

          {/* Table */}
          <AdminPickupsTable
            pickups={pickups || []}
            onStatusUpdate={handleStatusUpdate}
            onCourierAssign={handleCourierAssign}
            isLoading={pickupsLoading}
          />
        </CardContent>
      </Card>

      {/* Courier Assignment Dialog */}
      {selectedPickupForAssignment && (
        <CourierAssignmentDialog
          pickupId={selectedPickupForAssignment.id}
          pickupLocation={selectedPickupForAssignment.location}
          open={courierAssignDialogOpen}
          onOpenChange={(open) => {
            setCourierAssignDialogOpen(open);
            if (!open) {
              setSelectedPickupForAssignment(null);
            }
          }}
        />
      )}
    </div>
  );
};

export default AdminPickupsContent;
