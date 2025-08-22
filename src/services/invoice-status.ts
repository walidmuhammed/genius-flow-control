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
  console.log('Marking invoice as paid:', invoiceId);

  // Use a database function to handle this atomically
  const { data, error } = await supabase.rpc('mark_invoice_as_paid', {
    p_invoice_id: invoiceId
  });

  if (error) {
    console.error('Error marking invoice as paid:', error);
    if (error.message.includes('not found')) {
      throw new Error('Invoice not found');
    } else if (error.message.includes('already paid')) {
      throw new Error('Invoice is already marked as paid');
    }
    throw new Error(`Failed to mark invoice as paid: ${error.message}`);
  }

  return data;
}