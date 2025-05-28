
import React, { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
      <div className="space-y-6">
        <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Select Orders for Pickup</h3>
              <div className="text-sm text-gray-500">
                {localSelectedIds.length} of {orders.length} orders selected
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-hidden rounded-b-xl">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/80 border-b border-gray-200 hover:bg-gray-50/80">
                    <TableHead className="w-12 pl-6">
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
                    <TableHead className="font-semibold text-gray-700">Order</TableHead>
                    <TableHead className="font-semibold text-gray-700">Customer</TableHead>
                    <TableHead className="font-semibold text-gray-700">Location</TableHead>
                    <TableHead className="font-semibold text-gray-700">Amount</TableHead>
                    <TableHead className="font-semibold text-gray-700">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order, index) => (
                    <TableRow 
                      key={order.id} 
                      className={`
                        border-b border-gray-100 hover:bg-blue-50/30 transition-colors duration-200
                        ${localSelectedIds.includes(order.id) ? 'bg-blue-50/50' : 'bg-white'}
                        ${index === orders.length - 1 ? 'border-b-0' : ''}
                      `}
                    >
                      <TableCell className="pl-6">
                        <Checkbox
                          checked={localSelectedIds.includes(order.id)}
                          onCheckedChange={(checked) => handleSelectOrder(order.id, checked as boolean)}
                          className="data-[state=checked]:bg-[#DB271E] data-[state=checked]:border-[#DB271E]"
                        />
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="space-y-1">
                          <p className="font-semibold text-gray-900 text-sm">{order.reference_number}</p>
                          <p className="text-xs text-gray-500">#{order.order_id}</p>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="space-y-1">
                          <p className="font-medium text-gray-900 text-sm">{order.customer?.name}</p>
                          <p className="text-xs text-gray-500">{order.customer?.phone}</p>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="space-y-1">
                          <p className="text-sm text-gray-900">{order.customer?.city_name}</p>
                          <p className="text-xs text-gray-500">{order.customer?.governorate_name}</p>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-gray-900">${order.cash_collection_usd || 0}</p>
                          <p className="text-xs text-gray-500">{order.cash_collection_lbp || 0} LBP</p>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                          {order.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        
        {localSelectedIds.length > 0 && (
          <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-[#DB271E] rounded-full animate-pulse"></div>
                  <p className="text-sm font-semibold text-gray-900">
                    {localSelectedIds.length} order{localSelectedIds.length !== 1 ? 's' : ''} selected for pickup
                  </p>
                </div>
                <Button 
                  onClick={handleConfirmSelection} 
                  className="bg-[#DB271E] hover:bg-[#c0211a] text-white shadow-lg px-6 py-2 rounded-lg font-medium"
                >
                  Confirm Selection ({localSelectedIds.length})
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
      <CardContent className="p-0">
        <div className="overflow-hidden rounded-xl">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/80 border-b border-gray-200 hover:bg-gray-50/80">
                <TableHead className="font-semibold text-gray-700 pl-6">Order</TableHead>
                <TableHead className="font-semibold text-gray-700">Customer</TableHead>
                <TableHead className="font-semibold text-gray-700">Location</TableHead>
                <TableHead className="font-semibold text-gray-700">Amount</TableHead>
                <TableHead className="font-semibold text-gray-700">Delivery Charge</TableHead>
                <TableHead className="font-semibold text-gray-700">Status</TableHead>
                <TableHead className="font-semibold text-gray-700">Last Update</TableHead>
                <TableHead className="w-[50px] pr-6"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mappedOrders.map((order, index) => (
                <div key={order.id} className={`border-b border-gray-100 ${index === mappedOrders.length - 1 ? 'border-b-0' : ''}`}>
                  <OrdersTableRow 
                    order={order}
                    isSelected={false}
                    onToggleSelect={() => {}}
                  />
                </div>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

// Add default export for backward compatibility
export default OrdersTable;
