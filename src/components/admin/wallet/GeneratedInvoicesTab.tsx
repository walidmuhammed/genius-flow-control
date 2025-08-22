import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useInvoices } from '@/hooks/use-invoices';
import { formatCurrency } from '@/utils/format';
import { Eye, Check, Printer } from 'lucide-react';
import { markInvoiceAsPaid } from '@/services/invoice-status';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import InvoiceDetailsModal from './InvoiceDetailsModal';

const GeneratedInvoicesTab = () => {
  const { data: invoices = [], isLoading } = useInvoices();
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [markingAsPaid, setMarkingAsPaid] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const handleMarkAsPaid = async (invoiceId: string) => {
    setMarkingAsPaid(invoiceId);
    try {
      await markInvoiceAsPaid(invoiceId);
      toast.success('Invoice marked as paid successfully');
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['filtered-client-payouts'] });
    } catch (error: any) {
      toast.error(error.message || 'Failed to mark invoice as paid');
    } finally {
      setMarkingAsPaid(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'Pending': { variant: 'secondary' as const, color: 'bg-yellow-100 text-yellow-800' },
      'In Progress': { variant: 'default' as const, color: 'bg-blue-100 text-blue-800' },
      'Paid': { variant: 'success' as const, color: 'bg-green-100 text-green-800' },
      'On Hold': { variant: 'destructive' as const, color: 'bg-red-100 text-red-800' }
    };
    
    const config = statusMap[status as keyof typeof statusMap] || statusMap['Pending'];
    
    return (
      <Badge className={config.color}>
        {status}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Generated Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading invoices...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Generated Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No invoices generated yet
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Merchant</TableHead>
                  <TableHead>Amount (USD)</TableHead>
                  <TableHead>Amount (LBP)</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">
                      {invoice.invoice_id}
                    </TableCell>
                    <TableCell>{invoice.merchant_name}</TableCell>
                    <TableCell>
                      {formatCurrency(invoice.net_payout_usd, 'USD')}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(invoice.net_payout_lbp, 'LBP')}
                    </TableCell>
                    <TableCell>
                      {new Date(invoice.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(invoice.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedInvoiceId(invoice.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        
                        {invoice.status !== 'Paid' && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleMarkAsPaid(invoice.id)}
                            disabled={markingAsPaid === invoice.id}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            {markingAsPaid === invoice.id ? 'Marking...' : 'Mark as Paid'}
                          </Button>
                        )}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.print()}
                        >
                          <Printer className="h-4 w-4 mr-1" />
                          Print
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <InvoiceDetailsModal
        invoiceId={selectedInvoiceId}
        open={!!selectedInvoiceId}
        onClose={() => setSelectedInvoiceId(null)}
      />
    </>
  );
};

export default GeneratedInvoicesTab;