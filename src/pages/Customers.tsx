
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Filter, Users, Eye, Edit, Phone } from 'lucide-react';
import { useCustomers } from '@/hooks/use-customers';
import { EmptyState } from '@/components/ui/empty-state';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const Customers: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: customers = [], isLoading } = useCustomers();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [customerDetailsOpen, setCustomerDetailsOpen] = useState(false);

  document.title = "Customers - Dashboard";

  // Handle URL parameters for modal opening (from global search)
  useEffect(() => {
    const modal = searchParams.get('modal');
    const id = searchParams.get('id');
    
    if (modal === 'details' && id && customers.length > 0) {
      const customer = customers.find(c => c.id === id);
      if (customer) {
        setSelectedCustomerId(id);
        setCustomerDetailsOpen(true);
        // Clean up URL params
        navigate('/customers', { replace: true });
      } else {
        toast.error('Customer not found');
        navigate('/customers', { replace: true });
      }
    }
  }, [searchParams, customers, navigate]);

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.address?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

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
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            {filteredCustomers.length} Total Customers
          </Badge>
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

        {/* Customers Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>All Customers</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredCustomers.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCustomers.map((customer) => (
                        <TableRow key={customer.id}>
                          <TableCell className="font-medium">
                            {customer.name}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-gray-400" />
                              {customer.phone}
                            </div>
                          </TableCell>
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
                            <span className="text-sm text-gray-600">
                              {customer.address || '-'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => {
                                  setSelectedCustomerId(customer.id);
                                  setCustomerDetailsOpen(true);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <EmptyState
                  icon={Users}
                  title="No customers found"
                  description="No customers match your search criteria."
                />
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Customer Details Modal - Placeholder */}
        {customerDetailsOpen && selectedCustomerId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setCustomerDetailsOpen(false)}>
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-semibold mb-4">Customer Details</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Customer details modal for ID: {selectedCustomerId}
              </p>
              <Button onClick={() => setCustomerDetailsOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Customers;
