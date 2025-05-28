
import { supabase } from "@/integrations/supabase/client";

export interface Pickup {
  id: string;
  pickup_id: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Canceled';
  location: string;
  address: string;
  contact_person: string;
  contact_phone: string;
  pickup_date: string;
  courier_name?: string;
  courier_phone?: string;
  requested: boolean;
  picked_up: boolean;
  validated: boolean;
  note?: string;
  vehicle_type?: string;
  orders_count?: number;
  client_id?: string;
  created_at: string;
  updated_at: string;
}

export async function getPickups() {
  const { data, error } = await supabase
    .from('pickups')
    .select('*')
    .order('pickup_date', { ascending: true });
  
  if (error) {
    console.error('Error fetching pickups:', error);
    throw error;
  }
  
  return data as Pickup[];
}

export async function getPickupsByStatus(status: Pickup['status']) {
  const { data, error } = await supabase
    .from('pickups')
    .select('*')
    .eq('status', status)
    .order('pickup_date', { ascending: true });
  
  if (error) {
    console.error(`Error fetching pickups with status ${status}:`, error);
    throw error;
  }
  
  return data as Pickup[];
}

export async function getPickupById(id: string) {
  const { data, error } = await supabase
    .from('pickups')
    .select(`
      *,
      pickup_orders (
        order_id,
        orders (*)
      )
    `)
    .eq('id', id)
    .single();
  
  if (error) {
    console.error(`Error fetching pickup with id ${id}:`, error);
    throw error;
  }
  
  return data as Pickup;
}

export async function createPickup(pickup: Omit<Pickup, 'id' | 'pickup_id' | 'created_at' | 'updated_at' | 'client_id'>) {
  const { data, error } = await supabase
    .from('pickups')
    .insert([{
      ...pickup,
      client_id: (await supabase.auth.getUser()).data.user?.id
    }])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating pickup:', error);
    throw error;
  }
  
  return data as Pickup;
}

export async function updatePickup(id: string, updates: Partial<Omit<Pickup, 'id' | 'pickup_id' | 'created_at' | 'updated_at' | 'client_id'>>) {
  const { data, error } = await supabase
    .from('pickups')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error(`Error updating pickup with id ${id}:`, error);
    throw error;
  }
  
  return data as Pickup;
}

export async function linkOrdersToPickup(pickupId: string, orderIds: string[]) {
  const pickupOrders = orderIds.map(orderId => ({
    pickup_id: pickupId,
    order_id: orderId
  }));

  const { data, error } = await supabase
    .from('pickup_orders')
    .insert(pickupOrders);

  if (error) {
    console.error('Error linking orders to pickup:', error);
    throw error;
  }

  return data;
}

export async function getPickupOrders(pickupId: string) {
  const { data, error } = await supabase
    .from('pickup_orders')
    .select(`
      *,
      orders (*)
    `)
    .eq('pickup_id', pickupId);

  if (error) {
    console.error('Error fetching pickup orders:', error);
    throw error;
  }

  return data;
}
