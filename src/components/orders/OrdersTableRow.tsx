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
import OrderDetailsDialog from './OrderDetailsDialog';
import { formatDate } from '@/utils/format';
import { OrderWithCustomer } from '@/services/orders';

export type OrderStatus = 'New' | 'Pending Pickup' | 'In Progress' | 'Heading to Customer' | 'Heading to You' | 'Successful' | 'Unsuccessful' | 'Returned' | 'Paid' | 'Awaiting Action';
export type OrderType = 'Shipment' | 'Exchange' | 'Cash Collection' | 'Return';

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
  originalOrder?: OrderWithCustomer; // Add this to pass the original order data
  isSelected: boolean;
  onToggleSelect: (orderId: string) => void;
  onViewDetails?: (order: Order) => void;
  showActions?: boolean;
}

const OrdersTableRow: React.FC<OrdersTableRowProps> = ({
  order,
  originalOrder,
  isSelected,
  onToggleSelect,
  onViewDetails,
  showActions = true
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  
  const handleRowClick = () => {
    setShowDetailsDialog(true);
  };

  const handleViewDetails = () => {
    setShowDetailsDialog(true);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new':
        return 'text-blue-600 bg-blue-50';
      case 'pending pickup':
        return 'text-orange-600 bg-orange-50';
      case 'in progress':
        return 'text-yellow-600 bg-yellow-50';
      case 'heading to customer':
        return 'text-purple-600 bg-purple-50';
      case 'heading to you':
        return 'text-indigo-600 bg-indigo-50';
      case 'successful':
        return 'text-green-600 bg-green-50';
      case 'unsuccessful':
        return 'text-red-600 bg-red-50';
      case 'returned':
        return 'text-gray-600 bg-gray-50';
      case 'paid':
        return 'text-emerald-600 bg-emerald-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'shipment':
        return 'text-green-600 bg-green-50';
      case 'exchange':
        return 'text-purple-600 bg-purple-50';
      case 'cash collection':
        return 'text-green-600 bg-green-50';
      case 'return':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };
  
  return (
    <>
      <TableRow 
        className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
        onClick={handleRowClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <TableCell className="pl-6">
          <div className="flex items-center gap-2">
            <span className="font-medium text-blue-600">#{order.id}</span>
            <OrderNoteTooltip note={order.note} />
          </div>
        </TableCell>
        <TableCell>
          {order.referenceNumber ? (
            <span className="font-medium text-gray-900">{order.referenceNumber}</span>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </TableCell>
        <TableCell>
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md ${getTypeColor(order.type)}`}>
            {order.type}
          </span>
        </TableCell>
        <TableCell>
          <div>
            <div className="font-medium text-gray-900">{order.customer.name}</div>
            <div className="text-sm text-gray-500">{order.customer.phone}</div>
          </div>
        </TableCell>
        <TableCell>
          <div>
            <div>{order.location.city}</div>
            <div className="text-sm text-gray-500">{order.location.area}</div>
          </div>
        </TableCell>
        <TableCell>
          <div>
            {order.amount.valueUSD > 0 && (
              <div className="font-medium">${order.amount.valueUSD}</div>
            )}
            {order.amount.valueLBP > 0 && (
              <div className="text-sm text-gray-500">{order.amount.valueLBP.toLocaleString()} LBP</div>
            )}
          </div>
        </TableCell>
        <TableCell>
          <div>
            {order.deliveryCharge.valueUSD > 0 && (
              <div className="font-medium">${order.deliveryCharge.valueUSD}</div>
            )}
            {order.deliveryCharge.valueLBP > 0 && (
              <div className="text-sm text-gray-500">{order.deliveryCharge.valueLBP.toLocaleString()} LBP</div>
            )}
          </div>
        </TableCell>
        <TableCell>
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md ${getStatusColor(order.status)}`}>
            {order.status}
          </span>
        </TableCell>
        <TableCell>
          <div className="text-sm text-gray-900">
            {formatDate(new Date(order.lastUpdate))}
          </div>
        </TableCell>
        
        {showActions && (
          <TableCell className="text-right" onClick={e => e.stopPropagation()}>
            <OrderRowActions 
              order={order} 
              isHovered={isHovered} 
              onViewDetails={handleViewDetails} 
            />
          </TableCell>
        )}
      </TableRow>

      <OrderDetailsDialog
        order={originalOrder || null}
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
      />
    </>
  );
};

export default OrdersTableRow;
