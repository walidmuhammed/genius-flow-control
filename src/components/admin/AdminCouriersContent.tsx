
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
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
  Activity
} from 'lucide-react';

// Mock courier data - replace with actual API call
const mockCouriers = [
  {
    id: '1',
    name: 'Ahmed Hassan',
    phone: '+961 70 123 456',
    status: 'active',
    last_activity: '2024-01-08T10:30:00Z',
    orders_completed: 145,
    rating: 4.8,
    vehicle_type: 'Motorcycle'
  },
  {
    id: '2',
    name: 'Sara Michel',
    phone: '+961 71 789 012',
    status: 'active',
    last_activity: '2024-01-08T09:15:00Z',
    orders_completed: 89,
    rating: 4.9,
    vehicle_type: 'Car'
  },
  {
    id: '3',
    name: 'Omar Khoury',
    phone: '+961 76 345 678',
    status: 'inactive',
    last_activity: '2024-01-05T16:45:00Z',
    orders_completed: 203,
    rating: 4.7,
    vehicle_type: 'Motorcycle'
  }
];

const AdminCouriersContent = () => {
  const [couriers] = useState(mockCouriers);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Filter couriers based on search
  const filteredCouriers = couriers.filter(courier =>
    courier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    courier.phone.includes(searchQuery)
  );

  const getStatusBadge = (status: string) => {
    return status === 'active' 
      ? 'bg-green-50 text-green-700 border-green-200'
      : 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const formatLastActivity = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Couriers Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Add, view, and manage all couriers in the system ({filteredCouriers.length} couriers)
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
                <Input id="name" placeholder="Enter courier name" />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" placeholder="+961 70 123 456" />
              </div>
              <div>
                <Label htmlFor="vehicle">Vehicle Type</Label>
                <Input id="vehicle" placeholder="Motorcycle, Car, Van" />
              </div>
              <div>
                <Label htmlFor="photo">Photo ID Upload</Label>
                <Input id="photo" type="file" accept="image/*" />
              </div>
              <div className="flex gap-2 pt-4">
                <Button className="flex-1">Add Courier</Button>
                <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search couriers by name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Couriers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCouriers.map((courier) => (
          <Card key={courier.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <Truck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{courier.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Phone className="h-3 w-3" />
                      {courier.phone}
                    </div>
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Activity className="h-4 w-4 mr-2" />
                      Activity Logs
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {courier.status === 'active' ? (
                      <DropdownMenuItem>
                        <UserX className="h-4 w-4 mr-2" />
                        Disable
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem>
                        <UserCheck className="h-4 w-4 mr-2" />
                        Enable
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge 
                  variant="outline" 
                  className={getStatusBadge(courier.status)}
                >
                  {courier.status === 'active' ? 'Active' : 'Inactive'}
                </Badge>
                <div className="text-sm text-gray-500">
                  ⭐ {courier.rating}
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Orders Completed:</span>
                  <span className="font-medium">{courier.orders_completed}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Vehicle:</span>
                  <span className="font-medium">{courier.vehicle_type}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Last Activity:</span>
                  <span className="font-medium">{formatLastActivity(courier.last_activity)}</span>
                </div>
              </div>
              
              <div className="pt-2 border-t">
                <Button variant="outline" size="sm" className="w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  View Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCouriers.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No couriers found matching your search</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminCouriersContent;
