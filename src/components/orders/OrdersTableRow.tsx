
import React from 'react';
import { Eye, Edit, MoreHorizontal, Printer, MessageSquare, Trash2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { TableRow, TableCell } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export type OrderStatus = 'New' | 'Pending Pickup' | 'In Progress' | 'Heading to Customer' | 'Heading to You' | 'Successful' | 'Unsuccessful' | 'Returned' | 'Paid' | 'Awaiting Action';
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
      return <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>New</span>;
    case 'Pending Pickup':
      return <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-xs font-medium inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-orange-500"></span>Pending Pickup</span>;
    case 'In Progress':
      return <span className="px-3 py-1 bg-yellow-50 text-yellow-600 rounded-full text-xs font-medium inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-yellow-500"></span>In Progress</span>;
    case 'Heading to Customer':
      return <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-medium inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>Heading to Customer</span>;
    case 'Heading to You':
      return <span className="px-3 py-1 bg-teal-50 text-teal-600 rounded-full text-xs font-medium inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-teal-500"></span>Heading to You</span>;
    case 'Successful':
      return <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-medium inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>Successful</span>;
    case 'Unsuccessful':
      return <span className="px-3 py-1 bg-[#DB271E]/10 text-[#DB271E] rounded-full text-xs font-medium inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[#DB271E]"></span>Unsuccessful</span>;
    case 'Returned':
      return <span className="px-3 py-1 bg-sky-50 text-sky-600 rounded-full text-xs font-medium inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-sky-500"></span>Returned</span>;
    case 'Paid':
      return <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-medium inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>Paid</span>;
    case 'Awaiting Action':
      return <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-amber-600"></span>Awaiting Action</span>;
    default:
      return <span className="px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-xs font-medium inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-gray-400"></span>{status}</span>;
  }
};

const getTypeStyle = (type: OrderType) => {
  switch (type) {
    case 'Deliver':
      return "px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium";
    case 'Exchange':
      return "px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium";
    case 'Cash Collection':
      return "px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium";
    case 'Return':
      return "px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium";
    default:
      return "px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium";
  }
};

// Helper to display shipment type consistently
const getShipmentDisplayType = (type: OrderType) => {
  if (type === 'Deliver' || type === 'Cash Collection') {
    return 'Shipment';
  }
  return type;
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

  // Determine the shipment type for display
  const displayType = getShipmentDisplayType(order.type);
  
  return (
    <TableRow 
      className={cn(
        "hover:bg-muted/20 border-b border-border/10 cursor-pointer transition-colors group", 
        isSelected && "bg-[#DB271E]/5"
      )} 
      onClick={handleRowClick}
    >
      <TableCell className="w-12 pl-4 pr-0" onClick={e => e.stopPropagation()}>
        <Checkbox 
          checked={isSelected} 
          onCheckedChange={() => onToggleSelect(order.id)} 
          className="data-[state=checked]:bg-[#DB271E] data-[state=checked]:border-[#DB271E]" 
        />
      </TableCell>
      <TableCell className="py-4">
        <div className="flex items-center gap-1.5">
          <span className="font-medium text-gray-900">#{order.id}</span>
          {order.note && (
            <TooltipProvider>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <div className="cursor-help transition-opacity hover:opacity-80">
                    <MessageSquare className="h-3.5 w-3.5 text-gray-500 hover:text-[#DB271E] transition-colors" />
                  </div>
                </TooltipTrigger>
                <TooltipContent 
                  className="max-w-xs border border-border/10 shadow-lg rounded-lg bg-white p-3 animate-in fade-in-50 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95" 
                  sideOffset={5}
                >
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
        <span className={getTypeStyle(order.type)}>
          {displayType}
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
        {order.amount && (order.amount.valueUSD > 0 || order.amount.valueLBP > 0) ? (
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
        {order.deliveryCharge && (
          <div className="flex flex-col">
            <span className="text-gray-900 font-medium">
              ${formatCurrency(order.deliveryCharge.valueUSD)}
            </span>
            <span className="text-xs mt-0.5 font-medium text-gray-800">
              {formatCurrency(order.deliveryCharge.valueLBP)} LBP
            </span>
          </div>
        )}
      </TableCell>
      <TableCell className="py-4">
        {getStatusBadge(order.status)}
      </TableCell>
      
      {showActions && (
        <TableCell className="py-4 text-center">
          <div className="flex justify-center items-center transition-all">
            <div className="flex items-center relative">
              {/* Hidden actions that appear on hover */}
              <div className="absolute right-full pr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
                <button 
                  className="h-8 w-8 rounded-lg hover:bg-[#DB271E]/10 hover:text-[#DB271E] flex items-center justify-center transition-colors" 
                  onClick={e => e.stopPropagation()}
                >
                  <Edit className="h-4 w-4" />
                </button>
                
                <button 
                  className="h-8 w-8 rounded-lg hover:bg-muted/60 flex items-center justify-center transition-colors" 
                  onClick={e => e.stopPropagation()}
                >
                  <Printer className="h-4 w-4" />
                </button>
                
                {/* Only show delete for New orders */}
                {order.status === 'New' && (
                  <button 
                    className="h-8 w-8 rounded-lg hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-colors" 
                    onClick={e => e.stopPropagation()}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              {/* 3-dot menu always visible */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button 
                    className="h-8 w-8 rounded-lg hover:bg-muted/60 flex items-center justify-center transition-colors" 
                    onClick={e => e.stopPropagation()}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px] shadow-lg border-border/10 rounded-lg p-1 bg-white">
                  <DropdownMenuItem className="rounded-md py-2 px-3 cursor-pointer hover:bg-muted">
                    <Eye className="mr-2 h-4 w-4" />
                    View Order Details
                  </DropdownMenuItem>
                  <DropdownMenuItem className="rounded-md py-2 px-3 cursor-pointer hover:bg-muted">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Order
                  </DropdownMenuItem>
                  <DropdownMenuItem className="rounded-md py-2 px-3 cursor-pointer hover:bg-muted">
                    <Printer className="mr-2 h-4 w-4" />
                    Print Shipping Label
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-1.5 bg-border/10" />
                  
                  {/* Only show delete/cancel for New orders */}
                  {order.status === 'New' && (
                    <DropdownMenuItem className="rounded-md py-2 px-3 cursor-pointer hover:bg-[#DB271E]/10 hover:text-[#DB271E]">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Cancel Order
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </TableCell>
      )}
    </TableRow>
  );
};

export default OrdersTableRow;
