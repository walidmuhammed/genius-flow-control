
import React, { useState } from 'react';
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Package, Search, Filter, Download, Clock, Plus, FileText } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableHead, TableRow, TableHeader, TableCell, TableBody } from "@/components/ui/table";

interface PickupData {
  id: string;
  status: "Scheduled" | "Completed" | "Canceled" | "In Progress";
  location: string;
  address: string;
  contactPerson: string;
  contactPhone: string;
  pickupDate: string;
  courier: {
    name: string;
    phone: string;
  };
  requested: boolean;
  pickedUp: boolean;
  validated: boolean;
  note?: string;
}

const Pickups: React.FC = () => {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Sample data for pickups
  const pickupsData: PickupData[] = [
    {
      id: "PIC-1234",
      status: "Scheduled",
      location: "Beirut Bakery",
      address: "123 Hamra St, Beirut",
      contactPerson: "Ahmad Kassir",
      contactPhone: "+961 3 123 456",
      pickupDate: "May 5, 2025",
      courier: {
        name: "Mohammed Ali",
        phone: "+961 71 987 654"
      },
      requested: true,
      pickedUp: false,
      validated: false,
      note: "This is a priority pickup. Please arrive on time."
    },
    {
      id: "PIC-1235",
      status: "In Progress",
      location: "Tripoli Electronics",
      address: "45 Main Ave, Tripoli",
      contactPerson: "Leila Hassan",
      contactPhone: "+961 70 456 789",
      pickupDate: "May 6, 2025",
      courier: {
        name: "Jad Makari",
        phone: "+961 76 123 456"
      },
      requested: true,
      pickedUp: false,
      validated: false
    },
    {
      id: "PIC-1236",
      status: "Completed",
      location: "Saida Market",
      address: "78 Beach Rd, Saida",
      contactPerson: "Karim Nassar",
      contactPhone: "+961 81 789 123",
      pickupDate: "May 2, 2025",
      courier: {
        name: "Ali Hamdan",
        phone: "+961 76 345 678"
      },
      requested: true,
      pickedUp: true,
      validated: true
    },
    {
      id: "PIC-1237",
      status: "Canceled",
      location: "Jounieh Pharmacy",
      address: "12 Marina Way, Jounieh",
      contactPerson: "Nour Khoury",
      contactPhone: "+961 3 567 890",
      pickupDate: "May 3, 2025",
      courier: {
        name: "Rami Nasrallah",
        phone: "+961 70 901 234"
      },
      requested: true,
      pickedUp: false,
      validated: false,
      note: "Customer canceled the pickup due to change in plans."
    }
  ];

  const upcomingPickups = pickupsData.filter(pickup => 
    pickup.status === "Scheduled" || pickup.status === "In Progress"
  );
  
  const historyPickups = pickupsData.filter(pickup => 
    pickup.status === "Completed" || pickup.status === "Canceled"
  );
  
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
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Pickups</h1>
            <p className="text-gray-500">Schedule and manage your pickup requests</p>
          </div>
          <Button className="bg-orange-500 hover:bg-orange-600">
            <Plus className="h-4 w-4 mr-2" />
            Create Pickup
          </Button>
        </div>
        
        <Card className="border shadow-sm">
          <Tabs 
            defaultValue="upcoming" 
            value={activeTab} 
            onValueChange={setActiveTab} 
            className="w-full"
          >
            <div className="border-b">
              <TabsList className="bg-transparent h-12">
                <TabsTrigger 
                  value="upcoming" 
                  className="data-[state=active]:border-b-2 data-[state=active]:border-orange-500 data-[state=active]:shadow-none rounded-none h-12"
                >
                  Upcoming Pickups
                </TabsTrigger>
                <TabsTrigger 
                  value="history" 
                  className="data-[state=active]:border-b-2 data-[state=active]:border-orange-500 data-[state=active]:shadow-none rounded-none h-12"
                >
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
                  onChange={(e) => setSearchQuery(e.target.value)}
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
                {upcomingPickups.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="bg-gray-100 p-4 rounded-full mb-4">
                      <Package className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-800 mb-2">No upcoming pickups</h3>
                    <p className="text-gray-500 mb-6">You don't have any scheduled pickups at the moment</p>
                    <Button className="bg-orange-500 hover:bg-orange-600">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Order
                    </Button>
                  </div>
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
                          <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Courier</TableHead>
                          <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider text-center">Requested</TableHead>
                          <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider text-center">Picked Up</TableHead>
                          <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider text-center">Validated</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {upcomingPickups.map((pickup) => (
                          <TableRow key={pickup.id} className="hover:bg-gray-50 cursor-pointer">
                            <TableCell>
                              <div className="flex items-center">
                                <span className="font-medium text-blue-600">{pickup.id}</span>
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
                                <div>{pickup.contactPerson}</div>
                                <div className="text-xs text-gray-500">{pickup.contactPhone}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="font-medium">{pickup.pickupDate}</span>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div>{pickup.courier.name}</div>
                                <div className="text-xs text-gray-500">{pickup.courier.phone}</div>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              {pickup.requested ? (
                                <Badge className="bg-green-100 text-green-800 rounded-full px-2">Yes</Badge>
                              ) : (
                                <Badge className="bg-gray-100 text-gray-800 rounded-full px-2">No</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {pickup.pickedUp ? (
                                <Badge className="bg-green-100 text-green-800 rounded-full px-2">Yes</Badge>
                              ) : (
                                <Badge className="bg-gray-100 text-gray-800 rounded-full px-2">No</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {pickup.validated ? (
                                <Badge className="bg-green-100 text-green-800 rounded-full px-2">Yes</Badge>
                              ) : (
                                <Badge className="bg-gray-100 text-gray-800 rounded-full px-2">No</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="history" className="mt-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Pickup ID</TableHead>
                        <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Status</TableHead>
                        <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Location</TableHead>
                        <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Contact Person</TableHead>
                        <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Pickup Date</TableHead>
                        <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Courier</TableHead>
                        <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider text-center">Requested</TableHead>
                        <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider text-center">Picked Up</TableHead>
                        <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider text-center">Validated</TableHead>
                        <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Rating</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {historyPickups.map((pickup) => (
                        <TableRow key={pickup.id} className="hover:bg-gray-50">
                          <TableCell>
                            <div className="flex items-center">
                              <span className="font-medium text-blue-600">{pickup.id}</span>
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
                              <div>{pickup.contactPerson}</div>
                              <div className="text-xs text-gray-500">{pickup.contactPhone}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">{pickup.pickupDate}</span>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div>{pickup.courier.name}</div>
                              <div className="text-xs text-gray-500">{pickup.courier.phone}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            {pickup.requested ? (
                              <Badge className="bg-green-100 text-green-800 rounded-full px-2">Yes</Badge>
                            ) : (
                              <Badge className="bg-gray-100 text-gray-800 rounded-full px-2">No</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {pickup.pickedUp ? (
                              <Badge className="bg-green-100 text-green-800 rounded-full px-2">Yes</Badge>
                            ) : (
                              <Badge className="bg-gray-100 text-gray-800 rounded-full px-2">No</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {pickup.validated ? (
                              <Badge className="bg-green-100 text-green-800 rounded-full px-2">Yes</Badge>
                            ) : (
                              <Badge className="bg-gray-100 text-gray-800 rounded-full px-2">No</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm" className="h-7 text-xs px-3">
                              Rate
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Pickups;
