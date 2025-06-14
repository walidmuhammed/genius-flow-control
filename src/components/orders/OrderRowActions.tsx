
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
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
import { useNavigate } from 'react-router-dom';
import { useArchiveOrder } from '@/hooks/use-orders';
import { OrderWithCustomer } from '@/services/orders';

interface OrderRowActionsProps {
  order: any;
  originalOrder?: OrderWithCustomer;
  isHovered?: boolean;
  onViewDetails?: (order: any) => void;
}

const OrderRowActions: React.FC<OrderRowActionsProps> = ({
  order,
  originalOrder,
  isHovered,
  onViewDetails
}) => {
  const navigate = useNavigate();
  const archiveOrder = useArchiveOrder();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleEdit = () => {
    if (originalOrder?.status === 'New') {
      navigate(`/orders/${originalOrder.id}/edit`);
    }
  };

  const handleDelete = async () => {
    if (originalOrder?.status === 'New') {
      try {
        await archiveOrder.mutateAsync(originalOrder.id);
        setShowDeleteDialog(false);
      } catch (error) {
        console.error('Error archiving order:', error);
      }
    }
  };

  const canEdit = originalOrder?.status === 'New';
  const canDelete = originalOrder?.status === 'New';

  return (
    <>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onViewDetails?.(order)}
        >
          <Eye className="h-4 w-4" />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onViewDetails?.(order)}>
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </DropdownMenuItem>
            
            {canEdit && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Order
                </DropdownMenuItem>
              </>
            )}
            
            {canDelete && (
              <DropdownMenuItem 
                onClick={() => setShowDeleteDialog(true)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Order
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this order? This action will archive the order 
              and it will no longer appear in your orders list. The order ID will be preserved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default OrderRowActions;
