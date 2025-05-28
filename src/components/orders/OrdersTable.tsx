
import React, { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit } from 'lucide-react';
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
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending pickup':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'in progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'heading to customer':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'heading to you':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'successful':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'unsuccessful':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'returned':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'paid':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'deliver':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'exchange':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'cash collection':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'return':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

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
                  <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Order ID</TableHead>
                  <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Reference</TableHead>
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
                    <TableCell className="font-medium">
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
                      <div className="flex flex-col">
                        <span className="font-medium">{order.customer?.name}</span>
                        <span className="text-xs text-muted-foreground mt-0.5">{order.customer?.phone}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{order.customer?.city_name}</span>
                        <span className="text-xs text-muted-foreground mt-0.5">{order.customer?.governorate_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        {order.cash_collection_usd > 0 && (
                          <span className="font-medium">${order.cash_collection_usd}</span>
                        )}
                        {order.cash_collection_lbp > 0 && (
                          <span className="text-xs text-muted-foreground mt-0.5">{order.cash_collection_lbp.toLocaleString()} LBP</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={`${getStatusColor(order.status)} border px-2 py-0.5 text-xs font-medium`}
                      >
                        {order.status}
                      </Badge>
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
            <Button onClick={handleConfirmSelection}>
              Select {localSelectedIds.length} Order{localSelectedIds.length !== 1 ? 's' : ''}
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border border-border/10 shadow-sm overflow-hidden bg-white mt-4">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/40 border-b border-border/10">
                <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Order ID</TableHead>
                <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Reference</TableHead>
                <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Type</TableHead>
                <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Customer</TableHead>
                <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Location</TableHead>
                <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Amount</TableHead>
                <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Delivery Charge</TableHead>
                <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Status</TableHead>
                <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Last Update</TableHead>
                <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mappedOrders.map((order) => (
                <TableRow 
                  key={order.id} 
                  className="border-b border-border/5 hover:bg-muted/30 transition-colors"
                >
                  <TableCell className="font-medium">#{order.id}</TableCell>
                  <TableCell>
                    {order.referenceNumber ? (
                      <span className="font-medium">{order.referenceNumber}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={`${getTypeColor(order.type)} border px-2 py-0.5 text-xs font-medium`}
                    >
                      {order.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{order.customer.name}</span>
                      <span className="text-xs text-muted-foreground mt-0.5">{order.customer.phone}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{order.location.city}</span>
                      <span className="text-xs text-muted-foreground mt-0.5">{order.location.area}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      {order.amount.valueUSD > 0 && (
                        <span className="font-medium">${order.amount.valueUSD}</span>
                      )}
                      {order.amount.valueLBP > 0 && (
                        <span className="text-xs text-muted-foreground mt-0.5">{order.amount.valueLBP.toLocaleString()} LBP</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      {order.deliveryCharge.valueUSD > 0 && (
                        <span className="font-medium">${order.deliveryCharge.valueUSD}</span>
                      )}
                      {order.deliveryCharge.valueLBP > 0 && (
                        <span className="text-xs text-muted-foreground mt-0.5">{order.deliveryCharge.valueLBP.toLocaleString()} LBP</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={`${getStatusColor(order.status)} border px-2 py-0.5 text-xs font-medium`}
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {formatDate(new Date(order.lastUpdate))}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
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
    </>
  );
};

export default OrdersTable;
