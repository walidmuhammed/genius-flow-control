
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDate } from '@/utils/format';
import { OrderWithCustomer } from '@/services/orders';
import OrderProgressBar from './OrderProgressBar';
import { useScreenSize } from '@/hooks/useScreenSize';
import { 
  MapPin, 
  Phone, 
  User, 
  Package, 
  DollarSign,
  Clock,
  FileText,
  Truck,
  CreditCard,
  Hash,
  CheckCircle2,
  XCircle
} from 'lucide-react';
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
  const { isMobile } = useScreenSize();

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
      <DialogContent className={cn(
        "max-h-[90vh] w-[95vw]",
        isMobile ? "max-w-[95vw] p-0" : "max-w-2xl"
      )}>
        <DialogHeader className={cn("border-b", isMobile ? "p-4 pb-3" : "p-6 pb-4")}>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Package className="h-5 w-5 text-[#DC291E]" />
            Order #{order.order_id?.toString().padStart(3, '0') || order.id.slice(0, 8)}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1">
          <div className={cn("space-y-4", isMobile ? "p-4" : "p-6")}>
            {/* Order Status & Basic Info */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2">
                  <Badge className={`px-3 py-1 text-sm font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </Badge>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div><strong>Type:</strong> {order.type}</div>
                    {order.reference_number && (
                      <div className="flex items-center gap-1">
                        <Hash className="h-3 w-3" />
                        <span>{order.reference_number}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-right text-sm text-gray-600">
                  <div className="flex items-center gap-1 justify-end mb-1">
                    <Clock className="h-3 w-3" />
                    <span className={cn("text-xs", isMobile && "text-xs")}>
                      {formatDate(new Date(order.created_at))}
                    </span>
                  </div>
                  <div className={cn("text-xs text-gray-500", isMobile && "text-xs")}>
                    Updated: {formatDate(new Date(order.updated_at))}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Order Progress Bar */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2 text-base">
                <Package className="h-4 w-4 text-[#DC291E]" />
                Order Progress
              </h3>
              <div className="bg-gray-50 p-3 rounded-lg">
                <OrderProgressBar 
                  status={order.status as any} 
                  type={order.type as any} 
                />
              </div>
            </div>

            <Separator />

            {/* Customer Information */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2 text-base">
                <User className="h-4 w-4 text-[#DC291E]" />
                Customer Information
              </h3>
              <div className="bg-gray-50 p-3 rounded-lg space-y-3">
                <div className={cn("grid gap-3", isMobile ? "grid-cols-1" : "grid-cols-2")}>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-medium text-sm">{order.customer?.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{order.customer?.phone}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div className="text-sm">
                        <div className="font-medium">{order.customer?.city_name}</div>
                        <div className="text-gray-600">{order.customer?.governorate_name}</div>
                      </div>
                    </div>
                  </div>
                </div>
                {order.customer?.address && (
                  <div className="pt-2 border-t border-gray-200">
                    <div className="text-sm">
                      <strong>Full Address:</strong>
                      <div className="mt-1 text-gray-700">{order.customer.address}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Package Information */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2 text-base">
                <Package className="h-4 w-4 text-[#DC291E]" />
                Package Information
              </h3>
              <div className="bg-gray-50 p-3 rounded-lg space-y-2">
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
                <div className="flex items-center gap-2 text-sm">
                  <strong>Allow Opening:</strong>
                  {order.allow_opening ? (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Yes</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-red-600">
                      <XCircle className="h-4 w-4" />
                      <span>No</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Financial Information */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2 text-base">
                <DollarSign className="h-4 w-4 text-[#DC291E]" />
                Financial Information
              </h3>
              <div className={cn("grid gap-3", isMobile ? "grid-cols-1" : "grid-cols-2")}>
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg">
                  <h4 className="font-medium mb-2 text-sm flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-emerald-600" />
                    Cash Collection
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div className="font-semibold text-emerald-800">
                      ${order.cash_collection_usd}
                    </div>
                    <div className="text-emerald-700">
                      {order.cash_collection_lbp?.toLocaleString()} LBP
                    </div>
                    <div className="text-xs text-emerald-600 mt-2">
                      Status: {order.cash_collection_enabled ? 'Enabled' : 'Disabled'}
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                  <h4 className="font-medium mb-2 text-sm flex items-center gap-2">
                    <Truck className="h-4 w-4 text-blue-600" />
                    Delivery Fees
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div className="font-semibold text-blue-800">
                      ${order.delivery_fees_usd}
                    </div>
                    <div className="text-blue-700">
                      {order.delivery_fees_lbp?.toLocaleString()} LBP
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Courier Information */}
            {order.courier_name && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2 text-base">
                    <Truck className="h-4 w-4 text-[#DC291E]" />
                    Courier Information
                  </h3>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm">
                      <strong>Assigned Courier:</strong> {order.courier_name}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Notes */}
            {order.note && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2 text-base">
                    <FileText className="h-4 w-4 text-[#DC291E]" />
                    Notes
                  </h3>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-700 leading-relaxed">{order.note}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsDialog;
