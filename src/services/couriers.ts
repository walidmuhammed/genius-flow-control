
import { supabase } from "@/integrations/supabase/client";

export interface Courier {
  id: string;
  full_name: string;
  phone?: string;
  status?: 'active' | 'inactive' | 'suspended';
  vehicle_type?: string;
  assigned_zones?: string[];
  created_at: string;
  avatar_url?: string;
  email?: string;
  address?: string;
  id_photo_url?: string;
  license_photo_url?: string;
  admin_notes?: string;
}

export interface CourierWithStats extends Courier {
  active_orders_count: number;
  cash_on_hand_usd: number;
  cash_on_hand_lbp: number;
  delivery_fees_usd: number;
  delivery_fees_lbp: number;
  orders_completed_today: number;
  pickups_completed_today: number;
  last_activity?: string;
  rating?: number;
}

export async function getCouriers(): Promise<CourierWithStats[]> {
  const { data, error } = await supabase
    .from('couriers')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching couriers:', error);
    throw error;
  }
  
  // Calculate stats for each courier
  const couriersWithStats = await Promise.all(
    data.map(async (courier) => {
      const stats = await getCourierStats(courier.id);
      return {
        ...courier,
        status: courier.status || 'active' as const,
        vehicle_type: courier.vehicle_type || 'motorcycle',
        assigned_zones: courier.assigned_zones || [],
        ...stats
      };
    })
  );
  
  return couriersWithStats;
}

export async function getCourierById(id: string): Promise<CourierWithStats | null> {
  const { data, error } = await supabase
    .from('couriers')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error(`Error fetching courier with id ${id}:`, error);
    return null;
  }
  
  const stats = await getCourierStats(id);
  
  return {
    ...data,
    status: data.status || 'active' as const,
    vehicle_type: data.vehicle_type || 'motorcycle',
    assigned_zones: data.assigned_zones || [],
    ...stats
  };
}

export async function getCourierStats(courierId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString();
  
  // Get active orders
  const { data: activeOrders } = await supabase
    .from('orders')
    .select('*')
    .eq('courier_id', courierId)
    .in('status', ['In Progress', 'Heading to Customer', 'Heading to You']);
    
  // Get completed orders today
  const { data: ordersToday } = await supabase
    .from('orders')
    .select('*')
    .eq('courier_id', courierId)
    .eq('status', 'Successful')
    .gte('created_at', todayStr);
    
  // Get pickups completed today
  const { data: pickupsToday } = await supabase
    .from('pickups')
    .select('*')
    .eq('courier_name', (await getCourierById(courierId))?.full_name || '')
    .eq('picked_up', true)
    .gte('created_at', todayStr);
    
  // Calculate cash on hand and delivery fees
  const { data: successfulOrders } = await supabase
    .from('orders')
    .select('*')
    .eq('courier_id', courierId)
    .eq('status', 'Successful');
    
  let cashOnHandUsd = 0;
  let cashOnHandLbp = 0;
  let deliveryFeesUsd = 0;
  let deliveryFeesLbp = 0;
  
  successfulOrders?.forEach(order => {
    if (order.cash_collection_enabled) {
      cashOnHandUsd += order.cash_collection_usd || 0;
      cashOnHandLbp += order.cash_collection_lbp || 0;
    }
    deliveryFeesUsd += order.delivery_fees_usd || 0;
    deliveryFeesLbp += order.delivery_fees_lbp || 0;
  });
  
  return {
    active_orders_count: activeOrders?.length || 0,
    cash_on_hand_usd: cashOnHandUsd,
    cash_on_hand_lbp: cashOnHandLbp,
    delivery_fees_usd: deliveryFeesUsd,
    delivery_fees_lbp: deliveryFeesLbp,
    orders_completed_today: ordersToday?.length || 0,
    pickups_completed_today: pickupsToday?.length || 0,
    rating: 4.8, // Mock rating for now
    last_activity: new Date().toISOString()
  };
}

export async function createCourier(courier: Omit<Courier, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('couriers')
    .insert([{
      full_name: courier.full_name,
      phone: courier.phone,
      email: courier.email,
      address: courier.address,
      status: courier.status || 'active',
      vehicle_type: courier.vehicle_type || 'motorcycle',
      assigned_zones: courier.assigned_zones || [],
      avatar_url: courier.avatar_url,
      id_photo_url: courier.id_photo_url,
      license_photo_url: courier.license_photo_url,
      admin_notes: courier.admin_notes
    }])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating courier:', error);
    throw error;
  }
  
  return data as Courier;
}

export async function updateCourier(id: string, updates: Partial<Omit<Courier, 'id' | 'created_at'>>) {
  const { data, error } = await supabase
    .from('couriers')
    .update({
      full_name: updates.full_name,
      phone: updates.phone,
      email: updates.email,
      address: updates.address,
      status: updates.status,
      vehicle_type: updates.vehicle_type,
      assigned_zones: updates.assigned_zones,
      avatar_url: updates.avatar_url,
      id_photo_url: updates.id_photo_url,
      license_photo_url: updates.license_photo_url,
      admin_notes: updates.admin_notes
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error(`Error updating courier with id ${id}:`, error);
    throw error;
  }
  
  return data as Courier;
}

export async function deleteCourier(id: string) {
  const { data, error } = await supabase
    .from('couriers')
    .delete()
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error(`Error deleting courier with id ${id}:`, error);
    throw error;
  }
  
  return data;
}

export async function getCourierOrders(courierId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      customer:customer_id(
        *,
        cities:city_id(name),
        governorates:governorate_id(name)
      )
    `)
    .eq('courier_id', courierId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error(`Error fetching orders for courier ${courierId}:`, error);
    throw error;
  }
  
  return data;
}

export async function getCourierPickups(courierName: string) {
  const { data, error } = await supabase
    .from('pickups')
    .select('*')
    .eq('courier_name', courierName)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error(`Error fetching pickups for courier ${courierName}:`, error);
    throw error;
  }
  
  return data;
}

export async function uploadCourierFile(file: File, type: 'avatar' | 'id_photo' | 'license_photo'): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${type}_${Date.now()}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from('courier-documents')
    .upload(fileName, file);
  
  if (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
  
  const { data: { publicUrl } } = supabase.storage
    .from('courier-documents')
    .getPublicUrl(fileName);
  
  return publicUrl;
}
