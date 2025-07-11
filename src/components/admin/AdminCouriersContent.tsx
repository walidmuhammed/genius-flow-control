import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Truck, 
  Search, 
  Plus, 
  MoreHorizontal, 
  Eye, 
  UserCheck, 
  UserX, 
  Trash2, 
  Phone, 
  Calendar, 
  Activity,
  DollarSign,
  MapPin,
  Clock,
  Users,
  Package,
  TrendingUp,
  Timer
} from 'lucide-react';
import { useCouriers, useCreateCourier, useUpdateCourier, useDeleteCourier } from '@/hooks/use-couriers';
import { useOrders } from '@/hooks/use-orders';
import { usePickups } from '@/hooks/use-pickups';
import CourierProfileDialog from './CourierProfileDialog';
import { toast } from 'sonner';

const AdminCouriersContent = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCourier, setSelectedCourier] = useState(null);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [newCourier, setNewCourier] = useState({ full_name: '', phone: '' });
  
  // Hooks
  const { data: couriers = [], isLoading } = useCouriers();
  const { data: orders = [] } = useOrders();
  const { data: pickups = [] } = usePickups();
  const createCourierMutation = useCreateCourier();
  const updateCourierMutation = useUpdateCourier();
  const deleteCourierMutation = useDeleteCourier();

  // Calculate KPIs
  const totalCouriers = couriers.length;
  const activeCouriers = couriers.filter(c => c.status === 'active').length;
  const totalCashOnHand = couriers.reduce((sum, c) => sum + c.cash_on_hand_usd, 0);
  const ordersDeliveredToday = couriers.reduce((sum, c) => sum + c.orders_completed_today, 0);
  const pickupsCompletedToday = couriers.reduce((sum, c) => sum + c.pickups_completed_today, 0);
  const avgDeliveryTime = '32 min'; // Mock for now

  // Filter couriers based on search
  const filteredCouriers = couriers.filter(courier => 
    courier.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (courier.phone && courier.phone.includes(searchQuery))
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'inactive':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'suspended':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatLastActivity = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const handleCreateCourier = () => {
    if (!newCourier.full_name.trim()) {
      toast.error('Please enter courier name');
      return;
    }
    
    createCourierMutation.mutate(newCourier, {
      onSuccess: () => {
        setNewCourier({ full_name: '', phone: '' });
        setIsAddModalOpen(false);
      }
    });
  };

  const handleViewCourier = (courier: any) => {
    setSelectedCourier(courier);
    setIsProfileDialogOpen(true);
  };

  const handleUpdateCourierStatus = (courierId: string, status: 'active' | 'inactive' | 'suspended') => {
    updateCourierMutation.mutate({
      id: courierId,
      updates: { status }
    });
  };

  const handleDeleteCourier = (courierId: string) => {
    if (confirm('Are you sure you want to delete this courier?')) {
      deleteCourierMutation.mutate(courierId);
    }
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            Couriers Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor, assign and manage your entire courier network ({filteredCouriers.length} couriers)
          </p>
        </div>
        
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Courier
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Courier</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  placeholder="Enter courier name"
                  value={newCourier.full_name}
                  onChange={(e) => setNewCourier(prev => ({ ...prev, full_name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  placeholder="+961 70 123 456"
                  value={newCourier.phone}
                  onChange={(e) => setNewCourier(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button 
                  className="flex-1" 
                  onClick={handleCreateCourier}
                  disabled={createCourierMutation.isPending}
                >
                  {createCourierMutation.isPending ? 'Adding...' : 'Add Courier'}
                </Button>
                <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{totalCouriers}</div>
                <div className="text-sm text-muted-foreground">Total Couriers</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">${totalCashOnHand.toFixed(0)}</div>
                <div className="text-sm text-muted-foreground">Cash On Hand</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Package className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{ordersDeliveredToday}</div>
                <div className="text-sm text-muted-foreground">Orders Today</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Truck className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{pickupsCompletedToday}</div>
                <div className="text-sm text-muted-foreground">Pickups Today</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Timer className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{avgDeliveryTime}</div>
                <div className="text-sm text-muted-foreground">Avg Delivery</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-100 rounded-lg">
                <Activity className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{activeCouriers}</div>
                <div className="text-sm text-muted-foreground">Active Now</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Search couriers by name, phone, or zone..." 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
              className="pl-10" 
            />
          </div>
        </CardContent>
      </Card>

      {/* Couriers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            All Couriers ({filteredCouriers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading couriers...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Courier</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Assigned Zones</TableHead>
                  <TableHead>Active Orders</TableHead>
                  <TableHead>Cash on Hand</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCouriers.map(courier => (
                  <TableRow key={courier.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={courier.avatar_url} />
                          <AvatarFallback>
                            {courier.full_name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{courier.full_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {courier.vehicle_type || 'Motorcycle'}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        {courier.phone || 'Not provided'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {courier.assigned_zones?.length ? (
                          courier.assigned_zones.map((zone, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {zone}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">No zones</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Package className="h-3 w-3 text-blue-600" />
                        {courier.active_orders_count}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-green-600">
                        ${courier.cash_on_hand_usd.toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {courier.cash_on_hand_lbp.toLocaleString()} LBP
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusBadge(courier.status || 'active')}>
                        {(courier.status || 'active').charAt(0).toUpperCase() + (courier.status || 'active').slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewCourier(courier)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <MapPin className="h-4 w-4 mr-2" />
                            Assign Zones
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {(courier.status || 'active') === 'active' ? (
                            <DropdownMenuItem onClick={() => handleUpdateCourierStatus(courier.id, 'inactive')}>
                              <UserX className="h-4 w-4 mr-2" />
                              Deactivate
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleUpdateCourierStatus(courier.id, 'active')}>
                              <UserCheck className="h-4 w-4 mr-2" />
                              Activate
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => handleDeleteCourier(courier.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          
          {!isLoading && filteredCouriers.length === 0 && (
            <div className="text-center py-12">
              <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No couriers found matching your search</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Courier Profile Dialog */}
      <CourierProfileDialog
        courier={selectedCourier}
        open={isProfileDialogOpen}
        onOpenChange={setIsProfileDialogOpen}
      />
    </div>
  );
};
export default AdminCouriersContent;