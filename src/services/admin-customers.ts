import { supabase } from "@/integrations/supabase/client";
import { CustomerWithLocation } from "./customers";

// Admin service to get ALL customers across all clients
export async function getAdminCustomers() {
  const { data, error } = await supabase
    .from('customers')
    .select(`
      *,
      cities:city_id(name),
      governorates:governorate_id(name)
    `)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching admin customers:', error);
    throw error;
  }
  
  // Transform the data to match our interface
  const transformedData: CustomerWithLocation[] = data.map(customer => ({
    ...customer,
    city_name: customer.cities?.name,
    governorate_name: customer.governorates?.name
  }));
  
  return transformedData;
}

export async function getAdminCustomerById(id: string) {
  const { data, error } = await supabase
    .from('customers')
    .select(`
      *,
      cities:city_id(name),
      governorates:governorate_id(name)
    `)
    .eq('id', id)
    .single();
  
  if (error) {
    console.error(`Error fetching admin customer with id ${id}:`, error);
    throw error;
  }
  
  const customer: CustomerWithLocation = {
    ...data,
    city_name: data.cities?.name,
    governorate_name: data.governorates?.name
  };
  
  return customer;
}