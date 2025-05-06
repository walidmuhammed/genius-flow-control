
import React from 'react';
import { Eye, MoreHorizontal, Printer, FileText } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { TableRow, TableCell } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export type OrderStatus = 'New' | 'Pending Pickup' | 'In Progress' | 'Heading to Customer' | 'Heading to You' | 'Successful' | 'Unsuccessful' | 'Returned' | 'Paid';
export type OrderType = 'Deliver' | 'Exchange' | 'Cash Collection' | 'Return';

export interface Order {
  id: string;
  referenceNumber: string;
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
  onViewDetails?: (order: Order) => void;
  showActions?: boolean;
}

const getStatusBadge = (status: OrderStatus) => {
  switch (status) {
    case 'New':
      return <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">New</span>;
    case 'Pending Pickup':
      return <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-xs font-medium">Pending Pickup</span>;
    case 'In Progress':
      return <span className="px-3 py-1 bg-yellow-50 text-yellow-600 rounded-full text-xs font-medium">In Progress</span>;
    case 'Heading to Customer':
      return <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-medium">Heading to Customer</span>;
    case 'Heading to You':
      return <span className="px-3 py-1 bg-teal-50 text-teal-600 rounded-full text-xs font-medium">Heading to You</span>;
    case 'Successful':
      return <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-medium">Successful</span>;
    case 'Unsuccessful':
      return <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-medium">Unsuccessful</span>;
    case 'Returned':
      return <span className="px-3 py-1 bg-sky-50 text-sky-600 rounded-full text-xs font-medium">Returned</span>;
    case 'Paid':
      return <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-medium">Paid</span>;
    default:
      return <span className="px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-xs font-medium">{status}</span>;
  }
};

const OrdersTableRow: React.FC<OrdersTableRowProps> = ({
  order,
  isSelected,
  onToggleSelect,
  onViewDetails,
  showActions = true
}) => {
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  };
  
  const handleRowClick = () => {
    if (onViewDetails) {
      onViewDetails(order);
    }
  };

  return (
    <TableRow 
      className={cn(
        "hover:bg-gray-50 border-b border-gray-200 cursor-pointer", 
        isSelected && "bg-gray-50"
      )}
      onClick={handleRowClick}
    >
      <TableCell className="w-12 pl-4 pr-0" onClick={(e) => e.stopPropagation()}>
        <Checkbox 
          checked={isSelected} 
          onCheckedChange={() => onToggleSelect(order.id)} 
        />
      </TableCell>
      <TableCell className="py-4">
        <div className="flex items-center gap-1.5">
          <span className="font-medium text-gray-900">#{order.id}</span>
          {order.note && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="cursor-help">
                    <FileText className="h-3.5 w-3.5 text-gray-400" />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs border border-gray-200 shadow-lg rounded-md bg-white p-3">
                  <p className="text-sm">{order.note || "No notes available for this order."}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </TableCell>
      <TableCell className="py-4">
        <span className="font-medium text-gray-900">{order.referenceNumber}</span>
      </TableCell>
      <TableCell className="py-4">
        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
          {order.type}
        </span>
      </TableCell>
      <TableCell className="py-4">
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{order.customer.name}</span>
          <span className="text-gray-500 text-xs mt-0.5">{order.customer.phone}</span>
        </div>
      </TableCell>
      <TableCell className="py-4">
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{order.location.city}</span>
          <span className="text-gray-500 text-xs mt-0.5">{order.location.area}</span>
        </div>
      </TableCell>
      <TableCell className="py-4">
        {order.amount.valueUSD > 0 || order.amount.valueLBP > 0 ? (
          <div className="flex flex-col">
            <span className="text-gray-900 font-medium">
              ${formatCurrency(order.amount.valueUSD)}
            </span>
            <span className="mt-0.5 text-xs font-medium text-gray-700">
              {formatCurrency(order.amount.valueLBP)} LBP
            </span>
          </div>
        ) : (
          <div className="flex flex-col">
            <span className="text-gray-500">$0</span>
            <span className="text-gray-500 text-xs mt-0.5">0 LBP</span>
          </div>
        )}
      </TableCell>
      <TableCell className="py-4">
        <div className="flex flex-col">
          <span className="text-gray-900 font-medium">
            ${formatCurrency(order.deliveryCharge.valueUSD)}
          </span>
          <span className="text-xs mt-0.5 font-medium text-gray-800">
            {formatCurrency(order.deliveryCharge.valueLBP)} LBP
          </span>
        </div>
      </TableCell>
      <TableCell className="py-4">
        {getStatusBadge(order.status)}
      </TableCell>
      {showActions && (
        <TableCell>
          <div className="flex justify-center items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <button 
              className="h-8 w-8 rounded-md hover:bg-gray-100 flex items-center justify-center"
              onClick={(e) => {
                e.stopPropagation();
                if (onViewDetails) {
                  onViewDetails(order);
                }
              }}
            >
              <Eye className="h-4 w-4 text-gray-500" />
            </button>
            <button className="h-8 w-8 rounded-md hover:bg-gray-100 flex items-center justify-center">
              <Printer className="h-4 w-4 text-gray-500" />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  className="h-8 w-8 rounded-md hover:bg-gray-100 flex items-center justify-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4 text-gray-500" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px] shadow-lg border-gray-200 rounded-lg p-1">
                <DropdownMenuItem className="rounded-md py-2 px-3 cursor-pointer hover:bg-gray-50">View Order Details</DropdownMenuItem>
                <DropdownMenuItem className="rounded-md py-2 px-3 cursor-pointer hover:bg-gray-50">Edit Order</DropdownMenuItem>
                <DropdownMenuItem className="rounded-md py-2 px-3 cursor-pointer hover:bg-gray-50">Print Shipping Label</DropdownMenuItem>
                <DropdownMenuSeparator className="my-1.5 bg-gray-100" />
                <DropdownMenuItem className="rounded-md py-2 px-3 cursor-pointer hover:bg-red-50 hover:text-red-600">Cancel Order</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </TableCell>
      )}
    </TableRow>
  );
};

export default OrdersTableRow;
