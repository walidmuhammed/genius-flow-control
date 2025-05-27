
import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Filter, Eye, Edit, MapPin } from 'lucide-react';
import { useOrders } from '@/hooks/use-orders';
import { formatDate } from '@/utils/format';
import { OrderStatus } from '@/services/orders';

const AdminOrders = () => {
  const { data: orders = [], isLoading } = useOrders();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  document.title = "Orders Management - Admin Dashboard";

  const filteredOrders = orders.filter(order => {
    const orderId = order.order_id?.toString().padStart(3, '0') || order.id;
    const referenceMatch = order.reference_number ? order.reference_number.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    const matchesSearch = orderId.includes(searchTerm) ||
                         order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         referenceMatch;
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'New':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Pending Pickup':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Heading to Customer':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Heading to You':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Successful':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Unsuccessful':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Returned':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Paid':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
          <Card className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-64 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Orders Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage all incoming orders from clients
            </p>
          </div>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            {filteredOrders.length} Total Orders
          </Badge>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by order ID, reference number, or customer name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Pending Pickup">Pending Pickup</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Heading to Customer">Heading to Customer</SelectItem>
                  <SelectItem value="Heading to You">Heading to You</SelectItem>
                  <SelectItem value="Successful">Successful</SelectItem>
                  <SelectItem value="Unsuccessful">Unsuccessful</SelectItem>
                  <SelectItem value="Returned">Returned</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>All Orders</span>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Advanced Filters
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        #{order.order_id?.toString().padStart(3, '0') || order.id}
                      </TableCell>
                      <TableCell>
                        {order.reference_number ? (
                          <span className="font-medium">{order.reference_number}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.customer.name}</div>
                          <div className="text-sm text-gray-500">{order.customer.phone}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          {order.customer.governorate_name && (
                            <span className="font-medium text-gray-900">{order.customer.governorate_name}</span>
                          )}
                          {order.customer.city_name && (
                            <span className="text-xs text-gray-500 mt-0.5">{order.customer.city_name}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {order.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {order.cash_collection_usd > 0 && (
                            <div>${order.cash_collection_usd}</div>
                          )}
                          {order.cash_collection_lbp > 0 && (
                            <div>{order.cash_collection_lbp.toLocaleString()} LBP</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatDate(new Date(order.created_at))}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {filteredOrders.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No orders found matching your criteria.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
