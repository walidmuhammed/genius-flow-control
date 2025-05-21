
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Download, Filter, Search } from 'lucide-react';
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
import OrderDetailsDialog from './OrderDetailsDialog';
import { useScreenSize } from '@/hooks/useScreenSize';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import OrdersTableMobile from './OrdersTableMobile';

interface OrdersTableProps {
  orders: Order[];
  selectedOrders: string[];
  toggleSelectAll: (checked: boolean) => void;
  toggleSelectOrder: (orderId: string) => void;
  showActions?: boolean;
}

const OrdersTable: React.FC<OrdersTableProps> = ({ 
  orders, 
  selectedOrders, 
  toggleSelectAll, 
  toggleSelectOrder,
  showActions = true
}) => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const { isMobile } = useScreenSize();
  
  const handleViewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setDetailsDialogOpen(true);
  };
  
  if (isMobile) {
    return (
      <>
        <OrdersTableMobile
          orders={orders}
          selectedOrders={selectedOrders}
          toggleSelectOrder={toggleSelectOrder}
          onViewDetails={handleViewOrderDetails}
          showActions={showActions}
        />
        
        <OrderDetailsDialog 
          order={selectedOrder}
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
        />
      </>
    );
  }
  
  return (
    <>
      <div className="rounded-xl border border-border/10 shadow-sm overflow-hidden bg-white mt-4">
        {selectedOrders.length > 0 && (
          <div className="bg-[#DB271E]/5 py-3 px-6 flex justify-between items-center border-b border-border/10">
            <div className="text-sm font-medium text-[#DB271E]">
              {selectedOrders.length} orders selected
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-1.5 rounded-lg bg-white text-sm border border-border/20 shadow-sm flex items-center gap-2 hover:border-[#DB271E]/50 transition-colors">
                Print Labels
              </button>
              <button 
                className="px-4 py-1.5 rounded-lg bg-white text-sm border border-border/20 shadow-sm hover:text-[#DB271E] transition-colors"
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
              <TableRow className="bg-muted/20 hover:bg-muted/30 border-b border-border/10">
                <TableHead className="w-12 h-11 pl-4">
                  <Checkbox 
                    checked={selectedOrders.length === orders.length && orders.length > 0}
                    onCheckedChange={(checked) => toggleSelectAll(!!checked)}
                    className="data-[state=checked]:bg-[#DB271E] data-[state=checked]:border-[#DB271E]"
                  />
                </TableHead>
                <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    Order ID
                  </div>
                </TableHead>
                <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">
                  Reference No.
                </TableHead>
                <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Type</TableHead>
                <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Customer</TableHead>
                <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Location</TableHead>
                <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Amount</TableHead>
                <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Delivery Fees</TableHead>
                <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Status</TableHead>
                {showActions && (
                  <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider text-center">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <OrdersTableRow 
                  key={order.id}
                  order={order}
                  isSelected={selectedOrders.includes(order.id)}
                  onToggleSelect={toggleSelectOrder}
                  onViewDetails={handleViewOrderDetails}
                  showActions={showActions}
                />
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="bg-white border-t border-border/10 px-6 py-4 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{1}</span> to <span className="font-medium text-foreground">{orders.length}</span> of <span className="font-medium text-foreground">36</span> orders
          </span>
          
          <div className="flex items-center gap-1">
            <button className="p-2 border border-border/20 rounded-lg hover:bg-muted/30 transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            <button className="h-8 w-8 bg-[#DB271E] text-white rounded-lg flex items-center justify-center text-sm font-medium shadow-sm">1</button>
            <button className="h-8 w-8 text-muted-foreground hover:bg-muted/30 rounded-lg flex items-center justify-center text-sm transition-colors">2</button>
            <button className="h-8 w-8 text-muted-foreground hover:bg-muted/30 rounded-lg flex items-center justify-center text-sm transition-colors">3</button>
            
            <button className="p-2 border border-border/20 rounded-lg hover:bg-muted/30 transition-colors">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      
      <OrderDetailsDialog 
        order={selectedOrder}
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
      />
    </>
  );
};

export default OrdersTable;
