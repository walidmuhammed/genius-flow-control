
import React, { useState } from 'react';
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
  Package, 
  Search, 
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  Calendar,
  MapPin,
  Phone,
  User
} from 'lucide-react';

// Mock pickup data - replace with actual API call
const mockPickups = [
  {
    id: '1',
    pickup_id: 'PKP-001',
    client_name: 'Electronics Store',
    contact_person: 'Ahmed Hassan',
    contact_phone: '+961 70 123 456',
    address: 'Hamra Street, Beirut',
    pickup_date: '2024-01-08',
    status: 'pending',
    orders_count: 12,
    courier_name: null,
    note: 'Second floor, blue building'
  },
  {
    id: '2',
    pickup_id: 'PKP-002',
    client_name: 'Fashion Boutique',
    contact_person: 'Sara Michel',
    contact_phone: '+961 71 789 012',
    address: 'Verdun, Beirut',
    pickup_date: '2024-01-08',
    status: 'assigned',
    orders_count: 8,
    courier_name: 'Omar Khoury',
    note: null
  },
  {
    id: '3',
    pickup_id: 'PKP-003',
    client_name: 'Tech Solutions',
    contact_person: 'Maya Salim',
    contact_phone: '+961 76 345 678',
    address: 'Achrafieh, Beirut',
    pickup_date: '2024-01-07',
    status: 'completed',
    orders_count: 15,
    courier_name: 'Rami Nader',
    note: 'Call before arrival'
  }
];

const AdminPickupsContent = () => {
  const [pickups] = useState(mockPickups);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter pickups based on search
  const filteredPickups = pickups.filter(pickup =>
    pickup.pickup_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pickup.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pickup.contact_person.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pickup.contact_phone.includes(searchQuery)
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'assigned':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Calendar className="h-3 w-3" />;
      case 'assigned':
        return <Package className="h-3 w-3" />;
      case 'completed':
        return <CheckCircle className="h-3 w-3" />;
      default:
        return <XCircle className="h-3 w-3" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Pickups Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View and manage all pickup requests from clients ({filteredPickups.length} pickups)
          </p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search pickups by ID, client, or contact..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Pickups Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredPickups.map((pickup) => (
          <Card key={pickup.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{pickup.pickup_id}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    {pickup.client_name}
                  </p>
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
                    <DropdownMenuSeparator />
                    {pickup.status === 'pending' && (
                      <>
                        <DropdownMenuItem>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </DropdownMenuItem>
                      </>
                    )}
                    {pickup.status === 'assigned' && (
                      <DropdownMenuItem>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark Complete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge 
                  variant="outline" 
                  className={`${getStatusBadge(pickup.status)} flex items-center gap-1`}
                >
                  {getStatusIcon(pickup.status)}
                  {pickup.status.charAt(0).toUpperCase() + pickup.status.slice(1)}
                </Badge>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {pickup.orders_count} orders
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <User className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium">{pickup.contact_person}</div>
                    <div className="text-gray-500 flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {pickup.contact_phone}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="text-gray-600 dark:text-gray-400">
                    {pickup.address}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">
                    {new Date(pickup.pickup_date).toLocaleDateString()}
                  </span>
                </div>
                
                {pickup.courier_name && (
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">
                      Assigned to: <span className="font-medium">{pickup.courier_name}</span>
                    </span>
                  </div>
                )}
                
                {pickup.note && (
                  <div className="text-xs text-gray-500 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                    <strong>Note:</strong> {pickup.note}
                  </div>
                )}
              </div>
              
              <div className="pt-2 border-t">
                <Button variant="outline" size="sm" className="w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPickups.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No pickups found matching your search</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminPickupsContent;
