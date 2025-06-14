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
import { MapPin, Phone, User, Package, DollarSign, Clock, FileText, Truck, Edit, Trash2 } from 'lucide-react';

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
    if (isMobile) {
      return <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[90vh]">
          <SheetHeader>
            <SheetTitle>Order Details</SheetTitle>
          </SheetHeader>
          <div className="p-4 text-center text-gray-500">
            No order selected
          </div>
        </SheetContent>
      </Sheet>;
    }
    return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
        </DialogHeader>
        <div className="p-4 text-center text-gray-500">
          No order selected
        </div>
      </DialogContent>
    </Dialog>;
  }

  // --- Badge color logic ---
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'pending pickup': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'in progress': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'heading to customer': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'heading to you': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'successful': return 'bg-green-50 text-green-700 border-green-200';
      case 'unsuccessful': return 'bg-red-50 text-red-700 border-red-200';
      case 'returned': return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'paid': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };
  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'shipment': return 'bg-green-100 text-green-700';
      case 'exchange': return 'bg-purple-100 text-purple-700';
      case 'cash collection': return 'bg-emerald-100 text-emerald-700';
      case 'return': return 'bg-amber-100 text-amber-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Only NEW orders can be edited/deleted:
  const canEditDelete = order.status === 'New';

  // --- Enhanced REF design ---
  const RefNumber = () => (
    order.reference_number ?
      <span className="inline-flex ml-1 items-center gap-1 px-2 py-0.5 text-base font-semibold rounded bg-neutral-100 border border-neutral-300 text-neutral-800 shadow-sm tracking-tight">
        {order.reference_number}
      </span>
      : null
  );

  // --- Header Status/Type Badges: now appear beside RefNumber ---
  const HeaderBadges = () => (
    <span className="flex flex-wrap gap-1 ml-2">
      <Badge className={`px-3 py-1 text-xs font-medium border ${getStatusColor(order.status)}`}>{order.status}</Badge>
      <Badge className={`px-3 py-1 text-xs font-medium border ${getTypeColor(order.type)}`}>{order.type}</Badge>
    </span>
  );

  // --- HEADER ORDER ID + Enhanced REF & badges ---
  const OrderHeaderIdRef = () =>
    <span className="flex flex-wrap items-center min-w-0 gap-2 text-lg font-semibold truncate">
      Order #
      {order.order_id?.toString().padStart(3, '0') || order.id.slice(0, 8)}
      <RefNumber />
      <HeaderBadges />
    </span>;

  // --- Action Buttons ---
  const HeaderActions = () => canEditDelete ? (
    <div className="flex items-center gap-1 ml-2">
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
    </div>
  ) : null;

  // --- OrderContent (no badges/type/status here anymore) ---
  const OrderContent = () => <div className="space-y-4 sm:space-y-6">
      {/* -- Status/Type badges removed from here -- */}
      {/* Only show "created/updated" timestamps and edit history in this box now */}
      <div className="bg-white rounded-lg border p-4">
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
      {/* ... keep rest of OrderContent (progress, customer, package, finance, courier, notes) unchanged ... */}
      // ... keep existing code (Order ProgressBar, customer info, package info, financial info, courier info, notes) the same ...
    </div>;

  // --- DESKTOP Dialog ---
  if (!isMobile) {
    return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] w-[95vw] sm:w-full">
        <DialogHeader>
          <div className="flex flex-col gap-1 w-full">
            <div className="flex flex-row items-center justify-between w-full flex-wrap gap-y-2">
              <div className="flex items-center gap-2 min-w-0 flex-wrap">
                <Package className="h-5 w-5 text-[#DB271E] flex-shrink-0" />
                <OrderHeaderIdRef />
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <HeaderActions />
                {/* Close button comes from DialogContent */}
              </div>
            </div>
          </div>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="p-1">
            <OrderContent />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>;
  }

  // --- MOBILE Sheet ---
  return <Sheet open={open} onOpenChange={onOpenChange}>
    <SheetContent side="bottom" className="h-[90vh] p-0">
      <div className="flex flex-col h-full">
        <SheetHeader className="px-4 py-3 border-b bg-white">
          <div className="block w-full">
            <div className="flex flex-row items-center flex-wrap gap-y-2 justify-between w-full">
              <div className="flex items-center gap-2 min-w-0 flex-wrap">
                <Package className="h-5 w-5 text-[#DB271E] flex-shrink-0" />
                <OrderHeaderIdRef />
              </div>
              <div className="flex items-center gap-1 ml-auto">
                <HeaderActions />
              </div>
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
  </Sheet>;
};

export default OrderDetailsDialog;
