
import React, { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, MoreHorizontal, Filter, Download } from 'lucide-react';
import OrdersTableRow from './OrdersTableRow';
import { OrderWithCustomer } from '@/services/orders';
import { mapOrdersToTableFormat } from '@/utils/orderMappers';
import { formatDate } from '@/utils/format';

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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new':
        return 'text-blue-600 bg-blue-50';
      case 'pending pickup':
        return 'text-orange-600 bg-orange-50';
      case 'in progress':
        return 'text-yellow-600 bg-yellow-50';
      case 'heading to customer':
        return 'text-purple-600 bg-purple-50';
      case 'heading to you':
        return 'text-indigo-600 bg-indigo-50';
      case 'successful':
        return 'text-green-600 bg-green-50';
      case 'unsuccessful':
        return 'text-red-600 bg-red-50';
      case 'returned':
        return 'text-gray-600 bg-gray-50';
      case 'paid':
        return 'text-emerald-600 bg-emerald-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'deliver':
        return 'text-blue-600 bg-blue-50';
      case 'exchange':
        return 'text-orange-600 bg-orange-50';
      case 'cash collection':
        return 'text-green-600 bg-green-50';
      case 'return':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (selectionMode) {
    return (
      <div className="space-y-4">
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 border-b border-gray-200">
                <TableHead className="w-12 text-xs font-medium text-gray-500 uppercase tracking-wide pl-6">
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
                <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wide">ORDER ID</TableHead>
                <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wide">REFERENCE</TableHead>
                <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wide">CUSTOMER</TableHead>
                <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wide">LOCATION</TableHead>
                <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wide">AMOUNT</TableHead>
                <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wide">STATUS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <TableCell className="pl-6">
                    <Checkbox
                      checked={localSelectedIds.includes(order.id)}
                      onCheckedChange={(checked) => handleSelectOrder(order.id, checked as boolean)}
                      className="data-[state=checked]:bg-[#DB271E] data-[state=checked]:border-[#DB271E]"
                    />
                  </TableCell>
                  <TableCell className="font-medium text-blue-600">
                    #{order.order_id?.toString().padStart(3, '0') || order.id}
                  </TableCell>
                  <TableCell>
                    {order.reference_number ? (
                      <span className="font-medium">{order.reference_number}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-gray-900">{order.customer?.name}</div>
                      <div className="text-sm text-gray-500">{order.customer?.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div>{order.customer?.city_name}</div>
                      <div className="text-sm text-gray-500">{order.customer?.governorate_name}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      {order.cash_collection_usd > 0 && (
                        <div className="font-medium">${order.cash_collection_usd}</div>
                      )}
                      {order.cash_collection_lbp > 0 && (
                        <div className="text-sm text-gray-500">{order.cash_collection_lbp.toLocaleString()} LBP</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {localSelectedIds.length > 0 && (
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm font-medium text-blue-900">
              {localSelectedIds.length} order{localSelectedIds.length !== 1 ? 's' : ''} selected
            </p>
            <Button onClick={handleConfirmSelection} className="bg-blue-600 hover:bg-blue-700">
              Select {localSelectedIds.length} Order{localSelectedIds.length !== 1 ? 's' : ''}
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mt-6">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 border-b border-gray-200">
              <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wide pl-6">ORDER ID</TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wide">REFERENCE</TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wide">TYPE</TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wide">CUSTOMER</TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wide">LOCATION</TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wide">AMOUNT</TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wide">DELIVERY CHARGE</TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wide">STATUS</TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wide">LAST UPDATE</TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wide">ACTIONS</TableHead>
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
    </>
  );
};

export default OrdersTable;
