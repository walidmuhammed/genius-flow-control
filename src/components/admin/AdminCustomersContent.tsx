
import React, { useState } from 'react';
import { useCustomers } from '@/hooks/use-customers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Users, 
  Building2, 
  Search, 
  Download, 
  MoreHorizontal,
  Eye,
  Phone,
  MapPin,
  Package,
  User
} from 'lucide-react';
import { formatDate } from '@/utils/format';

// Mock clients data - replace with actual API call
const mockClients = [
  {
    id: '1',
    business_name: 'Fashion Forward',
    industry: 'Cosmetics',
    account_status: 'active',
    wallet_balance_usd: 1250.00,
    wallet_balance_lbp: 18750000,
    total_orders: 89,
    created_at: '2023-10-15T10:00:00Z',
    contact_name: 'Sarah Johnson',
    phone: '+961 70 123 456'
  },
  {
    id: '2',
    business_name: 'Tech Solutions',
    industry: 'Electronics',
    account_status: 'active',
    wallet_balance_usd: 3200.00,
    wallet_balance_lbp: 48000000,
    total_orders: 156,
    created_at: '2023-09-22T14:30:00Z',
    contact_name: 'Ahmad Khalil',
    phone: '+961 71 789 012'
  }
];

const AdminCustomersContent = () => {
  const { data: customers = [], isLoading } = useCustomers();
  const [clients] = useState(mockClients);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('customers');

  // Filter customers based on search
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.includes(searchQuery)
  );

  // Filter clients based on search
  const filteredClients = clients.filter(client =>
    client.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.contact_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.phone.includes(searchQuery)
  );

  const getIndustryColor = (industry: string) => {
    const colors = {
      'Cosmetics': 'bg-pink-50 text-pink-700 border-pink-200',
      'Electronics': 'bg-blue-50 text-blue-700 border-blue-200',
      'Fashion': 'bg-purple-50 text-purple-700 border-purple-200',
      'Food': 'bg-orange-50 text-orange-700 border-orange-200'
    };
    return colors[industry] || 'bg-gray-50 text-gray-700 border-gray-200';
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
            Clients & Customers Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View all registered clients (shops) and their customers
          </p>
        </div>
        
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by name, business, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="customers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Customers ({filteredCustomers.length})
          </TabsTrigger>
          <TabsTrigger value="clients" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Clients ({filteredClients.length})
          </TabsTrigger>
        </TabsList>

        {/* Customers Tab */}
        <TabsContent value="customers">
          <Card>
            <CardHeader>
              <CardTitle>Customers from All Shops</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800 border-b">
                    <tr>
                      <th className="text-left p-4 font-medium text-gray-600 dark:text-gray-400">Customer</th>
                      <th className="text-left p-4 font-medium text-gray-600 dark:text-gray-400">Location</th>
                      <th className="text-left p-4 font-medium text-gray-600 dark:text-gray-400">Category</th>
                      <th className="text-left p-4 font-medium text-gray-600 dark:text-gray-400">Orders</th>
                      <th className="text-left p-4 font-medium text-gray-600 dark:text-gray-400">Registered</th>
                      <th className="text-left p-4 font-medium text-gray-600 dark:text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.map((customer) => (
                      <tr key={customer.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                              <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <p className="font-medium">{customer.name}</p>
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <Phone className="h-3 w-3" />
                                {customer.phone}
                              </div>
                              {customer.secondary_phone && (
                                <div className="flex items-center gap-1 text-xs text-gray-400">
                                  <Phone className="h-3 w-3" />
                                  {customer.secondary_phone}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        
                        <td className="p-4">
                          <div className="text-sm">
                            {customer.city_name && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-gray-400" />
                                <span>{customer.city_name}</span>
                              </div>
                            )}
                            {customer.governorate_name && (
                              <p className="text-gray-500 text-xs">{customer.governorate_name}</p>
                            )}
                            {customer.address && (
                              <p className="text-gray-400 text-xs truncate max-w-32">{customer.address}</p>
                            )}
                          </div>
                        </td>
                        
                        <td className="p-4">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            General
                          </Badge>
                        </td>
                        
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            <Package className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">0</span>
                          </div>
                        </td>
                        
                        <td className="p-4">
                          <div className="text-sm">
                            <p>{formatDate(new Date(customer.created_at))}</p>
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
                              <DropdownMenuItem>
                                <Package className="h-4 w-4 mr-2" />
                                View Orders
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {filteredCustomers.length === 0 && (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No customers found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Clients Tab */}
        <TabsContent value="clients">
          <Card>
            <CardHeader>
              <CardTitle>Registered Clients (Shops)</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800 border-b">
                    <tr>
                      <th className="text-left p-4 font-medium text-gray-600 dark:text-gray-400">Business</th>
                      <th className="text-left p-4 font-medium text-gray-600 dark:text-gray-400">Industry</th>
                      <th className="text-left p-4 font-medium text-gray-600 dark:text-gray-400">Status</th>
                      <th className="text-left p-4 font-medium text-gray-600 dark:text-gray-400">Wallet Balance</th>
                      <th className="text-left p-4 font-medium text-gray-600 dark:text-gray-400">Orders</th>
                      <th className="text-left p-4 font-medium text-gray-600 dark:text-gray-400">Registered</th>
                      <th className="text-left p-4 font-medium text-gray-600 dark:text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClients.map((client) => (
                      <tr key={client.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                              <Building2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <p className="font-medium">{client.business_name}</p>
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <User className="h-3 w-3" />
                                {client.contact_name}
                              </div>
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <Phone className="h-3 w-3" />
                                {client.phone}
                              </div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="p-4">
                          <Badge 
                            variant="outline" 
                            className={getIndustryColor(client.industry)}
                          >
                            {client.industry}
                          </Badge>
                        </td>
                        
                        <td className="p-4">
                          <Badge 
                            variant="outline" 
                            className="bg-green-50 text-green-700 border-green-200"
                          >
                            {client.account_status}
                          </Badge>
                        </td>
                        
                        <td className="p-4">
                          <div className="text-sm">
                            <p className="font-medium">${client.wallet_balance_usd.toFixed(2)}</p>
                            <p className="text-gray-500">{client.wallet_balance_lbp.toLocaleString()} LBP</p>
                          </div>
                        </td>
                        
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            <Package className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">{client.total_orders}</span>
                          </div>
                        </td>
                        
                        <td className="p-4">
                          <div className="text-sm">
                            <p>{formatDate(new Date(client.created_at))}</p>
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
                              <DropdownMenuItem>
                                <Package className="h-4 w-4 mr-2" />
                                View Orders
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <MapPin className="h-4 w-4 mr-2" />
                                View Locations
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminCustomersContent;
