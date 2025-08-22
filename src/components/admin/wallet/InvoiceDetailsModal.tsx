import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useInvoiceWithOrders } from '@/hooks/use-invoices';
import { formatCurrency } from '@/utils/format';
import { Check, Printer, Package, MapPin, User, DollarSign } from 'lucide-react';
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
      'Pending': { color: 'bg-warning/10 text-warning border-warning/20' },
      'In Progress': { color: 'bg-primary/10 text-primary border-primary/20' },
      'Paid': { color: 'bg-success/10 text-success border-success/20' },
      'On Hold': { color: 'bg-destructive/10 text-destructive border-destructive/20' }
    };
    
    const config = statusMap[status as keyof typeof statusMap] || statusMap['Pending'];
    
    return (
      <Badge className={`${config.color} border`}>
        {status}
      </Badge>
    );
  };

  // Calculate totals for verification
  const calculateTotals = () => {
    if (!invoice?.orders) return null;
    
    const totals = invoice.orders.reduce((acc, order) => ({
      collectedUSD: acc.collectedUSD + Number(order.collected_amount_usd || 0),
      collectedLBP: acc.collectedLBP + Number(order.collected_amount_lbp || 0),
      deliveryUSD: acc.deliveryUSD + Number(order.delivery_fees_usd || 0),
      deliveryLBP: acc.deliveryLBP + Number(order.delivery_fees_lbp || 0),
    }), { collectedUSD: 0, collectedLBP: 0, deliveryUSD: 0, deliveryLBP: 0 });

    return {
      ...totals,
      netPayoutUSD: totals.collectedUSD - totals.deliveryUSD,
      netPayoutLBP: totals.collectedLBP - totals.deliveryLBP,
    };
  };

  const totals = calculateTotals();

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold">
                {invoice?.invoice_id || 'Invoice Details'}
              </DialogTitle>
              <p className="text-muted-foreground">
                View detailed breakdown of invoice items
              </p>
            </div>
            {invoice && getStatusBadge(invoice.status)}
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-140px)]">
          <div className="p-6">
            {isLoading ? (
              <div className="py-12 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading invoice details...</p>
              </div>
            ) : invoice ? (
              <div className="space-y-6">
                {/* Invoice Header */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Invoice Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Merchant</p>
                        <p className="font-semibold">{invoice.merchant_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Created Date</p>
                        <p className="font-semibold">
                          {new Date(invoice.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Orders</p>
                        <p className="font-semibold">{invoice.orders?.length || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Order Details - Responsive Cards */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Order Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {invoice.orders?.map((order, index) => (
                        <Card key={order.id} className="border-l-4 border-l-primary/20">
                          <CardContent className="p-4">
                            {/* Mobile-First Responsive Layout */}
                            <div className="space-y-4">
                              {/* Order Header */}
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold">Order #{order.order_id}</h4>
                                  <Badge variant="outline" className="text-xs">
                                    {order.type}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {order.reference_number}
                                </p>
                              </div>

                              {/* Customer & Location */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex items-start gap-2">
                                  <User className="h-4 w-4 mt-1 text-muted-foreground" />
                                  <div>
                                    <p className="font-medium text-sm">{order.customer.name}</p>
                                    <p className="text-xs text-muted-foreground">{order.customer.phone}</p>
                                  </div>
                                </div>
                                <div className="flex items-start gap-2">
                                  <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                                  <div>
                                    <p className="font-medium text-sm">{order.customer.city_name}</p>
                                    <p className="text-xs text-muted-foreground">{order.customer.governorate_name}</p>
                                  </div>
                                </div>
                              </div>

                              {/* Package Info */}
                              {order.package_type && (
                                <div className="flex items-center gap-2">
                                  <Package className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">{order.package_type}</span>
                                </div>
                              )}

                              {/* Financial Details */}
                              <div className="bg-muted/30 rounded-lg p-3">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <p className="text-muted-foreground mb-1">Collected Amount</p>
                                    <div className="space-y-1">
                                      <p className="font-medium text-primary">
                                        {formatCurrency(order.collected_amount_usd, 'USD')}
                                      </p>
                                      <p className="font-medium text-primary">
                                        {formatCurrency(order.collected_amount_lbp, 'LBP')}
                                      </p>
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground mb-1">Delivery Fee</p>
                                    <div className="space-y-1">
                                      <p className="font-medium text-orange-600">
                                        {formatCurrency(order.delivery_fees_usd, 'USD')}
                                      </p>
                                      <p className="font-medium text-orange-600">
                                        {formatCurrency(order.delivery_fees_lbp, 'LBP')}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="col-span-2 pt-2 border-t">
                                    <p className="text-muted-foreground mb-1">Net Payout</p>
                                    <div className="flex gap-4">
                                      <p className="font-bold text-success">
                                        {formatCurrency(
                                          Number(order.collected_amount_usd || 0) - Number(order.delivery_fees_usd || 0),
                                          'USD'
                                        )}
                                      </p>
                                      <p className="font-bold text-success">
                                        {formatCurrency(
                                          Number(order.collected_amount_lbp || 0) - Number(order.delivery_fees_lbp || 0),
                                          'LBP'
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Invoice Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Invoice Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* USD Column */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-primary">USD Amounts</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Total Collected:</span>
                            <span className="font-medium">
                              {formatCurrency(invoice.total_amount_usd, 'USD')}
                            </span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Total Delivery Fees:</span>
                            <span className="font-medium text-orange-600">
                              -{formatCurrency(invoice.total_delivery_usd, 'USD')}
                            </span>
                          </div>
                          <Separator />
                          <div className="flex justify-between py-2 text-lg">
                            <span className="font-bold">Net Payout:</span>
                            <span className="font-bold text-success">
                              {formatCurrency(invoice.net_payout_usd, 'USD')}
                            </span>
                          </div>
                          {totals && (
                            <div className="text-xs text-muted-foreground">
                              Calculated: {formatCurrency(totals.netPayoutUSD, 'USD')}
                              {Math.abs(totals.netPayoutUSD - invoice.net_payout_usd) > 0.01 && (
                                <span className="text-destructive ml-1">⚠ Mismatch</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* LBP Column */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-primary">LBP Amounts</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Total Collected:</span>
                            <span className="font-medium">
                              {formatCurrency(invoice.total_amount_lbp, 'LBP')}
                            </span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Total Delivery Fees:</span>
                            <span className="font-medium text-orange-600">
                              -{formatCurrency(invoice.total_delivery_lbp, 'LBP')}
                            </span>
                          </div>
                          <Separator />
                          <div className="flex justify-between py-2 text-lg">
                            <span className="font-bold">Net Payout:</span>
                            <span className="font-bold text-success">
                              {formatCurrency(invoice.net_payout_lbp, 'LBP')}
                            </span>
                          </div>
                          {totals && (
                            <div className="text-xs text-muted-foreground">
                              Calculated: {formatCurrency(totals.netPayoutLBP, 'LBP')}
                              {Math.abs(totals.netPayoutLBP - invoice.net_payout_lbp) > 0.01 && (
                                <span className="text-destructive ml-1">⚠ Mismatch</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="py-12 text-center text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Invoice not found</p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Actions Footer */}
        {invoice && (
          <div className="flex items-center justify-between p-6 border-t bg-muted/20">
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
        )}
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceDetailsModal;