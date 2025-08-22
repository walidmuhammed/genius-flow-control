import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useInvoices } from '@/hooks/use-invoices';
import { formatCurrency } from '@/utils/format';
import { Loader2, Search, Eye, Printer, Receipt } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import InvoiceDetailsModal from '@/components/admin/wallet/InvoiceDetailsModal';

const ClientWallet = () => {
  document.title = "My Invoices - Client Dashboard";
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const { data: invoices = [], isLoading, error } = useInvoices();

  // Filter invoices based on search term
  const filteredInvoices = invoices.filter(invoice =>
    invoice.invoice_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.merchant_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'Pending': { color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      'In Progress': { color: 'bg-blue-100 text-blue-800 border-blue-200' },
      'Paid': { color: 'bg-green-100 text-green-800 border-green-200' },
      'On Hold': { color: 'bg-red-100 text-red-800 border-red-200' }
    };
    
    const config = statusMap[status as keyof typeof statusMap] || statusMap['Pending'];
    
    return (
      <Badge className={`${config.color} border`}>
        {status}
      </Badge>
    );
  };

  const handlePrint = (invoice: any) => {
    // In a real implementation, this would open a print-friendly view
    window.print();
  };

  const handleExport = () => {
    // Create CSV content
    const csvContent = [
      ['Invoice ID', 'Merchant', 'Collected USD', 'Collected LBP', 'Net Payout USD', 'Status', 'Date'].join(','),
      ...filteredInvoices.map(invoice => [
        invoice.invoice_id,
        invoice.merchant_name,
        invoice.total_amount_usd,
        invoice.total_amount_lbp,
        invoice.net_payout_usd,
        invoice.status,
        new Date(invoice.created_at).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'invoices.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-destructive">Error loading invoices: {error.message}</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              My Invoices
            </h1>
            <p className="text-muted-foreground">
              View and manage your payment invoices
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Receipt className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Paid Orders Invoices List
            </CardTitle>
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredInvoices.length === 0 ? (
              <div className="text-center py-12">
                <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No invoices found</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? 'No invoices match your search criteria.' : 'You haven\'t received any invoices yet.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Desktop Table View */}
                <div className="hidden md:block">
                  <div className="border rounded-lg overflow-hidden">
                    <div className="grid grid-cols-7 gap-4 p-4 bg-muted/50 font-medium text-sm">
                      <div>Invoice ID</div>
                      <div>Merchant</div>
                      <div>Collected (USD)</div>
                      <div>Collected (LBP)</div>
                      <div>Net Payout (USD)</div>
                      <div>Status</div>
                      <div>Actions</div>
                    </div>
                    <Separator />
                    {filteredInvoices.map((invoice) => (
                      <motion.div
                        key={invoice.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="grid grid-cols-7 gap-4 p-4 hover:bg-muted/20 transition-colors border-b last:border-b-0"
                      >
                        <div className="font-medium">{invoice.invoice_id}</div>
                        <div>{invoice.merchant_name}</div>
                        <div className="font-medium text-primary">
                          {formatCurrency(invoice.total_amount_usd, 'USD')}
                        </div>
                        <div className="font-medium text-primary">
                          {formatCurrency(invoice.total_amount_lbp, 'LBP')}
                        </div>
                        <div className="font-medium text-green-600">
                          {formatCurrency(invoice.net_payout_usd, 'USD')}
                        </div>
                        <div>{getStatusBadge(invoice.status)}</div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedInvoiceId(invoice.id)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePrint(invoice)}
                          >
                            <Printer className="h-4 w-4 mr-1" />
                            Print
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                  {filteredInvoices.map((invoice) => (
                    <motion.div
                      key={invoice.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-semibold">{invoice.invoice_id}</h3>
                              <p className="text-sm text-muted-foreground">
                                {invoice.merchant_name}
                              </p>
                            </div>
                            {getStatusBadge(invoice.status)}
                          </div>
                          
                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Collected (USD):</span>
                              <span className="font-medium text-primary">
                                {formatCurrency(invoice.total_amount_usd, 'USD')}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Collected (LBP):</span>
                              <span className="font-medium text-primary">
                                {formatCurrency(invoice.total_amount_lbp, 'LBP')}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Net Payout (USD):</span>
                              <span className="font-medium text-green-600">
                                {formatCurrency(invoice.net_payout_usd, 'USD')}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Date:</span>
                              <span className="text-sm">
                                {new Date(invoice.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => setSelectedInvoiceId(invoice.id)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePrint(invoice)}
                            >
                              <Printer className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <InvoiceDetailsModal
          invoiceId={selectedInvoiceId}
          open={!!selectedInvoiceId}
          onClose={() => setSelectedInvoiceId(null)}
        />
      </div>
    </MainLayout>
  );
};

export default ClientWallet;