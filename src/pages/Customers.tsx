import React, { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Filter, Download, Plus, Edit, Check, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  city: string;
}

// Expanded customer data with recent orders
interface CustomerWithOrders extends CustomerData {
  recentOrders: {
    id: string;
    date: string;
    amount: number;
    status: string;
  }[];
}
const customersData: CustomerWithOrders[] = [{
  id: "CUST-001",
  name: "Hiba's Bakery",
  phone: "+961 3 123 456",
  location: "Beirut",
  address: "123 Hamra St, Beirut",
  orderCount: 24,
  totalValueUSD: 1250.75,
  totalValueLBP: 19250000,
  lastOrderDate: "May 2, 2025",
  status: "Active",
  city: "Beirut",
  recentOrders: [{
    id: "ORD-001",
    date: "May 2, 2025",
    amount: 150.25,
    status: "Delivered"
  }, {
    id: "ORD-002",
    date: "Apr 28, 2025",
    amount: 215.50,
    status: "Delivered"
  }, {
    id: "ORD-003",
    date: "Apr 15, 2025",
    amount: 89.75,
    status: "Delivered"
  }]
}, {
  id: "CUST-002",
  name: "Café Najjar",
  phone: "+961 1 987 654",
  location: "Tripoli",
  address: "45 Main St, Tripoli",
  orderCount: 18,
  totalValueUSD: 876.50,
  totalValueLBP: null,
  lastOrderDate: "May 1, 2025",
  status: "Active",
  city: "North Lebanon",
  recentOrders: [{
    id: "ORD-004",
    date: "May 1, 2025",
    amount: 125.00,
    status: "Delivered"
  }, {
    id: "ORD-005",
    date: "Apr 25, 2025",
    amount: 175.25,
    status: "Delivered"
  }]
}, {
  id: "CUST-003",
  name: "Beirut Supermarket",
  phone: "+961 70 123 789",
  location: "Jounieh",
  address: "78 Coastal Rd, Jounieh",
  orderCount: 31,
  totalValueUSD: 2350.25,
  totalValueLBP: 36150000,
  lastOrderDate: "Apr 30, 2025",
  status: "Active",
  city: "Mount Lebanon",
  recentOrders: [{
    id: "ORD-006",
    date: "Apr 30, 2025",
    amount: 312.50,
    status: "Delivered"
  }, {
    id: "ORD-007",
    date: "Apr 27, 2025",
    amount: 145.75,
    status: "Delivered"
  }, {
    id: "ORD-008",
    date: "Apr 20, 2025",
    amount: 89.25,
    status: "Delivered"
  }]
}, {
  id: "CUST-004",
  name: "Aishti Department Store",
  phone: "+961 3 456 789",
  location: "Beirut",
  address: "Downtown, Beirut",
  orderCount: 42,
  totalValueUSD: 4150.00,
  totalValueLBP: 63850000,
  lastOrderDate: "Apr 28, 2025",
  status: "Active",
  city: "Beirut",
  recentOrders: [{
    id: "ORD-009",
    date: "Apr 28, 2025",
    amount: 527.75,
    status: "Delivered"
  }, {
    id: "ORD-010",
    date: "Apr 22, 2025",
    amount: 318.50,
    status: "Delivered"
  }]
}, {
  id: "CUST-005",
  name: "Cedar Pharmacy",
  phone: "+961 81 234 567",
  location: "Baalbek",
  address: "12 Cedar St, Baalbek",
  orderCount: 8,
  totalValueUSD: 450.25,
  totalValueLBP: 6930000,
  lastOrderDate: "Apr 15, 2025",
  status: "Inactive",
  city: "Baalbek-Hermel",
  recentOrders: [{
    id: "ORD-011",
    date: "Apr 15, 2025",
    amount: 78.25,
    status: "Delivered"
  }]
}];
const Customers: React.FC = () => {
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithOrders | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [isEditing, setIsEditing] = useState(false);
  const [editedCustomer, setEditedCustomer] = useState<CustomerWithOrders | null>(null);
  const filteredCustomers = customersData.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) || customer.phone.includes(searchQuery) || customer.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = cityFilter === "all" || customer.city === cityFilter;
    return matchesSearch && matchesCity;
  });
  const handleRowClick = (customer: CustomerWithOrders) => {
    setSelectedCustomer(customer);
    setEditedCustomer({
      ...customer
    });
    setIsEditing(false);
  };
  const closeModal = () => {
    setSelectedCustomer(null);
    setEditedCustomer(null);
    setIsEditing(false);
  };
  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };
  const handleSaveChanges = () => {
    if (editedCustomer) {
      // Here you would typically save changes to your backend
      // For this demo, we're just updating the local state
      const updatedCustomers = customersData.map(c => c.id === editedCustomer.id ? editedCustomer : c);

      // Update the selected customer to show the changes
      setSelectedCustomer(editedCustomer);
      setIsEditing(false);
      console.log('Customer updated:', editedCustomer);
    }
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editedCustomer) return;
    setEditedCustomer({
      ...editedCustomer,
      [e.target.name]: e.target.value
    });
  };
  const handleCityChange = (city: string) => {
    if (!editedCustomer) return;
    setEditedCustomer({
      ...editedCustomer,
      city
    });
  };
  return <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
            <p className="text-gray-500">View and manage your customer relationships</p>
          </div>
          <Button className="bg-[#dc291e]">
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b gap-4">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input type="text" placeholder="Search customers..." className="pl-9 h-10 w-full sm:w-[300px] rounded-md border border-input px-3 py-2 text-sm ring-offset-background" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <div className="relative w-full sm:w-[200px]">
                  <Select value={cityFilter} onValueChange={setCityFilter}>
                    <SelectTrigger className="h-10 w-full border-input">
                      <SelectValue placeholder="Filter by city" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Cities</SelectItem>
                      <SelectItem value="Beirut">Beirut</SelectItem>
                      <SelectItem value="Mount Lebanon">Mount Lebanon</SelectItem>
                      <SelectItem value="North Lebanon">North Lebanon</SelectItem>
                      <SelectItem value="Akkar">Akkar</SelectItem>
                      <SelectItem value="Beqaa">Beqaa</SelectItem>
                      <SelectItem value="Baalbek-Hermel">Baalbek-Hermel</SelectItem>
                      <SelectItem value="South Lebanon">South Lebanon</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map(customer => <TableRow key={customer.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => handleRowClick(customer)}>
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
                                {customer.totalValueLBP !== null && <div>{customer.totalValueLBP.toLocaleString()} LBP</div>}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell>
                        <span className="text-gray-700">{customer.lastOrderDate}</span>
                      </TableCell>
                    </TableRow>)}
                </TableBody>
              </Table>
            </div>
            
            <div className="bg-white border-t border-gray-200 px-6 py-4 flex justify-between items-center">
              <span className="text-sm text-gray-500">
                Showing <span className="font-medium text-gray-700">1</span> to{" "}
                <span className="font-medium text-gray-700">{filteredCustomers.length}</span> of{" "}
                <span className="font-medium text-gray-700">{filteredCustomers.length}</span> customers
              </span>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">Previous</Button>
                <Button variant="outline" size="sm">Next</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer Detail Modal */}
      <Dialog open={!!selectedCustomer} onOpenChange={open => !open && closeModal()}>
        <DialogContent className="sm:max-w-[600px] p-0">
          <DialogHeader className="px-6 py-4 border-b flex flex-row justify-between items-center">
            <DialogTitle className="text-xl font-semibold">Customer Details</DialogTitle>
            <div className="flex items-center gap-2">
              {isEditing ? <>
                  <Button variant="outline" size="sm" className="h-8 px-3 py-1 text-sm" onClick={() => {
                setIsEditing(false);
                setEditedCustomer(selectedCustomer);
              }}>
                    <X className="h-4 w-4 mr-1" /> Cancel
                  </Button>
                  <Button size="sm" className="h-8 px-3 py-1 text-sm bg-[#46d483] hover:bg-[#3bb36e]" onClick={handleSaveChanges}>
                    <Check className="h-4 w-4 mr-1" /> Save Changes
                  </Button>
                </> : <Button variant="outline" size="sm" className="h-8 px-3 py-1 text-sm" onClick={handleEditToggle}>
                  <Edit className="h-4 w-4 mr-1" /> Edit
                </Button>}
            </div>
          </DialogHeader>
          
          {selectedCustomer && editedCustomer && <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Customer Information</h3>
                  <div className="mt-2 space-y-4">
                    {isEditing ? <>
                        <div>
                          <label htmlFor="name" className="block text-xs text-gray-500 mb-1">Customer Name</label>
                          <Input id="name" name="name" value={editedCustomer.name} onChange={handleInputChange} className="h-9" />
                        </div>
                        <div>
                          <label htmlFor="phone" className="block text-xs text-gray-500 mb-1">Phone Number</label>
                          <Input id="phone" name="phone" value={editedCustomer.phone} onChange={handleInputChange} className="h-9" />
                        </div>
                        <div>
                          <label htmlFor="city" className="block text-xs text-gray-500 mb-1">City</label>
                          <Select value={editedCustomer.city} onValueChange={handleCityChange}>
                            <SelectTrigger id="city" className="h-9">
                              <SelectValue placeholder="Select city" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Beirut">Beirut</SelectItem>
                              <SelectItem value="Mount Lebanon">Mount Lebanon</SelectItem>
                              <SelectItem value="North Lebanon">North Lebanon</SelectItem>
                              <SelectItem value="Akkar">Akkar</SelectItem>
                              <SelectItem value="Beqaa">Beqaa</SelectItem>
                              <SelectItem value="Baalbek-Hermel">Baalbek-Hermel</SelectItem>
                              <SelectItem value="South Lebanon">South Lebanon</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label htmlFor="address" className="block text-xs text-gray-500 mb-1">Address</label>
                          <Input id="address" name="address" value={editedCustomer.address} onChange={handleInputChange} className="h-9" />
                        </div>
                      </> : <>
                        <p className="text-lg font-semibold">{selectedCustomer.name}</p>
                        <p className="text-gray-700">{selectedCustomer.phone}</p>
                        <p className="text-gray-700">{selectedCustomer.city}</p>
                        <p className="text-gray-700">{selectedCustomer.address}</p>
                      </>}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Order Statistics</h3>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Orders:</span>
                      <span className="font-medium">{selectedCustomer.orderCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Value (USD):</span>
                      <span className="font-medium">${selectedCustomer.totalValueUSD.toFixed(2)}</span>
                    </div>
                    {selectedCustomer.totalValueLBP !== null && <div className="flex justify-between">
                        <span className="text-gray-600">Total Value (LBP):</span>
                        <span className="font-medium">{selectedCustomer.totalValueLBP.toLocaleString()}</span>
                      </div>}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Order:</span>
                      <span className="font-medium">{selectedCustomer.lastOrderDate}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500 mb-3">Recent Orders</h3>
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="text-xs">Order ID</TableHead>
                        <TableHead className="text-xs">Date</TableHead>
                        <TableHead className="text-xs">Amount</TableHead>
                        <TableHead className="text-xs">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedCustomer.recentOrders.map(order => <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.id}</TableCell>
                          <TableCell>{order.date}</TableCell>
                          <TableCell>${order.amount.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                              {order.status}
                            </Badge>
                          </TableCell>
                        </TableRow>)}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>}
        </DialogContent>
      </Dialog>
    </MainLayout>;
};
export default Customers;