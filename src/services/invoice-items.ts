import { supabase } from "@/integrations/supabase/client";

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  order_id: string;
  amount_collected_usd: number;
  amount_collected_lbp: number;
  delivery_fee_usd: number;
  delivery_fee_lbp: number;
  net_payout_usd: number;
  net_payout_lbp: number;
  created_at: string;
}

export interface InvoiceItemWithOrder extends InvoiceItem {
  order: {
    order_id: number;
    reference_number: string;
    type: string;
    package_type: string;
    status: string;
    customer: {
      name: string;
      phone: string;
      city_name: string;
      governorate_name: string;
    };
  };
}

export async function getInvoiceItems(invoiceId: string): Promise<InvoiceItemWithOrder[]> {
  const { data, error } = await supabase
    .from('invoice_items')
    .select(`
      *,
      orders:order_id (
        order_id,
        reference_number,
        type,
        package_type,
        status,
        customer:customer_id (
          name,
          phone,
          cities:city_id(name),
          governorates:governorate_id(name)
        )
      )
    `)
    .eq('invoice_id', invoiceId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching invoice items:', error);
    throw error;
  }

  return (data || []).map(item => {
    const order = item.orders as any;
    const customer = order?.customer as any;

    return {
      ...item,
      order: {
        order_id: order?.order_id || 0,
        reference_number: order?.reference_number || '',
        type: order?.type || '',
        package_type: order?.package_type || 'Standard',
        status: order?.status || '',
        customer: {
          name: customer?.name || '',
          phone: customer?.phone || '',
          city_name: customer?.cities?.name || '',
          governorate_name: customer?.governorates?.name || ''
        }
      }
    };
  });
}

export async function createInvoiceItems(invoiceId: string, orders: any[]): Promise<InvoiceItem[]> {
  const invoiceItemsData = orders.map(order => ({
    invoice_id: invoiceId,
    order_id: order.id,
    amount_collected_usd: order.collected_amount_usd || 0,
    amount_collected_lbp: order.collected_amount_lbp || 0,
    delivery_fee_usd: order.delivery_fees_usd || 0,
    delivery_fee_lbp: order.delivery_fees_lbp || 0,
    net_payout_usd: (order.collected_amount_usd || 0) - (order.delivery_fees_usd || 0),
    net_payout_lbp: (order.collected_amount_lbp || 0) - (order.delivery_fees_lbp || 0)
  }));

  const { data, error } = await supabase
    .from('invoice_items')
    .insert(invoiceItemsData)
    .select();

  if (error) {
    console.error('Error creating invoice items:', error);
    throw error;
  }

  return data || [];
}