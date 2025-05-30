
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
import { useScreenSize } from '@/hooks/useScreenSize';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const Pickups: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const { isMobile, isTablet } = useScreenSize();

  // Fetch real pickup data
  const { data: allPickups, isLoading, error } = usePickups();
  const { data: scheduledPickups } = usePickupsByStatus('Scheduled');
  const { data: inProgressPickups } = usePickupsByStatus('In Progress');
  const { data: completedPickups } = usePickupsByStatus('Completed');
  const { data: canceledPickups } = usePickupsByStatus('Canceled');

  const upcomingPickups = [...(scheduledPickups || []), ...(inProgressPickups || [])];
  const historyPickups = [...(completedPickups || []), ...(canceledPickups || [])];

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1.5 rounded-full text-xs font-medium";
    switch (status) {
      case 'Scheduled':
        return <Badge className={`${baseClasses} bg-blue-50 text-blue-700 border-blue-200`}>Scheduled</Badge>;
      case 'In Progress':
        return <Badge className={`${baseClasses} bg-yellow-50 text-yellow-700 border-yellow-200`}>In Progress</Badge>;
      case 'Completed':
        return <Badge className={`${baseClasses} bg-green-50 text-green-700 border-green-200`}>Completed</Badge>;
      case 'Canceled':
        return <Badge className={`${baseClasses} bg-red-50 text-red-700 border-red-200`}>Canceled</Badge>;
      default:
        return <Badge className={`${baseClasses} bg-gray-50 text-gray-700 border-gray-200`}>{status}</Badge>;
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const renderMobilePickupCard = (pickup: any) => (
    <motion.div
      key={pickup.id}
      className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 space-y-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-blue-600 dark:text-blue-400">{pickup.pickup_id}</span>
            {pickup.note && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <FileText className="h-4 w-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs p-3">
                    <p className="text-sm">{pickup.note}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{pickup.location}</p>
        </div>
        {getStatusBadge(pickup.status)}
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Contact:</span>
          <span className="font-medium">{pickup.contact_person}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Date:</span>
          <span className="font-medium">{formatDate(pickup.pickup_date)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Orders:</span>
          <Badge variant="outline" className="text-xs">{pickup.orders_count || 0} orders</Badge>
        </div>
      </div>
    </motion.div>
  );

  if (isLoading) {
    return (
      <MainLayout>
        <motion.div 
          className="flex items-center justify-center h-64"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#DC291E] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading pickups...</p>
          </div>
        </motion.div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <motion.div 
          className={cn(
            "flex justify-between items-start gap-4",
            isMobile ? "flex-col" : "flex-row items-center"
          )}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className={cn(isMobile && "w-full")}>
            <h1 className={cn(
              "font-bold tracking-tight text-gray-900 dark:text-gray-100",
              isMobile ? "text-xl" : "text-2xl"
            )}>
              Pickups
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Schedule and manage your pickup requests
            </p>
          </div>
          <Button 
            className={cn(
              "bg-[#DC291E] hover:bg-[#c0211a] text-white rounded-xl shadow-sm",
              isMobile && "w-full"
            )}
            onClick={() => navigate('/pickups/new')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Schedule Pickup
          </Button>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="border border-gray-200 dark:border-gray-700 shadow-sm rounded-2xl overflow-hidden">
            <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <TabsList className="bg-transparent h-14 w-full justify-start px-6">
                  <TabsTrigger 
                    value="upcoming" 
                    className={cn(
                      "data-[state=active]:border-b-2 data-[state=active]:border-[#DC291E] data-[state=active]:shadow-none rounded-none h-12 px-6",
                      "data-[state=active]:bg-transparent data-[state=active]:text-[#DC291E]"
                    )}
                  >
                    Upcoming Pickups
                  </TabsTrigger>
                  <TabsTrigger 
                    value="history" 
                    className={cn(
                      "data-[state=active]:border-b-2 data-[state=active]:border-[#DC291E] data-[state=active]:shadow-none rounded-none h-12 px-6",
                      "data-[state=active]:bg-transparent data-[state=active]:text-[#DC291E]"
                    )}
                  >
                    History
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <div className="p-4 flex items-center gap-4 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input 
                    placeholder="Search pickups by ID, location, or contact..." 
                    value={searchQuery} 
                    onChange={e => setSearchQuery(e.target.value)} 
                    className="pl-10 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-[#DC291E] focus:border-[#DC291E]" 
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-gray-200 dark:border-gray-700">
                    <Filter className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-gray-200 dark:border-gray-700">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <CardContent className="p-0">
                <TabsContent value="upcoming" className="mt-0">
                  {filteredUpcoming.length === 0 ? (
                    <div className="p-8">
                      <EmptyState
                        icon={Package}
                        title="No upcoming pickups"
                        description="You don't have any scheduled pickups at the moment"
                        actionLabel="Schedule Pickup"
                        onAction={() => navigate('/pickups/new')}
                      />
                    </div>
                  ) : (
                    <div className="p-4">
                      {isMobile ? (
                        <div className="space-y-4">
                          {filteredUpcoming.map(renderMobilePickupCard)}
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/50">
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
                                <TableRow key={pickup.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors">
                                  <TableCell>
                                    <div className="flex items-center">
                                      <span className="font-medium text-blue-600 dark:text-blue-400">{pickup.pickup_id}</span>
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
                                      <div className="text-xs text-gray-500 dark:text-gray-400">{pickup.address}</div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div>
                                      <div>{pickup.contact_person}</div>
                                      <div className="text-xs text-gray-500 dark:text-gray-400">{pickup.contact_phone}</div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <span className="font-medium">
                                      {formatDate(pickup.pickup_date)}
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className="rounded-full">{pickup.orders_count || 0} orders</Badge>
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
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="history" className="mt-0">
                  {filteredHistory.length === 0 ? (
                    <div className="p-8">
                      <EmptyState
                        icon={Package}
                        title="No pickup history"
                        description="You haven't completed any pickups yet"
                      />
                    </div>
                  ) : (
                    <div className="p-4">
                      {isMobile ? (
                        <div className="space-y-4">
                          {filteredHistory.map(renderMobilePickupCard)}
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/50">
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
                                <TableRow key={pickup.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                  <TableCell>
                                    <div className="flex items-center">
                                      <span className="font-medium text-blue-600 dark:text-blue-400">{pickup.pickup_id}</span>
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
                                      <div className="text-xs text-gray-500 dark:text-gray-400">{pickup.address}</div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div>
                                      <div>{pickup.contact_person}</div>
                                      <div className="text-xs text-gray-500 dark:text-gray-400">{pickup.contact_phone}</div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <span className="font-medium">
                                      {formatDate(pickup.pickup_date)}
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className="rounded-full">{pickup.orders_count || 0} orders</Badge>
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
                    </div>
                  )}
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default Pickups;
