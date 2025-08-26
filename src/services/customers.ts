
import { supabase } from "@/integrations/supabase/client";
import { formatPhoneForStorage, normalizePhoneForMatching, arePhoneNumbersEqual } from "@/utils/phoneNormalization";
import { logCustomerChange } from "./customerHistory";

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

  // Normalize phone number for storage
  let normalizedPhone = customer.phone;
  try {
    normalizedPhone = formatPhoneForStorage(customer.phone);
  } catch (error) {
    throw new Error(`Invalid phone number format: ${customer.phone}`);
  }

  const customerWithCreatedBy = {
    ...customer,
    phone: normalizedPhone,
    secondary_phone: customer.secondary_phone ? formatPhoneForStorage(customer.secondary_phone) : undefined,
    created_by: user.id
  };

  const { data, error } = await supabase
    .from('customers')
    .insert([customerWithCreatedBy])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating customer:', error);
    
    // Handle duplicate phone constraint violation per client
    if (error.code === '23505' && error.message?.includes('customers_created_by_phone_key')) {
      throw new Error('You already have a customer with this phone number. Please check your customer list or use a different phone number.');
    }
    
    throw error;
  }
  
  return data as Customer;
}

export async function updateCustomer(id: string, updates: Partial<Omit<Customer, 'id' | 'created_at' | 'updated_at'>>) {
  // Get the existing customer to log changes
  const existingCustomer = await getCustomerById(id);
  
  // Normalize phone numbers if provided
  const normalizedUpdates = { ...updates };
  if (updates.phone) {
    try {
      normalizedUpdates.phone = formatPhoneForStorage(updates.phone);
    } catch (error) {
      throw new Error(`Invalid phone number format: ${updates.phone}`);
    }
  }
  if (updates.secondary_phone) {
    try {
      normalizedUpdates.secondary_phone = formatPhoneForStorage(updates.secondary_phone);
    } catch (error) {
      throw new Error(`Invalid secondary phone number format: ${updates.secondary_phone}`);
    }
  }

  const { data, error } = await supabase
    .from('customers')
    .update(normalizedUpdates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error(`Error updating customer with id ${id}:`, error);
    throw error;
  }

  // Log changes to customer history
  try {
    const fieldsToTrack = ['name', 'phone', 'secondary_phone', 'address', 'city_id', 'governorate_id'];
    for (const field of fieldsToTrack) {
      if (field in normalizedUpdates) {
        const oldValue = existingCustomer[field as keyof Customer] as string;
        const newValue = normalizedUpdates[field as keyof typeof normalizedUpdates] as string;
        
        if (oldValue !== newValue) {
          await logCustomerChange(id, field, oldValue || null, newValue || null, 'user_edit');
        }
      }
    }
  } catch (historyError) {
    console.warn('Failed to log customer history:', historyError);
    // Don't fail the update if history logging fails
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

  // Try to normalize the phone for exact matching
  let normalizedPhone: string;
  try {
    normalizedPhone = formatPhoneForStorage(phone);
  } catch {
    // If normalization fails, try to match with the original phone
    normalizedPhone = phone;
  }

  const { data, error } = await supabase
    .from('customers')
    .select(`
      *,
      cities:city_id(name),
      governorates:governorate_id(name)
    `)
    .eq('created_by', user.id)
    .eq('phone', normalizedPhone)
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

export async function findCustomerByNormalizedPhone(phone: string) {
  // Get current user for proper tenant isolation
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Get all customers for this user
  const { data: customers, error } = await supabase
    .from('customers')
    .select(`
      *,
      cities:city_id(name),
      governorates:governorate_id(name)
    `)
    .eq('created_by', user.id);
  
  if (error) {
    console.error('Error fetching customers for phone matching:', error);
    throw error;
  }

  // Find customer with matching normalized phone
  const targetNormalized = normalizePhoneForMatching(phone);
  const matchingCustomer = customers?.find(customer => 
    arePhoneNumbersEqual(customer.phone, phone)
  );

  if (!matchingCustomer) {
    return null;
  }

  const customer: CustomerWithLocation = {
    ...matchingCustomer,
    city_name: matchingCustomer.cities?.name,
    governorate_name: matchingCustomer.governorates?.name
  };
  
  return customer;
}
