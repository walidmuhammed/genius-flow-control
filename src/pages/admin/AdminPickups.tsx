
import React, { useState } from 'react';
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableHead, TableRow, TableHeader, TableCell, TableBody } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Download, Package, Calendar, MapPin, Eye, Check, X } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { PickupDetailsModal } from "@/components/pickups/PickupDetailsModal";
import { usePickups, useUpdatePickup } from "@/hooks/use-pickups";
import { format } from 'date-fns';
import { toast } from 'sonner';

const AdminPickups: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedPickupId, setSelectedPickupId] = useState<string | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  // Fetch pickups data
  const { data: allPickups = [], isLoading, refetch } = usePickups();
  const { mutate: updatePickup } = useUpdatePickup();

  // Filter pickups based on status and search
  const getFilteredPickups = () => {
    let pickups = allPickups;
    
    // Filter by status
    if (statusFilter !== "all") {
      pickups = pickups.filter(pickup => pickup.status === statusFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      pickups = pickups.filter(pickup => 
        pickup.pickup_id?.toLowerCase().includes(query) ||
        pickup.location.toLowerCase().includes(query) ||
        pickup.contact_person.toLowerCase().includes(query) ||
        pickup.address.toLowerCase().includes(query)
      );
    }

    return pickups.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  };

  const filteredPickups = getFilteredPickups();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Scheduled':
        return <Badge className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full">Scheduled</Badge>;
      case 'In Progress':
        return <Badge className="bg-yellow-50 text-yellow-700 px-2 py-1 rounded-full">In Progress</Badge>;
      case 'Completed':
        return <Badge className="bg-green-50 text-green-700 px-2 py-1 rounded-full">Completed</Badge>;
      case 'Canceled':
        return <Badge className="bg-red-50 text-red-700 px-2 py-1 rounded-full">Canceled</Badge>;
      default:
        return <Badge className="bg-gray-50 text-gray-700 px-2 py-1 rounded-full">{status}</Badge>;
    }
  };

  const getVehicleType = (type: string) => {
    switch (type) {
      case 'small': return 'Small';
      case 'medium': return 'Medium';
      case 'large': return 'Large';
      default: return type;
    }
  };

  const handlePickupClick = (pickupId: string) => {
    setSelectedPickupId(pickupId);
    setDetailsModalOpen(true);
  };

  const handleStatusUpdate = (pickupId: string, newStatus: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    updatePickup(
      { id: pickupId, updates: { status: newStatus as any } },
      {
        onSuccess: () => {
          toast.success(`Pickup marked as ${newStatus.toLowerCase()}`);
          refetch();
        }
      }
    );
  };

  // Calculate stats
  const stats = {
    total: allPickups.length,
    scheduled: allPickups.filter(p => p.status === 'Scheduled').length,
    inProgress: allPickups.filter(p => p.status === 'In Progress').length,
    completed: allPickups.filter(p => p.status === 'Completed').length
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="text-lg">Loading pickups...</div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Pickup Management</h1>
            <p className="text-gray-500">Manage and track all pickup requests across clients</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pickups</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.scheduled}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Package className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Package className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input 
                  placeholder="Search pickups by ID, location, or contact..." 
                  value={searchQuery} 
                  onChange={e => setSearchQuery(e.target.value)} 
                  className="pl-10" 
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Canceled">Canceled</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Pickups Table */}
        <Card>
          <CardContent className="p-0">
            {filteredPickups.length === 0 ? (
              <EmptyState
                icon={Package}
                title="No pickups found"
                description="No pickups match your current filters."
              />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Pickup ID</TableHead>
                      <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Status</TableHead>
                      <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Date & Time</TableHead>
                      <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Store</TableHead>
                      <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Location</TableHead>
                      <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Contact</TableHead>
                      <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Vehicle</TableHead>
                      <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Orders</TableHead>
                      <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Courier</TableHead>
                      <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPickups.map(pickup => (
                      <TableRow 
                        key={pickup.id} 
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => handlePickupClick(pickup.id)}
                      >
                        <TableCell>
                          <span className="font-medium text-blue-600">{pickup.pickup_id || 'N/A'}</span>
                        </TableCell>
                        <TableCell>{getStatusBadge(pickup.status)}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {format(new Date(pickup.pickup_date), 'MMM d, yyyy')}
                            </div>
                            <div className="text-xs text-gray-500">
                              {format(new Date(pickup.pickup_date), 'h:mm a')}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium">Client Store</span>
                          <div className="text-xs text-gray-500">Business Account</div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{pickup.location}</div>
                            <div className="text-xs text-gray-500 max-w-48 truncate">{pickup.address}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="text-sm">{pickup.contact_person}</div>
                            <div className="text-xs text-gray-500">{pickup.contact_phone}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{getVehicleType(pickup.vehicle_type)}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-blue-100 text-blue-800 rounded-full px-2">
                            {pickup.orders_count || 0}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {pickup.courier_name ? (
                            <div>
                              <div className="text-sm">{pickup.courier_name}</div>
                              <div className="text-xs text-gray-500">{pickup.courier_phone}</div>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-500">Not assigned</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              onClick={() => handlePickupClick(pickup.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {pickup.status === 'Scheduled' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                  onClick={(e) => handleStatusUpdate(pickup.id, 'In Progress', e)}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={(e) => handleStatusUpdate(pickup.id, 'Canceled', e)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            {pickup.status === 'In Progress' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={(e) => handleStatusUpdate(pickup.id, 'Completed', e)}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Details Modal */}
        <PickupDetailsModal
          pickupId={selectedPickupId}
          open={detailsModalOpen}
          onOpenChange={setDetailsModalOpen}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminPickups;
