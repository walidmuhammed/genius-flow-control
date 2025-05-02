
import React from 'react';
import { ChevronLeft, ChevronRight, Eye, Package, MoreHorizontal, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

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
    <div className="rounded-xl border border-border/10 shadow-sm overflow-hidden bg-white mt-4">
      {selectedOrders.length > 0 && (
        <div className="bg-primary/5 py-3 px-6 flex justify-between items-center border-b border-border/5">
          <div className="text-sm font-medium">
            {selectedOrders.length} orders selected
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2 rounded-lg h-8 shadow-sm">
              <Printer className="h-3.5 w-3.5" /> 
              Print Labels
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-lg h-8 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
              onClick={() => toggleSelectAll(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/20 hover:bg-muted/20 border-b border-border/5">
              <TableHead className="w-12 h-12">
                <Checkbox 
                  checked={selectedOrders.length === orders.length && orders.length > 0}
                  onCheckedChange={(checked) => toggleSelectAll(!!checked)}
                  className="rounded-sm"
                />
              </TableHead>
              <TableHead className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                <div className="flex items-center gap-1.5">
                  <Package className="h-3.5 w-3.5" />
                  Order ID
                </div>
              </TableHead>
              <TableHead className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Type</TableHead>
              <TableHead className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Customer</TableHead>
              <TableHead className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Location</TableHead>
              <TableHead className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Amount</TableHead>
              <TableHead className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Delivery Fees</TableHead>
              <TableHead className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Status</TableHead>
              <TableHead className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Last Update</TableHead>
              <TableHead className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-center">Actions</TableHead>
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
      <div className="bg-white border-t border-border/5 px-6 py-4 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Showing <span className="font-medium">1</span> to <span className="font-medium">{orders.length}</span> of <span className="font-medium">36</span> orders
        </span>
        
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" className="rounded-lg border border-border/10 hover:bg-muted/30 shadow-sm" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive className="rounded-lg border border-primary/20 bg-primary/5 text-primary">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" className="rounded-lg border border-border/10 hover:bg-muted/30">2</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" className="rounded-lg border border-border/10 hover:bg-muted/30">3</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" className="rounded-lg border border-border/10 hover:bg-muted/30 shadow-sm" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};

export default OrdersTable;
