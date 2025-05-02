
import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import OrdersTableRow, { Order } from './OrdersTableRow';

interface OrdersTableProps {
  orders: Order[];
  selectedOrders: string[];
  toggleSelectAll: (checked: boolean) => void;
  toggleSelectOrder: (orderId: string) => void;
}

const OrdersTable: React.FC<OrdersTableProps> = ({ 
  orders, 
  selectedOrders, 
  toggleSelectAll, 
  toggleSelectOrder 
}) => {
  return (
    <div className="rounded-lg border border-gray-200 shadow-sm overflow-hidden bg-white mt-4">
      {selectedOrders.length > 0 && (
        <div className="bg-gray-50 py-3 px-6 flex justify-between items-center border-b border-gray-200">
          <div className="text-sm font-medium">
            {selectedOrders.length} orders selected
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-1.5 rounded-md bg-white text-sm border border-gray-200 shadow-sm flex items-center gap-2">
              Print Labels
            </button>
            <button 
              className="px-4 py-1.5 rounded-md bg-white text-sm border border-gray-200 shadow-sm hover:text-red-600"
              onClick={() => toggleSelectAll(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50 border-b border-gray-200">
              <TableHead className="w-12 h-11 pl-4">
                <Checkbox 
                  checked={selectedOrders.length === orders.length && orders.length > 0}
                  onCheckedChange={(checked) => toggleSelectAll(!!checked)}
                />
              </TableHead>
              <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-1.5">
                  Order ID
                </div>
              </TableHead>
              <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Type</TableHead>
              <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Customer</TableHead>
              <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Location</TableHead>
              <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Amount</TableHead>
              <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Delivery Fees</TableHead>
              <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Status</TableHead>
              <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">
                <span className="whitespace-nowrap">Last Update</span>
              </TableHead>
              <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <OrdersTableRow 
                key={order.id}
                order={order}
                isSelected={selectedOrders.includes(order.id)}
                onToggleSelect={toggleSelectOrder}
              />
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between">
        <span className="text-sm text-gray-500">
          Showing <span className="font-medium text-gray-700">1</span> to <span className="font-medium text-gray-700">{orders.length}</span> of <span className="font-medium text-gray-700">36</span> orders
        </span>
        
        <div className="flex items-center gap-1">
          <button className="p-2 border border-gray-200 rounded-md hover:bg-gray-50">
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          <button className="h-8 w-8 bg-[#46d483] text-white rounded-md flex items-center justify-center text-sm font-medium">1</button>
          <button className="h-8 w-8 text-gray-500 hover:bg-gray-100 rounded-md flex items-center justify-center text-sm">2</button>
          <button className="h-8 w-8 text-gray-500 hover:bg-gray-100 rounded-md flex items-center justify-center text-sm">3</button>
          
          <button className="p-2 border border-gray-200 rounded-md hover:bg-gray-50">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrdersTable;
