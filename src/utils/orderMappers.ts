
import { Order as ApiOrder, OrderWithCustomer, OrderStatus, OrderType } from '@/services/orders';
import { Order as TableOrder } from '@/components/orders/OrdersTableRow';

/**
 * Maps an order from the API format to the format expected by OrdersTableRow
 */
export function mapOrderToTableFormat(order: OrderWithCustomer): TableOrder {
  return {
    id: order.order_id?.toString().padStart(3, '0') || order.id, // Use formatted order_id or fallback to UUID
    referenceNumber: order.reference_number || '', // Don't show anything if no reference provided
    type: order.type as OrderType,
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
    note: order.note
  };
}

/**
 * Maps an array of API orders to table format orders
 */
export function mapOrdersToTableFormat(orders: OrderWithCustomer[]): TableOrder[] {
  return orders.map(mapOrderToTableFormat);
}
