
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Package, Search, Filter, Download, Plus, FileText } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableHead, TableRow, TableHeader, TableCell, TableBody } from "@/components/ui/table";
import { usePickups, usePickupsByStatus } from '@/hooks/use-pickups';
import { EmptyState } from "@/components/ui/empty-state";

const Pickups: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch real pickup data
  const { data: allPickups, isLoading, error } = usePickups();
  const { data: scheduledPickups } = usePickupsByStatus('Scheduled');
  const { data: inProgressPickups } = usePickupsByStatus('In Progress');
  const { data: completedPickups } = usePickupsByStatus('Completed');
  const { data: canceledPickups } = usePickupsByStatus('Canceled');

  const upcomingPickups = [...(scheduledPickups || []), ...(inProgressPickups || [])];
  const historyPickups = [...(completedPickups || []), ...(canceledPickups || [])];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Scheduled':
        return <Badge className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full">Scheduled</Badge>;
      case 'In Progress':
        return <Badge className="bg-yellow-50 text-yellow-700 px-2 py-1 rounded-full">In Progress</Badge>;
      case 'Completed':
        return <Badge className="bg-green-50 text-green-700 px-2 py-1 rounded-full">Completed</Badge>;
      case 'Canceled':
        return <Badge className="bg-red-50 text-red-700 px-2 py-1 rounded-full">Canceled</Badge>;
      default:
        return <Badge className="bg-gray-50 text-gray-700 px-2 py-1 rounded-full">{status}</Badge>;
    }
  };

  const filteredUpcoming = upcomingPickups.filter(pickup =>
    pickup.pickup_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pickup.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pickup.contact_person.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredHistory = historyPickups.filter(pickup =>
    pickup.pickup_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pickup.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pickup.contact_person.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Package className="h-8 w-8 animate-pulse text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Loading pickups...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Pickups</h1>
            <p className="text-gray-500">Schedule and manage your pickup requests</p>
          </div>
          <Button 
            className="bg-[#DB271E] hover:bg-[#c0211a] text-white"
            onClick={() => navigate('/pickups/new')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Schedule Pickup
          </Button>
        </div>
        
        <Card className="border shadow-sm">
          <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b">
              <TabsList className="bg-transparent h-12">
                <TabsTrigger value="upcoming" className="data-[state=active]:border-b-2 data-[state=active]:border-[#DB271E] data-[state=active]:shadow-none rounded-none h-12">
                  Upcoming Pickups
                </TabsTrigger>
                <TabsTrigger value="history" className="data-[state=active]:border-b-2 data-[state=active]:border-[#DB271E] data-[state=active]:shadow-none rounded-none h-12">
                  History
                </TabsTrigger>
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
              <TabsContent value="upcoming" className="mt-0">
                {filteredUpcoming.length === 0 ? (
                  <EmptyState
                    icon={Package}
                    title="No upcoming pickups"
                    description="You don't have any scheduled pickups at the moment"
                    actionLabel="Schedule Pickup"
                    onAction={() => navigate('/pickups/new')}
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Pickup ID</TableHead>
                          <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Status</TableHead>
                          <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Location</TableHead>
                          <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Contact Person</TableHead>
                          <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Pickup Date</TableHead>
                          <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Orders</TableHead>
                          <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Vehicle</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUpcoming.map(pickup => (
                          <TableRow key={pickup.id} className="hover:bg-gray-50 cursor-pointer">
                            <TableCell>
                              <div className="flex items-center">
                                <span className="font-medium text-blue-600">{pickup.pickup_id}</span>
                                {pickup.note && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className="ml-2 cursor-help">
                                          <FileText className="h-4 w-4 text-gray-400" />
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent className="max-w-xs p-3">
                                        <p className="text-sm">{pickup.note}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(pickup.status)}</TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{pickup.location}</div>
                                <div className="text-xs text-gray-500">{pickup.address}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div>{pickup.contact_person}</div>
                                <div className="text-xs text-gray-500">{pickup.contact_phone}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="font-medium">
                                {new Date(pickup.pickup_date).toLocaleDateString()}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{pickup.orders_count || 0} orders</Badge>
                            </TableCell>
                            <TableCell>
                              <span className="capitalize">{pickup.vehicle_type || 'small'}</span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="history" className="mt-0">
                {filteredHistory.length === 0 ? (
                  <EmptyState
                    icon={Package}
                    title="No pickup history"
                    description="You haven't completed any pickups yet"
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Pickup ID</TableHead>
                          <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Status</TableHead>
                          <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Location</TableHead>
                          <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Contact Person</TableHead>
                          <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Pickup Date</TableHead>
                          <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Orders</TableHead>
                          <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Vehicle</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredHistory.map(pickup => (
                          <TableRow key={pickup.id} className="hover:bg-gray-50">
                            <TableCell>
                              <div className="flex items-center">
                                <span className="font-medium text-blue-600">{pickup.pickup_id}</span>
                                {pickup.note && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className="ml-2 cursor-help">
                                          <FileText className="h-4 w-4 text-gray-400" />
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent className="max-w-xs p-3">
                                        <p className="text-sm">{pickup.note}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(pickup.status)}</TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{pickup.location}</div>
                                <div className="text-xs text-gray-500">{pickup.address}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div>{pickup.contact_person}</div>
                                <div className="text-xs text-gray-500">{pickup.contact_phone}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="font-medium">
                                {new Date(pickup.pickup_date).toLocaleDateString()}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{pickup.orders_count || 0} orders</Badge>
                            </TableCell>
                            <TableCell>
                              <span className="capitalize">{pickup.vehicle_type || 'small'}</span>
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
    </MainLayout>
  );
};

export default Pickups;
