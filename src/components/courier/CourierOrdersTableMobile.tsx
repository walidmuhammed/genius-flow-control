import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, CheckCircle, Truck, XCircle, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { OrderWithCustomer } from '@/services/orders';
import { formatDate } from '@/utils/format';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import OrderNoteTooltip from '../orders/OrderNoteTooltip';

interface CourierOrdersTableMobileProps {
  orders: OrderWithCustomer[];
  onViewOrder: (order: OrderWithCustomer) => void;
  onMarkPickedUp: (order: OrderWithCustomer) => void;
  onMarkDelivered: (order: OrderWithCustomer) => void;
  onMarkUnsuccessful: (order: OrderWithCustomer) => void;
}

export const CourierOrdersTableMobile: React.FC<CourierOrdersTableMobileProps> = ({
  orders,
  onViewOrder,
  onMarkPickedUp,
  onMarkDelivered,
  onMarkUnsuccessful
}) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'pending pickup':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'assigned':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'in progress':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'successful':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'unsuccessful':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'returned':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'awaiting payment':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'paid':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'on hold':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'shipment':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'exchange':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'cash collection':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'return':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const canMarkPickedUp = (order: OrderWithCustomer) => 
    ['New', 'Assigned'].includes(order.status);
  
  const canMarkDelivered = (order: OrderWithCustomer) => 
    order.status === 'In Progress';
  
  const canMarkUnsuccessful = (order: OrderWithCustomer) => 
    order.status === 'In Progress';

  return (
    <div className="space-y-4">
      {orders.map((order, index) => (
        <motion.div
          key={order.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: index * 0.07 }}
        >
          <Card className="border border-gray-200/60 dark:border-gray-700/40 rounded-xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-4">
              {/* Header - Order ID, Reference, Status */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-[#DB271E] text-lg">
                      #{order.order_id?.toString().padStart(3, '0') || order.id.slice(0, 8)}
                    </span>
                    {order.note && order.note.trim() !== "" && (
                      <OrderNoteTooltip note={order.note} />
                    )}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Ref: {order.reference_number || '-'}
                  </div>
                </div>
                <Badge className={cn("px-3 py-1 text-xs font-medium rounded-full border", getStatusColor(order.status))}>
                  {order.status}
                </Badge>
              </div>

              {/* Customer Info */}
              <div className="mb-3">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Customer</div>
                <div className="font-medium text-gray-900 dark:text-gray-100">{order.customer?.name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{order.customer?.phone}</div>
              </div>

              {/* Location */}
              <div className="mb-3">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Delivery Location</div>
                <div className="font-medium text-gray-900 dark:text-gray-100">{order.customer?.governorate_name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{order.customer?.city_name}</div>
              </div>

              {/* Package Type & COD */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Package Type</div>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-md border ${getTypeColor(order.package_type || 'parcel')}`}
                  >
                    {order.package_type || 'Parcel'}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">COD Amount</div>
                  {order.cash_collection_usd > 0 || order.cash_collection_lbp > 0 ? (
                    <div>
                      {order.cash_collection_usd > 0 && (
                        <div className="font-semibold text-gray-900 dark:text-gray-100">${order.cash_collection_usd}</div>
                      )}
                      {order.cash_collection_lbp > 0 && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">{order.cash_collection_lbp.toLocaleString()} LBP</div>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm">No COD</span>
                  )}
                </div>
              </div>

              {/* Shop Info */}
              <div className="mb-4">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Shop Info</div>
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {order.profiles?.business_name || order.profiles?.full_name || 'Business Name'}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {order.profiles?.phone || 'Not provided'}
                </div>
              </div>

              {/* Date */}
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Assigned: {formatDate(new Date(order.created_at))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewOrder(order)}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="px-3">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => onViewOrder(order)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    {canMarkPickedUp(order) && (
                      <DropdownMenuItem onClick={() => onMarkPickedUp(order)}>
                        <Truck className="mr-2 h-4 w-4" />
                        Mark as Picked Up
                      </DropdownMenuItem>
                    )}
                    
                    {canMarkDelivered(order) && (
                      <DropdownMenuItem onClick={() => onMarkDelivered(order)}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Mark as Delivered
                      </DropdownMenuItem>
                    )}
                    
                    {canMarkUnsuccessful(order) && (
                      <DropdownMenuItem onClick={() => onMarkUnsuccessful(order)}>
                        <XCircle className="mr-2 h-4 w-4" />
                        Mark as Unsuccessful
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};