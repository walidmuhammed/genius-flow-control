import React, { useState } from 'react';
import { Order } from './OrdersTableRow';
import { OrderWithCustomer } from '@/services/orders';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Eye, Printer, MoreVertical, Edit, Phone, MapPin, DollarSign, Calendar, Hash, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';

interface OrdersTableMobileProps {
  orders: (Order & {
    originalOrder: OrderWithCustomer;
  })[];
  selectedOrders?: string[];
  toggleSelectOrder?: (orderId: string) => void;
  onViewDetails?: (order: Order & {
    originalOrder: OrderWithCustomer;
  }) => void;
  onDeleteOrder?: (order: any) => void;
  showActions?: boolean;
}
const OrdersTableMobile: React.FC<OrdersTableMobileProps> = ({
  orders,
  selectedOrders = [],
  toggleSelectOrder = () => {},
  onViewDetails = () => {},
  onDeleteOrder = () => {},
  showActions = true
}) => {
  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border";
    switch (status.toLowerCase()) {
      case 'new':
        return <Badge className={`${baseClasses} bg-blue-50 text-blue-700 border-blue-200`}>{status}</Badge>;
      case 'pending pickup':
        return <Badge className={`${baseClasses} bg-orange-50 text-orange-700 border-orange-200`}>{status}</Badge>;
      case 'in progress':
        return <Badge className={`${baseClasses} bg-purple-50 text-purple-700 border-purple-200`}>{status}</Badge>;
      case 'successful':
        return <Badge className={`${baseClasses} bg-green-50 text-green-700 border-green-200`}>{status}</Badge>;
      case 'unsuccessful':
        return <Badge className={`${baseClasses} bg-red-50 text-red-700 border-red-200`}>{status}</Badge>;
      case 'returned':
        return <Badge className={`${baseClasses} bg-yellow-50 text-yellow-700 border-yellow-200`}>{status}</Badge>;
      case 'paid':
        return <Badge className={`${baseClasses} bg-teal-50 text-teal-700 border-teal-200`}>{status}</Badge>;
      case 'awaiting action':
        return <Badge className={`${baseClasses} bg-amber-50 text-amber-700 border-amber-200`}>{status}</Badge>;
      default:
        return <Badge className={`${baseClasses} bg-gray-50 text-gray-700 border-gray-200`}>{status}</Badge>;
    }
  };
  const canEdit = (order: Order) => order.status === 'New';
  const canDelete = (order: Order) => order.status === 'New';
  // Mobile/tablet deletion dialog state
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [orderPendingDelete, setOrderPendingDelete] = useState<any>(null);
  // Add edit handler using originalOrder (ensure fallback to order.id for safety)
  const handleEdit = (originalOrder: OrderWithCustomer, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (originalOrder && originalOrder.id) {
      window.location.href = `/create-order?edit=${originalOrder.id}`;
    }
  };
  const handleDelete = (order: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setOrderPendingDelete(order.originalOrder);
    setConfirmDeleteOpen(true);
  };
  return <div className="space-y-3 pb-4">
      {orders.map((order, index) => <motion.div key={order.id} className={cn("bg-white rounded-xl border border-gray-100 transition-all duration-200 overflow-hidden cursor-pointer", "active:scale-[0.98] active:shadow-sm", selectedOrders.includes(order.id) ? "border-[#DC291E]/30 bg-[#DC291E]/5 shadow-sm" : "hover:shadow-md hover:border-gray-200")} initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      duration: 0.3,
      delay: index * 0.05
    }} onClick={() => onViewDetails(order)}>
          {/* Card Header - Improved spacing and responsiveness */}
          <div className="p-3 sm:p-4 pb-2 sm:pb-3">
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div className="shrink-0" onClick={e => e.stopPropagation()}>
                  <Checkbox checked={selectedOrders.includes(order.id)} onCheckedChange={() => toggleSelectOrder(order.id)} className="data-[state=checked]:bg-[#DC291E] data-[state=checked]:border-[#DC291E] rounded-md h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                    <span className="font-semibold text-[#DC291E] text-sm sm:text-base">#{order.id}</span>
                    <Badge variant="outline" className="text-xs px-1.5 py-0.5 sm:px-2 bg-gray-50 text-gray-600 border-gray-200">
                      {order.type}
                    </Badge>
                  </div>
                  {order.referenceNumber && <div className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm text-gray-500">
                      <Hash className="h-3 w-3" />
                      <span className="truncate">{order.referenceNumber}</span>
                    </div>}
                </div>
              </div>
              <div className="shrink-0">
                {getStatusBadge(order.status)}
              </div>
            </div>
          </div>

          {/* Card Content - Better responsive spacing */}
          <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-2.5 sm:space-y-3">
            {/* Customer Info */}
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm truncate">{order.customer.name}</p>
                <div className="flex items-center gap-1 sm:gap-1.5 text-xs text-gray-500 mt-0.5">
                  <Phone className="h-3 w-3" />
                  <span className="truncate">{order.customer.phone}</span>
                </div>
              </div>
            </div>
            
            {/* Location */}
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-50 rounded-lg flex items-center justify-center shrink-0">
                <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 font-medium truncate">
                  {order.location.city}, {order.location.area}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">Delivery Location</p>
              </div>
            </div>
            
            {/* Amount & Date Row - Better responsive layout */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">${order.amount.valueUSD}</p>
                  <p className="text-xs text-gray-500">Collection</p>
                </div>
              </div>
              
              <div className="flex items-center gap-1 sm:gap-1.5 text-xs text-gray-500">
                
                
              </div>
            </div>
          </div>
          
          {/* Actions Footer - Improved touch targets */}
          {showActions && <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50/50 border-t border-gray-100">
              <Button variant="ghost" size="sm" className="h-8 sm:h-9 px-3 rounded-lg hover:bg-white/80 text-gray-600 hover:text-gray-900 text-xs font-medium" onClick={e => {
          e.stopPropagation();
          onViewDetails(order);
        }}>
                <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
                View Details
              </Button>
              
              <div className="flex items-center gap-1">
                {/* Fast action bar edit icon */}
                {canEdit(order) && <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 sm:h-9 sm:w-9 p-0 rounded-lg hover:bg-white/80"
                    onClick={e => handleEdit(order.originalOrder, e)}
                  >
                    <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500" />
                  </Button>}
                
                <Button variant="ghost" size="sm" className="h-8 w-8 sm:h-9 sm:w-9 p-0 rounded-lg hover:bg-white/80" onClick={e => e.stopPropagation()}>
                  <Printer className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500" />
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 sm:h-9 sm:w-9 p-0 rounded-lg hover:bg-white/80" onClick={e => e.stopPropagation()}>
                      <MoreVertical className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-white rounded-xl border-gray-200 shadow-xl z-50 min-w-[160px]" sideOffset={4}>
                    <DropdownMenuItem className="rounded-lg py-2.5 px-3 text-sm" onClick={e => {
                      e.stopPropagation();
                      onViewDetails(order);
                    }}>
                      View Order Details
                    </DropdownMenuItem>
                    {/* Edit menu item: handle navigation */}
                    {canEdit(order) && <DropdownMenuItem className="rounded-lg py-2.5 px-3 text-sm" onClick={e => handleEdit(order.originalOrder, e)}>
                        Edit Order
                      </DropdownMenuItem>}
                    <DropdownMenuItem className="rounded-lg py-2.5 px-3 text-sm">
                      Print Shipping Label
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-lg py-2.5 px-3 text-sm">
                      Create Support Ticket
                    </DropdownMenuItem>
                    {canEdit(order) && <>
                        <DropdownMenuSeparator className="my-1" />
                        <DropdownMenuItem className="text-red-600 rounded-lg py-2.5 px-3 text-sm" onClick={e => handleDelete(order, e)}>
                          Cancel Order
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600 rounded-lg py-2.5 px-3 text-sm" onClick={e => handleDelete(order, e)}>
                          Delete Order
                        </DropdownMenuItem>
                      </>}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>}
        </motion.div>)}
      {/* Mobile/tablet deletion confirmation dialog */}
      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Order?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this order? It will be archived and hidden from your list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmDeleteOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-[#DB271E] hover:bg-[#c0211a] text-white"
              onClick={() => {
                setConfirmDeleteOpen(false);
                if (orderPendingDelete && onDeleteOrder) {
                  onDeleteOrder({ originalOrder: orderPendingDelete });
                  setOrderPendingDelete(null);
                }
              }}
            >
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>;
};
export default OrdersTableMobile;
