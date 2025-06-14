
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
  SheetTrigger
} from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Order } from './OrdersTableRow';
import { useScreenSize } from '@/hooks/useScreenSize';
import { useArchiveOrder } from '@/hooks/use-orders';

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
  const { isMobile } = useScreenSize();
  const archiveOrderMutation = useArchiveOrder();
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
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
    if (isNewStatus) {
      navigate(`/orders/${order.id}/edit`);
    }
  };

  const handleCancelOrder = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`Canceling order ${order.id}`);
  };

  const handleDeleteOrder = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isNewStatus) {
      setShowDeleteDialog(true);
    }
  };

  const confirmDelete = async () => {
    try {
      await archiveOrderMutation.mutateAsync(order.id);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Error archiving order:', error);
    }
  };

  const actionItems = (
    <>
      <DropdownMenuItem 
        className="rounded-md py-2 px-3 cursor-pointer hover:bg-muted flex items-center gap-2 text-sm"
        onClick={handleViewDetails}
      >
        <FileText className="h-4 w-4 text-gray-500" />
        <span>View Details</span>
      </DropdownMenuItem>
      
      <DropdownMenuItem 
        className="rounded-md py-2 px-3 cursor-pointer hover:bg-muted flex items-center gap-2 text-sm"
        onClick={handlePrintLabel}
      >
        <Printer className="h-4 w-4 text-gray-500" />
        <span>Print Label</span>
      </DropdownMenuItem>
      
      {isNewStatus && (
        <DropdownMenuItem 
          className="rounded-md py-2 px-3 cursor-pointer hover:bg-muted flex items-center gap-2 text-sm"
          onClick={handleEditOrder}
        >
          <Edit className="h-4 w-4 text-gray-500" />
          <span>Edit Order</span>
        </DropdownMenuItem>
      )}
      
      {isNewStatus && (
        <DropdownMenuItem 
          className="rounded-md py-2 px-3 cursor-pointer hover:bg-[#DB271E]/10 hover:text-[#DB271E] flex items-center gap-2 text-sm"
          onClick={handleDeleteOrder}
        >
          <Trash2 className="h-4 w-4" />
          <span>Delete Order</span>
        </DropdownMenuItem>
      )}
      
      <DropdownMenuItem 
        className="rounded-md py-2 px-3 cursor-pointer hover:bg-muted flex items-center gap-2 text-sm"
        onClick={handleCreateTicket}
      >
        <Ticket className="h-4 w-4 text-gray-500" />
        <span>Create Ticket</span>
      </DropdownMenuItem>
    </>
  );

  if (isMobile) {
    return (
      <>
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
              <div className="grid gap-2 py-4">
                <Button 
                  variant="ghost" 
                  className="justify-start h-12"
                  onClick={handleViewDetails}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  View Details
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="justify-start h-12"
                  onClick={handlePrintLabel}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print Label
                </Button>
                
                {isNewStatus && (
                  <Button 
                    variant="ghost" 
                    className="justify-start h-12"
                    onClick={handleEditOrder}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Order
                  </Button>
                )}
                
                {isNewStatus && (
                  <Button 
                    variant="ghost" 
                    className="justify-start h-12 text-[#DB271E] hover:text-[#DB271E] hover:bg-[#DB271E]/10"
                    onClick={handleDeleteOrder}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Order
                  </Button>
                )}
                
                <Button 
                  variant="ghost" 
                  className="justify-start h-12"
                  onClick={handleCreateTicket}
                >
                  <Ticket className="h-4 w-4 mr-2" />
                  Create Ticket
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Order</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this order? This will archive it and it won't be visible in the list anymore.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmDelete} 
                className="bg-red-600 hover:bg-red-700"
                disabled={archiveOrderMutation.isPending}
              >
                {archiveOrderMutation.isPending ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  return (
    <>
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
            {actionItems}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this order? This will archive it and it won't be visible in the list anymore.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              className="bg-red-600 hover:bg-red-700"
              disabled={archiveOrderMutation.isPending}
            >
              {archiveOrderMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default OrderRowActions;
