
import React from 'react';
import { ChevronLeft, ChevronRight, Eye, Package, MoreHorizontal, Printer, FileText } from 'lucide-react';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
            <Button variant="outline" size="sm" className="gap-2 rounded-lg h-9 shadow-sm">
              <Printer className="h-3.5 w-3.5" /> 
              Print Labels
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-lg h-9 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
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
            <TableRow className="bg-muted/20 hover:bg-muted/20 border-b border-border/10">
              <TableHead className="w-12 h-11 pl-4">
                <Checkbox 
                  checked={selectedOrders.length === orders.length && orders.length > 0}
                  onCheckedChange={(checked) => toggleSelectAll(!!checked)}
                  className="rounded-sm"
                />
              </TableHead>
              <TableHead className="font-medium text-xs text-muted-foreground uppercase tracking-wider">
                <div className="flex items-center gap-1.5">
                  <Package className="h-3.5 w-3.5" />
                  Order ID
                </div>
              </TableHead>
              <TableHead className="font-medium text-xs text-muted-foreground uppercase tracking-wider">Type</TableHead>
              <TableHead className="font-medium text-xs text-muted-foreground uppercase tracking-wider">Customer</TableHead>
              <TableHead className="font-medium text-xs text-muted-foreground uppercase tracking-wider">Location</TableHead>
              <TableHead className="font-medium text-xs text-muted-foreground uppercase tracking-wider">Amount</TableHead>
              <TableHead className="font-medium text-xs text-muted-foreground uppercase tracking-wider">Delivery Fees</TableHead>
              <TableHead className="font-medium text-xs text-muted-foreground uppercase tracking-wider">Status</TableHead>
              <TableHead className="font-medium text-xs text-muted-foreground uppercase tracking-wider">
                <span className="whitespace-nowrap">Last Update</span>
              </TableHead>
              <TableHead className="font-medium text-xs text-muted-foreground uppercase tracking-wider text-center">Actions</TableHead>
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
      <div className="bg-white border-t border-border/10 px-6 py-4 flex items-center justify-between">
        <span className="text-sm text-muted-foreground font-medium">
          Showing <span className="text-foreground">1</span> to <span className="text-foreground">{orders.length}</span> of <span className="text-foreground">36</span> orders
        </span>
        
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" className="rounded-lg border border-border/10 hover:bg-muted/30 shadow-sm" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive className="rounded-lg border border-primary/20 bg-primary/5 text-primary font-medium">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" className="rounded-lg border border-border/10 hover:bg-muted/30 font-medium">2</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" className="rounded-lg border border-border/10 hover:bg-muted/30 font-medium">3</PaginationLink>
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
