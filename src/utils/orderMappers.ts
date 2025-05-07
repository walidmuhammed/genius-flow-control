
import { Order as ApiOrder, OrderWithCustomer } from '@/services/orders';
import { Order as TableOrder } from '@/components/orders/OrdersTableRow';

/**
 * Maps an order from the API format to the format expected by OrdersTableRow
 */
export function mapOrderToTableFormat(order: OrderWithCustomer): TableOrder {
  return {
    id: order.id,
    referenceNumber: order.reference_number,
    type: order.type,
    customer: {
      name: order.customer.name,
      phone: order.customer.phone
    },
    location: {
      city: order.customer.city_name || '',
      area: order.customer.governorate_name || ''
    },
    amount: {
      valueLBP: Number(order.cash_collection_lbp),
      valueUSD: Number(order.cash_collection_usd)
    },
    deliveryCharge: {
      valueLBP: Number(order.delivery_fees_lbp),
      valueUSD: Number(order.delivery_fees_usd)
    },
    status: order.status,
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
