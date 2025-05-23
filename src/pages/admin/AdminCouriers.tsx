
import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Truck, Phone, MapPin, Star, Plus } from 'lucide-react';

const AdminCouriers = () => {
  document.title = "Couriers Management - Admin Dashboard";

  // Mock courier data - in real app this would come from API
  const couriers = [
    {
      id: '1',
      name: 'Ahmad Hassan',
      phone: '+961 70 123 456',
      status: 'Available',
      currentLocation: 'Beirut, Hamra',
      rating: 4.8,
      activeOrders: 0,
      completedToday: 5,
      vehicle: 'Motorcycle'
    },
    {
      id: '2',
      name: 'Sara Khalil',
      phone: '+961 71 234 567',
      status: 'On Delivery',
      currentLocation: 'Dbayeh, Metn',
      rating: 4.9,
      activeOrders: 2,
      completedToday: 3,
      vehicle: 'Car'
    },
    {
      id: '3',
      name: 'Mohammed Ali',
      phone: '+961 76 345 678',
      status: 'Offline',
      currentLocation: 'Tripoli, Mina',
      rating: 4.6,
      activeOrders: 0,
      completedToday: 0,
      vehicle: 'Motorcycle'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'On Delivery':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Offline':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Couriers Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage delivery agents and track performance
            </p>
          </div>
          <Button className="bg-[#DC291E] hover:bg-[#DC291E]/90">
            <Plus className="h-4 w-4 mr-2" />
            Add Courier
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Couriers</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{couriers.length}</p>
                </div>
                <Truck className="h-8 w-8 text-[#DC291E]" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Available</p>
                  <p className="text-2xl font-bold text-green-600 mt-2">
                    {couriers.filter(c => c.status === 'Available').length}
                  </p>
                </div>
                <div className="h-3 w-3 bg-green-500 rounded-full" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">On Delivery</p>
                  <p className="text-2xl font-bold text-blue-600 mt-2">
                    {couriers.filter(c => c.status === 'On Delivery').length}
                  </p>
                </div>
                <div className="h-3 w-3 bg-blue-500 rounded-full" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Deliveries Today</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {couriers.reduce((sum, c) => sum + c.completedToday, 0)}
                  </p>
                </div>
                <div className="h-3 w-3 bg-[#DC291E] rounded-full" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Couriers Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Couriers</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Courier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Active Orders</TableHead>
                  <TableHead>Completed Today</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {couriers.map((courier) => (
                  <TableRow key={courier.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{courier.name}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {courier.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(courier.status)}>
                        {courier.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        {courier.currentLocation}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {courier.vehicle}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{courier.activeOrders}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{courier.completedToday}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="font-medium">{courier.rating}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                        <Button variant="ghost" size="sm">
                          Assign
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminCouriers;
