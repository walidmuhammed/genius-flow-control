
import React, { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import OrdersTableRow from './OrdersTableRow';
import { OrderWithCustomer } from '@/services/orders';
import { mapOrdersToTableFormat } from '@/utils/orderMappers';

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

  const handleConfirmSelection = () => {
    onOrderSelection?.(localSelectedIds);
  };

  const isAllSelected = localSelectedIds.length === orders.length && orders.length > 0;
  const isPartiallySelected = localSelectedIds.length > 0 && localSelectedIds.length < orders.length;

  if (selectionMode) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-border/10 shadow-sm overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/40 border-b border-border/10">
                  <TableHead className="w-12 h-11 pl-4">
                    <Checkbox
                      checked={isAllSelected}
                      ref={(el) => {
                        if (el) {
                          const input = el.querySelector('input') as HTMLInputElement;
                          if (input) input.indeterminate = isPartiallySelected;
                        }
                      }}
                      onCheckedChange={handleSelectAll}
                      className="data-[state=checked]:bg-[#DB271E] data-[state=checked]:border-[#DB271E]"
                    />
                  </TableHead>
                  <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Order</TableHead>
                  <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Customer</TableHead>
                  <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Location</TableHead>
                  <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Amount</TableHead>
                  <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id} className="border-b border-border/5 hover:bg-muted/30 transition-colors">
                    <TableCell className="pl-4">
                      <Checkbox
                        checked={localSelectedIds.includes(order.id)}
                        onCheckedChange={(checked) => handleSelectOrder(order.id, checked as boolean)}
                        className="data-[state=checked]:bg-[#DB271E] data-[state=checked]:border-[#DB271E]"
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{order.reference_number}</p>
                        <p className="text-xs text-gray-500">#{order.order_id}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{order.customer?.name}</p>
                        <p className="text-xs text-gray-500">{order.customer?.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{order.customer?.city_name}</p>
                        <p className="text-xs text-gray-500">{order.customer?.governorate_name}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">${order.cash_collection_usd || 0}</p>
                        <p className="text-xs text-gray-500">{order.cash_collection_lbp || 0} LBP</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {order.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        
        {localSelectedIds.length > 0 && (
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium">
              {localSelectedIds.length} order{localSelectedIds.length !== 1 ? 's' : ''} selected
            </p>
            <Button onClick={handleConfirmSelection} className="bg-[#DB271E] hover:bg-[#c0211a] text-white">
              Select {localSelectedIds.length} Order{localSelectedIds.length !== 1 ? 's' : ''}
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/10 shadow-sm overflow-hidden bg-white mt-4">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/40 border-b border-border/10">
              <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Order</TableHead>
              <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Customer</TableHead>
              <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Location</TableHead>
              <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Amount</TableHead>
              <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Delivery Charge</TableHead>
              <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Status</TableHead>
              <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Last Update</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mappedOrders.map((order) => (
              <OrdersTableRow 
                key={order.id} 
                order={order}
                isSelected={false}
                onToggleSelect={() => {}}
              />
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="bg-white border-t border-border/10 px-6 py-4 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Showing <span className="font-medium text-foreground">{1}</span> to <span className="font-medium text-foreground">{mappedOrders.length}</span> of <span className="font-medium text-foreground">{mappedOrders.length}</span> orders
        </span>
      </div>
    </div>
  );
};

// Add default export for backward compatibility
export default OrdersTable;
