
import { Order as ApiOrder, OrderWithCustomer, OrderStatus, OrderType } from '@/services/orders';
import { Order as TableOrder } from '@/components/orders/OrdersTableRow';

/**
 * Maps an order from the API format to the format expected by OrdersTableRow
 */
export function mapOrderToTableFormat(order: OrderWithCustomer): TableOrder & { originalOrder: OrderWithCustomer } {
  let type: OrderType = order.type as OrderType;
  if (type === 'Deliver' || type === 'Shipment') type = 'Shipment';
  return {
    id: order.order_id.toString().padStart(3, '0'), // Use sequential order_id, properly formatted
    referenceNumber: order.reference_number || '',
    type,
    customer: {
      name: order.customer.name,
      phone: order.customer.phone
    },
    location: {
      city: order.customer.city_name || '',
      area: order.customer.governorate_name || '',
      address: order.customer.address
    },
    amount: {
      valueLBP: Number(order.cash_collection_lbp),
      valueUSD: Number(order.cash_collection_usd)
    },
    deliveryCharge: {
      valueLBP: Number(order.delivery_fees_lbp),
      valueUSD: Number(order.delivery_fees_usd)
    },
    status: order.status as OrderStatus,
    lastUpdate: order.updated_at,
    note: order.note,
    originalOrder: order
  };
}

/**
 * Maps an array of API orders to table format orders
 */
export function mapOrdersToTableFormat(orders: OrderWithCustomer[]): (TableOrder & { originalOrder: OrderWithCustomer })[] {
  return orders.map(mapOrderToTableFormat);
}
