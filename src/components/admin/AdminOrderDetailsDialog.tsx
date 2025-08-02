import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogPortal, DialogOverlay, DialogDescription } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetPortal, SheetOverlay } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle as AlertDialogTitlePrimitive, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDate } from '@/utils/format';
import { OrderWithCustomer, OrderStatus } from '@/services/orders';
import OrderProgressBar from '@/components/orders/OrderProgressBar';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate } from 'react-router-dom';
import { useDeleteOrder, useUpdateOrder } from '@/hooks/use-orders';
import { useAdminClients } from '@/hooks/use-admin-clients';
import { toast } from 'sonner';
import { MapPin, Phone, User, Package, DollarSign, Clock, FileText, Truck, Edit, Trash2, History, Map, Building, AlertTriangle, Store } from 'lucide-react';
import { cn } from '@/lib/utils';
import AppleOrderHeaderMobile from '@/components/orders/AppleOrderHeaderMobile';
import CurrencyDisplay from '@/components/orders/CurrencyDisplay';
import CustomerInfo from '@/components/orders/CustomerInfo';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';

interface AdminOrderDetailsDialogProps {
  order: OrderWithCustomer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AdminOrderDetailsDialog: React.FC<AdminOrderDetailsDialogProps> = ({
  order,
  open,
  onOpenChange,
}) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const deleteOrder = useDeleteOrder();
  const updateOrder = useUpdateOrder();
  const { data: clients } = useAdminClients();

