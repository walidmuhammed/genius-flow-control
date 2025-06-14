
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit, Printer, FileText, Ticket, Trash2 } from 'lucide-react';
import { useScreenSize } from '@/hooks/useScreenSize';
import { Order } from './OrdersTableRow';

interface OrderActionsMenuProps {
  order: Order;
  onViewDetails: () => void;
  onEditOrder: () => void;
  onPrintLabel: () => void;
  onCreateTicket: () => void;
  onDeleteOrder: () => void;
}

export const OrderActionsMenu: React.FC<OrderActionsMenuProps> = ({
  order,
  onViewDetails,
  onEditOrder,
  onPrintLabel,
  onCreateTicket,
  onDeleteOrder,
}) => {
  const { isMobile, isTablet } = useScreenSize();
  const isNewStatus = order.status === 'New';

  // Menu items component to use in both dropdown and sheet
  const MenuItems = ({ close }: {close?: () => void}) => (
    <div className="flex flex-col py-1">
      <DropdownMenuItem
        className="rounded-md px-3 py-2 text-sm flex items-center gap-2 cursor-pointer"
        onClick={() => { onViewDetails(); close && close(); }}
      >
        <FileText className="h-4 w-4 text-gray-500" />
        View Order Details
      </DropdownMenuItem>

      {isNewStatus && (
        <DropdownMenuItem
          className="rounded-md px-3 py-2 text-sm flex items-center gap-2 cursor-pointer"
          onClick={() => { onEditOrder(); close && close(); }}
        >
          <Edit className="h-4 w-4 text-gray-500" />
          Edit Order
        </DropdownMenuItem>
      )}

      <DropdownMenuItem
        className="rounded-md px-3 py-2 text-sm flex items-center gap-2 cursor-pointer"
        onClick={() => { onPrintLabel(); close && close(); }}
      >
        <Printer className="h-4 w-4 text-gray-500" />
        Print Shipping Label
      </DropdownMenuItem>

      <DropdownMenuItem
        className="rounded-md px-3 py-2 text-sm flex items-center gap-2 cursor-pointer"
        onClick={() => { onCreateTicket(); close && close(); }}
      >
        <Ticket className="h-4 w-4 text-gray-500" />
        Create Support Ticket
      </DropdownMenuItem>
      
      {isNewStatus && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="rounded-md px-3 py-2 text-sm flex items-center gap-2 cursor-pointer text-[#DB271E] hover:text-[#DB271E] hover:bg-[#DB271E]/10"
            onClick={() => { onDeleteOrder(); close && close(); }}
          >
            <Trash2 className="h-4 w-4" />
            Delete Order
          </DropdownMenuItem>
        </>
      )}
    </div>
  );

  // Mobile/tablet as Sheet, desktop as DropdownMenu
  if (isMobile || isTablet) {
    // On sheet close, must close menu (SheetContent receives onOpenChange)
    const [open, setOpen] = React.useState(false);
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 p-0 rounded-lg text-gray-500 hover:bg-muted/60 hover:text-gray-700">
            <MoreHorizontal className="h-5 w-5" />
            <span className="sr-only">Open actions menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="px-0 pb-6 pt-4">
          <SheetHeader>
            <SheetTitle>Order Actions</SheetTitle>
          </SheetHeader>
          <div className="grid gap-1 mt-4">
            <MenuItems close={() => setOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop dropdown menu
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 p-0 rounded-lg text-gray-500 hover:bg-muted/60 hover:text-gray-700">
          <MoreHorizontal className="h-5 w-5" />
          <span className="sr-only">Open actions menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="rounded-lg shadow-lg w-[210px] border bg-white z-50 p-1"
        sideOffset={5}
      >
        <MenuItems />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default OrderActionsMenu;
