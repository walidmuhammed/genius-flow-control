
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Search, Filter, User } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useCustomers } from '@/hooks/use-customers';
import { useOrders } from '@/hooks/use-orders';
import { EmptyState } from '@/components/ui/empty-state';
import { useScreenSize } from '@/hooks/useScreenSize';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { CustomerWithLocation } from '@/services/customers';
import CustomersTableMobile from '@/components/customers/CustomersTableMobile';
import CustomerDetailsModal from '@/components/customers/CustomerDetailsModal';
import AddCustomerModal from '@/components/customers/AddCustomerModal';

const Customers: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isMobile } = useScreenSize();
  const { data: customers = [], isLoading } = useCustomers();
  const { data: orders = [] } = useOrders();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithLocation | null>(null);
  const [customerDetailsOpen, setCustomerDetailsOpen] = useState(false);
  const [addCustomerModalOpen, setAddCustomerModalOpen] = useState(false);

  document.title = "Customers - Dashboard";

  // Handle URL parameters for modal opening (from global search)
  useEffect(() => {
    const modal = searchParams.get('modal');
    const id = searchParams.get('id');
    
    if (modal === 'details' && id && customers.length > 0) {
      const customer = customers.find(c => c.id === id);
      if (customer) {
        setSelectedCustomer(customer);
        setCustomerDetailsOpen(true);
        // Clean up URL params
        navigate('/customers', { replace: true });
      } else {
        toast.error('Customer not found');
        navigate('/customers', { replace: true });
      }
    }
  }, [searchParams, customers, navigate]);

  // Calculate customer statistics
  const calculateCustomerStats = (customerId: string) => {
    const customerOrders = orders.filter(order => order.customer?.id === customerId);
    
    const orderCount = customerOrders.length;
    const totalValueUSD = customerOrders.reduce((sum, order) => 
      sum + (order.cash_collection_usd || 0) + (order.delivery_fees_usd || 0), 0
    );
    const totalValueLBP = customerOrders.reduce((sum, order) => 
      sum + (order.cash_collection_lbp || 0) + (order.delivery_fees_lbp || 0), 0
    );
    
    const lastOrder = customerOrders.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0];
    
    const lastOrderDate = lastOrder 
      ? new Date(lastOrder.created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })
      : 'No orders';

    return {
      orderCount,
      totalValueUSD,
      totalValueLBP: totalValueLBP > 0 ? totalValueLBP : null,
      lastOrderDate
    };
  };

  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           customer.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           customer.address?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [customers, searchTerm]);

  const handleCustomerClick = (customer: CustomerWithLocation) => {
    setSelectedCustomer(customer);
    setCustomerDetailsOpen(true);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
          <Card className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-64 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div 
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Customers
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your customer database
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {filteredCustomers.length} Total Customers
            </Badge>
            <Button 
              className="bg-[#DC291E] hover:bg-[#c0211a] text-white"
              onClick={() => setAddCustomerModalOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
          </div>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, phone, or address..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Customers Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          {filteredCustomers.length > 0 ? (
            isMobile ? (
              <CustomersTableMobile
                customers={filteredCustomers}
                onCardClick={handleCustomerClick}
                calculateCustomerStats={calculateCustomerStats}
              />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>All Customers</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Orders</TableHead>
                          <TableHead>Total Value</TableHead>
                          <TableHead>Last Order</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCustomers.map((customer) => {
                          const stats = calculateCustomerStats(customer.id);
                          return (
                            <TableRow 
                              key={customer.id}
                              className="cursor-pointer hover:bg-gray-50"
                              onClick={() => handleCustomerClick(customer)}
                            >
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 bg-[#DC291E]/10 text-[#DC291E] rounded-full flex items-center justify-center">
                                    <User className="h-4 w-4" />
                                  </div>
                                  {customer.name}
                                </div>
                              </TableCell>
                              <TableCell>{customer.phone}</TableCell>
                              <TableCell>
                                <div className="flex flex-col">
                                  {customer.governorate_name && (
                                    <span className="font-medium text-gray-900">{customer.governorate_name}</span>
                                  )}
                                  {customer.city_name && (
                                    <span className="text-xs text-gray-500 mt-0.5">{customer.city_name}</span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                  {stats.orderCount}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="font-semibold">${stats.totalValueUSD.toFixed(2)}</span>
                                  {stats.totalValueLBP && (
                                    <span className="text-xs text-gray-500">
                                      {stats.totalValueLBP.toLocaleString()} LBP
                                    </span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-sm text-gray-600">
                                {stats.lastOrderDate}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )
          ) : (
            <Card>
              <CardContent className="p-8">
                <EmptyState
                  icon={User}
                  title="No customers found"
                  description="No customers match your search criteria."
                  actionLabel="Add Customer"
                  onAction={() => setAddCustomerModalOpen(true)}
                />
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Customer Details Modal */}
        <CustomerDetailsModal
          open={customerDetailsOpen}
          onOpenChange={setCustomerDetailsOpen}
          title={selectedCustomer ? `${selectedCustomer.name}` : 'Customer Details'}
        >
          {selectedCustomer && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="text-lg font-semibold">{selectedCustomer.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="text-lg">{selectedCustomer.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Location</label>
                  <p className="text-lg">
                    {selectedCustomer.governorate_name && selectedCustomer.city_name
                      ? `${selectedCustomer.governorate_name} - ${selectedCustomer.city_name}`
                      : 'No location set'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Address</label>
                  <p className="text-lg">{selectedCustomer.address || 'No address provided'}</p>
                </div>
              </div>
              
              {(() => {
                const stats = calculateCustomerStats(selectedCustomer.id);
                return (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-[#DC291E]">{stats.orderCount}</p>
                      <p className="text-sm text-gray-500">Total Orders</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">${stats.totalValueUSD.toFixed(2)}</p>
                      <p className="text-sm text-gray-500">Total Value (USD)</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold">{stats.lastOrderDate}</p>
                      <p className="text-sm text-gray-500">Last Order</p>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </CustomerDetailsModal>

        {/* Add Customer Modal */}
        <AddCustomerModal
          open={addCustomerModalOpen}
          onOpenChange={setAddCustomerModalOpen}
        />
      </div>
    </MainLayout>
  );
};

export default Customers;
