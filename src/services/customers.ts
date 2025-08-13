
import { supabase } from "@/integrations/supabase/client";

export interface Customer {
  id: string;
  name: string;
  phone: string;
  secondary_phone?: string;
  address?: string;
  city_id?: string;
  governorate_id?: string;
  is_work_address: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface CustomerWithLocation extends Customer {
  city_name?: string;
  governorate_name?: string;
}

export async function getCustomers() {
  // Get current user for proper tenant isolation
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('customers')
    .select(`
      *,
      cities:city_id(name),
      governorates:governorate_id(name)
    `)
    .eq('created_by', user.id)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching customers:', error);
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

export async function getCustomerById(id: string) {
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
    console.error(`Error fetching customer with id ${id}:`, error);
    throw error;
  }
  
  const customer: CustomerWithLocation = {
    ...data,
    city_name: data.cities?.name,
    governorate_name: data.governorates?.name
  };
  
  return customer;
}

export async function createCustomer(customer: Omit<Customer, 'id' | 'created_at' | 'updated_at' | 'created_by'>) {
  // Get current user for proper tenant isolation
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const customerWithCreatedBy = {
    ...customer,
    created_by: user.id
  };

  const { data, error } = await supabase
    .from('customers')
    .insert([customerWithCreatedBy])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating customer:', error);
    
    // Handle duplicate phone constraint violation
    if (error.code === '23505' && error.message?.includes('customers_phone_key')) {
      throw new Error('A customer with this phone number already exists. Please check your customer list or use a different phone number.');
    }
    
    throw error;
  }
  
  return data as Customer;
}

export async function updateCustomer(id: string, updates: Partial<Omit<Customer, 'id' | 'created_at' | 'updated_at'>>) {
  const { data, error } = await supabase
    .from('customers')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error(`Error updating customer with id ${id}:`, error);
    throw error;
  }
  
  return data as Customer;
}

export async function searchCustomersByPhone(phone: string) {
  // Get current user for proper tenant isolation
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('customers')
    .select(`
      *,
      cities:city_id(name),
      governorates:governorate_id(name)
    `)
    .eq('created_by', user.id)
    .ilike('phone', `%${phone}%`)
    .limit(5);
  
  if (error) {
    console.error(`Error searching customers with phone ${phone}:`, error);
    throw error;
  }
  
  const customers: CustomerWithLocation[] = data.map(customer => ({
    ...customer,
    city_name: customer.cities?.name,
    governorate_name: customer.governorates?.name
  }));
  
  return customers;
}

export async function findCustomerByExactPhone(phone: string) {
  // Get current user for proper tenant isolation
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('customers')
    .select(`
      *,
      cities:city_id(name),
      governorates:governorate_id(name)
    `)
    .eq('created_by', user.id)
    .eq('phone', phone)
    .maybeSingle();
  
  if (error) {
    console.error(`Error finding customer with exact phone ${phone}:`, error);
    throw error;
  }
  
  if (!data) {
    return null;
  }
  
  const customer: CustomerWithLocation = {
    ...data,
    city_name: data.cities?.name,
    governorate_name: data.governorates?.name
  };
  
  return customer;
}
