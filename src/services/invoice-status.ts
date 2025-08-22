import { supabase } from "@/integrations/supabase/client";

export async function updateInvoiceStatus(invoiceId: string, status: string) {
  const { data, error } = await supabase
    .from('invoices')
    .update({ status })
    .eq('id', invoiceId)
    .select()
    .single();

  if (error) {
    console.error('Error updating invoice status:', error);
    throw error;
  }

  return data;
}

export async function markInvoiceAsPaid(invoiceId: string) {
  // Update invoice status
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .update({ status: 'Paid' })
    .eq('id', invoiceId)
    .select()
    .single();

  if (invoiceError) {
    console.error('Error marking invoice as paid:', invoiceError);
    throw invoiceError;
  }

  // Update related client payouts status
  const { error: payoutsError } = await supabase
    .from('client_payouts')
    .update({ payout_status: 'Paid' })
    .eq('invoice_id', invoiceId);

  if (payoutsError) {
    console.error('Error updating client payouts status:', payoutsError);
    throw payoutsError;
  }

  // Update all orders in this invoice to 'paid' status
  // First get the order IDs
  const { data: invoiceOrders, error: fetchOrdersError } = await supabase
    .from('invoice_orders')
    .select('order_id')
    .eq('invoice_id', invoiceId);

  if (fetchOrdersError) {
    console.error('Error fetching invoice orders:', fetchOrdersError);
    throw fetchOrdersError;
  }

  if (invoiceOrders && invoiceOrders.length > 0) {
    const orderIds = invoiceOrders.map(io => io.order_id).filter(Boolean);
    
    const { error: ordersError } = await supabase
      .from('orders')
      .update({ status: 'paid' })
      .in('id', orderIds);

    if (ordersError) {
      console.error('Error updating orders status to paid:', ordersError);
      throw ordersError;
    }
  }

  return invoice;
}