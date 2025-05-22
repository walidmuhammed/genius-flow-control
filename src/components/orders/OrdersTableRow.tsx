import React from 'react';
import { Eye, Edit, Printer, Ticket, Trash2, Ban, MoreHorizontal } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { TableRow, TableCell } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  const isNewStatus = order.status === 'New';
  
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

  const handleCreateTicket = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Navigate to support page with order reference
    navigate(`/support?order=${order.referenceNumber}`);
  };

  // Determine the shipment type for display
  const displayType = getShipmentDisplayType(order.type);
  
  return (
    <TableRow 
      className={cn(
        "hover:bg-muted/20 border-b border-border/10 cursor-pointer transition-colors", 
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
                    <Eye className="h-3.5 w-3.5 text-gray-500 hover:text-[#DB271E] transition-colors" />
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
        <TableCell className="py-4 w-16 text-right" onClick={e => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                className="h-8 w-8 rounded-lg text-gray-500 hover:bg-muted/60 hover:text-gray-700 flex items-center justify-center transition-colors"
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-[180px] shadow-lg border-border/10 rounded-lg p-1 bg-white"
              sideOffset={5}
              alignOffset={-5}
            >
              {/* View Details - Always available */}
              <DropdownMenuItem 
                className="rounded-md py-2 px-3 cursor-pointer hover:bg-muted flex items-center gap-2 text-sm"
                onClick={e => {
                  e.stopPropagation();
                  if (onViewDetails) onViewDetails(order);
                }}
              >
                <Eye className="h-4 w-4 text-gray-500" />
                <span>View Details</span>
              </DropdownMenuItem>
              
              {/* Edit Order - Only for New status */}
              <DropdownMenuItem 
                className={cn(
                  "rounded-md py-2 px-3 cursor-pointer hover:bg-muted flex items-center gap-2 text-sm",
                  !isNewStatus && "opacity-50 pointer-events-none"
                )}
                disabled={!isNewStatus}
              >
                <Edit className="h-4 w-4 text-gray-500" />
                <span>Edit Order</span>
              </DropdownMenuItem>
              
              {/* Print Label - Always available */}
              <DropdownMenuItem 
                className="rounded-md py-2 px-3 cursor-pointer hover:bg-muted flex items-center gap-2 text-sm"
              >
                <Printer className="h-4 w-4 text-gray-500" />
                <span>Print Label</span>
              </DropdownMenuItem>
              
              {/* Create Ticket - Always available */}
              <DropdownMenuItem 
                className="rounded-md py-2 px-3 cursor-pointer hover:bg-muted flex items-center gap-2 text-sm"
                onClick={handleCreateTicket}
              >
                <Ticket className="h-4 w-4 text-gray-500" />
                <span>Create Ticket</span>
              </DropdownMenuItem>
              
              {/* Separator before destructive actions */}
              <DropdownMenuSeparator className="my-1 bg-border/10" />
              
              {/* Cancel Order - Only for New status */}
              <DropdownMenuItem 
                className={cn(
                  "rounded-md py-2 px-3 cursor-pointer hover:bg-[#DB271E]/10 hover:text-[#DB271E] flex items-center gap-2 text-sm",
                  !isNewStatus && "opacity-50 pointer-events-none"
                )}
                disabled={!isNewStatus}
              >
                <Ban className="h-4 w-4" />
                <span>Cancel Order</span>
              </DropdownMenuItem>
              
              {/* Delete Order - Only for New status */}
              <DropdownMenuItem 
                className={cn(
                  "rounded-md py-2 px-3 cursor-pointer hover:bg-[#DB271E]/10 hover:text-[#DB271E] flex items-center gap-2 text-sm",
                  !isNewStatus && "opacity-50 pointer-events-none"
                )}
                disabled={!isNewStatus}
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete Order</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      )}
    </TableRow>
  );
};

export default OrdersTableRow;
