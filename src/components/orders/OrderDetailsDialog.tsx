import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogPortal, DialogOverlay, DialogDescription } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetPortal, SheetOverlay } from '@/components/ui/sheet';
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
import { MapPin, Phone, User, Package, DollarSign, Clock, FileText, Truck, Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import AppleOrderHeaderMobile from './AppleOrderHeaderMobile';
import CurrencyDisplay from './CurrencyDisplay';
import CustomerInfo from './CustomerInfo';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';

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
    // Mobile: Drawer, Desktop: Dialog fallback for no order
    return isMobile ? <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader>
            <DrawerTitle>Order Details</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 text-center text-gray-500">
            No order selected
          </div>
        </DrawerContent>
      </Drawer> : <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[95vh] w-[95vw] sm:w-full" style={{
        zIndex: 60
      }}>
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          <div className="p-4 text-center text-gray-500">
            No order selected
          </div>
        </DialogContent>
      </Dialog>;
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
  const canEditDelete = order?.status === 'New';

  // --- Drawer drag handle (iOS-style, polished) ---
  const DrawerDragHandle = () => (
    <div className="mx-auto mt-3 mb-2 h-1.5 w-12 rounded-full bg-black/10 dark:bg-white/20 opacity-70 backdrop-blur-sm" aria-hidden="true" />
  );

  // --- STATUS BADGE + TYPE BADGE ---
  const StatusTypeBadges = () => <div className="flex items-center gap-2 flex-wrap min-w-0">
      <Badge className={`px-3 py-1 text-xs font-medium ${getStatusColor(order.status)}`}>{order.status}</Badge>
      <Badge className={`px-3 py-1 text-xs font-medium ${getTypeColor(order.type)}`}>{order.type}</Badge>
    </div>;

  // --- ENHANCED OrderHeaderIdRef ---
  const EnhancedOrderHeader = () => <div className="w-full">
      <div className="flex items-center min-w-0 gap-2">
        <span className="text-lg font-semibold truncate shrink-0">
          Order #{order.order_id?.toString().padStart(3, '0') || order.id.slice(0, 8)}
        </span>
        {order.reference_number && <span className="ml-0 px-2 py-0.5 rounded bg-gradient-to-r from-[#F5E6E6] to-[#fee8e8] border border-[#DB271E]/30 text-[#DB271E] font-semibold tracking-wide text-base align-middle shadow-inner shadow-white/10 truncate max-w-[110px] sm:max-w-none" style={{
        lineHeight: '1.6'
      }}>
            {order.reference_number}
          </span>}
        <div className="ml-auto flex items-center gap-1"></div>
      </div>
      <div className="flex flex-wrap items-center gap-2 mt-1">
        <StatusTypeBadges />
      </div>
    </div>;

  // --- HEADER ACTION BUTTONS ---
  const HeaderActions = () => canEditDelete ? <div className="flex items-center gap-1 ml-2">
        <Button onClick={handleEditOrder} variant="outline" size="sm" className="flex items-center gap-1 px-2 py-1 text-xs">
          <Edit className="h-4 w-4" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 border-none px-2 py-1 text-xs">
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
              <AlertDialogAction onClick={handleDeleteOrder} className="bg-red-600 hover:bg-red-700">
                Delete Order
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div> : null;

  // --- helper for extracting user and courier names ---
  const getCreatorName = (order: OrderWithCustomer) => {
    return order.customer?.name || 'N/A';
  };

  const getCourierName = (order: OrderWithCustomer) => {
    return order.courier_name || '';
  };

  const getPickupCourierName = (order: OrderWithCustomer) => {
    return order.courier_name || '';
  };

  const getReasonUnsuccessful = (order: OrderWithCustomer) => {
    return order.reason_unsuccessful || '';
  };

  const getInvoiceId = (order: OrderWithCustomer) => {
    return order.invoice_id || '';
  };

  const formatDateShort = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const d = new Date(dateString);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  // --- MODERNIZED OrderContent ---
  const OrderContent = () => {
    // Status message for below the progress bar
    const getStatusMessage = () => {
      switch ((order.status || '').toLowerCase()) {
        case 'new':
          return (
            <div className="flex items-center text-xs text-gray-600">
              <span>Created: {formatDateShort(order.created_at)}</span>
              <span className="mx-2">•</span>
              <span>by {getCreatorName(order)}</span>
            </div>
          );
        case 'pending pickup':
          return (
            <div className="flex items-center text-xs text-gray-600">
              {getPickupCourierName(order) ? (
                <span>
                  Courier assigned for pickup: <span className="font-medium text-gray-800">{getPickupCourierName(order)}</span>
                </span>
              ) : (
                <span>No pickup courier assigned yet</span>
              )}
            </div>
          );
        case 'in progress':
          return (
            <div className="flex items-center text-xs text-gray-600">
              {getCourierName(order) ? (
                <span>
                  Courier <span className="font-medium text-gray-800">{getCourierName(order)}</span> is heading to customer
                </span>
              ) : (
                <span>Order is being processed and will be delivered soon</span>
              )}
            </div>
          );
        case 'successful':
          return (
            <div className="flex items-center text-xs text-green-700">
              Order has been <span className="font-semibold ml-1">Successfully delivered</span> and will get paid soon
            </div>
          );
        case 'unsuccessful':
          return (
            <div className="flex items-center text-xs text-[#DB271E]">
              Not Successful
              {getReasonUnsuccessful(order) ? (
                <span className="ml-2">• Reason: {getReasonUnsuccessful(order)}</span>
              ) : null}
            </div>
          );
        case 'returned':
          return (
            <div className="flex items-center text-xs text-sky-700">
              Package has been <span className="font-semibold ml-1">Returned to your warehouse</span>
            </div>
          );
        case 'awaiting action':
          return (
            <div className="flex items-center text-xs text-amber-700">
              This order needs to be reviewed by you
            </div>
          );
        case 'paid':
          return (
            <div className="flex items-center text-xs text-indigo-700">
              Order has been paid
              {getInvoiceId(order) ? (
                <span className="ml-1">in Invoice ID: <span className="font-semibold">{getInvoiceId(order)}</span></span>
              ) : null}
            </div>
          );
        default:
          return null;
      }
    };

    return (
      <div className="space-y-5">
        {/* Progress section */}
        <Card className="shadow-sm backdrop-blur-lg">
          <CardHeader className="pb-3 flex-row items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <CardTitle className="text-base font-semibold pl-1 flex-1">
              Order Progress
            </CardTitle>
            <span className="text-xs text-muted-foreground ml-auto">Updated: {formatDateShort(order.updated_at)}</span>
          </CardHeader>
          <CardContent>
            <OrderProgressBar status={order.status as any} type={order.type as any} />
            <div className="mt-2">{getStatusMessage()}</div>
          </CardContent>
        </Card>

        {/* Customer Details Card */}
        <Card className="shadow-sm backdrop-blur-lg">
          <CardHeader className="pb-2 flex-row items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <CardTitle className="text-base font-semibold pl-1 flex-1">
              Customer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <span className="font-medium text-gray-900 text-sm">{order.customer?.name}</span>
              <div className="flex gap-2 text-xs text-muted-foreground items-center flex-wrap">
                {order.customer?.phone && (
                  <span className="flex items-center gap-1"><Phone className="h-4 w-4 opacity-70" />{order.customer.phone}</span>
                )}
                {order.customer?.secondary_phone && (
                  <span className="flex items-center gap-1 ml-2"><Phone className="h-4 w-4 opacity-60" />{order.customer.secondary_phone}</span>
                )}
              </div>
              <div className="flex gap-2 text-xs text-muted-foreground items-center flex-wrap">
                {order.customer?.address && (
                  <span className="flex items-center gap-1"><MapPin className="h-4 w-4 opacity-70" />{order.customer.address}</span>
                )}
                {order.customer?.city_name && (
                  <span className="flex items-center gap-1"><MapPin className="h-4 w-4 opacity-60" />{order.customer.city_name}</span>
                )}
                {order.customer?.governorate_name && (
                  <span className="flex items-center gap-1"><MapPin className="h-4 w-4 opacity-60" />{order.customer.governorate_name}</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Package & Financial Info in two columns on desktop, stacked on mobile */}
        <div className="flex flex-col sm:flex-row gap-5">
          {/* Package Details */}
          <Card className="flex-1 shadow-sm backdrop-blur-lg">
            <CardHeader className="pb-2 flex-row items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              <CardTitle className="text-base font-semibold pl-1 flex-1">Package</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="flex gap-4 text-xs text-muted-foreground flex-wrap mb-1">
                <span>Type: <span className="font-medium text-gray-900">{order.package_type}</span></span>
                <span>Items: <span className="font-medium text-gray-900">{order.items_count}</span></span>
                <span>Allow Opening: <span className="font-medium text-gray-900">{order.allow_opening ? "Yes" : "No"}</span></span>
              </div>
              {order.package_description && (
                <div className="text-xs text-gray-800 leading-normal pt-1">
                  <span className="font-semibold">Description: </span>
                  {order.package_description}
                </div>
              )}
            </CardContent>
          </Card>
          {/* Financial Info */}
          <Card className="flex-1 shadow-sm backdrop-blur-lg">
            <CardHeader className="pb-2 flex-row items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <CardTitle className="text-base font-semibold pl-1 flex-1">Financials</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-x-8 gap-y-2 flex-wrap text-xs">
                <div>
                  <div className="text-muted-foreground">Cash Collection:</div>
                  <CurrencyDisplay valueUSD={order.cash_collection_usd} valueLBP={order.cash_collection_lbp} />
                </div>
                <div>
                  <div className="text-muted-foreground">Delivery Fee:</div>
                  <CurrencyDisplay valueUSD={order.delivery_fees_usd} valueLBP={order.delivery_fees_lbp} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Courier Info (if present) */}
        {(order.courier_name || order.courier_id) && (
          <Card className="shadow-sm backdrop-blur-lg">
            <CardHeader className="pb-2 flex-row items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              <CardTitle className="text-base font-semibold pl-1 flex-1">Courier</CardTitle>
            </CardHeader>
            <CardContent className="text-xs flex flex-col gap-1 text-gray-800">
              {order.courier_name && (
                <div><span className="font-semibold">Name:</span> {order.courier_name}</div>
              )}
              {order.courier_id && (
                <div><span className="font-semibold">ID:</span> {order.courier_id}</div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Notes Section */}
        {order.note && (
          <Card className="shadow-sm backdrop-blur-lg">
            <CardHeader className="pb-2 flex-row items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle className="text-base font-semibold pl-1 flex-1">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-700 whitespace-pre-line">{order.note}</div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  // DESKTOP: fix dialog constraints, add DialogDescription
  if (!isMobile) {
    return <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[95vh] w-[95vw] sm:w-full shadow-lg border bg-background p-0" style={{
        zIndex: 60,
        overflow: 'hidden'
      }}>
          <DialogHeader className="sr-only">
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Full details of order and customer package information
            </DialogDescription>
          </DialogHeader>
          {/* ACTUAL header UI */}
          <div className="border-b p-6 pt-4 pb-2 bg-background z-10 relative py-[20px]">
            <div className="flex items-center justify-between w-full flex-wrap gap-y-2">
              <div className="flex items-center gap-2 min-w-0 flex-wrap flex-1">
                <Package className="h-5 w-5 text-[#DB271E] flex-shrink-0" />
                <span className="text-[17px] font-semibold text-gray-900 truncate shrink-0 leading-tight tracking-tight">
                  Order #{order.order_id?.toString().padStart(3, "0") || order.id.slice(0, 8)}
                </span>
                {order.reference_number && (
                  <span
                    className="ml-1 px-2 py-0.5 rounded bg-gradient-to-r from-[#F5E6E6] to-[#fee8e8] border border-[#DB271E]/30 text-[#DB271E] font-semibold tracking-wide text-[15px] align-middle shadow-inner shadow-white/10 truncate max-w-[120px] sm:max-w-none"
                    style={{
                      letterSpacing: "0.01em",
                      lineHeight: "1.6",
                      fontWeight: 600
                    }}
                  >
                    {order.reference_number}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 ml-auto">
                {/* Header action buttons (Edit/Delete) */}
                <HeaderActions />
              </div>
            </div>
            {/* REMOVED badges row here */}
          </div>
          <ScrollArea className="max-h-[calc(95vh-140px)]" style={{
          padding: 0
        }}>
            <div className="p-6 pt-4">
              <OrderContent />
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>;
  }

  // MOBILE drawer (refactored header)
  return (
    <Drawer open={open} onOpenChange={onOpenChange} shouldScaleBackground={true}>
      <DrawerContent className="max-h-[85vh] p-0 rounded-t-2xl border-t-0 shadow-lg">
        {/* Apple-style header: refactored into a separate component */}
        <AppleOrderHeaderMobile
          order={order}
          canEditDelete={canEditDelete}
          onEdit={handleEditOrder}
          onDelete={handleDeleteOrder}
        />
        {/* Scroll area unchanged */}
        <ScrollArea
          className="flex-1 max-h-[calc(85vh-65px)] overflow-y-auto overscroll-y-contain scroll-touch isolate"
          data-vaul-no-drag
          style={{
            touchAction: "pan-y"
          }}
        >
          <div className="p-4 pb-8">
            <OrderContent />
          </div>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
};
export default OrderDetailsDialog;
