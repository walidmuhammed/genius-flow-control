
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Edit, 
  Printer, 
  Ticket, 
  Trash2, 
  Ban, 
  MoreHorizontal, 
  FileText,
  Eye
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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useScreenSize } from '@/hooks/useScreenSize';
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
  const { isMobile, isTablet } = useScreenSize();
  const isNewStatus = order.status === 'New';

  const handleCreateTicket = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/support?order=${order.referenceNumber}`);
  };

  const handlePrintLabel = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`Printing label for order ${order.id}`);
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onViewDetails) onViewDetails(order);
  };

  const handleEditOrder = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`Editing order ${order.id}`);
  };

  const handleCancelOrder = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`Cancelling order ${order.id}`);
  };

  const handleDeleteOrder = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`Deleting order ${order.id}`);
  };

  const actionItems = [
    {
      label: 'View Details',
      icon: <Eye className="h-4 w-4" />,
      onClick: handleViewDetails,
      always: true
    },
    {
      label: 'Print Label',
      icon: <Printer className="h-4 w-4" />,
      onClick: handlePrintLabel,
      always: true
    },
    {
      label: 'Edit Order',
      icon: <Edit className="h-4 w-4" />,
      onClick: handleEditOrder,
      condition: isNewStatus
    },
    {
      label: 'Create Ticket',
      icon: <Ticket className="h-4 w-4" />,
      onClick: handleCreateTicket,
      always: true
    },
    {
      label: 'Cancel Order',
      icon: <Ban className="h-4 w-4" />,
      onClick: handleCancelOrder,
      condition: isNewStatus,
      destructive: true
    },
    {
      label: 'Delete Order',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: handleDeleteOrder,
      condition: isNewStatus,
      destructive: true
    }
  ];

  const visibleActions = actionItems.filter(item => item.always || item.condition);

  // Mobile/Tablet: Use Sheet for actions
  if (isMobile || isTablet) {
    return (
      <div className="flex items-center justify-end">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg text-gray-500 hover:bg-muted/60 hover:text-gray-700"
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-auto">
            <SheetHeader>
              <SheetTitle>Order Actions</SheetTitle>
            </SheetHeader>
            <div className="grid gap-3 py-6">
              {visibleActions.map((action, index) => (
                <React.Fragment key={action.label}>
                  {action.destructive && index > 0 && !visibleActions[index - 1].destructive && (
                    <div className="border-t border-gray-200 my-2" />
                  )}
                  <Button
                    variant="ghost"
                    className={cn(
                      "justify-start h-12 text-base",
                      action.destructive && "text-red-600 hover:text-red-700 hover:bg-red-50"
                    )}
                    onClick={action.onClick}
                  >
                    {action.icon}
                    <span className="ml-3">{action.label}</span>
                  </Button>
                </React.Fragment>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  // Desktop: Use DropdownMenu (only show 3-dots)
  return (
    <div className="flex items-center justify-end">
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
          className="w-[180px] shadow-lg border-border/10 rounded-lg p-1 bg-white z-50"
          sideOffset={5}
          alignOffset={-5}
        >
          {visibleActions.map((action, index) => (
            <React.Fragment key={action.label}>
              {action.destructive && index > 0 && !visibleActions[index - 1].destructive && (
                <DropdownMenuSeparator className="my-1 bg-border/10" />
              )}
              <DropdownMenuItem 
                className={cn(
                  "rounded-md py-2 px-3 cursor-pointer hover:bg-muted flex items-center gap-2 text-sm",
                  action.destructive && "hover:bg-[#DB271E]/10 hover:text-[#DB271E]"
                )}
                onClick={action.onClick}
              >
                <span className={cn(
                  "text-gray-500",
                  action.destructive && "text-[#DB271E]"
                )}>
                  {action.icon}
                </span>
                <span>{action.label}</span>
              </DropdownMenuItem>
            </React.Fragment>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default OrderRowActions;
