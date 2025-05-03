
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Filter, Download, Plus } from "lucide-react";

interface CustomerData {
  id: string;
  name: string;
  phone: string;
  location: string;
  address: string;
  orderCount: number;
  totalValueUSD: number;
  totalValueLBP: number | null;
  lastOrderDate: string;
  status: "Active" | "Inactive";
}

const customersData: CustomerData[] = [
  {
    id: "CUST-001",
    name: "Hiba's Bakery",
    phone: "+961 3 123 456",
    location: "Beirut",
    address: "123 Hamra St, Beirut",
    orderCount: 24,
    totalValueUSD: 1250.75,
    totalValueLBP: 19250000,
    lastOrderDate: "May 2, 2025",
    status: "Active"
  },
  {
    id: "CUST-002",
    name: "Café Najjar",
    phone: "+961 1 987 654",
    location: "Tripoli",
    address: "45 Main St, Tripoli",
    orderCount: 18,
    totalValueUSD: 876.50,
    totalValueLBP: null,
    lastOrderDate: "May 1, 2025",
    status: "Active"
  },
  {
    id: "CUST-003",
    name: "Beirut Supermarket",
    phone: "+961 70 123 789",
    location: "Jounieh",
    address: "78 Coastal Rd, Jounieh",
    orderCount: 31,
    totalValueUSD: 2350.25,
    totalValueLBP: 36150000,
    lastOrderDate: "Apr 30, 2025",
    status: "Active"
  },
  {
    id: "CUST-004",
    name: "Aishti Department Store",
    phone: "+961 3 456 789",
    location: "Beirut",
    address: "Downtown, Beirut",
    orderCount: 42,
    totalValueUSD: 4150.00,
    totalValueLBP: 63850000,
    lastOrderDate: "Apr 28, 2025",
    status: "Active"
  },
  {
    id: "CUST-005",
    name: "Cedar Pharmacy",
    phone: "+961 81 234 567",
    location: "Baalbek",
    address: "12 Cedar St, Baalbek",
    orderCount: 8,
    totalValueUSD: 450.25,
    totalValueLBP: 6930000,
    lastOrderDate: "Apr 15, 2025",
    status: "Inactive"
  },
];

const Customers: React.FC = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
            <p className="text-gray-500">View and manage your customer relationships</p>
          </div>
          <Button className="bg-orange-500 hover:bg-orange-600">
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b gap-4">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input 
                  type="text" 
                  placeholder="Search customers..." 
                  className="pl-9 h-10 w-full sm:w-[300px] rounded-md border border-input px-3 py-2 text-sm ring-offset-background" 
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
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

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">
                      Customer Name
                    </TableHead>
                    <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">
                      Phone Number
                    </TableHead>
                    <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">
                      Location
                    </TableHead>
                    <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider text-center">
                      Orders
                    </TableHead>
                    <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider text-right">
                      Total Value
                    </TableHead>
                    <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">
                      Last Order Date
                    </TableHead>
                    <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customersData.map((customer) => (
                    <TableRow 
                      key={customer.id} 
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <TableCell className="font-medium">
                        {customer.name}
                      </TableCell>
                      <TableCell>
                        {customer.phone}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div>{customer.location}</div>
                          <div className="text-xs text-gray-500">{customer.address}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {customer.orderCount}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger className="cursor-help">
                              <span>${customer.totalValueUSD.toFixed(2)}</span>
                            </TooltipTrigger>
                            <TooltipContent className="p-2">
                              <div className="text-xs">
                                <div className="font-semibold">Total Value:</div>
                                <div>${customer.totalValueUSD.toFixed(2)} USD</div>
                                {customer.totalValueLBP !== null && (
                                  <div>{customer.totalValueLBP.toLocaleString()} LBP</div>
                                )}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell>
                        <span className="text-gray-700">{customer.lastOrderDate}</span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`px-2 py-1 rounded-full font-medium text-xs ${
                            customer.status === "Active" 
                              ? "bg-green-100 text-green-800" 
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {customer.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            <div className="bg-white border-t border-gray-200 px-6 py-4 flex justify-between items-center">
              <span className="text-sm text-gray-500">
                Showing <span className="font-medium text-gray-700">1</span> to{" "}
                <span className="font-medium text-gray-700">{customersData.length}</span> of{" "}
                <span className="font-medium text-gray-700">{customersData.length}</span> customers
              </span>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">Previous</Button>
                <Button variant="outline" size="sm">Next</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Customers;
