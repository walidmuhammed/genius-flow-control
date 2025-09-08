import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { OrderWithCustomer } from '@/services/orders';
import { formatDate } from '@/utils/format';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import OrderNoteTooltip from '../orders/OrderNoteTooltip';

interface CourierOrdersTableMobileProps {
  orders: OrderWithCustomer[];
  onViewOrder: (order: OrderWithCustomer) => void;
}

export const CourierOrdersTableMobile: React.FC<CourierOrdersTableMobileProps> = ({
  orders,
  onViewOrder
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

  return (
    <div className="space-y-2 w-full">
      {orders.map((order, index) => (
        <motion.div
          key={order.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: index * 0.03 }}
          className="w-full"
        >
          <Card 
            className="border border-gray-200/60 dark:border-gray-700/40 rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200 w-full cursor-pointer"
            onClick={() => onViewOrder(order)}
          >
            <CardContent className="p-3">
              {/* Header - Order ID, Reference, Status */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-[#DB271E] text-sm">
                      #{order.order_id?.toString().padStart(3, '0') || order.id.slice(0, 8)}
                    </span>
                    {order.note && order.note.trim() !== "" && (
                      <OrderNoteTooltip note={order.note} />
                    )}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    Ref: {order.reference_number || '-'}
                  </div>
                </div>
                <Badge className={cn("px-1.5 py-0.5 text-xs font-medium rounded-md border whitespace-nowrap flex-shrink-0", getStatusColor(order.status))}>
                  {order.status}
                </Badge>
              </div>

              {/* Customer & Location Row */}
              <div className="flex justify-between mb-2">
                <div className="flex-1 min-w-0 pr-2">
                  <div className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate">{order.customer?.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{order.customer?.phone}</div>
                  <div className="text-xs text-gray-400 truncate">
                    {order.customer?.governorate_name} • {order.customer?.city_name}
                  </div>
                </div>
                <div className="text-right">
                  {order.cash_collection_usd > 0 && (
                    <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm">${order.cash_collection_usd}</div>
                  )}
                  {order.cash_collection_lbp > 0 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">{order.cash_collection_lbp.toLocaleString()} LBP</div>
                  )}
                  {order.cash_collection_usd === 0 && order.cash_collection_lbp === 0 && (
                    <span className="text-gray-400 text-xs">No COD</span>
                  )}
                </div>
              </div>

              {/* Bottom Row - Type, Shop, Date */}
              <div className="flex justify-between items-center pt-1 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <Badge className={`px-1.5 py-0.5 text-xs font-medium rounded-md border ${getTypeColor(order.package_type || 'parcel')}`}>
                    {order.package_type || 'Parcel'}
                  </Badge>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px]">
                    {order.profiles?.business_name || order.profiles?.full_name || 'Business'}
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  {formatDate(new Date(order.created_at))}
                </div>
              </div>

            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};