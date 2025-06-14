import React, { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, MoreHorizontal, Printer } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import OrdersTableRow from './OrdersTableRow';
import { OrderWithCustomer } from '@/services/orders';
import { mapOrdersToTableFormat } from '@/utils/orderMappers';
import { formatDate } from '@/utils/format';
import { cn } from '@/lib/utils';

interface OrdersTableProps {
  orders: OrderWithCustomer[];
  onOrderSelection?: (orderIds: string[]) => void;
  selectionMode?: boolean;
  selectedOrderIds?: string[];
}

export const OrdersTable: React.FC<OrdersTableProps> = ({ 
  orders, 
  onOrderSelection, 
  selectionMode = false,
  selectedOrderIds = []
}) => {
  const [localSelectedIds, setLocalSelectedIds] = useState<string[]>(selectedOrderIds);
  
  const mappedOrders = useMemo(() => mapOrdersToTableFormat(orders), [orders]);

  const handleSelectAll = (checked: boolean) => {
    const newSelection = checked ? orders.map(order => order.id) : [];
    setLocalSelectedIds(newSelection);
  };

  const handleSelectOrder = (orderId: string, checked: boolean) => {
    setLocalSelectedIds(prev => 
      checked 
        ? [...prev, orderId]
        : prev.filter(id => id !== orderId)
    );
  };

  const handleRowClick = (orderId: string) => {
    if (selectionMode) {
      const isSelected = localSelectedIds.includes(orderId);
      handleSelectOrder(orderId, !isSelected);
    }
  };

  const handleConfirmSelection = () => {
    onOrderSelection?.(localSelectedIds);
  };

  const isAllSelected = localSelectedIds.length === orders.length && orders.length > 0;
  const isPartiallySelected = localSelectedIds.length > 0 && localSelectedIds.length < orders.length;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'pending pickup':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'in progress':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'heading to customer':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'heading to you':
        return 'text-indigo-600 bg-indigo-50 border-indigo-200';
      case 'successful':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'unsuccessful':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'returned':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'paid':
        return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'shipment':
        // Update to green
        return 'text-green-600 bg-green-50 border-green-200';
      case 'exchange':
        // Update to purple
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'cash collection':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'return':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (selectionMode) {
    return (
      <div className="space-y-4">
        <div className="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/30 rounded-2xl overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-200/30 dark:border-gray-700/30 hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                <TableHead className="w-12 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider pl-6">
                  <Checkbox
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) {
                        const input = el.querySelector('input') as HTMLInputElement;
                        if (input) input.indeterminate = isPartiallySelected;
                      }
                    }}
                    onCheckedChange={handleSelectAll}
                    className="data-[state=checked]:bg-[#DB271E] data-[state=checked]:border-[#DB271E] rounded-md"
                  />
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">ORDER ID</TableHead>
                <TableHead className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">REFERENCE</TableHead>
                <TableHead className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">CUSTOMER</TableHead>
                <TableHead className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">LOCATION</TableHead>
                <TableHead className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">AMOUNT</TableHead>
                <TableHead className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">STATUS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow 
                  key={order.id} 
                  className="border-b border-gray-100/50 dark:border-gray-700/30 hover:bg-gray-50/30 dark:hover:bg-gray-800/30 transition-all duration-200 cursor-pointer"
                  onClick={() => handleRowClick(order.id)}
                >
                  <TableCell className="pl-6" onClick={e => e.stopPropagation()}>
                    <Checkbox
                      checked={localSelectedIds.includes(order.id)}
                      onCheckedChange={(checked) => handleSelectOrder(order.id, checked as boolean)}
                      className="data-[state=checked]:bg-[#DB271E] data-[state=checked]:border-[#DB271E] rounded-md"
                    />
                  </TableCell>
                  <TableCell className="font-semibold text-[#DB271E]">
                    #{order.order_id?.toString().padStart(3, '0') || order.id}
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {localSelectedIds.length > 0 && (
          <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              {localSelectedIds.length} order{localSelectedIds.length !== 1 ? 's' : ''} selected
            </p>
            <Button onClick={handleConfirmSelection} className="bg-blue-600 hover:bg-blue-700 rounded-xl">
              Select {localSelectedIds.length} Order{localSelectedIds.length !== 1 ? 's' : ''}
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/30 rounded-2xl overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-200/30 dark:border-gray-700/30 hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
            <TableHead className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider pl-6">ORDER ID</TableHead>
            <TableHead className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">REFERENCE</TableHead>
            <TableHead className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">TYPE</TableHead>
            <TableHead className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">CUSTOMER</TableHead>
            <TableHead className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">LOCATION</TableHead>
            <TableHead className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">AMOUNT</TableHead>
            <TableHead className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">DELIVERY CHARGE</TableHead>
            <TableHead className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">STATUS</TableHead>
            <TableHead className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">LAST UPDATE</TableHead>
            <TableHead className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">ACTIONS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mappedOrders.map((order) => (
            <OrdersTableRow
              key={order.id}
              order={order}
              isSelected={false}
              onToggleSelect={() => {}}
              showActions={true}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default OrdersTable;
