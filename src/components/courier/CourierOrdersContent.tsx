import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, 
  Search, 
  Eye, 
  CheckCircle, 
  XCircle,
  MapPin,
  Phone,
  DollarSign
} from 'lucide-react';

const CourierOrdersContent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('all');

  // Mock data - in real app this would come from hooks
  const orders = [
    {
      id: 'ORD-001',
      refNo: 'REF-ABC123',
      customer: { name: 'Ahmad Hassan', phone: '+961 70 123456' },
      pickup: { location: 'Beirut, Hamra', address: 'Bliss Street, Building 45' },
      dropoff: { location: 'Jounieh, Kaslik', address: 'Main Road, Villa 12' },
      packageType: 'Documents',
      cashCollection: { usd: 25.50, lbp: 382500 },
      deliveryFee: { usd: 12.50, lbp: 187500 },
      status: 'In Progress',
      createdAt: '2024-01-15 10:30'
    },
    {
      id: 'ORD-002',
      refNo: 'REF-DEF456',
      customer: { name: 'Sara Khalil', phone: '+961 71 987654' },
      pickup: { location: 'Tripoli, Al-Mina', address: 'Port Street, Office 8' },
      dropoff: { location: 'Beirut, Achrafieh', address: 'Sassine Square, Apt 304' },
      packageType: 'Small Package',
      cashCollection: { usd: 0, lbp: 0 },
      deliveryFee: { usd: 18.00, lbp: 270000 },
      status: 'Successful',
      createdAt: '2024-01-15 09:15'
    },
    {
      id: 'ORD-003',
      refNo: 'REF-GHI789',
      customer: { name: 'Mahmoud Ali', phone: '+961 76 555777' },
      pickup: { location: 'Sidon, Old Souk', address: 'Traditional Market, Shop 15' },
      dropoff: { location: 'Tyre, Downtown', address: 'Central Plaza, Floor 2' },
      packageType: 'Medium Package',
      cashCollection: { usd: 45.00, lbp: 675000 },
      deliveryFee: { usd: 15.75, lbp: 236250 },
      status: 'New',
      createdAt: '2024-01-15 08:45'
    }
  ];

  const statusCounts = {
    all: orders.length,
    new: orders.filter(o => o.status === 'New').length,
    assigned: orders.filter(o => o.status === 'Assigned').length,
    inProgress: orders.filter(o => o.status === 'In Progress').length,
    successful: orders.filter(o => o.status === 'Successful').length,
    unsuccessful: orders.filter(o => o.status === 'Unsuccessful').length
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'New': 'bg-yellow-100 text-yellow-800',
      'Assigned': 'bg-blue-100 text-blue-800',
      'In Progress': 'bg-purple-100 text-purple-800',
      'Successful': 'bg-green-100 text-green-800',
      'Unsuccessful': 'bg-red-100 text-red-800'
    };
    return statusConfig[status as keyof typeof statusConfig] || 'bg-gray-100 text-gray-800';
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.refNo.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = selectedTab === 'all' || 
                      order.status.toLowerCase().replace(' ', '') === selectedTab.toLowerCase();
    
    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Orders</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage your assigned deliveries
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search orders by customer, order ID, or reference..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all" className="text-xs">
            All ({statusCounts.all})
          </TabsTrigger>
          <TabsTrigger value="new" className="text-xs">
            New ({statusCounts.new})
          </TabsTrigger>
          <TabsTrigger value="assigned" className="text-xs">
            Assigned ({statusCounts.assigned})
          </TabsTrigger>
          <TabsTrigger value="inprogress" className="text-xs">
            In Progress ({statusCounts.inProgress})
          </TabsTrigger>
          <TabsTrigger value="successful" className="text-xs">
            Successful ({statusCounts.successful})
          </TabsTrigger>
          <TabsTrigger value="unsuccessful" className="text-xs">
            Unsuccessful ({statusCounts.unsuccessful})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="mt-6">
          {/* Orders List */}
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    {/* Order Info */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{order.id}</span>
                      </div>
                      <p className="text-sm text-gray-500">{order.refNo}</p>
                      <Badge className={`text-xs ${getStatusBadge(order.status)}`}>
                        {order.status}
                      </Badge>
                      <p className="text-xs text-gray-400">{order.createdAt}</p>
                    </div>

                    {/* Customer & Route */}
                    <div className="space-y-2">
                      <div>
                        <p className="font-medium text-sm">{order.customer.name}</p>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Phone className="h-3 w-3" />
                          {order.customer.phone}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium">{order.pickup.location}</p>
                            <p className="text-xs text-gray-500">{order.pickup.address}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium">{order.dropoff.location}</p>
                            <p className="text-xs text-gray-500">{order.dropoff.address}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Package & Financial */}
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-medium">Package Type</p>
                        <p className="text-sm text-gray-500">{order.packageType}</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <DollarSign className="h-3 w-3 text-gray-400" />
                          <span className="font-medium">Delivery: ${order.deliveryFee.usd}</span>
                        </div>
                        {(order.cashCollection.usd > 0 || order.cashCollection.lbp > 0) && (
                          <div className="text-sm">
                            <p className="text-yellow-600 font-medium">
                              Cash Collection: ${order.cashCollection.usd}
                            </p>
                            <p className="text-xs text-gray-500">
                              {order.cashCollection.lbp.toLocaleString()} LBP
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="h-3 w-3 mr-1" />
                        View Details
                      </Button>
                      
                      {order.status === 'New' || order.status === 'Assigned' ? (
                        <Button size="sm" className="w-full">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Start Delivery
                        </Button>
                      ) : order.status === 'In Progress' ? (
                        <>
                          <Button size="sm" className="w-full">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Mark Delivered
                          </Button>
                          <Button variant="destructive" size="sm" className="w-full">
                            <XCircle className="h-3 w-3 mr-1" />
                            Mark Failed
                          </Button>
                        </>
                      ) : null}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredOrders.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No orders found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {searchTerm ? 'Try adjusting your search terms.' : 'No orders match the selected filter.'}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CourierOrdersContent;