
import React, { useState } from 'react';
import { useOrders } from '@/hooks/use-orders';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Package, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  User,
  Phone,
  MapPin
} from 'lucide-react';
import { formatDate } from '@/utils/format';

const AdminOrdersContent = () => {
  const { data: orders = [], isLoading } = useOrders();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Filter orders based on search and filters
  const filteredOrders = orders.filter(order => {
    const matchesSearch = !searchQuery || 
      order.reference_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.phone.includes(searchQuery) ||
      order.order_id.toString().includes(searchQuery);
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesType = typeFilter === 'all' || order.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'New': 'bg-blue-50 text-blue-700 border-blue-200',
      'Pending Pickup': 'bg-orange-50 text-orange-700 border-orange-200',
      'In Progress': 'bg-yellow-50 text-yellow-700 border-yellow-200',
      'Successful': 'bg-green-50 text-green-700 border-green-200',
      'Unsuccessful': 'bg-red-50 text-red-700 border-red-200',
      'Returned': 'bg-gray-50 text-gray-700 border-gray-200'
    };
    
    return statusConfig[status] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Orders Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View and manage all orders from every shop ({filteredOrders.length} orders)
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by order ID, customer name, phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="New">New</SelectItem>
                <SelectItem value="Pending Pickup">Pending Pickup</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Successful">Successful</SelectItem>
                <SelectItem value="Unsuccessful">Unsuccessful</SelectItem>
                <SelectItem value="Returned">Returned</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Standard">Standard</SelectItem>
                <SelectItem value="Express">Express</SelectItem>
                <SelectItem value="Same Day">Same Day</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Orders List
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b">
                <tr>
                  <th className="text-left p-4 font-medium text-gray-600 dark:text-gray-400">Order</th>
                  <th className="text-left p-4 font-medium text-gray-600 dark:text-gray-400">Customer</th>
                  <th className="text-left p-4 font-medium text-gray-600 dark:text-gray-400">Shop</th>
                  <th className="text-left p-4 font-medium text-gray-600 dark:text-gray-400">Status</th>
                  <th className="text-left p-4 font-medium text-gray-600 dark:text-gray-400">Type</th>
                  <th className="text-left p-4 font-medium text-gray-600 dark:text-gray-400">Amount</th>
                  <th className="text-left p-4 font-medium text-gray-600 dark:text-gray-400">Date</th>
                  <th className="text-left p-4 font-medium text-gray-600 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="p-4">
                      <div>
                        <p className="font-medium">#{order.order_id}</p>
                        {order.reference_number && (
                          <p className="text-sm text-gray-500">{order.reference_number}</p>
                        )}
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium">{order.customer.name}</p>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Phone className="h-3 w-3" />
                            {order.customer.phone}
                          </div>
                          {order.customer.city_name && (
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <MapPin className="h-3 w-3" />
                              {order.customer.city_name}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <div className="text-sm">
                        <p className="font-medium">Shop Name</p>
                        <p className="text-gray-500">Business Type</p>
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <Badge 
                        variant="outline" 
                        className={getStatusBadge(order.status)}
                      >
                        {order.status}
                      </Badge>
                    </td>
                    
                    <td className="p-4">
                      <Badge variant="outline">
                        {order.type}
                      </Badge>
                    </td>
                    
                    <td className="p-4">
                      <div className="text-sm">
                        {order.cash_collection_usd > 0 && (
                          <p className="font-medium">${order.cash_collection_usd}</p>
                        )}
                        {order.cash_collection_lbp > 0 && (
                          <p className="text-gray-500">{order.cash_collection_lbp.toLocaleString()} LBP</p>
                        )}
                        <p className="text-xs text-gray-400">
                          +${order.delivery_fees_usd} delivery
                        </p>
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <div className="text-sm">
                        <p>{formatDate(new Date(order.created_at))}</p>
                        <p className="text-gray-500">
                          {new Date(order.created_at).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </td>
                    
                    <td className="p-4">
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
                          <DropdownMenuItem 
                            onClick={() => {
                              if (order.status !== 'Paid') {
                                window.location.href = `/create-order?edit=true&id=${order.id}`;
                              }
                            }}
                            disabled={order.status === 'Paid'}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            {order.status === 'Paid' ? 'Cannot Edit (Paid)' : 'Edit Order'}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <User className="h-4 w-4 mr-2" />
                            Assign Courier
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Order
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No orders found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOrdersContent;
