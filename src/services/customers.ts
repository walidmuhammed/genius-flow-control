
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

export async function createCustomer(customer: Omit<Customer, 'id' | 'created_at' | 'updated_at' | 'created_by'>, targetClientId?: string) {
  // Get current user for proper tenant isolation
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Determine who should own this customer
  let customerId = user.id;
  
  // If targetClientId is provided and current user is admin, create customer for the target client
  if (targetClientId && user.id !== targetClientId) {
    // Verify current user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single();
    
    if (profile?.user_type === 'admin') {
      customerId = targetClientId;
      console.log('👑 Admin creating customer for client:', targetClientId);
    } else {
      console.warn('⚠️ Non-admin trying to create customer for different user, using own ID');
    }
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
    created_by: customerId
  };

  console.log('📝 Creating customer with created_by:', customerId, 'for user:', user.id);

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

  console.log('🔍 [SEARCH] User ID:', user.id, 'Searching for phone:', phone);
  
  // Normalize the search phone for exact matching
  const normalizedSearchPhone = normalizePhoneForMatching(phone);
  console.log('📱 [SEARCH] Normalized search phone:', normalizedSearchPhone);

  // Search only within current user's customers using exact normalized phone match
  const { data, error } = await supabase
    .from('customers')
    .select(`
      *,
      cities:city_id(name),
      governorates:governorate_id(name)
    `)
    .eq('created_by', user.id);
  
  if (error) {
    console.error(`[SEARCH] Error fetching customers:`, error);
    throw error;
  }
  
  console.log(`🗂️ [SEARCH] Total customers for user ${user.id}:`, data.length);
  
  // Filter customers by exact normalized phone matching (no bidirectional)
  const matchingCustomers = data.filter(customer => {
    const customerPrimaryNorm = normalizePhoneForMatching(customer.phone || '');
    const customerSecondaryNorm = normalizePhoneForMatching(customer.secondary_phone || '');
    
    // Simple exact match - no contains logic to prevent cross-contamination
    const primaryMatch = customerPrimaryNorm === normalizedSearchPhone;
    const secondaryMatch = customerSecondaryNorm === normalizedSearchPhone;
    
    if (primaryMatch || secondaryMatch) {
      console.log('✅ [MATCH]', {
        customer: customer.name,
        customerPhone: customer.phone,
        customerPhoneNorm: customerPrimaryNorm,
        searchPhoneNorm: normalizedSearchPhone,
        exactMatch: true,
        createdBy: customer.created_by
      });
    }
    
    return primaryMatch || secondaryMatch;
  }).slice(0, 5);
  
  const customers: CustomerWithLocation[] = matchingCustomers.map(customer => ({
    ...customer,
    city_name: customer.cities?.name,
    governorate_name: customer.governorates?.name
  }));
  
  console.log('🎯 [RESULT] Found matching customers:', customers.length);
  return customers;
}

export async function findCustomerByExactPhone(phone: string) {
  // Get current user for proper tenant isolation
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  console.log('🔍 [EXACT] User ID:', user.id, 'Finding exact phone:', phone);
  
  const normalizedPhone = normalizePhoneForMatching(phone);
  console.log('📱 [EXACT] Normalized phone:', normalizedPhone);
  
  // Get all customers for this user and find exact match
  const { data, error } = await supabase
    .from('customers')
    .select(`
      *,
      cities:city_id(name),
      governorates:governorate_id(name)
    `)
    .eq('created_by', user.id);
  
  if (error) {
    console.error(`[EXACT] Error fetching customers:`, error);
    throw error;
  }
  
  // Find exact normalized phone match
  const exactMatch = data.find(customer => {
    const customerPrimaryNorm = normalizePhoneForMatching(customer.phone || '');
    const customerSecondaryNorm = normalizePhoneForMatching(customer.secondary_phone || '');
    
    return customerPrimaryNorm === normalizedPhone || customerSecondaryNorm === normalizedPhone;
  });
  
  if (exactMatch) {
    console.log('✅ [EXACT] Found customer:', exactMatch.name, 'created_by:', exactMatch.created_by);
    const customerWithLocation: CustomerWithLocation = {
      ...exactMatch,
      city_name: exactMatch.cities?.name,
      governorate_name: exactMatch.governorates?.name
    };
    
    return customerWithLocation;
  }
  
  console.log('❌ [EXACT] No customer found');
  return null;
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
