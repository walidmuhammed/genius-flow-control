
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

const Wallet: React.FC = () => {
  const { isMobile } = useScreenSize();
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
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">Wallet</h1>
            <p className="text-gray-500">Manage invoices and payments</p>
          </div>
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500">Loading invoices...</p>
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
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">Wallet</h1>
            <p className="text-gray-500">Manage invoices and payments</p>
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
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">Wallet</h1>
          <p className="text-gray-500">Manage invoices and payments</p>
        </div>

        <Card className="border shadow-sm">
          <div className="p-4 border-b">
            <h2 className="text-base md:text-lg font-semibold">Paid Orders Invoices List</h2>
          </div>
          <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 border-b">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input 
                placeholder="Search invoices..." 
                className="pl-10"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              {isMobile && (
                <Button variant="outline" size="icon" className="h-10 w-10">
                  <Filter className="h-4 w-4" />
                </Button>
              )}
              <Button variant="outline" className={`${isMobile ? "flex-1" : ""} gap-2`}>
                <Download className="h-4 w-4" /> {!isMobile && "Export Invoices"}
              </Button>
            </div>
          </div>
          
          <CardContent className="p-0">
            {isMobile ? (
              // Mobile invoice cards
              <div className="space-y-4 p-4">
                {filteredInvoices.map((invoice) => (
                  <div 
                    key={invoice.id} 
                    className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleInvoiceClick(invoice.id)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-medium text-blue-600">{invoice.invoice_id}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{invoice.merchant_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${invoice.total_amount_usd.toFixed(2)}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{format(new Date(invoice.created_at), 'PPP')}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-500">{invoice.total_amount_lbp.toLocaleString()} LBP</p>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => { e.stopPropagation(); window.print(); }}>
                          <Printer className="h-4 w-4 text-gray-600" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => { e.stopPropagation(); handleViewInvoice(invoice.id); }}>
                          <Eye className="h-4 w-4 text-gray-600" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="flex items-center justify-between mt-4">
                  <span className="text-sm text-gray-500">
                    Showing <span className="font-medium text-gray-700">{filteredInvoices.length}</span> invoices
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              // Desktop table view
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                      <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Invoice ID</TableHead>
                      <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Merchant Name</TableHead>
                      <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Amount USD</TableHead>
                      <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Amount LBP</TableHead>
                      <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Creation Date</TableHead>
                      <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map((invoice) => (
                      <TableRow 
                        key={invoice.id} 
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => handleInvoiceClick(invoice.id)}
                      >
                        <TableCell className="font-medium text-blue-600">
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
                              className="h-8 w-8 p-0"
                              onClick={(e) => { e.stopPropagation(); window.print(); }}
                            >
                              <Printer className="h-4 w-4 text-gray-600" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0"
                              onClick={(e) => { e.stopPropagation(); handleViewInvoice(invoice.id); }}
                            >
                              <Eye className="h-4 w-4 text-gray-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            
            {!isMobile && (
              <div className="p-4 border-t flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  Showing <span className="font-medium text-gray-700">{filteredInvoices.length}</span> invoices
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Previous</Button>
                  <Button variant="outline" size="sm">Next</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Add padding at the bottom for mobile to account for the navigation bar */}
      {isMobile && <div className="h-16" />}

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
