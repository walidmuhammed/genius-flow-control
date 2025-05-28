
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
  vehicle_type: 'small' | 'medium' | 'large';
  orders_count: number;
  client_id?: string;
  created_at: string;
  updated_at: string;
}

export interface PickupWithOrders extends Pickup {
  orders: Array<{
    id: string;
    order_id: number;
    reference_number: string;
    type: string;
    status: string;
    customer_name: string;
  }>;
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
      pickup_orders!inner(
        order:order_id(
          id,
          order_id,
          reference_number,
          type,
          status,
          customer:customer_id(name)
        )
      )
    `)
    .eq('id', id)
    .single();
  
  if (error) {
    console.error(`Error fetching pickup with id ${id}:`, error);
    throw error;
  }
  
  // Transform the data to include orders array and ensure proper typing
  const pickup: PickupWithOrders = {
    ...data,
    status: data.status as Pickup['status'],
    vehicle_type: (data.vehicle_type || 'medium') as 'small' | 'medium' | 'large', // Ensure proper typing
    orders: data.pickup_orders?.map((po: any) => ({
      id: po.order.id,
      order_id: po.order.order_id,
      reference_number: po.order.reference_number,
      type: po.order.type,
      status: po.order.status,
      customer_name: po.order.customer?.name || 'Unknown'
    })) || []
  };
  
  return pickup;
}

export async function createPickup(pickup: Omit<Pickup, 'id' | 'pickup_id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('pickups')
    .insert([pickup])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating pickup:', error);
    throw error;
  }
  
  return data as Pickup;
}

export async function updatePickup(id: string, updates: Partial<Omit<Pickup, 'id' | 'pickup_id' | 'created_at' | 'updated_at'>>) {
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

export async function addOrdersToPickup(pickupId: string, orderIds: string[]) {
  const pickupOrders = orderIds.map(orderId => ({
    pickup_id: pickupId,
    order_id: orderId
  }));

  const { error } = await supabase
    .from('pickup_orders')
    .insert(pickupOrders);
  
  if (error) {
    console.error('Error adding orders to pickup:', error);
    throw error;
  }
}

export async function getNewOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      customer:customer_id(
        name,
        phone,
        address,
        cities:city_id(name),
        governorates:governorate_id(name)
      )
    `)
    .eq('status', 'New')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching new orders:', error);
    throw error;
  }
  
  return data;
}
