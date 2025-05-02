import React from 'react';
import { Eye, MoreHorizontal, Printer, MapPin, User, DollarSign, Truck, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { TableRow, TableCell } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
export type OrderStatus = 'New' | 'Pending Pickup' | 'In Progress' | 'Heading to Customer' | 'Heading to You' | 'Successful' | 'Unsuccessful' | 'Returned' | 'Paid';
export type OrderType = 'Deliver' | 'Exchange' | 'Cash Collection' | 'Return';
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
  deliveryCharge: {
    valueLBP: number;
    valueUSD: number;
  };
  status: OrderStatus;
  lastUpdate: string;
  note?: string;
}
interface OrdersTableRowProps {
  order: Order;
  isSelected: boolean;
  onToggleSelect: (orderId: string) => void;
}
const getStatusBadge = (status: OrderStatus) => {
  switch (status) {
    case 'New':
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100 font-medium px-2.5 py-0.5">New</Badge>;
    case 'Pending Pickup':
      return <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-100 font-medium px-2.5 py-0.5">Pending Pickup</Badge>;
    case 'In Progress':
      return <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-100 font-medium px-2.5 py-0.5">In Progress</Badge>;
    case 'Heading to Customer':
      return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-100 font-medium px-2.5 py-0.5 rounded">Heading to Customer</Badge>;
    case 'Heading to You':
      return <Badge variant="outline" className="bg-teal-50 text-teal-600 border-teal-100 font-medium px-2.5 py-0.5">Heading to You</Badge>;
    case 'Successful':
      return <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-100 font-medium px-2.5 py-0.5">Successful</Badge>;
    case 'Unsuccessful':
      return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-100 font-medium px-2.5 py-0.5">Unsuccessful</Badge>;
    case 'Returned':
      return <Badge variant="outline" className="bg-sky-50 text-sky-600 border-sky-100 font-medium px-2.5 py-0.5">Returned</Badge>;
    case 'Paid':
      return <Badge variant="outline" className="bg-indigo-50 text-indigo-600 border-indigo-100 font-medium px-2.5 py-0.5">Paid</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};
const OrdersTableRow: React.FC<OrdersTableRowProps> = ({
  order,
  isSelected,
  onToggleSelect
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'MMM dd, h:mm a');
  };
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  };
  return <TableRow className={cn("hover:bg-muted/10 transition-colors border-b last:border-0 border-border/10", isSelected && "bg-primary/5")}>
      <TableCell className="w-12 pl-4 pr-0">
        <Checkbox checked={isSelected} onCheckedChange={() => onToggleSelect(order.id)} className="rounded-sm" />
      </TableCell>
      <TableCell className="py-4">
        <div className="flex items-center gap-1.5">
          <span className="font-medium text-primary">#{order.id}</span>
          {order.note && <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="cursor-help">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs border border-border/20 shadow-lg rounded-md bg-white p-3">
                  <p className="text-sm">{order.note || "No notes available for this order."}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>}
        </div>
      </TableCell>
      <TableCell className="py-4">
        <Badge variant="secondary" className="font-medium bg-muted/70 text-muted-foreground border border-border/10 rounded">
          {order.type}
        </Badge>
      </TableCell>
      <TableCell className="py-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            
            <span className="font-medium">{order.customer.name}</span>
          </div>
          <span className="text-muted-foreground text-xs pt-0.5">{order.customer.phone}</span>
        </div>
      </TableCell>
      <TableCell className="py-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-medium">{order.location.city}</span>
          </div>
          <span className="text-muted-foreground text-xs pt-0.5">{order.location.area}</span>
        </div>
      </TableCell>
      <TableCell className="py-4">
        {order.amount.valueUSD > 0 || order.amount.valueLBP > 0 ? <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              
              <span className="text-emerald-600 font-medium">
                ${formatCurrency(order.amount.valueUSD)}
              </span>
            </div>
            <span className="text-muted-foreground text-xs pt-0.5">
              {formatCurrency(order.amount.valueLBP)} LBP
            </span>
          </div> : <div className="flex flex-col">
            <span className="text-muted-foreground">$0</span>
            <span className="text-muted-foreground text-xs pt-0.5">0 LBP</span>
          </div>}
      </TableCell>
      <TableCell className="py-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <Truck className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-medium">
              ${formatCurrency(order.deliveryCharge.valueUSD)}
            </span>
          </div>
          <span className="text-muted-foreground text-xs pt-0.5">
            {formatCurrency(order.deliveryCharge.valueLBP)} LBP
          </span>
        </div>
      </TableCell>
      <TableCell className="py-4">
        {getStatusBadge(order.status)}
      </TableCell>
      <TableCell>
        <span className="text-muted-foreground whitespace-nowrap text-center font-normal text-sm">{formatDate(order.lastUpdate)}</span>
      </TableCell>
      <TableCell>
        <div className="flex justify-center items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/10">
            <Eye className="h-4 w-4 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/10">
            <Printer className="h-4 w-4 text-muted-foreground" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/10">
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px] shadow-lg border-border/10 rounded-lg p-1">
              <DropdownMenuItem className="rounded-md py-2 px-3 cursor-pointer hover:bg-muted/20 focus:bg-muted/20">View Order Details</DropdownMenuItem>
              <DropdownMenuItem className="rounded-md py-2 px-3 cursor-pointer hover:bg-muted/20 focus:bg-muted/20">Edit Order</DropdownMenuItem>
              <DropdownMenuItem className="rounded-md py-2 px-3 cursor-pointer hover:bg-muted/20 focus:bg-muted/20">Print Shipping Label</DropdownMenuItem>
              <DropdownMenuSeparator className="my-1.5 bg-border/10" />
              <DropdownMenuItem className="rounded-md py-2 px-3 cursor-pointer hover:bg-red-50 hover:text-red-600 focus:bg-red-50 focus:text-red-600">Cancel Order</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>;
};
export default OrdersTableRow;