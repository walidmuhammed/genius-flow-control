import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle as AlertDialogTitlePrimitive, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { formatDate } from '@/utils/format';
import { OrderWithCustomer } from '@/services/orders';
import OrderProgressBar from './OrderProgressBar';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate } from 'react-router-dom';
import { useDeleteOrder } from '@/hooks/use-orders';
import { toast } from 'sonner';
import {
  MapPin,
  Phone,
  User,
  Package,
  DollarSign,
  Clock,
  FileText,
  Truck,
  Edit,
  Trash2
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
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const deleteOrder = useDeleteOrder();

  const handleEditOrder = () => {
    if (order) {
      navigate(`/create-order?edit=${order.id}`);
      onOpenChange(false);
    }
  };

  const handleDeleteOrder = async () => {
    if (order) {
      try {
        await deleteOrder.mutateAsync(order.id);
        onOpenChange(false);
        toast.success("Order archived successfully");
      } catch (error) {
        toast.error("Failed to archive order");
      }
    }
  };

  if (!order) {
    return isMobile ? (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[90vh]">
          <SheetHeader>
            <SheetTitle>Order Details</SheetTitle>
          </SheetHeader>
          <div className="p-4 text-center text-gray-500">
            No order selected
          </div>
        </SheetContent>
      </Sheet>
    ) : (
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

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'shipment':
        return 'bg-green-100 text-green-700';
      case 'exchange':
        return 'bg-purple-100 text-purple-700';
      case 'cash collection':
        return 'bg-emerald-100 text-emerald-700';
      case 'return':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Check if order can be edited/deleted (only NEW orders)
  const canEditDelete = order.status === 'New';

  // --- HEADER ACTION BUTTONS ---
  const HeaderActions = () => (
    canEditDelete ? (
      <div className="flex items-center gap-1 ml-2">
        <Button
          onClick={handleEditOrder}
          variant="outline"
          size="sm"
          className="flex items-center gap-1 px-2 py-1 text-xs"
        >
          <Edit className="h-4 w-4" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 border-none px-2 py-1 text-xs"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitlePrimitive>Are you sure?</AlertDialogTitlePrimitive>
              <AlertDialogDescription>
                Are you sure you want to delete this order? It will be archived and hidden from the list.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteOrder}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete Order
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    ) : null
  );

  // --- BADGES FOR FIRST CONTAINER ---
  const StatusTypeBadges = () => (
    <div className="flex items-center gap-2 mb-3">
      <Badge className={`px-3 py-1 text-xs font-medium ${getStatusColor(order.status)}`}>{order.status}</Badge>
      <Badge className={`px-3 py-1 text-xs font-medium ${getTypeColor(order.type)}`}>{order.type}</Badge>
    </div>
  );

  // --- HEADER ORDER ID + REF NUMBER ---
  const OrderHeaderIdRef = () => (
    <span className="flex items-center text-lg font-semibold truncate gap-2">
      {/* Order ID padded if present, else show first 8 chars */}
      Order #{order.order_id?.toString().padStart(3, '0') || order.id.slice(0, 8)}
      {order.reference_number && (
        <span className="ml-2 text-lg font-semibold text-gray-700">{order.reference_number}</span>
      )}
    </span>
  );

  // --- OrderContent (no badge/type here anymore except our badges at top) ---
  const OrderContent = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* Order Status & Basic Info */}
      <div className="bg-white rounded-lg border p-4">
        <StatusTypeBadges />
        {/* Display as "Type: X -- Status: Y" */}
        <div className="mb-4 text-sm font-medium text-gray-700 flex flex-wrap gap-x-2">
          <span>Type: {order.type || 'N/A'}</span>
          <span>--</span>
          <span>Status: {order.status || 'N/A'}</span>
        </div>
        <div className="flex flex-col space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">Created: {formatDate(new Date(order.created_at))}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">Updated: {formatDate(new Date(order.updated_at))}</span>
            </div>
          </div>
          {/* ... keep edit history section ... */}
          {order.edited && order.edit_history && Array.isArray(order.edit_history) && order.edit_history.length > 0 && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Edit className="h-4 w-4 text-amber-600" />
                <span className="font-medium text-amber-800">🛠 This order was edited:</span>
              </div>
              <div className="space-y-1 text-sm text-amber-700">
                {order.edit_history.map((change: any, index: number) => (
                  <div key={index}>
                    • {change.field}: "{change.oldValue}" → "{change.newValue}"
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* ... keep rest of OrderContent the same ... */}
      {/* Order Progress */}
      <div className="bg-white rounded-lg border p-4">
        <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
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

      {/* Customer Information */}
      <div className="bg-white rounded-lg border p-4">
        <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
          <User className="h-5 w-5 text-[#DB271E]" />
          Customer Information
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <User className="h-4 w-4 text-gray-500 flex-shrink-0" />
            <div>
              <span className="font-medium text-gray-700">Name:</span>
              <span className="ml-2 text-gray-900">{order.customer?.name || 'N/A'}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-gray-500 flex-shrink-0" />
            <div>
              <span className="font-medium text-gray-700">Phone:</span>
              <span className="ml-2 text-gray-900">{order.customer?.phone || 'N/A'}</span>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-medium text-gray-700">Location:</span>
              <div className="ml-2 text-gray-900">
                {order.customer?.city_name && order.customer?.governorate_name 
                  ? `${order.customer.city_name}, ${order.customer.governorate_name}`
                  : 'N/A'
                }
              </div>
              {order.customer?.address && (
                <div className="ml-2 text-sm text-gray-600 mt-1">
                  <span className="font-medium">Address:</span> {order.customer.address}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Package Information */}
      <div className="bg-white rounded-lg border p-4">
        <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
          <Package className="h-5 w-5 text-[#DB271E]" />
          Package Information
        </h3>
        <div className="space-y-3 text-sm">
          <div>
            <span className="font-medium text-gray-700">Type:</span>
            <span className="ml-2 text-gray-900">{order.package_type || 'N/A'}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Description:</span>
            <span className="ml-2 text-gray-900">{order.package_description || 'N/A'}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Items Count:</span>
            <span className="ml-2 text-gray-900">{order.items_count || 1}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Allow Opening:</span>
            <span className="ml-2 text-gray-900">{order.allow_opening ? 'Yes' : 'No'}</span>
          </div>
        </div>
      </div>

      {/* Financial Information */}
      <div className="bg-white rounded-lg border p-4">
        <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
          <DollarSign className="h-5 w-5 text-[#DB271E]" />
          Financial Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-3 text-gray-800">Cash Collection</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">USD:</span>
                <span className="font-medium">${order.cash_collection_usd || '0.00'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">LBP:</span>
                <span className="font-medium">{(order.cash_collection_lbp || 0).toLocaleString()} LBP</span>
              </div>
              <div className="pt-1 border-t border-gray-200">
                <span className="text-xs text-gray-500">
                  Enabled: {order.cash_collection_enabled ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-3 text-gray-800">Delivery Fees</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">USD:</span>
                <span className="font-medium">${order.delivery_fees_usd || '0.00'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">LBP:</span>
                <span className="font-medium">{(order.delivery_fees_lbp || 0).toLocaleString()} LBP</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Courier Information */}
      {order.courier_name && (
        <div className="bg-white rounded-lg border p-4">
          <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
            <Truck className="h-5 w-5 text-[#DB271E]" />
            Courier Information
          </h3>
          <div className="text-sm">
            <span className="font-medium text-gray-700">Assigned Courier:</span>
            <span className="ml-2 text-gray-900">{order.courier_name}</span>
          </div>
        </div>
      )}

      {/* Notes */}
      {order.note && (
        <div className="bg-white rounded-lg border p-4">
          <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-[#DB271E]" />
            Notes
          </h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{order.note}</p>
          </div>
        </div>
      )}
    </div>
  );

  // --- DESKTOP Dialog ---
  if (!isMobile) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] w-[95vw] sm:w-full">
          <DialogHeader>
            <div className="flex items-center justify-between w-full">
              {/* Header: [Package] Order #xxx [ref] ... right: actions + close */}
              <div className="flex items-center gap-2 min-w-0">
                <Package className="h-5 w-5 text-[#DB271E] flex-shrink-0" />
                <OrderHeaderIdRef />
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <HeaderActions />
                {/* Close button is provided by DialogContent */}
              </div>
            </div>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-120px)]">
            <div className="p-1">
              <OrderContent />
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    );
  }

  // --- MOBILE Sheet ---
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] p-0">
        <div className="flex flex-col h-full">
          <SheetHeader className="px-4 py-3 border-b bg-white">
            <div className="flex items-center w-full gap-2">
              <Package className="h-5 w-5 text-[#DB271E] flex-shrink-0" />
              <OrderHeaderIdRef />
              <div className="flex items-center gap-2 ml-auto">
                <HeaderActions />
              </div>
            </div>
          </SheetHeader>
          <ScrollArea className="flex-1">
            <div className="p-4 pb-8">
              <OrderContent />
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default OrderDetailsDialog;
