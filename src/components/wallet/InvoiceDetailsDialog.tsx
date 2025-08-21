
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { InvoiceWithOrders } from '@/services/invoices';
import { format } from 'date-fns';
import { Printer, Eye } from 'lucide-react';

interface InvoiceDetailsDialogProps {
  invoice: InvoiceWithOrders | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const InvoiceDetailsDialog: React.FC<InvoiceDetailsDialogProps> = ({ 
  invoice, 
  open, 
  onOpenChange 
}) => {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'text-emerald-600 bg-emerald-50';
      case 'successful':
        return 'text-green-600 bg-green-50';
      case 'unsuccessful':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'deliver':
        return 'text-blue-600 bg-blue-50';
      case 'exchange':
        return 'text-orange-600 bg-orange-50';
      case 'cash collection':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span>Invoice {invoice.invoice_id}</span>
              <Badge variant="outline" className={
                invoice.status === 'Paid' ? "text-emerald-600 bg-emerald-50" :
                invoice.status === 'In Progress' ? "text-blue-600 bg-blue-50" :
                "text-gray-600 bg-gray-50"
              }>
                {invoice.status}
              </Badge>
            </div>
            <Button onClick={handlePrint} className="gap-2">
              <Printer className="h-4 w-4" />
              Print Invoice
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full pr-2">
            <div className="space-y-6">
              {/* Invoice Overview */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice Details</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Invoice ID</p>
                    <p className="font-medium">{invoice.invoice_id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Merchant</p>
                    <p className="font-medium">{invoice.merchant_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Created Date</p>
                    <p className="font-medium">{format(new Date(invoice.created_at), 'PPp')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Created By</p>
                    <p className="font-medium">System</p>
                  </div>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Total Collection</h4>
                  <div className="space-y-1">
                    <p className="text-lg font-semibold">${invoice.total_amount_usd.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">{invoice.total_amount_lbp.toLocaleString()} LBP</p>
                  </div>
                </div>
                <div className="bg-white border rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Total Delivery Fees</h4>
                  <div className="space-y-1">
                    <p className="text-lg font-semibold">${invoice.total_delivery_usd.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">{invoice.total_delivery_lbp.toLocaleString()} LBP</p>
                  </div>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-emerald-700 mb-2">Net Payout</h4>
                  <div className="space-y-1">
                    <p className="text-lg font-semibold text-emerald-800">${invoice.net_payout_usd.toFixed(2)}</p>
                    <p className="text-sm text-emerald-600">{invoice.net_payout_lbp.toLocaleString()} LBP</p>
                  </div>
                </div>
              </div>

              {/* Orders Table */}
              <div className="bg-white border rounded-lg overflow-hidden">
                <div className="p-4 bg-gray-50 border-b">
                  <h3 className="text-lg font-semibold text-gray-900">Paid Orders ({invoice.orders.length})</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase">Order ID</th>
                        <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase">Reference</th>
                        <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase">Package</th>
                        <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase">Customer</th>
                        <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase">Location</th>
                        <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase">Delivery Fee</th>
                        <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase">Net Payout</th>
                        <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.orders.map((order) => (
                        <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="p-3">
                            <span className="font-medium text-blue-600">#{order.order_id?.toString().padStart(3, '0')}</span>
                          </td>
                          <td className="p-3">
                            {order.reference_number ? (
                              <span className="font-medium">{order.reference_number}</span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="p-3">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md ${getTypeColor(order.type)}`}>
                              {order.type}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-800">
                              {order.package_type || 'Standard'}
                            </span>
                          </td>
                          <td className="p-3">
                            <div>
                              <div className="font-medium text-gray-900">{order.customer.name}</div>
                              <div className="text-sm text-gray-500">{order.customer.phone}</div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div>
                              <div className="font-medium">{order.customer.city_name}</div>
                              <div className="text-sm text-gray-500">{order.customer.governorate_name}</div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div>
                              {order.collected_amount_usd > 0 && (
                                <div className="font-medium">${order.collected_amount_usd.toFixed(2)}</div>
                              )}
                              {order.collected_amount_lbp > 0 && (
                                <div className="text-sm text-gray-500">{order.collected_amount_lbp.toLocaleString()} LBP</div>
                              )}
                            </div>
                          </td>
                          <td className="p-3">
                            <div>
                              {order.delivery_fees_usd > 0 && (
                                <div className="font-medium">${order.delivery_fees_usd.toFixed(2)}</div>
                              )}
                              {order.delivery_fees_lbp > 0 && (
                                <div className="text-sm text-gray-500">{order.delivery_fees_lbp.toLocaleString()} LBP</div>
                              )}
                            </div>
                          </td>
                          <td className="p-3">
                            <div>
                              <div className="font-medium text-green-600">
                                ${(order.collected_amount_usd - order.delivery_fees_usd).toFixed(2)}
                              </div>
                              <div className="text-sm text-gray-500">
                                {(order.collected_amount_lbp - order.delivery_fees_lbp).toLocaleString()} LBP
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceDetailsDialog;
