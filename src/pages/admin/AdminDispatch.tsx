
import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Navigation, Clock, MapPin, User } from 'lucide-react';
import { useOrdersByStatus } from '@/hooks/use-orders';

const AdminDispatch = () => {
  document.title = "Dispatch Panel - Admin Dashboard";
  
  const { data: newOrders = [] } = useOrdersByStatus('New');
  const { data: pendingOrders = [] } = useOrdersByStatus('Pending Pickup');

  const unassignedOrders = [...newOrders, ...pendingOrders];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Dispatch Panel
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Assign orders to couriers and manage deliveries
            </p>
          </div>
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
            <Navigation className="h-3 w-3 mr-1" />
            {unassignedOrders.length} Unassigned Orders
          </Badge>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Unassigned Orders</p>
                  <p className="text-2xl font-bold text-orange-600 mt-2">{unassignedOrders.length}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Available Couriers</p>
                  <p className="text-2xl font-bold text-green-600 mt-2">3</p>
                </div>
                <User className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Deliveries</p>
                  <p className="text-2xl font-bold text-blue-600 mt-2">8</p>
                </div>
                <Navigation className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Unassigned Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Unassigned Orders</span>
              <Button className="bg-[#DC291E] hover:bg-[#DC291E]/90">
                Auto-Assign All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {unassignedOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Navigation className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No unassigned orders at the moment.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {unassignedOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        {order.reference_number}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.customer.name}</div>
                          <div className="text-sm text-gray-500">{order.customer.phone}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-gray-400" />
                          <div>
                            {order.customer.governorate_name && (
                              <div className="text-sm">{order.customer.governorate_name}</div>
                            )}
                            {order.customer.city_name && (
                              <div className="text-xs text-gray-500">{order.customer.city_name}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                          Normal
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleTimeString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            Assign
                          </Button>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDispatch;
