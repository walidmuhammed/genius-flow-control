import { supabase } from '@/integrations/supabase/client';

export interface CourierPickupStats {
  totalPickups: number;
  totalScheduled: number;
  totalAssigned: number;
  totalInProgress: number;
  totalCompleted: number;
  totalCanceled: number;
  totalCashToCollectUSD: number;
  totalCashToCollectLBP: number;
}

export interface CourierPickupWithClient {
  id: string;
  pickup_id: string;
  location: string;
  address: string;
  contact_person: string;
  contact_phone: string;
  pickup_date: string;
  status: string;
  note?: string;
  courier_name?: string;
  courier_phone?: string;
  vehicle_type: string;
  client_business_name: string;
  client_business_type: string;
  client_phone: string;
  total_orders: number;
  total_cash_usd: number;
  total_cash_lbp: number;
  package_type?: string;
}

async function getCurrentCourierProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, phone')
    .eq('id', user.id)
    .single();

  return profile;
}

export async function getCourierPickupStats(): Promise<CourierPickupStats> {
  try {
    const courierProfile = await getCurrentCourierProfile();
    if (!courierProfile) throw new Error('Courier profile not found');

    const { data: pickups, error } = await supabase
      .from('pickups')
      .select(`
        id,
        status,
        pickup_orders!inner(
          order_id,
          orders!inner(
            cash_collection_usd,
            cash_collection_lbp
          )
        )
      `)
      .eq('courier_name', courierProfile.full_name);

    if (error) throw error;

    const stats = {
      totalPickups: pickups?.length || 0,
      totalScheduled: pickups?.filter(p => p.status === 'scheduled').length || 0,
      totalAssigned: pickups?.filter(p => p.status === 'assigned').length || 0,
      totalInProgress: pickups?.filter(p => p.status === 'in progress').length || 0,
      totalCompleted: pickups?.filter(p => p.status === 'completed').length || 0,
      totalCanceled: pickups?.filter(p => p.status === 'canceled').length || 0,
      totalCashToCollectUSD: 0,
      totalCashToCollectLBP: 0,
    };

    // Calculate total cash to collect
    pickups?.forEach(pickup => {
      pickup.pickup_orders?.forEach(po => {
        if (po.orders) {
          stats.totalCashToCollectUSD += Number(po.orders.cash_collection_usd || 0);
          stats.totalCashToCollectLBP += Number(po.orders.cash_collection_lbp || 0);
        }
      });
    });

    return stats;
  } catch (error) {
    console.error('Error fetching courier pickup stats:', error);
    throw error;
  }
}

export async function getCourierPickupsWithDetails(filters?: {
  status?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  packageType?: string;
  limit?: number;
  offset?: number;
}): Promise<CourierPickupWithClient[]> {
  try {
    const courierProfile = await getCurrentCourierProfile();
    if (!courierProfile) throw new Error('Courier profile not found');

    let query = supabase
      .from('pickups')
      .select(`
        id,
        pickup_id,
        location,
        address,
        contact_person,
        contact_phone,
        pickup_date,
        status,
        note,
        courier_name,
        courier_phone,
        vehicle_type,
        client_id,
        profiles!pickups_client_id_fkey(
          business_name,
          business_type,
          phone
        )
      `)
      .eq('courier_name', courierProfile.full_name)
      .order('pickup_date', { ascending: false });

    // Apply filters
    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    if (filters?.dateFrom) {
      query = query.gte('pickup_date', filters.dateFrom);
    }

    if (filters?.dateTo) {
      query = query.lte('pickup_date', filters.dateTo);
    }

    if (filters?.search) {
      query = query.or(`
        pickup_id.ilike.%${filters.search}%,
        location.ilike.%${filters.search}%,
        contact_person.ilike.%${filters.search}%,
        contact_phone.ilike.%${filters.search}%
      `);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
    }

    const { data: pickups, error } = await query;

    if (error) throw error;

    // Get pickup orders and calculate totals
    const pickupsWithDetails = await Promise.all(
      (pickups || []).map(async (pickup) => {
        const { data: pickupOrders } = await supabase
          .from('pickup_orders')
          .select(`
            order_id,
            orders!inner(
              cash_collection_usd,
              cash_collection_lbp,
              package_type
            )
          `)
          .eq('pickup_id', pickup.id);

        const totalOrders = pickupOrders?.length || 0;
        let totalCashUSD = 0;
        let totalCashLBP = 0;
        let packageType = '';

        pickupOrders?.forEach(po => {
          if (po.orders) {
            totalCashUSD += Number(po.orders.cash_collection_usd || 0);
            totalCashLBP += Number(po.orders.cash_collection_lbp || 0);
            if (!packageType && po.orders.package_type) {
              packageType = po.orders.package_type;
            }
          }
        });

        return {
          ...pickup,
          client_business_name: pickup.profiles?.business_name || 'Unknown',
          client_business_type: pickup.profiles?.business_type || 'Unknown',
          client_phone: pickup.profiles?.phone || '',
          total_orders: totalOrders,
          total_cash_usd: totalCashUSD,
          total_cash_lbp: totalCashLBP,
          package_type: packageType,
        };
      })
    );

    // Filter by package type if specified
    if (filters?.packageType && filters.packageType !== 'all') {
      return pickupsWithDetails.filter(p => 
        p.package_type?.toLowerCase() === filters.packageType?.toLowerCase()
      );
    }

    return pickupsWithDetails;
  } catch (error) {
    console.error('Error fetching courier pickups:', error);
    throw error;
  }
}

export async function updateCourierPickupStatus(
  pickupId: string, 
  status: string, 
  reason?: string
): Promise<void> {
  try {
    const courierProfile = await getCurrentCourierProfile();
    if (!courierProfile) throw new Error('Courier profile not found');

    // Verify this pickup is assigned to the current courier
    const { data: pickup } = await supabase
      .from('pickups')
      .select('courier_name')
      .eq('id', pickupId)
      .single();

    if (!pickup || pickup.courier_name !== courierProfile.full_name) {
      throw new Error('Pickup not assigned to current courier');
    }

    const updateData: any = { status };
    if (reason) {
      updateData.note = reason;
    }

    const { error } = await supabase
      .from('pickups')
      .update(updateData)
      .eq('id', pickupId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating courier pickup status:', error);
    throw error;
  }
}