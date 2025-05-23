
import React, { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { TableRow, TableCell } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import OrderNoteTooltip from './OrderNoteTooltip';
import StatusBadge from './StatusBadge';
import ShipmentTypeBadge from './ShipmentTypeBadge';
import CustomerInfo from './CustomerInfo';
import LocationInfo from './LocationInfo';
import CurrencyDisplay from './CurrencyDisplay';
import OrderRowActions from './OrderRowActions';

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
    address?: string; 
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

const OrdersTableRow: React.FC<OrdersTableRowProps> = ({
  order,
  isSelected,
  onToggleSelect,
  onViewDetails,
  showActions = true
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const handleRowClick = () => {
    if (onViewDetails) {
      onViewDetails(order);
    }
  };
  
  return (
    <TableRow 
      className={cn(
        "hover:bg-muted/20 border-b border-border/10 cursor-pointer transition-colors", 
        isSelected && "bg-[#DB271E]/5"
      )}
      onClick={handleRowClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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
          <OrderNoteTooltip note={order.note} />
        </div>
      </TableCell>
      <TableCell className="py-4">
        <span className="font-medium text-gray-900">{order.referenceNumber}</span>
      </TableCell>
      <TableCell className="py-4">
        <ShipmentTypeBadge type={order.type} />
      </TableCell>
      <TableCell className="py-4">
        <CustomerInfo name={order.customer.name} phone={order.customer.phone} />
      </TableCell>
      <TableCell className="py-4">
        <LocationInfo city={order.location.city} area={order.location.area} />
      </TableCell>
      <TableCell className="py-4">
        <CurrencyDisplay 
          valueUSD={order.amount.valueUSD} 
          valueLBP={order.amount.valueLBP} 
        />
      </TableCell>
      <TableCell className="py-4">
        <CurrencyDisplay 
          valueUSD={order.deliveryCharge.valueUSD} 
          valueLBP={order.deliveryCharge.valueLBP} 
        />
      </TableCell>
      <TableCell className="py-4">
        <StatusBadge status={order.status} />
      </TableCell>
      
      {showActions && (
        <TableCell className="py-4 w-24 text-right" onClick={e => e.stopPropagation()}>
          <OrderRowActions 
            order={order} 
            isHovered={isHovered} 
            onViewDetails={onViewDetails} 
          />
        </TableCell>
      )}
    </TableRow>
  );
};

export default OrdersTableRow;
