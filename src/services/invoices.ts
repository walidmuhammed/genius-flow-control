
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
  status: string;
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
    package_type: string;
    customer: {
      name: string;
      phone: string;
      city_name: string;
      governorate_name: string;
    };
    collected_amount_usd: number;
    collected_amount_lbp: number;
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
        package_type,
        collected_amount_usd,
        collected_amount_lbp,
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
      package_type: order.package_type || 'Standard',
      customer: {
        name: order.customer?.name || '',
        phone: order.customer?.phone || '',
        city_name: order.customer?.cities?.name || '',
        governorate_name: order.customer?.governorates?.name || ''
      },
      collected_amount_usd: order.collected_amount_usd || 0,
      collected_amount_lbp: order.collected_amount_lbp || 0,
      delivery_fees_usd: order.delivery_fees_usd || 0,
      delivery_fees_lbp: order.delivery_fees_lbp || 0,
      status: order.status
    };
  }) || [];

  return {
    ...invoice,
    orders
  } as InvoiceWithOrders;
}

export async function createInvoice(orderIds: string[], merchantName?: string) {
  console.log('Creating invoice for orders:', orderIds);
  
  if (!orderIds || orderIds.length === 0) {
    throw new Error('No orders selected');
  }

  // Use a transaction for atomic invoice creation
  const { data, error } = await supabase.rpc('create_invoice_with_items', {
    p_order_ids: orderIds,
    p_merchant_name: merchantName
  });

  if (error) {
    console.error('Error creating invoice:', error);
    // Return specific error messages based on the error type
    if (error.message.includes('already invoiced')) {
      throw new Error(`One or more orders are already invoiced: ${error.message}`);
    } else if (error.message.includes('multiple clients')) {
      throw new Error('Selected orders belong to multiple clients. Please select orders from the same client.');
    } else if (error.message.includes('not found')) {
      throw new Error('One or more orders were not found or are not eligible for invoicing');
    } else if (error.message.includes('already paid')) {
      throw new Error('One or more orders are already paid and cannot be invoiced');
    }
    throw new Error(`Failed to create invoice: ${error.message}`);
  }

  return data;
}

// Database function to handle invoice creation atomically
export async function createInvoiceFunction() {
  const { error } = await supabase.rpc('create_invoice_function');
  if (error) {
    console.error('Error creating invoice function:', error);
    throw error;
  }
}
