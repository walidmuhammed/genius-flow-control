
import React from 'react';
import { OrderType } from './OrdersTableRow';

interface ShipmentTypeBadgeProps {
  type: OrderType;
}

const getTypeStyle = (type: OrderType) => {
  switch (type) {
    case 'Shipment':
      // Modern light green
      return "px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium";
    case 'Exchange':
      // Light purple
      return "px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium";
    case 'Cash Collection':
      return "px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium";
    case 'Return':
      return "px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium";
    default:
      return "px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium";
  }
};

const ShipmentTypeBadge: React.FC<ShipmentTypeBadgeProps> = ({ type }) => {
  return (
    <span className={getTypeStyle(type)}>
      {type}
    </span>
  );
};

export default ShipmentTypeBadge;
