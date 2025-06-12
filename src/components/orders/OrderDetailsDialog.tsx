
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDate } from '@/utils/format';
import { OrderWithCustomer } from '@/services/orders';
import OrderProgressBar from './OrderProgressBar';
import { 
  MapPin, 
  Phone, 
  User, 
  Package, 
  DollarSign,
  Clock,
  FileText,
  Truck
} from 'lucide-react';

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
  if (!order) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          <div className="p-4 text-center text-gray-500">
            No order selected
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'pending pickup':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'in progress':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'heading to customer':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'heading to you':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'successful':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'unsuccessful':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'returned':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'paid':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-[#DB271E]" />
            Order #{order.order_id?.toString().padStart(3, '0') || order.id.slice(0, 8)}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="space-y-6 p-1">
            {/* Order Status & Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className={`px-3 py-1 text-sm font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600">
                  <strong>Type:</strong> {order.type}
                </div>
                {order.reference_number && (
                  <div className="text-sm text-gray-600">
                    <strong>Reference:</strong> {order.reference_number}
                  </div>
                )}
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Created: {formatDate(new Date(order.created_at))}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Updated: {formatDate(new Date(order.updated_at))}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Order Progress Bar */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Package className="h-5 w-5 text-[#DB271E]" />
                Order Progress
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <OrderProgressBar 
                  status={order.status as any} 
                  type={order.type as any} 
                />
              </div>
            </div>

            <Separator />

            {/* Customer Information */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-[#DB271E]" />
                Customer Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{order.customer?.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span>{order.customer?.phone}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span>{order.customer?.city_name}, {order.customer?.governorate_name}</span>
                  </div>
                  {order.customer?.address && (
                    <div className="text-sm text-gray-600">
                      <strong>Address:</strong> {order.customer.address}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Package Information */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Package className="h-5 w-5 text-[#DB271E]" />
                Package Information
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                {order.package_type && (
                  <div className="text-sm">
                    <strong>Type:</strong> {order.package_type}
                  </div>
                )}
                {order.package_description && (
                  <div className="text-sm">
                    <strong>Description:</strong> {order.package_description}
                  </div>
                )}
                <div className="text-sm">
                  <strong>Items Count:</strong> {order.items_count || 1}
                </div>
                <div className="text-sm">
                  <strong>Allow Opening:</strong> {order.allow_opening ? 'Yes' : 'No'}
                </div>
              </div>
            </div>

            <Separator />

            {/* Financial Information */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-[#DB271E]" />
                Financial Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Cash Collection</h4>
                  <div className="space-y-1 text-sm">
                    <div>USD: ${order.cash_collection_usd}</div>
                    <div>LBP: {order.cash_collection_lbp?.toLocaleString()} LBP</div>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Enabled: {order.cash_collection_enabled ? 'Yes' : 'No'}
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Delivery Fees</h4>
                  <div className="space-y-1 text-sm">
                    <div>USD: ${order.delivery_fees_usd}</div>
                    <div>LBP: {order.delivery_fees_lbp?.toLocaleString()} LBP</div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Courier Information */}
            {order.courier_name && (
              <>
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Truck className="h-5 w-5 text-[#DB271E]" />
                    Courier Information
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm">
                      <strong>Courier:</strong> {order.courier_name}
                    </div>
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Notes */}
            {order.note && (
              <div className="space-y-3">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[#DB271E]" />
                  Notes
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700">{order.note}</p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsDialog;
