
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
  
  // First, fetch the orders with client info to calculate totals and get merchant name
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select(`
      id,
      client_id,
      collected_amount_usd,
      collected_amount_lbp,
      delivery_fees_usd,
      delivery_fees_lbp,
      profiles:client_id (
        business_name,
        full_name
      )
    `)
    .in('id', orderIds);
  
  if (ordersError) {
    console.error('Error fetching orders for invoice:', ordersError);
    throw ordersError;
  }
  
  if (!orders || orders.length === 0) {
    throw new Error('No orders found for the provided IDs');
  }

  // Auto-detect merchant name from first order's client if not provided
  const firstOrder = orders[0] as any;
  const autoMerchantName = merchantName || 
    firstOrder.profiles?.business_name || 
    firstOrder.profiles?.full_name || 
    'WIXX';

  // Calculate totals
  const totals = orders.reduce((acc, order) => {
    return {
      total_amount_usd: acc.total_amount_usd + (order.collected_amount_usd || 0),
      total_amount_lbp: acc.total_amount_lbp + (order.collected_amount_lbp || 0),
      total_delivery_usd: acc.total_delivery_usd + (order.delivery_fees_usd || 0),
      total_delivery_lbp: acc.total_delivery_lbp + (order.delivery_fees_lbp || 0)
    };
  }, {
    total_amount_usd: 0,
    total_amount_lbp: 0,
    total_delivery_usd: 0,
    total_delivery_lbp: 0
  });

  // Calculate net payout (total collection minus delivery fees)
  const net_payout_usd = totals.total_amount_usd - totals.total_delivery_usd;
  const net_payout_lbp = totals.total_amount_lbp - totals.total_delivery_lbp;

  // Create the invoice - the trigger will automatically generate invoice_id
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .insert({
      merchant_name: autoMerchantName,
      total_amount_usd: totals.total_amount_usd,
      total_amount_lbp: totals.total_amount_lbp,
      total_delivery_usd: totals.total_delivery_usd,
      total_delivery_lbp: totals.total_delivery_lbp,
      net_payout_usd,
      net_payout_lbp,
      status: 'Pending'
    } as any)
    .select()
    .single();

  if (invoiceError) {
    console.error('Error creating invoice:', invoiceError);
    throw invoiceError;
  }

  // Link orders to the invoice
  const invoiceOrdersData = orderIds.map(orderId => ({
    invoice_id: invoice.id,
    order_id: orderId
  }));

  const { error: linkError } = await supabase
    .from('invoice_orders')
    .insert(invoiceOrdersData);

  if (linkError) {
    console.error('Error linking orders to invoice:', linkError);
    throw linkError;
  }

  return invoice;
}
