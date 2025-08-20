import { supabase } from "@/integrations/supabase/client";
import { OrderWithCustomer, OrderStatus, transformOrderData } from "./orders";

// Get current courier's profile from the database
export async function getCurrentCourierProfile() {
  console.log('=== getCurrentCourierProfile: Starting authentication check ===');
  
  const { data: { user } } = await supabase.auth.getUser();
  console.log('Auth user:', user ? { id: user.id, email: user.email } : 'No user found');
  
  if (!user) {
    console.error('No authenticated user found');
    throw new Error('User not authenticated');
  }

  // First get the user's profile to check if they're a courier
  console.log('Fetching profile for user ID:', user.id);
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('user_type, full_name')
    .eq('id', user.id)
    .single();

  console.log('Profile query result:', { profile, profileError });

  if (profileError) {
    console.error('Profile error:', profileError);
    throw new Error(`Profile lookup failed: ${profileError.message}`);
  }

  if (!profile) {
    console.error('No profile found for user');
    throw new Error('No profile found for user');
  }

  if (profile.user_type !== 'courier') {
    console.error('User is not a courier. User type:', profile.user_type);
    throw new Error(`User is not a courier. User type: ${profile.user_type}`);
  }

  console.log('User is confirmed courier, fetching courier record...');

  // Now get the courier record using user ID
  const { data: courier, error: courierError } = await supabase
    .from('couriers')
    .select('*')
    .eq('id', user.id)
    .single();

  console.log('Courier query result:', { courier: courier ? { id: courier.id, full_name: courier.full_name } : null, courierError });

  if (courierError) {
    console.error('Courier error:', courierError);
    throw new Error(`Courier profile not found: ${courierError.message}`);
  }

  if (!courier) {
    console.error('No courier record found');
    throw new Error('No courier record found');
  }

  console.log('=== getCurrentCourierProfile: SUCCESS ===', courier.id);
  return courier;
}

// Get orders assigned to the current courier
export async function getCourierOrders() {
  console.log('=== getCourierOrders: Starting ===');
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('No authenticated user in getCourierOrders');
    throw new Error('User not authenticated');
  }

  try {
    const courier = await getCurrentCourierProfile();
    console.log('Got courier profile, fetching orders for courier ID:', courier.id);
    
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        customer:customer_id(
          *,
          cities:city_id(name),
          governorates:governorate_id(name)
        ),
        profiles:created_by(
          business_name,
          phone
        )
      `)
      .eq('courier_id', courier.id)
      .eq('archived', false)
      .order('created_at', { ascending: false });

    console.log('Orders query result:', { 
      orderCount: data?.length || 0, 
      error: error ? error.message : 'No error',
      courierIdUsed: courier.id
    });

    if (error) {
      console.error('Error fetching courier orders:', error);
      throw error;
    }

    const transformedOrders = data.map(transformOrderData);
    console.log('=== getCourierOrders: SUCCESS - Returning', transformedOrders.length, 'orders ===');
    
    return transformedOrders;
  } catch (error) {
    console.error('Error getting courier orders:', error);
    throw error;
  }
}

// Get courier orders by status
export async function getCourierOrdersByStatus(status: OrderStatus) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  try {
    const courier = await getCurrentCourierProfile();
    
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        customer:customer_id(
          *,
          cities:city_id(name),
          governorates:governorate_id(name)
        ),
        profiles:created_by(
          business_name,
          phone
        )
      `)
      .eq('courier_id', courier.id)
      .eq('status', status)
      .eq('archived', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`Error fetching courier orders with status ${status}:`, error);
      throw error;
    }

    return data.map(transformOrderData);
  } catch (error) {
    console.error(`Error getting courier orders by status ${status}:`, error);
    throw error;
  }
}

// Update order status (courier actions)
export async function updateOrderStatus(
  orderId: string, 
  status: OrderStatus, 
  reason?: string,
  collected_amount_usd?: number,
  collected_amount_lbp?: number,
  collected_currency?: string,
  unsuccessful_reason?: string,
  note?: string
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  try {
    const courier = await getCurrentCourierProfile();
    
    const updates: any = {
      status,
      updated_at: new Date().toISOString()
    };

    if (reason) updates.reason_unsuccessful = reason;
    if (unsuccessful_reason) updates.unsuccessful_reason = unsuccessful_reason;
    if (collected_amount_usd !== undefined) updates.collected_amount_usd = collected_amount_usd;
    if (collected_amount_lbp !== undefined) updates.collected_amount_lbp = collected_amount_lbp;
    if (collected_currency) updates.collected_currency = collected_currency;
    if (note) updates.note = note;
    if (status === 'Successful' || status === 'Unsuccessful') {
      updates.collection_timestamp = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', orderId)
      .eq('courier_id', courier.id) // Ensure courier can only update their own orders
      .select()
      .single();

    if (error) {
      console.error(`Error updating order status:`, error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
}

// Add delivery notes to an order
export async function addDeliveryNote(orderId: string, note: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  try {
    const courier = await getCurrentCourierProfile();
    
    const { data, error } = await supabase
      .from('orders')
      .update({
        note: note,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .eq('courier_id', courier.id)
      .select()
      .single();

    if (error) {
      console.error(`Error adding delivery note:`, error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error adding delivery note:', error);
    throw error;
  }
}