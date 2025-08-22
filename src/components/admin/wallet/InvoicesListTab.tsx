import React, { useState } from 'react';
import { Eye, Printer, DollarSign, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useInvoices, useInvoiceWithOrders } from '@/hooks/use-invoices';
import { markInvoiceAsPaid } from '@/services/invoice-status';
import InvoiceDetailsDialog from '@/components/wallet/InvoiceDetailsDialog';
import { toast } from 'sonner';
import { format } from 'date-fns';

const InvoicesListTab = () => {
  const { data: invoices = [], isLoading } = useInvoices();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const { data: selectedInvoice } = useInvoiceWithOrders(selectedInvoiceId);
  const [markingAsPaid, setMarkingAsPaid] = useState<string | null>(null);

  // Filter invoices based on search
  const filteredInvoices = invoices.filter(invoice => {
    if (!searchTerm) return true;
    
    return (
      invoice.invoice_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.merchant_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleMarkAsPaid = async (invoiceId: string) => {
    try {
      setMarkingAsPaid(invoiceId);
      await markInvoiceAsPaid(invoiceId);
      toast.success('Invoice marked as paid successfully');
    } catch (error) {
      toast.error('Failed to mark invoice as paid');
    } finally {
      setMarkingAsPaid(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'default';
      case 'In Progress':
        return 'secondary';
      case 'Pending':
        return 'outline';
      default:
        return 'outline';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading invoices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Generated Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by invoice ID or merchant name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Merchant</TableHead>
                  <TableHead>Net Payout</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      <span className="font-medium text-blue-600">{invoice.invoice_id}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{invoice.merchant_name}</span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">${invoice.net_payout_usd.toFixed(2)}</div>
                        {invoice.net_payout_lbp > 0 && (
                          <div className="text-sm text-muted-foreground">
                            {invoice.net_payout_lbp.toLocaleString()} LBP
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(invoice.created_at), 'MMM dd, yyyy HH:mm')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(invoice.status || 'Pending')}>
                        {invoice.status || 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedInvoiceId(invoice.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.print()}
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                        {invoice.status !== 'Paid' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkAsPaid(invoice.id)}
                            disabled={markingAsPaid === invoice.id}
                          >
                            <DollarSign className="h-4 w-4 mr-1" />
                            Mark Paid
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredInvoices.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">No invoices found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'No invoices match your search criteria.' : 'No invoices have been generated yet.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoice Details Modal */}
      <InvoiceDetailsDialog
        invoice={selectedInvoice || null}
        open={selectedInvoiceId !== null}
        onOpenChange={(open) => !open && setSelectedInvoiceId(null)}
      />
    </div>
  );
};

export default InvoicesListTab;