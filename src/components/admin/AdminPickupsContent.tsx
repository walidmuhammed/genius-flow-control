
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, Truck, Clock } from 'lucide-react';
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
  const [statusFilter, setStatusFilter] = useState('all');
  const [courierAssignDialogOpen, setCourierAssignDialogOpen] = useState(false);
  const [selectedPickupForAssignment, setSelectedPickupForAssignment] = useState<{
    id: string;
    location: string;
  } | null>(null);

  const { data: stats, isLoading: statsLoading } = useAdminPickupStats();
  const { data: pickups, isLoading: pickupsLoading } = useAdminPickupsWithClients({
    status: statusFilter,
    search: searchQuery
  });
  const updateStatus = useUpdatePickupStatus();

  const handleStatusUpdate = (pickupId: string, status: string) => {
    updateStatus.mutate({ pickupId, status });
  };

  const handleCourierAssign = (pickupId: string) => {
    const pickup = pickups?.find(p => p.id === pickupId);
    if (pickup) {
      setSelectedPickupForAssignment({
        id: pickupId,
        location: pickup.location
      });
      setCourierAssignDialogOpen(true);
    }
  };

  const statusTabs = [
    { value: 'all', label: 'All Pickups', count: pickups?.length || 0 },
    { value: 'scheduled', label: 'Scheduled', count: stats?.totalScheduled || 0 },
    { value: 'assigned', label: 'Assigned', count: stats?.totalAssigned || 0 },
    { value: 'in progress', label: 'In Progress', count: stats?.totalInProgress || 0 },
    { value: 'completed', label: 'Completed', count: stats?.totalCompleted || 0 },
    { value: 'canceled', label: 'Canceled', count: stats?.totalCanceled || 0 },
  ];

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
            <Filter className="h-4 w-4 mr-2" />
            Export
          </Button>
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

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search pickups by ID, client, location, or contact..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Tabs and Table */}
      <Tabs value={statusFilter} onValueChange={setStatusFilter} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          {statusTabs.map((tab) => (
            <TabsTrigger 
              key={tab.value} 
              value={tab.value} 
              className="flex items-center gap-2"
            >
              {tab.label}
              <span className="text-xs bg-muted-foreground/20 px-2 py-1 rounded-full">
                {tab.count}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={statusFilter} className="space-y-4">
          <AdminPickupsTable
            pickups={pickups || []}
            onStatusUpdate={handleStatusUpdate}
            onCourierAssign={handleCourierAssign}
            isLoading={pickupsLoading}
          />
        </TabsContent>
      </Tabs>

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
