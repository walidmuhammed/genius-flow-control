import React, { useState } from 'react';
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Package, Search, Filter, Download, Eye, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableHead, TableRow, TableHeader, TableCell, TableBody } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { usePickups, usePickupsByStatus } from "@/hooks/use-pickups";
import { format } from 'date-fns';

const AdminPickups: React.FC = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch pickups data
  const { data: allPickups = [], isLoading } = usePickups();
  const { data: scheduledPickups = [] } = usePickupsByStatus('Scheduled');
  const { data: inProgressPickups = [] } = usePickupsByStatus('In Progress');
  const { data: completedPickups = [] } = usePickupsByStatus('Completed');

  // Filter pickups based on active tab
  const getFilteredPickups = () => {
    let pickups = [];
    
    switch (activeTab) {
      case 'scheduled':
        pickups = scheduledPickups;
        break;
      case 'in-progress':
        pickups = inProgressPickups;
        break;
      case 'completed':
        pickups = completedPickups;
        break;
      default:
        pickups = allPickups;
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      pickups = pickups.filter(pickup => 
        pickup.pickup_id?.toLowerCase().includes(query) ||
        pickup.location.toLowerCase().includes(query) ||
        pickup.contact_person.toLowerCase().includes(query)
      );
    }

    return pickups;
  };

  const filteredPickups = getFilteredPickups();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Scheduled':
        return <Badge className="bg-blue-50 text-blue-700">Scheduled</Badge>;
      case 'In Progress':
        return <Badge className="bg-yellow-50 text-yellow-700">In Progress</Badge>;
      case 'Completed':
        return <Badge className="bg-green-50 text-green-700">Completed</Badge>;
      case 'Canceled':
        return <Badge className="bg-red-50 text-red-700">Canceled</Badge>;
      default:
        return <Badge className="bg-gray-50 text-gray-700">{status}</Badge>;
    }
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Client Pickups</h1>
            <p className="text-gray-500">Manage all client pickup requests</p>
          </div>
        </div>
        
        <Card className="border shadow-sm">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b">
              <TabsList className="bg-transparent h-12">
                <TabsTrigger value="all">All Pickups</TabsTrigger>
                <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
                <TabsTrigger value="in-progress">In Progress</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
            </div>
            
            <div className="p-4 flex items-center gap-4 border-b">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input 
                  placeholder="Search pickups by ID, location, or contact..." 
                  value={searchQuery} 
                  onChange={e => setSearchQuery(e.target.value)} 
                  className="pl-10" 
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" className="h-10 w-10">
                  <Filter className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-10 w-10">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <CardContent className="p-0">
              <TabsContent value="all" className="mt-0">
                {filteredPickups.length === 0 ? (
                  <EmptyState
                    icon={Package}
                    title="No pickups found"
                    description="No pickup requests have been made yet."
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead>Pickup ID</TableHead>
                          <TableHead>Store</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Orders</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPickups.map(pickup => (
                          <TableRow key={pickup.id} className="hover:bg-gray-50">
                            <TableCell className="font-medium text-blue-600">
                              {pickup.pickup_id || 'N/A'}
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{pickup.client_id || 'Unknown Store'}</div>
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
                              <div>
                                <div className="font-medium">{pickup.location}</div>
                                <div className="text-xs text-gray-500 max-w-48 truncate">
                                  {pickup.address}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div>{pickup.contact_person}</div>
                                <div className="text-xs text-gray-500">{pickup.contact_phone}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-blue-100 text-blue-800">
                                {pickup.orders_count || 0}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {pickup.status === 'Scheduled' && (
                                  <>
                                    <Button variant="ghost" size="sm" className="text-green-600">
                                      <CheckCircle className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" className="text-red-600">
                                      <XCircle className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="scheduled" className="mt-0">
                {filteredPickups.length === 0 ? (
                  <EmptyState
                    icon={Package}
                    title="No scheduled pickups found"
                    description="No scheduled pickup requests have been made yet."
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead>Pickup ID</TableHead>
                          <TableHead>Store</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Orders</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPickups.map(pickup => (
                          <TableRow key={pickup.id} className="hover:bg-gray-50">
                            <TableCell className="font-medium text-blue-600">
                              {pickup.pickup_id || 'N/A'}
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{pickup.client_id || 'Unknown Store'}</div>
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
                              <div>
                                <div className="font-medium">{pickup.location}</div>
                                <div className="text-xs text-gray-500 max-w-48 truncate">
                                  {pickup.address}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div>{pickup.contact_person}</div>
                                <div className="text-xs text-gray-500">{pickup.contact_phone}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-blue-100 text-blue-800">
                                {pickup.orders_count || 0}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {pickup.status === 'Scheduled' && (
                                  <>
                                    <Button variant="ghost" size="sm" className="text-green-600">
                                      <CheckCircle className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" className="text-red-600">
                                      <XCircle className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="in-progress" className="mt-0">
                {filteredPickups.length === 0 ? (
                  <EmptyState
                    icon={Package}
                    title="No in-progress pickups found"
                    description="No pickup requests are currently in progress."
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead>Pickup ID</TableHead>
                          <TableHead>Store</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Orders</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPickups.map(pickup => (
                          <TableRow key={pickup.id} className="hover:bg-gray-50">
                            <TableCell className="font-medium text-blue-600">
                              {pickup.pickup_id || 'N/A'}
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{pickup.client_id || 'Unknown Store'}</div>
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
                              <div>
                                <div className="font-medium">{pickup.location}</div>
                                <div className="text-xs text-gray-500 max-w-48 truncate">
                                  {pickup.address}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div>{pickup.contact_person}</div>
                                <div className="text-xs text-gray-500">{pickup.contact_phone}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-blue-100 text-blue-800">
                                {pickup.orders_count || 0}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {pickup.status === 'Scheduled' && (
                                  <>
                                    <Button variant="ghost" size="sm" className="text-green-600">
                                      <CheckCircle className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" className="text-red-600">
                                      <XCircle className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="completed" className="mt-0">
                {filteredPickups.length === 0 ? (
                  <EmptyState
                    icon={Package}
                    title="No completed pickups found"
                    description="No pickup requests have been completed yet."
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead>Pickup ID</TableHead>
                          <TableHead>Store</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Orders</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPickups.map(pickup => (
                          <TableRow key={pickup.id} className="hover:bg-gray-50">
                            <TableCell className="font-medium text-blue-600">
                              {pickup.pickup_id || 'N/A'}
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{pickup.client_id || 'Unknown Store'}</div>
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
                              <div>
                                <div className="font-medium">{pickup.location}</div>
                                <div className="text-xs text-gray-500 max-w-48 truncate">
                                  {pickup.address}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div>{pickup.contact_person}</div>
                                <div className="text-xs text-gray-500">{pickup.contact_phone}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-blue-100 text-blue-800">
                                {pickup.orders_count || 0}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {pickup.status === 'Scheduled' && (
                                  <>
                                    <Button variant="ghost" size="sm" className="text-green-600">
                                      <CheckCircle className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" className="text-red-600">
                                      <XCircle className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminPickups;
