
import React from 'react';
import { Eye, MoreHorizontal, Printer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { TableRow, TableCell } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type OrderStatus = 'Successful' | 'Returned' | 'Delayed' | 'In Progress' | 'Pending';
export type OrderType = 'Deliver' | 'Cash Collection' | 'Return';

export interface Order {
  id: string;
  type: OrderType;
  customer: {
    name: string;
    phone: string;
  };
  location: {
    city: string;
    area: string;
  };
  amount: {
    valueLBP: number;
    valueUSD: number;
  };
  deliveryCharge: number;
  status: OrderStatus;
  lastUpdate: string;
}

interface OrdersTableRowProps {
  order: Order;
  isSelected: boolean;
  onToggleSelect: (orderId: string) => void;
}

const getStatusBadge = (status: OrderStatus) => {
  switch (status) {
    case 'Successful':
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-100 font-medium">Successful</Badge>;
    case 'Returned':
      return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-100 font-medium">Returned</Badge>;
    case 'Delayed':
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-100 font-medium">Delayed</Badge>;
    case 'In Progress':
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100 font-medium">In Progress</Badge>;
    case 'Pending':
      return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-100 font-medium">Pending</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const OrdersTableRow: React.FC<OrdersTableRowProps> = ({ order, isSelected, onToggleSelect }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'MMM dd, yyyy h:mm a');
  };

  return (
    <TableRow 
      className={cn(
        "hover:bg-muted/20 transition-colors",
        isSelected && "bg-primary/5"
      )}
    >
      <TableCell className="w-12">
        <Checkbox 
          checked={isSelected}
          onCheckedChange={() => onToggleSelect(order.id)}
          className="rounded-sm"
        />
      </TableCell>
      <TableCell className="font-medium text-primary">
        #{order.id}
      </TableCell>
      <TableCell>
        <Badge variant="secondary" className="font-medium">
          {order.type}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex flex-col">
          <span className="font-medium">{order.customer.name}</span>
          <span className="text-muted-foreground text-sm">{order.customer.phone}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex flex-col">
          <span className="font-medium">{order.location.city}</span>
          <span className="text-muted-foreground text-xs">{order.location.area}</span>
        </div>
      </TableCell>
      <TableCell>
        {(order.amount.valueUSD > 0 || order.amount.valueLBP > 0) ? (
          <div className="flex flex-col">
            <span className="text-green-600 font-medium">
              ${order.amount.valueUSD}
            </span>
            <span className="text-muted-foreground text-xs">
              {order.amount.valueLBP.toLocaleString()} LBP
            </span>
          </div>
        ) : (
          <div className="flex flex-col">
            <span className="text-muted-foreground">$0</span>
            <span className="text-muted-foreground text-xs">0 LBP</span>
          </div>
        )}
      </TableCell>
      <TableCell>
        {getStatusBadge(order.status)}
      </TableCell>
      <TableCell>
        <span className="font-medium">${order.deliveryCharge}</span>
      </TableCell>
      <TableCell>
        <span className="text-muted-foreground text-sm">{formatDate(order.lastUpdate)}</span>
      </TableCell>
      <TableCell>
        <div className="flex justify-center items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-muted/50">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-muted/50">
            <Printer className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-muted/50">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[180px] shadow-lg border-border/10 rounded-lg p-1">
              <DropdownMenuItem className="rounded-md py-1.5 px-2 hover:bg-muted/50">View Details</DropdownMenuItem>
              <DropdownMenuItem className="rounded-md py-1.5 px-2 hover:bg-muted/50">Edit Order</DropdownMenuItem>
              <DropdownMenuItem className="rounded-md py-1.5 px-2 hover:bg-muted/50">Print Label</DropdownMenuItem>
              <DropdownMenuItem className="rounded-md py-1.5 px-2 hover:bg-red-50 hover:text-red-600 focus:bg-red-50 focus:text-red-600">Cancel Order</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default OrdersTableRow;
