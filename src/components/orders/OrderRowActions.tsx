
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Edit, 
  Printer, 
  Ticket, 
  Trash2, 
  Ban, 
  MoreHorizontal, 
  FileText 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { Order } from './OrdersTableRow';

interface OrderRowActionsProps {
  order: Order;
  isHovered: boolean;
  onViewDetails?: (order: Order) => void;
}

const OrderRowActions: React.FC<OrderRowActionsProps> = ({ 
  order, 
  isHovered,
  onViewDetails
}) => {
  const navigate = useNavigate();
  const isNewStatus = order.status === 'New';

  const handleCreateTicket = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Navigate to support page with order reference
    navigate(`/support?order=${order.referenceNumber}`);
  };

  const handlePrintLabel = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Implement print label functionality
    console.log(`Printing label for order ${order.id}`);
  };

  return (
    <div className="flex items-center justify-end gap-1">
      {(isHovered || window.innerWidth < 768) && (
        <TooltipProvider>
          <Tooltip delayDuration={100}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg text-gray-500 hover:bg-muted/60 hover:text-gray-700"
                onClick={handlePrintLabel}
              >
                <Printer className="h-4 w-4" />
                <span className="sr-only">Print Label</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p className="text-xs">Print Label</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg text-gray-500 hover:bg-muted/60 hover:text-gray-700"
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
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
            <FileText className="h-4 w-4 text-gray-500" />
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
            onClick={handlePrintLabel}
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
    </div>
  );
};

export default OrderRowActions;
