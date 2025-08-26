import { supabase } from "@/integrations/supabase/client";

export interface CustomerHistoryEntry {
  id: string;
  customer_id: string;
  field_name: string;
  old_value: string | null;
  new_value: string | null;
  changed_by: string;
  changed_at: string;
  change_reason: string;
}

export async function getCustomerHistory(customerId: string): Promise<CustomerHistoryEntry[]> {
  const { data, error } = await supabase
    .from('customer_history')
    .select('*')
    .eq('customer_id', customerId)
    .order('changed_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching customer history:', error);
    throw error;
  }
  
  return data || [];
}

export async function logCustomerChange(
  customerId: string,
  fieldName: string,
  oldValue: string | null,
  newValue: string | null,
  changeReason: string = 'user_edit'
): Promise<void> {
  // Only log if values are actually different
  if (oldValue === newValue) {
    return;
  }

  const { error } = await supabase.rpc('log_customer_change', {
    p_customer_id: customerId,
    p_field_name: fieldName,
    p_old_value: oldValue,
    p_new_value: newValue,
    p_change_reason: changeReason
  });
  
  if (error) {
    console.error('Error logging customer change:', error);
    throw error;
  }
}