  const handleEditOrder = () => {
    if (order) {
      navigate(`/dashboard/admin/create-order?edit=true&id=${order.id}`);
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

  const handleViewShop = () => {
    if (order?.client_id) {
      navigate(`/dashboard/admin/clients?id=${order.client_id}`);
      onOpenChange(false);
    }
  };

  if (!order) {
    // Mobile: Drawer, Desktop: Dialog fallback for no order
    return isMobile ? (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader>
            <DrawerTitle>Order Details</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 text-center text-gray-500">
            No order selected
          </div>
        </DrawerContent>
      </Drawer>
    ) : (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[95vh] w-[95vw] sm:w-full" style={{ zIndex: 60 }}>
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
        return 'bg-green-100 text-green-700 border-green-200';
      case 'exchange':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'cash collection':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'return':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Check if order can be edited/deleted (admins can edit any order except "Paid")
  const canEditDelete = order?.status !== 'Paid';

  // Get shop information
  const getShopInfo = () => {
    if (!order.client_id || !clients) return null;
    return clients.find(c => c.id === order.client_id);
  };

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!order) return;
    
    try {
      await updateOrder.mutateAsync({
        id: order.id,
        updates: { status: newStatus }
      });
    } catch (error) {
      toast.error("Failed to update order status");
    }
  };

  const formatDateShort = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const d = new Date(dateString);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  // Add this function to provide context-dependent status messages
  const getStatusMessage = () => {
    if (!order) return null;

    switch (order.status.toLowerCase()) {
      case 'unsuccessful':
        return (
          <div className="mt-4 flex items-center gap-2 text-sm text-[#DB271E] bg-red-50 border border-red-200 px-4 py-3 rounded-lg">
            <span>
              {order.reason_unsuccessful
                ? `Unsuccessful: ${order.reason_unsuccessful}`
                : "Delivery was unsuccessful."}
            </span>
          </div>
        );
      case 'returned':
        return (
          <div className="mt-4 flex items-center gap-2 text-sm text-sky-700 bg-sky-50 border border-sky-200 px-4 py-3 rounded-lg">
            <span>This order was returned to sender.</span>
          </div>
        );
      case 'successful':
        return (
          <div className="mt-4 flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-3 rounded-lg">
            <span>Delivered successfully to customer.</span>
          </div>
        );
      default:
        return null;
    }
  };

  // STATUS BADGE + TYPE BADGE
  const StatusTypeBadges = () => (
    <div className="flex items-center gap-3 flex-wrap min-w-0">
      <Select value={order.status} onValueChange={handleStatusChange}>
        <SelectTrigger className={`w-auto px-3 py-1.5 text-sm font-medium border-none ${getStatusColor(order.status)}`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="New">New</SelectItem>
          <SelectItem value="Pending Pickup">Pending Pickup</SelectItem>
          <SelectItem value="In Progress">In Progress</SelectItem>
          <SelectItem value="Successful">Successful</SelectItem>
          <SelectItem value="Unsuccessful">Unsuccessful</SelectItem>
          <SelectItem value="Returned">Returned</SelectItem>
          <SelectItem value="Awaiting Action">Awaiting Action</SelectItem>
          <SelectItem value="Paid">Paid</SelectItem>
        </SelectContent>
      </Select>
      <Badge className={`px-3 py-1.5 text-sm font-medium ${getTypeColor(order.type)}`}>
        {order.type}
      </Badge>
    </div>
  );

  // HEADER ACTION BUTTONS
  const HeaderActions = () => (
    <div className="flex items-center gap-2 ml-2">
      <Button
        onClick={handleViewShop}
        variant="outline"
        size="sm"
        className="flex items-center gap-2 px-3 py-2 text-sm"
      >
        <Store className="h-4 w-4" />
        View Shop
      </Button>
      {canEditDelete && (
        <>
          <Button
            onClick={handleEditOrder}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 px-3 py-2 text-sm"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 px-3 py-2 text-sm"
              >
                <Trash2 className="h-4 w-4" />
                Delete
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
        </>
      )}
    </div>
  );

  // ENHANCED OrderContent with all improvements
  const OrderContent = () => {
    // Collapse state for edit history
    const [editHistoryOpen, setEditHistoryOpen] = React.useState(false);

    // Edit History Collapsible Card
    const EditHistoryCollapsibleCard = () => {
      if (!order.edited || !order.edit_history || order.edit_history.length === 0) {
        return null;
      }
      return (
        <Card className="shadow-sm backdrop-blur-lg border border-gray-200/50 mb-4">
          <Collapsible open={editHistoryOpen} onOpenChange={setEditHistoryOpen}>
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition rounded-t-xl group focus:outline-none"
                aria-expanded={editHistoryOpen}
              >
                <History className="h-6 w-6 text-primary" />
                <span className="text-xl font-semibold flex-1 text-left pl-1">Edit History</span>
                <Badge
                  variant="outline"
                  className="bg-yellow-50 text-yellow-700 border-yellow-200 text-sm px-3 py-1"
                >
                  {order.edit_history.length} {order.edit_history.length === 1 ? 'Change' : 'Changes'}
                </Badge>
                <span
                  className={`transition-transform duration-200 ml-3 ${
                    editHistoryOpen ? 'rotate-180' : 'rotate-0'
                  }`}
                >
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="space-y-4 mt-2">
                  {order.edit_history.map((change, index) => (
                    <div key={index} className="border-l-2 border-blue-200 pl-5 py-3 bg-blue-50/30 rounded-r-lg">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium text-base text-gray-900 capitalize">
                          {change.field.replace('_', ' ')}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDateShort(change.timestamp)}
                        </span>
                      </div>
                      <div className="text-base text-gray-700">
                        <span className="text-red-600 line-through">{change.oldValue}</span>
                        {' → '}
                        <span className="text-green-600 font-medium">{change.newValue}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      );
    };

    return (
      <div className="space-y-6">
        {/* Edit History Collapsible Card */}
        <EditHistoryCollapsibleCard />

        {/* Shop Information Card */}
        <Card className="shadow-sm backdrop-blur-lg border border-gray-200/50">
          <CardHeader className="pb-4 flex-row items-center gap-3">
            <Store className="h-6 w-6 text-primary" />
            <CardTitle className="text-xl font-semibold pl-1 flex-1">
              Shop Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              {getShopInfo() ? (
                <>
                  <div>
                    <span className="font-semibold text-lg text-gray-900">
                      {getShopInfo()?.business_name || getShopInfo()?.full_name}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {getShopInfo()?.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-gray-500" />
                        <span className="text-base text-gray-700">{getShopInfo()?.phone}</span>
                      </div>
                    )}
                    {getShopInfo()?.email && (
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-gray-500" />
                        <span className="text-base text-gray-700">{getShopInfo()?.email}</span>
                      </div>
                    )}
                  </div>
                  
                  <Button
                    onClick={handleViewShop}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Store className="h-4 w-4" />
                    View Shop Details
                  </Button>
                </>
              ) : (
                <div className="text-gray-500">Shop information not available</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Progress section */}
        <Card className="shadow-sm backdrop-blur-lg border border-gray-200/50">
          <CardHeader className="pb-4 flex-row items-center gap-3">
            <Package className="h-6 w-6 text-primary" />
            <CardTitle className="text-xl font-semibold pl-1 flex-1">
              Order Progress
            </CardTitle>
            <span className="text-base text-muted-foreground ml-auto">
              Updated: {formatDateShort(order.updated_at)}
            </span>
          </CardHeader>
          <CardContent className="pt-0">
            <OrderProgressBar status={order.status as any} type={order.type as any} />
            {getStatusMessage()}
          </CardContent>
        </Card>

        {/* Customer Details Card */}
        <Card className="shadow-sm backdrop-blur-lg border border-gray-200/50">
          <CardHeader className="pb-4 flex-row items-center gap-3">
            <User className="h-6 w-6 text-primary" />
            <CardTitle className="text-xl font-semibold pl-1 flex-1">
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-5">
              {/* Customer Name */}
              <div>
                <span className="font-semibold text-lg text-gray-900">{order.customer?.name}</span>
              </div>
              
              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {order.customer?.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-gray-500" />
                    <span className="text-base text-gray-700">{order.customer.phone}</span>
                  </div>
                )}
                {order.customer?.secondary_phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <span className="text-base text-gray-600">{order.customer.secondary_phone}</span>
                  </div>
                )}
              </div>

              {/* Location Information */}
              <div className="space-y-4">
                {order.customer?.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-700 mb-2">Address</div>
                      <div className="text-base text-gray-600 leading-relaxed break-words max-h-20 overflow-y-auto p-3 bg-gray-50 rounded-lg">
                        {order.customer.address}
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {order.customer?.city_name && (
                    <div className="flex items-center gap-3">
                      <Building className="h-5 w-5 text-gray-500" />
                      <div>
                        <div className="text-sm text-gray-500">City</div>
                        <span className="text-base font-medium text-gray-700">{order.customer.city_name}</span>
                      </div>
                    </div>
                  )}
                  {order.customer?.governorate_name && (
                    <div className="flex items-center gap-3">
                      <Map className="h-5 w-5 text-gray-500" />
                      <div>
                        <div className="text-sm text-gray-500">Governorate</div>
                        <span className="text-base font-medium text-gray-700">{order.customer.governorate_name}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Package & Financial Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Package Details */}
          <Card className="shadow-sm backdrop-blur-lg border border-gray-200/50">
            <CardHeader className="pb-4 flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <Package className="h-6 w-6 text-primary" />
                <CardTitle className="text-xl font-semibold pl-1">Package</CardTitle>
              </div>
              <Badge className={`px-4 py-2 text-base font-medium ${getTypeColor(order.type)}`}>
                {order.type}
              </Badge>
            </CardHeader>
            <CardContent className="pt-0 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500 mb-2">Type</div>
                  <span className="text-base font-medium text-gray-900">{order.package_type}</span>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-2">Items</div>
                  <span className="text-base font-medium text-gray-900">{order.items_count}</span>
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500 mb-2">Allow Opening</div>
                <Badge variant={order.allow_opening ? "default" : "secondary"} className="text-sm px-3 py-1">
                  {order.allow_opening ? "Yes" : "No"}
                </Badge>
              </div>

              {order.package_description && (
                <div>
                  <div className="text-sm text-gray-500 mb-2">Description</div>
                  <div className="text-base text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {order.package_description}
                  </div>
                </div>
              )}

              {order.note && (
                <div>
                  <div className="text-sm text-gray-500 mb-2">Order Note</div>
                  <div className="text-base text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {order.note}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Financial Information */}
          <Card className="shadow-sm backdrop-blur-lg border border-gray-200/50">
            <CardHeader className="pb-4 flex-row items-center gap-3">
              <DollarSign className="h-6 w-6 text-primary" />
              <CardTitle className="text-xl font-semibold pl-1">Financial</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-5">
              {/* Cash Collection */}
              <div>
                <div className="text-sm text-gray-500 mb-3">Cash Collection</div>
                <div className="space-y-2">
                  {order.cash_collection_usd > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-base text-gray-700">USD</span>
                      <span className="text-lg font-semibold text-gray-900">${order.cash_collection_usd}</span>
                    </div>
                  )}
                  {order.cash_collection_lbp > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-base text-gray-700">LBP</span>
                      <span className="text-lg font-semibold text-gray-900">{order.cash_collection_lbp.toLocaleString()}</span>
                    </div>
                  )}
                  {order.cash_collection_usd === 0 && order.cash_collection_lbp === 0 && (
                    <span className="text-base text-gray-500">No cash collection</span>
                  )}
                </div>
              </div>

              {/* Delivery Fees */}
              <div>
                <div className="text-sm text-gray-500 mb-3">Delivery Fee</div>
                <div className="space-y-3">
                  {/* Display delivery fees */}
                  <div className="space-y-2">
                    {order.delivery_fees_usd > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-base text-gray-700">USD</span>
                        <span className="text-lg font-semibold text-gray-900">${order.delivery_fees_usd}</span>
                      </div>
                    )}
                    {order.delivery_fees_lbp > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-base text-gray-700">LBP</span>
                        <span className="text-lg font-semibold text-gray-900">{order.delivery_fees_lbp.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Pricing source information */}
                  {order.pricing_source && (
                    <div className="pt-2 border-t border-gray-100">
                      <div className="text-xs text-gray-500 mb-1">Pricing Source</div>
                      <span className="text-sm text-gray-600 capitalize">
                        {order.pricing_source.replace('_', ' ')} pricing
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  // Mobile: Drawer implementation
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="h-[90vh] flex flex-col">
          <DrawerHeader className="flex-row items-center justify-between pb-4 flex-shrink-0 border-b">
            <div className="flex-1 min-w-0">
              <DrawerTitle className="text-xl font-semibold">
                Order #{order.order_id?.toString().padStart(3, '0') || order.id.slice(0, 8)}
              </DrawerTitle>
              <div className="mt-2">
                <StatusTypeBadges />
              </div>
            </div>
            <HeaderActions />
          </DrawerHeader>
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full px-4 pb-4">
              <div className="py-4">
                <OrderContent />
              </div>
            </ScrollArea>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop: Dialog implementation
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] sm:w-full h-[95vh] p-0 flex flex-col" style={{ zIndex: 60 }}>
        <DialogHeader className="flex-row items-center justify-between pb-4 px-6 pt-6 flex-shrink-0 border-b">
          <div className="flex-1 min-w-0">
            <DialogTitle className="text-2xl font-semibold">
              Order #{order.order_id?.toString().padStart(3, '0') || order.id.slice(0, 8)}
            </DialogTitle>
            <div className="mt-3">
              <StatusTypeBadges />
            </div>
          </div>
          <HeaderActions />
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full px-6 pb-6">
            <div className="py-4">
              <OrderContent />
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};