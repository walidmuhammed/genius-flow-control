
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Order } from './OrdersTableRow';
import OrderActionsMenu from './OrderActionsMenu';

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

  // Inline buttons shown on desktop/tablet ONLY on row hover
  // But 3-dots always visible due to responsive menu
  return (
    <div className="flex items-center justify-end gap-1">
      {/* Inline buttons: only if row hovered + status = New/any. Only desktop! */}
      {isRowHovered && (
        <>
          <button
            type="button"
            className="inline-flex items-center gap-2 text-xs font-medium px-2 py-1 bg-muted/60 hover:bg-muted rounded transition text-gray-700"
            onClick={e => {
              e.stopPropagation();
              onPrintLabel();
            }}
            aria-label="Print Label"
          >
            🖨️
            <span className="hidden md:inline">Print</span>
          </button>
          {isNewStatus && (
            <button
              type="button"
              className="inline-flex items-center gap-2 text-xs font-medium px-2 py-1 bg-muted/60 hover:bg-muted rounded transition text-gray-700"
              onClick={e => {
                e.stopPropagation();
                onEditOrder();
              }}
              aria-label="Edit Order"
            >
              ✏️
              <span className="hidden md:inline">Edit</span>
            </button>
          )}
        </>
      )}
      {/* Always visible 3-dots menu */}
      <OrderActionsMenu
        order={order}
        onViewDetails={onViewDetails}
        onEditOrder={onEditOrder}
        onPrintLabel={onPrintLabel}
        onCreateTicket={onCreateTicket}
        onDeleteOrder={onDeleteOrder}
      />
    </div>
  );
};

export default OrderRowActions;
