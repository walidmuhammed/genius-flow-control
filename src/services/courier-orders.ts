import { supabase } from "@/integrations/supabase/client";
import { OrderWithCustomer, OrderStatus, transformOrderData } from "./orders";

// Get current courier's profile from the database
export async function getCurrentCourierProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  // First get the user's profile to check if they're a courier
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('user_type')
    .eq('id', user.id)
    .single();

  if (profileError || !profile || profile.user_type !== 'courier') {
    throw new Error('User is not a courier');
  }

  // Now get the courier record using user ID instead of email
  const { data: courier, error: courierError } = await supabase
    .from('couriers')
    .select('*')
    .eq('id', user.id)
    .single();

  if (courierError) {
    throw new Error('Courier profile not found');
  }

  return courier;
}

// Get orders assigned to the current courier
export async function getCourierOrders() {
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
      .eq('archived', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching courier orders:', error);
      throw error;
    }

    return data.map(transformOrderData);
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
export async function updateOrderStatus(orderId: string, status: OrderStatus, reason?: string) {
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

    if (reason) {
      updates.reason_unsuccessful = reason;
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