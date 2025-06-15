import React, { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Edit, Check, X, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCustomers, useCustomer, useUpdateCustomer } from "@/hooks/use-customers";
import { CustomerWithLocation } from "@/services/customers";
import { formatDate } from "@/utils/format";
import { useOrders } from "@/hooks/use-orders";
import { toast } from "sonner";
import CustomerDetailsModal from "@/components/customers/CustomerDetailsModal";
import CustomerEditForm from "@/components/customers/CustomerEditForm";
import { useScreenSize } from "@/hooks/useScreenSize";
import CustomersTableMobile from "@/components/customers/CustomersTableMobile";
import AddCustomerModal from "@/components/customers/AddCustomerModal";
import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet";
import { Filter } from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader } from "@/components/ui/drawer";
import { filterCustomers } from "@/utils/customerSearch";

interface CustomerFormProps {
  customer: CustomerWithLocation;
  onUpdate: (updates: Partial<CustomerWithLocation>) => void;
  cities: { id: string; name: string; governorate_id: string }[];
  governorates: { id: string; name: string }[];
  isLoading: boolean;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ 
  customer, 
  onUpdate, 
  cities, 
  governorates, 
  isLoading 
}) => {
  const [name, setName] = useState(customer.name);
  const [phone, setPhone] = useState(customer.phone);
  const [secondaryPhone, setSecondaryPhone] = useState(customer.secondary_phone || '');
  const [address, setAddress] = useState(customer.address || '');
  const [cityId, setCityId] = useState(customer.city_id || '');
  const [governorateId, setGovernorateId] = useState(customer.governorate_id || '');
  const [isWorkAddress, setIsWorkAddress] = useState(customer.is_work_address);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      name,
      phone,
      secondary_phone: secondaryPhone || null,
      address: address || null,
      city_id: cityId || null,
      governorate_id: governorateId || null,
      is_work_address: isWorkAddress
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="mt-1"
        />
      </div>
      
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
        <Input
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          className="mt-1"
        />
      </div>
      
      <div>
        <label htmlFor="secondaryPhone" className="block text-sm font-medium text-gray-700">Secondary Phone</label>
        <Input
          id="secondaryPhone"
          value={secondaryPhone}
          onChange={(e) => setSecondaryPhone(e.target.value)}
          className="mt-1"
        />
      </div>
      
      <div>
        <label htmlFor="governorate" className="block text-sm font-medium text-gray-700">Governorate</label>
        <Select value={governorateId} onValueChange={setGovernorateId}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select a governorate" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_none">None</SelectItem>
            {governorates.map(governorate => (
              <SelectItem key={governorate.id} value={governorate.id}>{governorate.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
        <Select value={cityId} onValueChange={setCityId}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select a city" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_none">None</SelectItem>
            {cities
              .filter(city => !governorateId || city.governorate_id === governorateId)
              .map(city => (
                <SelectItem key={city.id} value={city.id}>{city.name}</SelectItem>
              ))
            }
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
        <Input
          id="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="mt-1"
        />
      </div>
      
      <div className="flex items-center">
        <input
          type="checkbox"
          id="isWorkAddress"
          checked={isWorkAddress}
          onChange={(e) => setIsWorkAddress(e.target.checked)}
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
        <label htmlFor="isWorkAddress" className="ml-2 block text-sm text-gray-700">
          Work Address
        </label>
      </div>
      
      <div className="flex justify-end mt-4">
        <Button type="submit" disabled={isLoading} className="bg-[#dc291e]">
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Save Changes
        </Button>
      </div>
    </form>
  );
};

const GOVERNORATES = [
  "Akkar",
  "Baalbek-Hermel",
  "Beirut",
  "Beqaa",
  "Mount Lebanon",
  "North Lebanon",
  "South Lebanon"
];

const Customers: React.FC = () => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [governorateFilter, setGovernorateFilter] = useState<string>("all");
  const [isEditing, setIsEditing] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Fetch data
  const { data: customers = [], isLoading: isLoadingCustomers, error: customersError } = useCustomers();
  const { data: selectedCustomer, isLoading: isLoadingCustomer } = useCustomer(selectedCustomerId || undefined);
  const { data: allOrders = [] } = useOrders();
  const { mutate: updateCustomer, isPending: isUpdating } = useUpdateCustomer();

  // Get customer orders
  const customerOrders = selectedCustomer ? allOrders.filter(
    order => order.customer_id === selectedCustomer.id
  ) : [];

  // Filter customers
  const advancedFilteredCustomers = filterCustomers(
    customers.filter(customer => {
      // Still filter by governorate
      return governorateFilter === "all" || (customer.governorate_name === governorateFilter);
    }),
    searchQuery
  );

  const handleRowClick = (customer: CustomerWithLocation) => {
    setSelectedCustomerId(customer.id);
    setIsEditing(false);
  };

  const closeModal = () => {
    setSelectedCustomerId(null);
    setIsEditing(false);
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleSaveChanges = (updates: Partial<CustomerWithLocation>) => {
    if (selectedCustomerId) {
      updateCustomer(
        { id: selectedCustomerId, updates },
        {
          onSuccess: () => {
            setIsEditing(false);
          }
        }
      );
    }
  };

  // Calculate customer stats
  const calculateCustomerStats = (customerId: string) => {
    const customerOrders = allOrders.filter(order => order.customer_id === customerId);
    
    const orderCount = customerOrders.length;
    
    const totalValueUSD = customerOrders.reduce((total, order) => {
      return total + (Number(order.cash_collection_usd) || 0);
    }, 0);

    const totalValueLBP = customerOrders.reduce((total, order) => {
      return total + (Number(order.cash_collection_lbp) || 0);
    }, 0);

    const lastOrderDate = customerOrders.length > 0 
      ? new Date(Math.max(...customerOrders.map(o => new Date(o.created_at).getTime())))
      : null;

    return {
      orderCount,
      totalValueUSD,
      totalValueLBP: totalValueLBP > 0 ? totalValueLBP : null,
      lastOrderDate: lastOrderDate ? formatDate(lastOrderDate) : 'N/A'
    };
  };

  // Responsive edit mode check (for conditional rendering)
  const { isMobile, isTablet, isDesktop } = useScreenSize();

  // Open/close region filter modal/drawer
  const [isRegionDialogOpen, setIsRegionDialogOpen] = useState(false);

  return (
    <MainLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col gap-2 pb-1 border-b border-gray-100 mb-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight leading-snug">
                Customers
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                View and manage your customer relationships
              </p>
            </div>
            <Button
              className="bg-[#dc291e] w-full sm:w-auto mt-2 sm:mt-0"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
          </div>
        </div>

        {customersError && (
          <div className="p-4 bg-red-50 text-red-700 rounded-md">
            Error loading customers: {(customersError as Error).message}
          </div>
        )}

        <Card>
          <CardContent className="p-0">
            {/* Filter/Search Bar Row */}
            <div className="p-3 flex flex-col sm:flex-row items-stretch border-b gap-3">
              {/* Search bar: full width until filters */}
              <div className="flex w-full">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search customers by name, phone, or location..."
                    className="pl-9 h-10 w-full rounded-md border border-input px-3 py-2 text-sm ring-offset-background"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                  <Search className="absolute left-3 top-[1.375rem] transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" style={{ position: 'absolute' }} />
                </div>
                {/* On desktop, filter button on far right */}
                {!isMobile && (
                  <div className="ml-3 flex-shrink-0 flex items-center">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-10 font-medium text-gray-700 bg-white border-gray-200 whitespace-nowrap"
                      onClick={() => setIsRegionDialogOpen(true)}
                    >
                      <Filter className="h-4 w-4 mr-2 text-[#dc291e]" />
                      Filter by Region
                    </Button>
                  </div>
                )}
              </div>
              {/* On mobile, stack the filter button below search */}
              {isMobile && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-10 mt-2 sm:mt-0 justify-start font-medium text-gray-700 bg-white border-gray-200"
                  onClick={() => setIsDrawerOpen(true)}
                >
                  <Filter className="h-4 w-4 mr-2 text-[#dc291e]" />
                  Filter by Region
                </Button>
              )}
            </div>

            {/* Desktop/Tablet: Region Filter Modal */}
            {!isMobile && (
              <Dialog open={isRegionDialogOpen} onOpenChange={setIsRegionDialogOpen}>
                <DialogContent className="max-w-sm p-0">
                  <DialogHeader>
                    {/* Only show the indicator bar on mobile, not here */}
                    <h2 className="text-lg font-semibold mb-2 w-full text-center">Filter by Region</h2>
                  </DialogHeader>
                  <div className="w-full max-w-md mx-auto px-4 flex flex-col items-stretch gap-2 pb-6">
                    {[{ name: "All Governorates", value: "all" }, ...GOVERNORATES.map(g => ({ name: g, value: g }))].map(opt => (
                      <Button
                        key={opt.value}
                        variant={governorateFilter === opt.value ? "default" : "outline"}
                        className={`w-full text-left justify-start capitalize font-medium ${
                          governorateFilter === opt.value
                            ? "border-[#dc291e] bg-[#dc291e] text-white"
                            : "bg-white text-gray-800"
                        }`}
                        onClick={() => {
                          setGovernorateFilter(opt.value);
                          setIsRegionDialogOpen(false);
                        }}
                      >
                        {opt.name}
                      </Button>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {/* Mobile: Region Filter Drawer */}
            {isMobile && (
              <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                <DrawerContent>
                  <DrawerHeader>
                    {/* Touch indicator bar for mobile */}
                    <div className="w-14 h-1.5 rounded-full bg-gray-300 mb-4 cursor-pointer" />
                    <h2 className="text-lg font-semibold mb-2">Filter by Region</h2>
                  </DrawerHeader>
                  <div className="w-full max-w-md mx-auto px-2 flex flex-col items-stretch gap-2 pb-6">
                    {[{ name: "All Governorates", value: "all" }, ...GOVERNORATES.map(g => ({ name: g, value: g }))].map(opt => (
                      <Button
                        key={opt.value}
                        variant={governorateFilter === opt.value ? "default" : "outline"}
                        className={`w-full text-left justify-start capitalize font-medium ${
                          governorateFilter === opt.value
                            ? "border-[#dc291e] bg-[#dc291e] text-white"
                            : "bg-white text-gray-800"
                        }`}
                        onClick={() => {
                          setGovernorateFilter(opt.value);
                          setIsDrawerOpen(false);
                        }}
                      >
                        {opt.name}
                      </Button>
                    ))}
                  </div>
                </DrawerContent>
              </Drawer>
            )}

            {/* Main data table logic */}
            <div className="overflow-x-auto">
              {(isMobile || isTablet) ? (
                <CustomersTableMobile
                  customers={advancedFilteredCustomers}
                  onCardClick={handleRowClick}
                  calculateCustomerStats={calculateCustomerStats}
                />
              ) : (
                // Existing desktop table
                advancedFilteredCustomers.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-gray-500">No customers found</p>
                  </div>
                ) : (
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
                      {advancedFilteredCustomers.map(customer => {
                        const stats = calculateCustomerStats(customer.id);
                        return (
                          <TableRow 
                            key={customer.id} 
                            className="hover:bg-gray-50 transition-colors cursor-pointer" 
                            onClick={() => handleRowClick(customer)}
                          >
                            <TableCell className="font-medium">
                              {customer.name}
                            </TableCell>
                            <TableCell>
                              {customer.phone}
                            </TableCell>
                            <TableCell>
                              <div>
                                {customer.governorate_name && (
                                  <div className="font-medium text-gray-900">{customer.governorate_name}</div>
                                )}
                                {customer.city_name && (
                                  <div className="text-xs text-gray-500 mt-0.5">{customer.city_name}</div>
                                )}
                                {!customer.governorate_name && !customer.city_name && (
                                  <div className="text-gray-500">No location</div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              {stats.orderCount}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {stats.totalValueUSD > 0 ? (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger className="cursor-help">
                                      <span>${stats.totalValueUSD.toFixed(2)}</span>
                                    </TooltipTrigger>
                                    <TooltipContent className="p-2">
                                      <div className="text-xs">
                                        <div className="font-semibold">Total Value:</div>
                                        <div>${stats.totalValueUSD.toFixed(2)} USD</div>
                                        {stats.totalValueLBP !== null && <div>{stats.totalValueLBP.toLocaleString()} LBP</div>}
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              ) : (
                                <span>$0.00</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <span className="text-gray-700">{stats.lastOrderDate}</span>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )
              )}
            </div>
            
            <div className="bg-white border-t border-gray-200 px-6 py-4 flex justify-between items-center">
              <span className="text-sm text-gray-500">
                Showing <span className="font-medium text-gray-700">{advancedFilteredCustomers.length > 0 ? 1 : 0}</span> to{" "}
                <span className="font-medium text-gray-700">{advancedFilteredCustomers.length}</span> of{" "}
                <span className="font-medium text-gray-700">{advancedFilteredCustomers.length}</span> customers
              </span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled>Previous</Button>
                <Button variant="outline" size="sm" disabled>Next</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer Detail Modal */}
      <CustomerDetailsModal
        open={!!selectedCustomerId}
        onOpenChange={(open) => {
          if (!open) closeModal();
        }}
        title="Customer Details"
        isEditing={isEditing && !isMobile}
      >
        {isLoadingCustomer ? (
          <div className="flex justify-center items-center min-h-[120px]">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : selectedCustomer ? (
          <>
            <div
              className={`${
                isEditing && !isMobile
                  ? "flex justify-center items-start"
                  : "grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"
              }`}
            >
              <div className={isEditing && !isMobile ? "w-full" : ""}>
                <h3 className="text-sm font-medium text-gray-500">Customer Information</h3>
                {isEditing ? (
                  <div className={isMobile ? "mt-2" : "mt-2"}>
                    <CustomerEditForm
                      customer={selectedCustomer}
                      onUpdate={handleSaveChanges}
                      isLoading={isUpdating}
                      onCancel={() => setIsEditing(false)}
                      isHorizontalLayout={!isMobile}
                    />
                  </div>
                ) : (
                  <div className="mt-2 space-y-4">
                    <p className="text-lg font-semibold">{selectedCustomer.name}</p>
                    <p className="text-gray-700">{selectedCustomer.phone}</p>
                    {selectedCustomer.secondary_phone && (
                      <p className="text-gray-700">{selectedCustomer.secondary_phone}</p>
                    )}
                    <p className="text-gray-700">
                      {selectedCustomer.city_name || selectedCustomer.governorate_name || 'No location'}
                      {selectedCustomer.is_work_address && ' (Work Address)'}
                    </p>
                    <p className="text-gray-700">{selectedCustomer.address || 'No address'}</p>
                  </div>
                )}
                <div className="mt-4 flex gap-2">
                  {isEditing ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 py-1 text-sm"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 py-1 text-sm"
                      onClick={handleEditToggle}
                      disabled={isLoadingCustomer}
                    >
                      Edit
                    </Button>
                  )}
                </div>
              </div>
              {/* Hide statistics and orders when editing on desktop */}
              {!isEditing || isMobile ? (
                <>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Order Statistics</h3>
                    <div className="mt-2 space-y-2">
                      {(() => {
                        const stats = calculateCustomerStats(selectedCustomer.id);
                        return (
                          <>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Total Orders:</span>
                              <span className="font-medium">{stats.orderCount}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Total Value (USD):</span>
                              <span className="font-medium">${stats.totalValueUSD.toFixed(2)}</span>
                            </div>
                            {stats.totalValueLBP !== null && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Total Value (LBP):</span>
                                <span className="font-medium">{stats.totalValueLBP.toLocaleString()}</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-gray-600">Last Order:</span>
                              <span className="font-medium">{stats.lastOrderDate}</span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </>
              ) : null}
            </div>
            {/* Recent Orders - hide when editing on desktop */}
            {(!isEditing || isMobile) && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500 mb-3">Recent Orders</h3>
                {customerOrders.length === 0 ? (
                  <div className="text-sm text-gray-500 p-4 text-center border rounded-md">
                    No orders found for this customer
                  </div>
                ) : (
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
                        {customerOrders.slice(0, 5).map(order => (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">{order.reference_number || order.id.substring(0, 8)}</TableCell>
                            <TableCell>{formatDate(new Date(order.created_at))}</TableCell>
                            <TableCell>
                              {order.cash_collection_usd ? `$${Number(order.cash_collection_usd).toFixed(2)}` : ''}
                              {order.cash_collection_usd && order.cash_collection_lbp ? ' / ' : ''}
                              {order.cash_collection_lbp ? `${Number(order.cash_collection_lbp).toLocaleString()} LBP` : ''}
                              {!order.cash_collection_usd && !order.cash_collection_lbp ? 'N/A' : ''}
                            </TableCell>
                            <TableCell>
                              <Badge className={`
                                ${order.status === 'Successful' ? 'bg-green-100 text-green-800' : 
                                  order.status === 'Unsuccessful' ? 'bg-red-100 text-red-800' : 
                                  order.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 
                                  order.status === 'New' ? 'bg-purple-100 text-purple-800' : 
                                  order.status === 'Pending Pickup' ? 'bg-amber-100 text-amber-800' :
                                  order.status === 'Returned' ? 'bg-gray-100 text-gray-800' : 
                                  'bg-gray-100 text-gray-800'}
                                hover:bg-opacity-80
                              `}>
                                {order.status || 'Unknown'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {customerOrders.length > 5 && (
                      <div className="p-2 text-center border-t">
                        <Button variant="ghost" size="sm">
                          View all {customerOrders.length} orders
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-gray-500 min-h-[80px] flex items-center justify-center">
            Customer not found
          </div>
        )}
      </CustomerDetailsModal>

      {/* Add Customer Modal */}
      <AddCustomerModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
      />
    </MainLayout>
  );
};

export default Customers;
