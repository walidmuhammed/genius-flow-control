
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Order } from './OrdersTableRow';
import { useScreenSize } from '@/hooks/useScreenSize';

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
  const [showMobileActions, setShowMobileActions] = React.useState(false);
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
    console.log(`Canceling order ${order.id}`);
  };

  const handleDeleteOrder = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`Deleting order ${order.id}`);
  };

  const actionItems = [
    {
      label: 'View Details',
      icon: Eye,
      action: handleViewDetails,
      available: true,
      variant: 'default' as const
    },
    {
      label: 'Print Label',
      icon: Printer,
      action: handlePrintLabel,
      available: true,
      variant: 'default' as const
    },
    {
      label: 'Edit Order',
      icon: Edit,
      action: handleEditOrder,
      available: isNewStatus,
      variant: 'default' as const
    },
    {
      label: 'Create Ticket',
      icon: Ticket,
      action: handleCreateTicket,
      available: true,
      variant: 'default' as const
    },
    {
      label: 'Cancel Order',
      icon: Ban,
      action: handleCancelOrder,
      available: isNewStatus,
      variant: 'destructive' as const
    },
    {
      label: 'Delete Order',
      icon: Trash2,
      action: handleDeleteOrder,
      available: isNewStatus,
      variant: 'destructive' as const
    }
  ];

  if (isMobile || isTablet) {
    return (
      <>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg text-gray-500 hover:bg-muted/60 hover:text-gray-700"
          onClick={(e) => {
            e.stopPropagation();
            setShowMobileActions(true);
          }}
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>

        <Sheet open={showMobileActions} onOpenChange={setShowMobileActions}>
          <SheetContent side="bottom" className="rounded-t-2xl max-h-[60vh]">
            <SheetHeader className="pb-4">
              <SheetTitle className="text-left">
                Order #{order.id} Actions
              </SheetTitle>
            </SheetHeader>
            
            <div className="space-y-2">
              {actionItems.map((item) => {
                if (!item.available) return null;
                
                const Icon = item.icon;
                return (
                  <Button
                    key={item.label}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start h-12 text-base",
                      item.variant === 'destructive' && "text-red-600 hover:text-red-700 hover:bg-red-50"
                    )}
                    onClick={(e) => {
                      item.action(e);
                      setShowMobileActions(false);
                    }}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {item.label}
                  </Button>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>
      </>
    );
  }

  return (
    <div className="flex items-center justify-end gap-1">
      {/* Quick Print Action - shown on hover for desktop */}
      {(isHovered || window.innerWidth < 768) && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg text-gray-500 hover:bg-muted/60 hover:text-gray-700 transition-all"
          onClick={handlePrintLabel}
        >
          <Printer className="h-4 w-4" />
          <span className="sr-only">Print Label</span>
        </Button>
      )}
      
      {/* Dropdown Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg text-gray-500 hover:bg-muted/60 hover:text-gray-700 transition-all"
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-[200px] shadow-xl border-border/10 rounded-xl p-2 bg-white z-50"
          sideOffset={5}
          alignOffset={-5}
        >
          {/* Primary Actions */}
          <DropdownMenuItem 
            className="rounded-lg py-3 px-3 cursor-pointer hover:bg-muted flex items-center gap-3 text-sm font-medium"
            onClick={handleViewDetails}
          >
            <Eye className="h-4 w-4 text-blue-500" />
            <span>View Details</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            className="rounded-lg py-3 px-3 cursor-pointer hover:bg-muted flex items-center gap-3 text-sm"
            onClick={handlePrintLabel}
          >
            <Printer className="h-4 w-4 text-gray-500" />
            <span>Print Label</span>
          </DropdownMenuItem>
          
          {/* Edit Action - Only for New status */}
          {isNewStatus && (
            <DropdownMenuItem 
              className="rounded-lg py-3 px-3 cursor-pointer hover:bg-muted flex items-center gap-3 text-sm"
              onClick={handleEditOrder}
            >
              <Edit className="h-4 w-4 text-gray-500" />
              <span>Edit Order</span>
            </DropdownMenuItem>
          )}
          
          {/* Support Action */}
          <DropdownMenuItem 
            className="rounded-lg py-3 px-3 cursor-pointer hover:bg-muted flex items-center gap-3 text-sm"
            onClick={handleCreateTicket}
          >
            <Ticket className="h-4 w-4 text-gray-500" />
            <span>Create Ticket</span>
          </DropdownMenuItem>
          
          {/* Destructive Actions - Only for New status */}
          {isNewStatus && (
            <>
              <DropdownMenuSeparator className="my-2 bg-border/10" />
              
              <DropdownMenuItem 
                className="rounded-lg py-3 px-3 cursor-pointer hover:bg-red-50 hover:text-red-700 flex items-center gap-3 text-sm text-red-600"
                onClick={handleCancelOrder}
              >
                <Ban className="h-4 w-4" />
                <span>Cancel Order</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                className="rounded-lg py-3 px-3 cursor-pointer hover:bg-red-50 hover:text-red-700 flex items-center gap-3 text-sm text-red-600"
                onClick={handleDeleteOrder}
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete Order</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default OrderRowActions;
