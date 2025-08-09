import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, Printer, MoreHorizontal, Trash2 } from 'lucide-react';
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
import OrderRowActions from './OrderRowActions';
import OrderNoteTooltip from './OrderNoteTooltip';

interface EnhancedOrdersTableProps {
  orders: OrderWithCustomer[];
  selectedOrderIds: string[];
  onOrderSelection: (orderIds: string[]) => void;
  onViewOrder: (order: OrderWithCustomer) => void;
  onEditOrder?: (order: OrderWithCustomer) => void;
  onDeleteOrder?: (order: OrderWithCustomer) => void;
}

export const EnhancedOrdersTable: React.FC<EnhancedOrdersTableProps> = ({
  orders,
  selectedOrderIds,
  onOrderSelection,
  onViewOrder,
  onEditOrder,
  onDeleteOrder
}) => {
  // ---- New local state for hovering ----
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleSelectAll = (checked: boolean) => {
    onOrderSelection(checked ? orders.map(order => order.id) : []);
  };

  const handleSelectOrder = (orderId: string, checked: boolean) => {
    onOrderSelection(
      checked
        ? [...selectedOrderIds, orderId]
        : selectedOrderIds.filter(id => id !== orderId)
    );
  };

  const isAllSelected = selectedOrderIds.length === orders.length && orders.length > 0;
  const isPartiallySelected = selectedOrderIds.length > 0 && selectedOrderIds.length < orders.length;
  const anySelected = selectedOrderIds.length > 0;

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

  const canEdit = (order: OrderWithCustomer) => order.status === 'New';
  const canDelete = (order: OrderWithCustomer) => order.status === 'New';

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-200/30 dark:border-gray-700/30 hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
            {/* FIXED selection column, always present */}
            <TableHead
              className="w-12 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider pl-6 transition-all duration-500 overflow-hidden"
              style={{
                width: '3rem',
                minWidth: '3rem',
                maxWidth: '3rem'
              }}
            >
              {/* Checkbox is only visible (opacity) if anySelected */}
              <Checkbox
                checked={isAllSelected}
                ref={el => {
                  if (el) {
                    const input = el.querySelector('input') as HTMLInputElement;
                    if (input) input.indeterminate = isPartiallySelected;
                  }
                }}
                onCheckedChange={handleSelectAll}
                className={cn(
                  "data-[state=checked]:bg-[#DB271E] data-[state=checked]:border-[#DB271E] rounded-md transition-opacity duration-300",
                  anySelected ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                )}
                tabIndex={anySelected ? 0 : -1}
                aria-hidden={!anySelected}
              />
            </TableHead>
            <TableHead className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">ORDER ID</TableHead>
            <TableHead className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">REFERENCE</TableHead>
            <TableHead className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">CUSTOMER</TableHead>
            <TableHead className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">LOCATION</TableHead>
            <TableHead className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">TYPE</TableHead>
            <TableHead className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">AMOUNT</TableHead>
            <TableHead className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">STATUS</TableHead>
            <TableHead className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">DATE</TableHead>
            <TableHead className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">ACTIONS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order, index) => {
            const isRowSelected = selectedOrderIds.includes(order.id);
            // Only show checkbox for this row if:
            // - this row is hovered
            // - OR it's selected
            // - OR anySelected (i.e. once multi-selection has started)
            const showCheckbox = hoveredIndex === index || isRowSelected || anySelected;

            return (
              <motion.tr
                key={order.id}
                className={cn(
                  "border-b border-gray-100/50 dark:border-gray-700/30 transition-all duration-200 cursor-pointer",
                  isRowSelected 
                    ? "bg-[#DB271E]/5 border-[#DB271E]/20" 
                    : "hover:bg-gray-50/30 dark:hover:bg-gray-800/30"
                )}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.07, ease: [0.4, 0.0, 0.2, 1] }}
                // No more onMouseEnter/onMouseLeave since hover no longer toggles checkbox visibility
                onClick={() => onViewOrder(order)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex((prev) => prev === index ? null : prev)}
              >
                {/* Selection cell: always present, but checkbox only visible if anySelected */}
                <TableCell
                  className="pl-6 transition-all duration-500"
                  style={{
                    width: '3rem',
                    minWidth: '3rem',
                    maxWidth: '3rem',
                    overflow: "hidden",
                    position: "relative"
                  }}
                  onClick={e => e.stopPropagation()}
                >
                  <Checkbox
                    checked={isRowSelected}
                    onCheckedChange={(checked) => handleSelectOrder(order.id, checked as boolean)}
                    className={cn(
                      "data-[state=checked]:bg-[#DB271E] data-[state=checked]:border-[#DB271E] rounded-md transition-opacity duration-300",
                      showCheckbox ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                    )}
                    tabIndex={showCheckbox ? 0 : -1}
                    aria-hidden={!showCheckbox}
                  />
                </TableCell>
                <TableCell className="font-semibold text-[#DB271E]">
                  <div className="flex items-center gap-2">
                    <span>
                      #{order.order_id?.toString().padStart(3, '0') || order.id.slice(0, 8)}
                    </span>
                    {order.note && order.note.trim() !== "" && (
                      <OrderNoteTooltip note={order.note} />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {order.reference_number ? (
                    <span className="font-medium text-gray-900 dark:text-gray-100">{order.reference_number}</span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">{order.customer?.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{order.customer?.phone}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">{order.customer?.city_name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{order.customer?.governorate_name}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <span
                      className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${getTypeColor(order.type)}`}
                    >
                      {order.type}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    {order.cash_collection_usd > 0 && (
                      <div className="font-semibold text-gray-900 dark:text-gray-100">${order.cash_collection_usd}</div>
                    )}
                    {order.cash_collection_lbp > 0 && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">{order.cash_collection_lbp.toLocaleString()} LBP</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={cn("px-3 py-1 text-xs font-medium rounded-full border", getStatusColor(order.status))}>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-gray-900 dark:text-gray-100">
                    {formatDate(new Date(order.created_at))}
                  </div>
                </TableCell>
                <TableCell className="text-right" onClick={e => e.stopPropagation()}>
                  <OrderRowActions
                    order={{
                      id: order.order_id?.toString().padStart(3, '0') || order.id.slice(0, 8),
                      referenceNumber: order.reference_number || '',
                      type: order.type,
                      customer: {
                        name: order.customer?.name || '',
                        phone: order.customer?.phone || '',
                      },
                      location: {
                        city: order.customer?.city_name || '',
                        area: order.customer?.governorate_name || '',
                        address: order.customer?.address || '',
                      },
                      amount: {
                        valueLBP: Number(order.cash_collection_lbp),
                        valueUSD: Number(order.cash_collection_usd),
                      },
                      deliveryCharge: {
                        valueLBP: Number(order.delivery_fees_lbp),
                        valueUSD: Number(order.delivery_fees_usd),
                      },
                      status: order.status,
                      lastUpdate: order.updated_at,
                      note: order.note,
                    }}
                    originalOrder={order}
                    isRowHovered={false}
                    onViewDetails={() => onViewOrder(order)}
                    onEditOrder={() => onEditOrder && onEditOrder(order)}
                    onPrintLabel={() => console.log(`Printing label for order ${order.id}`)}
                    onCreateTicket={() => window.location.href = `/support?order=${order.reference_number}`}
                    onDeleteOrder={() => onDeleteOrder && onDeleteOrder(order)}
                  />
                </TableCell>
              </motion.tr>
            )
          })}
        </TableBody>
      </Table>
    </div>
  );
};
