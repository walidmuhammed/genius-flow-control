import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye } from 'lucide-react';
import { OrderWithCustomer } from '@/services/orders';
import { formatDate } from '@/utils/format';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import OrderNoteTooltip from '../orders/OrderNoteTooltip';

interface CourierOrdersTableProps {
  orders: OrderWithCustomer[];
  onViewOrder: (order: OrderWithCustomer) => void;
  selectedOrders: string[];
  onOrderSelect: (orderId: string) => void;
  onSelectAll: () => void;
  isAllSelected: boolean;
}

export const CourierOrdersTable: React.FC<CourierOrdersTableProps> = ({
  orders,
  onViewOrder,
  selectedOrders,
  onOrderSelect,
  onSelectAll,
  isAllSelected
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

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
    <div className="w-full">
      <div className="w-full overflow-x-auto">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-200/30 dark:border-gray-700/30 hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
              <TableHead className="w-12">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={onSelectAll}
                  className="data-[state=checked]:bg-[#DB271E] data-[state=checked]:border-[#DB271E]"
                />
              </TableHead>
              <TableHead className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider w-[140px]">ORDER & REF</TableHead>
              <TableHead className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider w-[180px]">CUSTOMER</TableHead>
              <TableHead className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider w-[140px] hidden lg:table-cell">LOCATION</TableHead>
              <TableHead className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider w-[100px] hidden lg:table-cell">TYPE</TableHead>
              <TableHead className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider w-[130px]">COD AMOUNT</TableHead>
              <TableHead className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider w-[110px]">STATUS</TableHead>
              <TableHead className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider w-[120px] hidden xl:table-cell">ASSIGNED</TableHead>
              <TableHead className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider w-[140px] hidden xl:table-cell">SHOP INFO</TableHead>
            </TableRow>
          </TableHeader>
        <TableBody>
          {orders.map((order, index) => (
            <motion.tr
              key={order.id}
              className="border-b border-gray-100/50 dark:border-gray-700/30 transition-all duration-200 cursor-pointer hover:bg-gray-50/30 dark:hover:bg-gray-800/30"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.07, ease: [0.4, 0.0, 0.2, 1] }}
              onClick={() => onViewOrder(order)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Checkbox */}
              <TableCell onClick={e => e.stopPropagation()}>
                <Checkbox
                  checked={selectedOrders.includes(order.id)}
                  onCheckedChange={() => onOrderSelect(order.id)}
                  className="data-[state=checked]:bg-[#DB271E] data-[state=checked]:border-[#DB271E]"
                />
              </TableCell>

              {/* Order ID & Reference */}
              <TableCell>
                <div>
                  <div className="font-semibold text-[#DB271E] flex items-center gap-2">
                    #{order.order_id?.toString().padStart(3, '0') || order.id.slice(0, 8)}
                    {order.note && order.note.trim() !== "" && (
                      <OrderNoteTooltip note={order.note} />
                    )}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {order.reference_number || '-'}
                  </div>
                </div>
              </TableCell>

              {/* Customer Name & Phone */}
              <TableCell>
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-[160px]" title={order.customer?.name}>
                    {order.customer?.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 truncate">{order.customer?.phone}</div>
                  <div className="text-xs text-gray-400 lg:hidden">
                    {order.customer?.governorate_name}
                  </div>
                </div>
              </TableCell>

              {/* Delivery Location - Hidden on tablet and smaller */}
              <TableCell className="hidden lg:table-cell">
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-[120px]" title={order.customer?.governorate_name}>
                    {order.customer?.governorate_name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[120px]" title={order.customer?.city_name}>
                    {order.customer?.city_name}
                  </div>
                </div>
              </TableCell>

              {/* Order Type - Hidden on tablet and smaller */}
              <TableCell className="hidden lg:table-cell">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-medium rounded-md border ${getTypeColor(order.package_type || 'parcel')}`}
                >
                  {order.package_type || 'Parcel'}
                </span>
              </TableCell>

              {/* COD Amount */}
              <TableCell>
                <div>
                  {order.cash_collection_usd > 0 && (
                    <div className="font-semibold text-gray-900 dark:text-gray-100">${order.cash_collection_usd}</div>
                  )}
                  {order.cash_collection_lbp > 0 && (
                    <div className="text-sm text-gray-500 dark:text-gray-400">{order.cash_collection_lbp.toLocaleString()} LBP</div>
                  )}
                  {order.cash_collection_usd === 0 && order.cash_collection_lbp === 0 && (
                    <span className="text-gray-400 text-sm">No COD</span>
                  )}
                </div>
              </TableCell>

              {/* Status */}
              <TableCell>
                <Badge className={cn("px-2 py-1 text-xs font-medium rounded-md border whitespace-nowrap", getStatusColor(order.status))}>
                  {order.status}
                </Badge>
              </TableCell>

              {/* Assigned Date - Hidden on laptop and smaller */}
              <TableCell className="hidden xl:table-cell">
                <div className="text-sm text-gray-900 dark:text-gray-100">
                  {formatDate(new Date(order.created_at))}
                </div>
              </TableCell>

              {/* Shop Info - Hidden on laptop and smaller */}
              <TableCell className="hidden xl:table-cell">
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-[120px]" title={order.profiles?.business_name || order.profiles?.full_name || 'N/A'}>
                    {order.profiles?.business_name || order.profiles?.full_name || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {order.profiles?.phone || 'No phone'}
                  </div>
                </div>
              </TableCell>
            </motion.tr>
          ))}
        </TableBody>
      </Table>
    </div>
  </div>
  );
};