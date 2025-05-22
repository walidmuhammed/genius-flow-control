
import React from 'react';
import { OrderType } from './OrdersTableRow';

interface ShipmentTypeBadgeProps {
  type: OrderType;
}

const getTypeStyle = (type: OrderType) => {
  switch (type) {
    case 'Deliver':
      return "px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium";
    case 'Exchange':
      return "px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium";
    case 'Cash Collection':
      return "px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium";
    case 'Return':
      return "px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium";
    default:
      return "px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium";
  }
};

// Helper to display shipment type consistently
const getShipmentDisplayType = (type: OrderType) => {
  if (type === 'Deliver' || type === 'Cash Collection') {
    return 'Shipment';
  }
  return type;
};

const ShipmentTypeBadge: React.FC<ShipmentTypeBadgeProps> = ({ type }) => {
  const displayType = getShipmentDisplayType(type);
  return (
    <span className={getTypeStyle(type)}>
      {displayType}
    </span>
  );
};

export default ShipmentTypeBadge;
