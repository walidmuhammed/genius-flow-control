
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Download, Eye, Printer, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useScreenSize } from '@/hooks/useScreenSize';
import { useInvoices, useInvoiceWithOrders } from '@/hooks/use-invoices';
import InvoiceDetailsDialog from '@/components/wallet/InvoiceDetailsDialog';
import { Invoice } from '@/services/invoices';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const Wallet: React.FC = () => {
  const { isMobile, isTablet } = useScreenSize();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  
  const { data: invoices = [], isLoading, error } = useInvoices();
  const { data: selectedInvoice } = useInvoiceWithOrders(selectedInvoiceId);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleInvoiceClick = (invoiceId: string) => {
    setSelectedInvoiceId(invoiceId);
  };

  const handleViewInvoice = (invoiceId: string) => {
    setSelectedInvoiceId(invoiceId);
  };

  const filteredInvoices = invoices.filter(invoice =>
    invoice.invoice_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.merchant_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <MainLayout>
        <div className="space-y-4 md:space-y-6">
          <div>
            <h1 className={cn("font-bold tracking-tight", isMobile ? "text-xl" : "text-2xl")}>Wallet</h1>
            <p className="text-gray-500 text-sm">Manage invoices and payments</p>
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-[#DC291E] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">Loading invoices...</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="space-y-4 md:space-y-6">
          <div>
            <h1 className={cn("font-bold tracking-tight", isMobile ? "text-xl" : "text-2xl")}>Wallet</h1>
            <p className="text-gray-500 text-sm">Manage invoices and payments</p>
          </div>
          <div className="flex justify-center items-center h-64">
            <p className="text-red-500">Error loading invoices. Please try again.</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-4 md:space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className={cn("font-bold tracking-tight", isMobile ? "text-xl" : "text-2xl")}>Wallet</h1>
          <p className="text-gray-500 text-sm">Manage invoices and payments</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="border shadow-sm rounded-2xl overflow-hidden">
            <div className="p-4 border-b bg-gray-50/50 dark:bg-gray-800/50">
              <h2 className={cn("font-semibold", isMobile ? "text-base" : "text-lg")}>Paid Orders Invoices List</h2>
            </div>
            <div className={cn(
              "p-4 border-b bg-white dark:bg-gray-900",
              isMobile ? "flex flex-col gap-3" : "flex flex-row items-center gap-4"
            )}>
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input 
                  placeholder="Search invoices..." 
                  className="pl-10 rounded-xl border-gray-200 dark:border-gray-700"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
              <div className={cn("flex gap-2", isMobile ? "w-full" : "w-auto")}>
                {isMobile && (
                  <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-gray-200 dark:border-gray-700">
                    <Filter className="h-4 w-4" />
                  </Button>
                )}
                <Button variant="outline" className={cn("gap-2 rounded-xl border-gray-200 dark:border-gray-700", isMobile ? "flex-1" : "")}>
                  <Download className="h-4 w-4" /> 
                  {!isMobile && "Export Invoices"}
                  {isMobile && "Export"}
                </Button>
              </div>
            </div>
            
            <CardContent className="p-0">
              {isMobile ? (
                // Mobile invoice cards
                <div className="space-y-4 p-4">
                  {filteredInvoices.map((invoice, index) => (
                    <motion.div 
                      key={invoice.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 active:scale-[0.98]"
                      onClick={() => handleInvoiceClick(invoice.id)}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-blue-600 dark:text-blue-400 truncate">{invoice.invoice_id}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{invoice.merchant_name}</p>
                        </div>
                        <div className="text-right ml-3">
                          <p className="font-medium text-gray-900 dark:text-gray-100">${invoice.total_amount_usd.toFixed(2)}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{format(new Date(invoice.created_at), 'MMM dd')}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">{invoice.total_amount_lbp.toLocaleString()} LBP</p>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600" 
                            onClick={(e) => { e.stopPropagation(); window.print(); }}
                          >
                            <Printer className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600" 
                            onClick={(e) => { e.stopPropagation(); handleViewInvoice(invoice.id); }}
                          >
                            <Eye className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {filteredInvoices.length > 0 && (
                    <motion.div 
                      className="flex items-center justify-between mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-medium text-gray-700 dark:text-gray-300">{filteredInvoices.length}</span> invoices
                      </span>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-xl border-gray-200 dark:border-gray-600">
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-xl border-gray-200 dark:border-gray-600">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </div>
              ) : (
                // Desktop table view
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-800">
                        <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Invoice ID</TableHead>
                        <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Merchant Name</TableHead>
                        <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Amount USD</TableHead>
                        <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Amount LBP</TableHead>
                        <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Creation Date</TableHead>
                        <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInvoices.map((invoice, index) => (
                        <motion.tr 
                          key={invoice.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.03 }}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                          onClick={() => handleInvoiceClick(invoice.id)}
                        >
                          <TableCell className="font-medium text-blue-600 dark:text-blue-400">
                            {invoice.invoice_id}
                          </TableCell>
                          <TableCell>
                            {invoice.merchant_name}
                          </TableCell>
                          <TableCell>
                            ${invoice.total_amount_usd.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            {invoice.total_amount_lbp.toLocaleString()} LBP
                          </TableCell>
                          <TableCell>
                            {format(new Date(invoice.created_at), 'PPP')}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"
                                onClick={(e) => { e.stopPropagation(); window.print(); }}
                              >
                                <Printer className="h-4 w-4 text-gray-600" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"
                                onClick={(e) => { e.stopPropagation(); handleViewInvoice(invoice.id); }}
                              >
                                <Eye className="h-4 w-4 text-gray-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              
              {!isMobile && filteredInvoices.length > 0 && (
                <motion.div 
                  className="p-4 border-t flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <span className="text-sm text-gray-500">
                    Showing <span className="font-medium text-gray-700">{filteredInvoices.length}</span> invoices
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="rounded-xl">Previous</Button>
                    <Button variant="outline" size="sm" className="rounded-xl">Next</Button>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Invoice Details Dialog */}
      <InvoiceDetailsDialog
        invoice={selectedInvoice || null}
        open={!!selectedInvoiceId}
        onOpenChange={(open) => !open && setSelectedInvoiceId(null)}
      />
    </MainLayout>
  );
};

export default Wallet;
