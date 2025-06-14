
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Phone, 
  MapPin, 
  Package, 
  CreditCard, 
  FileText, 
  Clock,
  Edit,
  ArrowRight
} from 'lucide-react';
import { OrderWithCustomer } from '@/services/orders';
import { formatDate } from '@/utils/format';
import { cn } from '@/lib/utils';

interface OrderDetailsDialogProps {
  order: OrderWithCustomer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const OrderDetailsDialog: React.FC<OrderDetailsDialogProps> = ({
  order,
  open,
  onOpenChange
}) => {
  if (!order) return null;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending pickup':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'in progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'heading to customer':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'heading to you':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'successful':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'unsuccessful':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'returned':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'paid':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              Order #{order.order_id?.toString().padStart(3, '0')}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {order.edited && (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                  <Edit className="h-3 w-3 mr-1" />
                  Edited
                </Badge>
              )}
              <Badge variant="outline" className={cn("px-3 py-1", getStatusColor(order.status))}>
                {order.status}
              </Badge>
            </div>
          </div>
          
          {order.reference_number && (
            <div className="text-sm text-gray-600">
              Reference: <span className="font-medium">{order.reference_number}</span>
            </div>
          )}
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Customer Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-medium text-gray-900">{order.customer.name}</p>
                <p className="text-sm text-gray-600">{order.customer.phone}</p>
                {order.customer.secondary_phone && (
                  <p className="text-sm text-gray-600">
                    Secondary: {order.customer.secondary_phone}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Delivery Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="font-medium text-gray-900">
                  {order.customer.governorate_name}
                </p>
                <p className="text-sm text-gray-600">{order.customer.city_name}</p>
                <p className="text-sm text-gray-600">{order.customer.address}</p>
                {order.customer.is_work_address && (
                  <Badge variant="outline" className="mt-1 text-xs">
                    Work Address
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Package Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-4 w-4" />
                Package Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Type:</span>
                <span className="text-sm font-medium capitalize">{order.package_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Items:</span>
                <span className="text-sm font-medium">{order.items_count}</span>
              </div>
              {order.package_description && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Description:</span>
                  <span className="text-sm font-medium">{order.package_description}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Allow Opening:</span>
                <span className="text-sm font-medium">
                  {order.allow_opening ? 'Yes' : 'No'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {order.cash_collection_enabled ? (
                <>
                  {order.cash_collection_usd > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Cash Collection (USD):</span>
                      <span className="text-sm font-medium">${order.cash_collection_usd}</span>
                    </div>
                  )}
                  {order.cash_collection_lbp > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Cash Collection (LBP):</span>
                      <span className="text-sm font-medium">
                        {order.cash_collection_lbp.toLocaleString()} LBP
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-600">No cash collection</p>
              )}
              
              <Separator />
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Delivery Fee (USD):</span>
                <span className="text-sm font-medium">${order.delivery_fees_usd}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Delivery Fee (LBP):</span>
                <span className="text-sm font-medium">
                  {order.delivery_fees_lbp.toLocaleString()} LBP
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Edit History */}
        {order.edited && order.edit_history && order.edit_history.length > 0 && (
          <Card className="mt-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Edit History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {order.edit_history.map((change: any, index: number) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{change.field}</span>
                      <span className="text-xs text-gray-500">
                        {formatDate(new Date(change.timestamp))}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-red-600 bg-red-50 px-2 py-1 rounded">
                        {change.from || 'Empty'}
                      </span>
                      <ArrowRight className="h-3 w-3 text-gray-400" />
                      <span className="text-green-600 bg-green-50 px-2 py-1 rounded">
                        {change.to || 'Empty'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Additional Notes */}
        {order.note && (
          <Card className="mt-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Delivery Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">{order.note}</p>
            </CardContent>
          </Card>
        )}

        {/* Order Timeline */}
        <Card className="mt-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Order Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Created:</span>
              <span className="text-sm font-medium">
                {formatDate(new Date(order.created_at))}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Last Updated:</span>
              <span className="text-sm font-medium">
                {formatDate(new Date(order.updated_at))}
              </span>
            </div>
            {order.courier_name && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Courier:</span>
                <span className="text-sm font-medium">{order.courier_name}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsDialog;
