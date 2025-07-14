import React, { useState } from 'react';
import { Edit, Printer } from 'lucide-react';
import { Order } from './OrdersTableRow';
import OrderActionsMenu from './OrderActionsMenu';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { OrderWithCustomer } from '@/services/orders';

interface OrderRowActionsProps {
  order: Order;
  originalOrder?: OrderWithCustomer;
  isRowHovered: boolean;
  onViewDetails: () => void;
  onEditOrder: () => void;
  onPrintLabel: () => void;
  onCreateTicket: () => void;
  onDeleteOrder: () => void;
}

const OrderRowActions: React.FC<OrderRowActionsProps> = ({
  order,
  originalOrder,
  isRowHovered,
  onViewDetails,
  onEditOrder,
  onPrintLabel,
  onCreateTicket,
  onDeleteOrder,
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const isNewStatus = order.status === 'New';

  // Correct, always use the real DB id for edit redirect
  const handleEdit = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const dbId = originalOrder?.id || order.id;
    window.location.href = `/create-order?edit=true&id=${dbId}`;
  };

  return (
    <div className="flex items-center justify-end min-w-[80px] gap-1 relative">
      {/* Desktop hover icon actions: minimalist, not floating */}
      <div className="hidden md:flex items-center gap-1 pr-2">
        <div
          className={`
            flex items-center gap-1
            transition-all duration-200
            ${isRowHovered ? 'opacity-100 translate-x-0 animate-fade-in animate-slide-in-right pointer-events-auto'
                          : 'opacity-0 translate-x-2 pointer-events-none'}
          `}
        >
          {/* Print Icon */}
          <button
            type="button"
            className="group p-1 rounded-md hover:bg-muted transition-colors"
            aria-label="Print Label"
            onClick={e => {
              e.stopPropagation();
              onPrintLabel();
            }}
            tabIndex={isRowHovered ? 0 : -1}
            style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Printer className="w-4 h-4 text-gray-500 group-hover:text-gray-700" />
          </button>
          {/* Edit Icon (only for NEW) */}
          {isNewStatus && (
            <button
              type="button"
              className="group p-1 rounded-md hover:bg-muted transition-colors"
              aria-label="Edit Order"
              onClick={handleEdit}
              tabIndex={isRowHovered ? 0 : -1}
              style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Edit className="w-4 h-4 text-gray-500 group-hover:text-gray-700" />
            </button>
          )}
        </div>
      </div>
      {/* 3-dots action menu, always visible */}
      <div className="ml-0 flex items-center z-10">
        <OrderActionsMenu
          order={order}
          onViewDetails={onViewDetails}
          onEditOrder={handleEdit}
          onPrintLabel={onPrintLabel}
          onCreateTicket={onCreateTicket}
          onDeleteOrder={() => setShowDeleteDialog(true)}
        />
      </div>
      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Order?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this order? It will be archived and hidden from your list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-[#DB271E] hover:bg-[#c0211a] text-white"
              onClick={() => {
                setShowDeleteDialog(false);
                onDeleteOrder && onDeleteOrder();
              }}
            >
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default OrderRowActions;
