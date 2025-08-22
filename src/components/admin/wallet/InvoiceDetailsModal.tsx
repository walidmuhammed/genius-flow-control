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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useInvoiceWithOrders } from '@/hooks/use-invoices';
import { useUserRole } from '@/hooks/use-user-role';
import { formatCurrency } from '@/utils/format';
import { Check, Printer, Package, Receipt, Clock, DollarSign, AlertCircle } from 'lucide-react';
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
  const { isAdmin } = useUserRole();
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
    const statusConfig = {
      'Pending': { variant: 'secondary', icon: Clock },
      'In Progress': { variant: 'default', icon: Package },
      'Paid': { variant: 'success', icon: Check },
      'On Hold': { variant: 'destructive', icon: AlertCircle }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['Pending'];
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant as any} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
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
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        {/* Header */}
        <DialogHeader className="flex flex-row items-center justify-between p-6 pb-4 space-y-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Receipt className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">
                {invoice?.invoice_id || 'Invoice Details'}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                {invoice?.merchant_name} • {invoice?.orders?.length || 0} orders
              </p>
            </div>
          </div>
          {invoice && getStatusBadge(invoice.status)}
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-140px)]">
          <div className="px-6 pb-6">
            {isLoading ? (
              <div className="py-12 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading invoice details...</p>
              </div>
            ) : invoice ? (
              <div className="space-y-6">
                {/* Quick Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-l-4 border-l-primary">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded">
                          <DollarSign className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Total Collection</p>
                          <div className="space-y-1">
                            <p className="font-bold text-lg">{formatCurrency(invoice.total_amount_usd, 'USD')}</p>
                            <p className="text-sm font-medium">{formatCurrency(invoice.total_amount_lbp, 'LBP')}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-l-4 border-l-orange-500">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded">
                          <Package className="h-4 w-4 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Delivery Fees</p>
                          <div className="space-y-1">
                            <p className="font-bold text-lg">{formatCurrency(invoice.total_delivery_usd, 'USD')}</p>
                            <p className="text-sm font-medium">{formatCurrency(invoice.total_delivery_lbp, 'LBP')}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded">
                          <Check className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Net Payout</p>
                          <div className="space-y-1">
                            <p className="font-bold text-lg text-green-600">{formatCurrency(invoice.net_payout_usd, 'USD')}</p>
                            <p className="text-sm font-medium text-green-600">{formatCurrency(invoice.net_payout_lbp, 'LBP')}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Order Details Table */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Package className="h-5 w-5" />
                      Order Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/30">
                            <TableHead className="font-semibold">Order</TableHead>
                            <TableHead className="font-semibold">Customer</TableHead>
                            <TableHead className="font-semibold">Location</TableHead>
                            <TableHead className="font-semibold text-right">Collection</TableHead>
                            <TableHead className="font-semibold text-right">Fees</TableHead>
                            <TableHead className="font-semibold text-right">Net Payout</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {invoice.orders?.map((order) => {
                            const netUSD = Number(order.collected_amount_usd || 0) - Number(order.delivery_fees_usd || 0);
                            const netLBP = Number(order.collected_amount_lbp || 0) - Number(order.delivery_fees_lbp || 0);
                            const isNegative = netUSD < 0 || netLBP < 0;
                            
                            return (
                              <TableRow key={order.id} className="hover:bg-muted/20">
                                <TableCell>
                                  <div>
                                    <p className="font-medium">#{order.order_id}</p>
                                    <p className="text-xs text-muted-foreground">{order.reference_number}</p>
                                    <Badge variant="outline" className="text-xs mt-1">
                                      {order.type}
                                    </Badge>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div>
                                    <p className="font-medium">{order.customer.name}</p>
                                    <p className="text-xs text-muted-foreground">{order.customer.phone}</p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div>
                                    <p className="text-sm">{order.customer.city_name}</p>
                                    <p className="text-xs text-muted-foreground">{order.customer.governorate_name}</p>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div>
                                    <p className="font-medium">{formatCurrency(order.collected_amount_usd, 'USD')}</p>
                                    <p className="text-sm text-muted-foreground">{formatCurrency(order.collected_amount_lbp, 'LBP')}</p>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div>
                                    <p className="font-medium text-orange-600">{formatCurrency(order.delivery_fees_usd, 'USD')}</p>
                                    <p className="text-sm text-orange-500">{formatCurrency(order.delivery_fees_lbp, 'LBP')}</p>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div>
                                    <p className={`font-bold ${isNegative ? 'text-red-600' : 'text-green-600'}`}>
                                      {formatCurrency(netUSD, 'USD')}
                                    </p>
                                    <p className={`text-sm ${isNegative ? 'text-red-500' : 'text-green-500'}`}>
                                      {formatCurrency(netLBP, 'LBP')}
                                    </p>
                                    {isNegative && (
                                      <Badge variant="destructive" className="text-xs mt-1">
                                        Negative
                                      </Badge>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>

                {/* Invoice Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Financial Summary
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Created: {new Date(invoice.created_at).toLocaleDateString()}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* USD Summary */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-primary border-b pb-2">USD Summary</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Total Collection:</span>
                            <span className="font-bold">{formatCurrency(invoice.total_amount_usd, 'USD')}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Delivery Fees:</span>
                            <span className="font-bold text-orange-600">-{formatCurrency(invoice.total_delivery_usd, 'USD')}</span>
                          </div>
                          <Separator />
                          <div className="flex justify-between items-center text-lg">
                            <span className="font-bold">Net Payout:</span>
                            <span className="font-bold text-green-600">{formatCurrency(invoice.net_payout_usd, 'USD')}</span>
                          </div>
                        </div>
                      </div>

                      {/* LBP Summary */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-primary border-b pb-2">LBP Summary</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Total Collection:</span>
                            <span className="font-bold">{formatCurrency(invoice.total_amount_lbp, 'LBP')}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Delivery Fees:</span>
                            <span className="font-bold text-orange-600">-{formatCurrency(invoice.total_delivery_lbp, 'LBP')}</span>
                          </div>
                          <Separator />
                          <div className="flex justify-between items-center text-lg">
                            <span className="font-bold">Net Payout:</span>
                            <span className="font-bold text-green-600">{formatCurrency(invoice.net_payout_lbp, 'LBP')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="py-12 text-center text-muted-foreground">
                <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Invoice not found</p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Actions Footer */}
        {invoice && (
          <div className="flex items-center justify-between p-6 border-t bg-card">
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="h-4 w-4 mr-2" />
              Print Invoice
            </Button>
            
            {isAdmin && invoice.status !== 'Paid' && (
              <Button
                onClick={handleMarkAsPaid}
                disabled={markingAsPaid}
                className="bg-green-600 hover:bg-green-700"
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