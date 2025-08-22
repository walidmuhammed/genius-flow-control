import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { useInvoiceWithOrders } from '@/hooks/use-invoices';
import { formatCurrency } from '@/utils/format';
import { Check, Printer } from 'lucide-react';
import { markInvoiceAsPaid } from '@/services/invoice-status';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface InvoiceDetailsModalProps {
  invoiceId: string | null;
  open: boolean;
  onClose: () => void;
}

const InvoiceDetailsModal: React.FC<InvoiceDetailsModalProps> = ({
  invoiceId,
  open,
  onClose,
}) => {
  const { data: invoice, isLoading } = useInvoiceWithOrders(invoiceId);
  const [markingAsPaid, setMarkingAsPaid] = React.useState(false);
  const queryClient = useQueryClient();

  const handleMarkAsPaid = async () => {
    if (!invoiceId) return;
    
    setMarkingAsPaid(true);
    try {
      await markInvoiceAsPaid(invoiceId);
      toast.success('Invoice marked as paid successfully');
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice', invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['filtered-client-payouts'] });
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to mark invoice as paid');
    } finally {
      setMarkingAsPaid(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'Pending': { color: 'bg-yellow-100 text-yellow-800' },
      'In Progress': { color: 'bg-blue-100 text-blue-800' },
      'Paid': { color: 'bg-green-100 text-green-800' },
      'On Hold': { color: 'bg-red-100 text-red-800' }
    };
    
    const config = statusMap[status as keyof typeof statusMap] || statusMap['Pending'];
    
    return (
      <Badge className={config.color}>
        {status}
      </Badge>
    );
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Invoice Details</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center">Loading invoice details...</div>
        ) : invoice ? (
          <div className="space-y-6">
            {/* Invoice Header */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-lg">{invoice.invoice_id}</h3>
                <p className="text-muted-foreground">Invoice ID</p>
              </div>
              <div className="text-right">
                {getStatusBadge(invoice.status)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-medium">{invoice.merchant_name}</p>
                <p className="text-sm text-muted-foreground">Merchant</p>
              </div>
              <div className="text-right">
                <p className="font-medium">
                  {new Date(invoice.created_at).toLocaleDateString()}
                </p>
                <p className="text-sm text-muted-foreground">Created Date</p>
              </div>
            </div>

            <Separator />

            {/* Order Details */}
            <div>
              <h4 className="font-semibold mb-4">Order Details</h4>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Reference</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Package</TableHead>
                          <TableHead>Amount (USD)</TableHead>
                          <TableHead>Amount (LBP)</TableHead>
                          <TableHead>Delivery Fee (USD)</TableHead>
                          <TableHead>Delivery Fee (LBP)</TableHead>
                          <TableHead>Net Payout (USD)</TableHead>
                          <TableHead>Net Payout (LBP)</TableHead>
                        </TableRow>
                      </TableHeader>
                <TableBody>
                  {invoice.orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        #{order.order_id}
                      </TableCell>
                      <TableCell>{order.reference_number}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.customer.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.customer.phone}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p>{order.customer.city_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.customer.governorate_name}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{order.type}</TableCell>
                      <TableCell>{order.package_type}</TableCell>
                      <TableCell>
                        {formatCurrency(order.collected_amount_usd, 'USD')}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(order.collected_amount_lbp, 'LBP')}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(order.delivery_fees_usd, 'USD')}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(order.delivery_fees_lbp, 'LBP')}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(
                          order.collected_amount_usd - order.delivery_fees_usd,
                          'USD'
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(
                          order.collected_amount_lbp - order.delivery_fees_lbp,
                          'LBP'
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                      </TableBody>
                    </Table>
                  </div>
            </div>

            <Separator />

            {/* Invoice Summary */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-semibold mb-3">Invoice Summary</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Total Collected (USD):</span>
                    <span className="font-medium">
                      {formatCurrency(invoice.total_amount_usd, 'USD')}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Total Delivery Fees (USD):</span>
                    <span className="font-medium">
                      {formatCurrency(invoice.total_delivery_usd, 'USD')}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Net Payout (USD):</span>
                    <span>{formatCurrency(invoice.net_payout_usd, 'USD')}</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Total Collected (LBP):</span>
                    <span className="font-medium">
                      {formatCurrency(invoice.total_amount_lbp, 'LBP')}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Total Delivery Fees (LBP):</span>
                    <span className="font-medium">
                      {formatCurrency(invoice.total_delivery_lbp, 'LBP')}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Net Payout (LBP):</span>
                    <span>{formatCurrency(invoice.net_payout_lbp, 'LBP')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => window.print()}
              >
                <Printer className="h-4 w-4 mr-2" />
                Print Invoice
              </Button>
              
              {invoice.status !== 'Paid' && (
                <Button
                  onClick={handleMarkAsPaid}
                  disabled={markingAsPaid}
                >
                  <Check className="h-4 w-4 mr-2" />
                  {markingAsPaid ? 'Marking as Paid...' : 'Mark as Paid'}
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            Invoice not found
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceDetailsModal;