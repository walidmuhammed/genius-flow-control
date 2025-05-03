
import React, { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Package, Search, Filter, Download, Clock, Plus, Note } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";

const EmptyPickupsState = () => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center mb-6">
      <Package className="w-10 h-10 text-orange-500" />
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-2">No upcoming pickups</h3>
    <p className="text-gray-500 max-w-md mb-6">
      You don't have any scheduled pickups coming up. Create a new order to schedule a pickup.
    </p>
    <Button className="bg-orange-500 hover:bg-orange-600">
      <Plus className="w-4 h-4 mr-2" />
      Create Order
    </Button>
  </div>
);

const PickupHistoryTable = ({ pickups }: { pickups: PickupData[] }) => (
  <div className="rounded-lg border border-gray-200 shadow-sm overflow-hidden bg-white">
    <div className="p-4 flex justify-between items-center border-b border-gray-200">
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search pickups..." 
            className="pl-9 h-10 w-full md:w-[300px] rounded-md border border-input px-3 py-2 text-sm ring-offset-background" 
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span>Filter</span>
        </Button>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          <span>Export</span>
        </Button>
      </div>
    </div>
    <Table>
      <TableHeader>
        <TableRow className="bg-gray-50 hover:bg-gray-50">
          <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">
            Pickup ID
          </TableHead>
          <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">
            Status
          </TableHead>
          <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">
            Location
          </TableHead>
          <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">
            Contact Person
          </TableHead>
          <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">
            Picked Up Date
          </TableHead>
          <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">
            Courier
          </TableHead>
          <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider text-center">
            Requested
          </TableHead>
          <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider text-center">
            Picked Up
          </TableHead>
          <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider text-center">
            Validated
          </TableHead>
          <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider text-center">
            Rating
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {pickups.map((pickup) => (
          <TableRow key={pickup.id} className="hover:bg-gray-50 transition-colors">
            <TableCell className="font-medium">
              <div className="flex items-center gap-1.5">
                <a href="#" className="text-blue-600 hover:underline">
                  {pickup.id}
                </a>
                {pickup.hasNote && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="text-gray-400 hover:text-gray-600">
                          <Note className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="w-80 p-4 bg-white shadow-lg rounded-lg border">
                        <div className="font-medium mb-1">Pickup Note</div>
                        <p className="text-sm text-gray-500">{pickup.note}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </TableCell>
            <TableCell>
              <Badge
                className={`px-2 py-1 rounded-full font-medium text-xs ${
                  pickup.status === "Completed" 
                    ? "bg-green-100 text-green-800" 
                    : pickup.status === "In Progress" 
                    ? "bg-orange-100 text-orange-800"
                    : pickup.status === "Scheduled"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {pickup.status}
              </Badge>
            </TableCell>
            <TableCell>
              <div>
                <div className="font-medium">{pickup.location}</div>
                <div className="text-xs text-gray-500">{pickup.address}</div>
              </div>
            </TableCell>
            <TableCell>
              <div>
                <div className="font-medium">{pickup.contactName}</div>
                <div className="text-xs text-gray-500">{pickup.contactPhone}</div>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span>{pickup.date}</span>
              </div>
            </TableCell>
            <TableCell>
              <div>
                <div className="font-medium">{pickup.courierName}</div>
                <div className="text-xs text-gray-500">{pickup.courierPhone}</div>
              </div>
            </TableCell>
            <TableCell className="text-center">
              <span className={pickup.requested ? "text-green-600 font-medium" : "text-gray-400"}>
                {pickup.requested ? "Y" : "N"}
              </span>
            </TableCell>
            <TableCell className="text-center">
              <span className={pickup.pickedUp ? "text-green-600 font-medium" : "text-gray-400"}>
                {pickup.pickedUp ? "Y" : "N"}
              </span>
            </TableCell>
            <TableCell className="text-center">
              <span className={pickup.validated ? "text-green-600 font-medium" : "text-gray-400"}>
                {pickup.validated ? "Y" : "N"}
              </span>
            </TableCell>
            <TableCell className="text-center">
              <Button 
                disabled={pickup.rated} 
                variant="outline" 
                size="sm" 
                className="text-xs h-7"
              >
                {pickup.rated ? "Rated" : "Rate"}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
    <div className="bg-white border-t border-gray-200 px-6 py-4">
      <div className="text-sm text-gray-500">
        Showing <span className="font-medium text-gray-700">1</span> to{" "}
        <span className="font-medium text-gray-700">{pickups.length}</span> of{" "}
        <span className="font-medium text-gray-700">{pickups.length}</span> pickups
      </div>
    </div>
  </div>
);

interface PickupData {
  id: string;
  status: string;
  location: string;
  address: string;
  contactName: string;
  contactPhone: string;
  date: string;
  courierName: string;
  courierPhone: string;
  requested: boolean;
  pickedUp: boolean;
  validated: boolean;
  rated: boolean;
  hasNote: boolean;
  note?: string;
}

const pickupHistoryData: PickupData[] = [
  {
    id: "PKP-12345",
    status: "Completed",
    location: "Beirut Central",
    address: "123 Main St, Beirut",
    contactName: "John Smith",
    contactPhone: "+961 3 123 456",
    date: "May 2, 2025",
    courierName: "Ali Hassan",
    courierPhone: "+961 71 987 654",
    requested: true,
    pickedUp: true,
    validated: true,
    rated: true,
    hasNote: true,
    note: "Customer prefers afternoon delivery. Gate code is 1234."
  },
  {
    id: "PKP-12346",
    status: "In Progress",
    location: "Tripoli Branch",
    address: "456 North St, Tripoli",
    contactName: "Sara Khoury",
    contactPhone: "+961 3 234 567",
    date: "May 1, 2025",
    courierName: "Mohammad Nassar",
    courierPhone: "+961 71 876 543",
    requested: true,
    pickedUp: true,
    validated: false,
    rated: false,
    hasNote: false
  },
  {
    id: "PKP-12347",
    status: "Scheduled",
    location: "Sidon Mall",
    address: "789 Beach Rd, Sidon",
    contactName: "Rami Jaber",
    contactPhone: "+961 3 345 678",
    date: "Apr 30, 2025",
    courierName: "Hassan Ibrahim",
    courierPhone: "+961 71 765 432",
    requested: true,
    pickedUp: false,
    validated: false,
    rated: false,
    hasNote: true,
    note: "Special instructions: Call before arrival. Package requires refrigeration."
  }
];

const Pickups: React.FC = () => {
  const [activeTab, setActiveTab] = useState("upcoming");
  const hasUpcomingPickups = false;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Pickups</h1>
            <p className="text-gray-500">Manage and track all your pickup activities</p>
          </div>
          <Button className="bg-orange-500 hover:bg-orange-600">
            <Plus className="h-4 w-4 mr-2" />
            Schedule Pickup
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <Tabs 
              defaultValue="upcoming" 
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <div className="border-b px-6 pt-4">
                <TabsList className="bg-transparent p-0 mb-0 h-auto">
                  <TabsTrigger 
                    value="upcoming"
                    className="py-3 px-4 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-orange-500 data-[state=active]:text-gray-900 rounded-none"
                  >
                    Upcoming Pickups
                  </TabsTrigger>
                  <TabsTrigger 
                    value="history"
                    className="py-3 px-4 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-orange-500 data-[state=active]:text-gray-900 rounded-none"
                  >
                    History Pickups
                  </TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="upcoming" className="m-0">
                {!hasUpcomingPickups ? (
                  <EmptyPickupsState />
                ) : (
                  <div className="p-6">Upcoming pickups content</div>
                )}
              </TabsContent>
              <TabsContent value="history" className="m-0 p-6">
                <PickupHistoryTable pickups={pickupHistoryData} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Pickups;
