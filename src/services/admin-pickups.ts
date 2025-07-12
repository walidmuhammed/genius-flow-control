import { supabase } from "@/integrations/supabase/client";
import { Pickup } from "@/services/pickups";

export interface AdminPickupStats {
  totalPickups: number;
  totalScheduled: number;
  totalAssigned: number;
  totalInProgress: number;
  totalCompleted: number;
  totalCanceled: number;
  totalCashToCollect: {
    usd: number;
    lbp: number;
  };
  pickupSuccessRate: number;
}

export interface AdminPickupWithClient extends Pickup {
  client_name: string;
  client_business_name: string;
  client_business_type: string;
  total_orders: number;
  total_cash_usd: number;
  total_cash_lbp: number;
}

export async function getAdminPickupStats(): Promise<AdminPickupStats> {
  // Get pickup counts by status
  const { data: pickupStats, error: statsError } = await supabase
    .from('pickups')
    .select('status');

  if (statsError) {
    console.error('Error fetching pickup stats:', statsError);
    throw statsError;
  }

  // Get cash collection totals from orders linked to pickups
  const { data: cashData, error: cashError } = await supabase
    .from('pickup_orders')
    .select(`
      orders!inner(
        cash_collection_usd,
        cash_collection_lbp,
        cash_collection_enabled
      )
    `);

  if (cashError) {
    console.error('Error fetching cash data:', cashError);
    throw cashError;
  }

  const totalPickups = pickupStats.length;
  const statusCounts = pickupStats.reduce((acc, pickup) => {
    acc[pickup.status.toLowerCase()] = (acc[pickup.status.toLowerCase()] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const cashTotals = cashData.reduce(
    (acc, item) => {
      if (item.orders.cash_collection_enabled) {
        acc.usd += item.orders.cash_collection_usd || 0;
        acc.lbp += item.orders.cash_collection_lbp || 0;
      }
      return acc;
    },
    { usd: 0, lbp: 0 }
  );

  const completedCount = statusCounts.completed || 0;
  const pickupSuccessRate = totalPickups > 0 ? (completedCount / totalPickups) * 100 : 0;

  return {
    totalPickups,
    totalScheduled: statusCounts.scheduled || 0,
    totalAssigned: statusCounts.assigned || 0,
    totalInProgress: statusCounts['in progress'] || 0,
    totalCompleted: completedCount,
    totalCanceled: statusCounts.canceled || 0,
    totalCashToCollect: cashTotals,
    pickupSuccessRate
  };
}

export async function getAdminPickupsWithClients(filters?: { 
  status?: string; 
  search?: string; 
  limit?: number; 
  offset?: number; 
}): Promise<AdminPickupWithClient[]> {
  // Build optimized query with filters at database level
  let query = supabase
    .from('pickups')
    .select(`
      id,
      pickup_id,
      pickup_date,
      status,
      location,
      address,
      contact_person,
      contact_phone,
      courier_name,
      courier_phone,
      note,
      vehicle_type,
      orders_count,
      created_at,
      updated_at,
      client_id,
      profiles!pickups_client_id_fkey(
        full_name,
        business_name,
        business_type
      ),
      pickup_orders(
        count
      )
    `)
    .order('created_at', { ascending: false });

  // Apply status filter at database level
  if (filters?.status && filters.status !== 'all') {
    query = query.ilike('status', filters.status);
  }

  // Apply search filter at database level
  if (filters?.search) {
    const searchTerm = `%${filters.search}%`;
    query = query.or(`pickup_id.ilike.${searchTerm},location.ilike.${searchTerm},contact_person.ilike.${searchTerm}`);
  }

  // Apply pagination
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }
  if (filters?.offset) {
    query = query.range(filters.offset, (filters.offset + (filters.limit || 50)) - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching admin pickups:', error);
    throw error;
  }

  // Get cash collection data separately for better performance
  const pickupIds = data?.map(p => p.id) || [];
  let cashData = [];
  
  if (pickupIds.length > 0) {
    const { data: cashResult } = await supabase
      .from('pickup_orders')
      .select(`
        pickup_id,
        orders!inner(
          cash_collection_usd,
          cash_collection_lbp,
          cash_collection_enabled
        )
      `)
      .in('pickup_id', pickupIds);
    
    cashData = cashResult || [];
  }

  return data?.map((pickup: any) => {
    const totalOrders = pickup.orders_count || pickup.pickup_orders?.length || 0;
    
    // Calculate cash totals for this pickup
    const pickupCashData = cashData.filter((cd: any) => cd.pickup_id === pickup.id);
    const cashTotals = pickupCashData.reduce(
      (acc: any, po: any) => {
        if (po.orders?.cash_collection_enabled) {
          acc.usd += po.orders.cash_collection_usd || 0;
          acc.lbp += po.orders.cash_collection_lbp || 0;
        }
        return acc;
      },
      { usd: 0, lbp: 0 }
    );

    return {
      ...pickup,
      client_name: pickup.profiles?.full_name || 'Unknown Client',
      client_business_name: pickup.profiles?.business_name || 'Unknown Business',
      client_business_type: pickup.profiles?.business_type || 'Unknown Type',
      total_orders: totalOrders,
      total_cash_usd: cashTotals.usd,
      total_cash_lbp: cashTotals.lbp
    };
  }) || [];
}

export async function updatePickupStatus(pickupId: string, status: string): Promise<void> {
  const { error } = await supabase
    .from('pickups')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', pickupId);

  if (error) {
    console.error('Error updating pickup status:', error);
    throw error;
  }
}

export async function assignCourierToPickup(pickupId: string, courierName: string, courierPhone?: string): Promise<void> {
  const { error } = await supabase
    .from('pickups')
    .update({ 
      courier_name: courierName,
      courier_phone: courierPhone,
      status: 'Assigned',
      updated_at: new Date().toISOString()
    })
    .eq('id', pickupId);

  if (error) {
    console.error('Error assigning courier to pickup:', error);
    throw error;
  }
}

export async function getAvailableCouriers() {
  const { data, error } = await supabase
    .from('couriers')
    .select('*')
    .eq('status', 'active')
    .order('full_name');

  if (error) {
    console.error('Error fetching couriers:', error);
    throw error;
  }

  return data;
}