
import React, { useState } from 'react';
import { Edit, Printer, MoreHorizontal } from 'lucide-react';
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

interface OrderRowActionsProps {
  order: Order;
  isRowHovered: boolean;
  onViewDetails: () => void;
  onEditOrder: () => void;
  onPrintLabel: () => void;
  onCreateTicket: () => void;
  onDeleteOrder: () => void;
}

const OrderRowActions: React.FC<OrderRowActionsProps> = ({
  order,
  isRowHovered,
  onViewDetails,
  onEditOrder,
  onPrintLabel,
  onCreateTicket,
  onDeleteOrder,
}) => {
  const isNewStatus = order.status === 'New';

  // UI: Delete confirmation dialog (used only if Delete is selected, handled in menu)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Only show icons on desktop hover (fade/slide right); always render 3-dots icon
  return (
    <div className="flex items-center justify-end min-w-[80px] gap-1 relative">
      {/* Inline action icons: Show on desktop hover. Icons only, subtle fade/slide-in */}
      <div className="hidden md:flex items-center gap-1 absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none">
        <div
          className={`flex items-center gap-1 transition-all duration-200
            ${isRowHovered ? 'opacity-100 translate-x-0 pointer-events-auto animate-fade-in animate-slide-in-right' : 'opacity-0 translate-x-4'}`}
        >
          {/* Print icon -- always visible on hover */}
          <button
            type="button"
            className="group p-1 rounded hover:bg-muted transition-colors pointer-events-auto"
            aria-label="Print Label"
            onClick={e => {
              e.stopPropagation();
              onPrintLabel();
            }}
            tabIndex={isRowHovered ? 0 : -1}
          >
            <Printer className="w-4 h-4 text-gray-500 group-hover:text-gray-700" />
          </button>

          {/* Edit icon — only for New orders */}
          {isNewStatus && (
            <button
              type="button"
              className="group p-1 rounded hover:bg-muted transition-colors pointer-events-auto"
              aria-label="Edit Order"
              onClick={e => {
                e.stopPropagation();
                onEditOrder();
              }}
              tabIndex={isRowHovered ? 0 : -1}
            >
              <Edit className="w-4 h-4 text-gray-500 group-hover:text-gray-700" />
            </button>
          )}
        </div>
      </div>

      {/* Always-visible 3-dots menu; rightmost */}
      <div className="ml-auto flex items-center z-10">
        <OrderActionsMenu
          order={order}
          onViewDetails={onViewDetails}
          onEditOrder={onEditOrder}
          onPrintLabel={onPrintLabel}
          onCreateTicket={onCreateTicket}
          // For delete, show alert dialog BEFORE archiving so user can confirm.
          onDeleteOrder={() => setShowDeleteDialog(true)}
        />
      </div>

      {/* Delete Confirmation Dialog */}
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
                onDeleteOrder();
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

