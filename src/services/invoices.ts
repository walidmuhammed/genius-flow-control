
import { supabase } from "@/integrations/supabase/client";

export interface Invoice {
  id: string;
  invoice_id: string;
  merchant_name: string;
  total_amount_usd: number;
  total_amount_lbp: number;
  total_delivery_usd: number;
  total_delivery_lbp: number;
  net_payout_usd: number;
  net_payout_lbp: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface InvoiceOrder {
  id: string;
  invoice_id: string;
  order_id: string;
  created_at: string;
}

export interface InvoiceWithOrders extends Invoice {
  orders: Array<{
    id: string;
    order_id: number;
    reference_number: string;
    type: string;
    customer: {
      name: string;
      phone: string;
      city_name: string;
      governorate_name: string;
    };
    cash_collection_usd: number;
    cash_collection_lbp: number;
    delivery_fees_usd: number;
    delivery_fees_lbp: number;
    status: string;
  }>;
}

export async function getInvoices() {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching invoices:', error);
    throw error;
  }
  
  return data as Invoice[];
}

export async function getInvoiceWithOrders(invoiceId: string): Promise<InvoiceWithOrders> {
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', invoiceId)
    .single();
  
  if (invoiceError) {
    console.error('Error fetching invoice:', invoiceError);
    throw invoiceError;
  }

  const { data: invoiceOrders, error: ordersError } = await supabase
    .from('invoice_orders')
    .select(`
      order_id,
      orders:order_id (
        id,
        order_id,
        reference_number,
        type,
        cash_collection_usd,
        cash_collection_lbp,
        delivery_fees_usd,
        delivery_fees_lbp,
        status,
        customer:customer_id (
          name,
          phone,
          cities:city_id(name),
          governorates:governorate_id(name)
        )
      )
    `)
    .eq('invoice_id', invoiceId);
  
  if (ordersError) {
    console.error('Error fetching invoice orders:', ordersError);
    throw ordersError;
  }

  const orders = invoiceOrders?.map(item => {
    const order = item.orders as any;
    return {
      id: order.id,
      order_id: order.order_id,
      reference_number: order.reference_number,
      type: order.type,
      customer: {
        name: order.customer?.name || '',
        phone: order.customer?.phone || '',
        city_name: order.customer?.cities?.name || '',
        governorate_name: order.customer?.governorates?.name || ''
      },
      cash_collection_usd: order.cash_collection_usd,
      cash_collection_lbp: order.cash_collection_lbp,
      delivery_fees_usd: order.delivery_fees_usd,
      delivery_fees_lbp: order.delivery_fees_lbp,
      status: order.status
    };
  }) || [];

  return {
    ...invoice,
    orders
  } as InvoiceWithOrders;
}

export async function createInvoice(orderIds: string[]) {
  // This function would be used by admins to create invoices from paid orders
  // Implementation would calculate totals from the provided order IDs
  const { data, error } = await supabase.rpc('create_invoice_from_orders', {
    order_ids: orderIds
  });
  
  if (error) {
    console.error('Error creating invoice:', error);
    throw error;
  }
  
  return data;
}
