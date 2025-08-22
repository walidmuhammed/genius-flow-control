import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ClientPayout {
  id: string;
  order_id: string;
  client_id: string;
  collected_amount_usd: number;
  collected_amount_lbp: number;
  delivery_fee_usd: number;
  delivery_fee_lbp: number;
  net_payout_usd: number;
  net_payout_lbp: number;
  payout_status: string;
  invoice_id: string | null;
  created_at: string;
  updated_at: string;
  order: {
    order_id: number;
    reference_number: string;
    type: string;
    status: string;
    customer: {
      name: string;
      phone: string;
      city_name: string;
      governorate_name: string;
    };
  };
  client: {
    id: string;
    business_name: string;
    full_name: string;
  };
}

export interface GroupedClientPayouts {
  [clientId: string]: {
    client: {
      id: string;
      business_name: string;
      full_name: string;
    };
    payouts: ClientPayout[];
    totalUSD: number;
    totalLBP: number;
  };
}

async function getFilteredClientPayouts(): Promise<ClientPayout[]> {
  try {
    console.log('Fetching eligible orders for client payouts...');
    
    // Step 1: Get orders that are eligible for invoicing
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        order_id,
        reference_number,
        type,
        status,
        payment_status,
        invoice_id,
        client_id,
        customer_id,
        collected_amount_usd,
        collected_amount_lbp,
        delivery_fees_usd,
        delivery_fees_lbp,
        created_at
      `)
      .eq('status', 'Successful')
      .eq('payment_status', 'pending')
      .is('invoice_id', null)
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
      throw ordersError;
    }

    if (!orders || orders.length === 0) {
      console.log('No eligible orders found for payouts');
      return [];
    }

    console.log(`Found ${orders.length} eligible orders`);

    // Step 2: Get unique customer and client IDs
    const customerIds = [...new Set(orders.map(o => o.customer_id).filter(Boolean))];
    const clientIds = [...new Set(orders.map(o => o.client_id).filter(Boolean))];

    // Step 3: Fetch customer data
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select(`
        id,
        name,
        phone,
        city_id,
        governorate_id
      `)
      .in('id', customerIds);

    if (customersError) {
      console.error('Error fetching customers:', customersError);
      throw customersError;
    }

    // Step 4: Fetch client profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select(`
        id,
        business_name,
        full_name
      `)
      .in('id', clientIds);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      throw profilesError;
    }

    // Step 5: Get unique city and governorate IDs
    const cityIds = [...new Set(customers?.map(c => c.city_id).filter(Boolean) || [])];
    const governorateIds = [...new Set(customers?.map(c => c.governorate_id).filter(Boolean) || [])];

    // Step 6: Fetch city and governorate names
    const [citiesResult, governoratesResult] = await Promise.all([
      cityIds.length > 0 ? supabase
        .from('cities')
        .select('id, name')
        .in('id', cityIds) : { data: [], error: null },
      governorateIds.length > 0 ? supabase
        .from('governorates')
        .select('id, name')
        .in('id', governorateIds) : { data: [], error: null }
    ]);

    if (citiesResult.error) {
      console.error('Error fetching cities:', citiesResult.error);
    }
    if (governoratesResult.error) {
      console.error('Error fetching governorates:', governoratesResult.error);
    }

    // Create lookup maps
    const customerMap = new Map<string, any>();
    const profileMap = new Map<string, any>();
    const cityMap = new Map<string, string>();
    const governorateMap = new Map<string, string>();

    customers?.forEach(c => customerMap.set(c.id, c));
    profiles?.forEach(p => profileMap.set(p.id, p));
    citiesResult.data?.forEach(c => cityMap.set(c.id, c.name));
    governoratesResult.data?.forEach(g => governorateMap.set(g.id, g.name));

    // Step 7: Transform the data
    const result = orders.map(order => {
      const customer = customerMap.get(order.customer_id);
      const client = profileMap.get(order.client_id);
      
      const collected_usd = Number(order.collected_amount_usd) || 0;
      const collected_lbp = Number(order.collected_amount_lbp) || 0;
      const delivery_usd = Number(order.delivery_fees_usd) || 0;
      const delivery_lbp = Number(order.delivery_fees_lbp) || 0;
      
      return {
        id: order.id,
        order_id: order.id,
        client_id: order.client_id,
        collected_amount_usd: collected_usd,
        collected_amount_lbp: collected_lbp,
        delivery_fee_usd: delivery_usd,
        delivery_fee_lbp: delivery_lbp,
        net_payout_usd: collected_usd - delivery_usd,
        net_payout_lbp: collected_lbp - delivery_lbp,
        payout_status: 'Pending',
        invoice_id: null,
        created_at: order.created_at,
        updated_at: order.created_at,
        order: {
          order_id: order.order_id || 0,
          reference_number: order.reference_number || '',
          type: order.type || '',
          status: order.status || '',
          customer: {
            name: customer?.name || '',
            phone: customer?.phone || '',
            city_name: (customer ? cityMap.get(customer.city_id) : '') || '',
            governorate_name: (customer ? governorateMap.get(customer.governorate_id) : '') || ''
          }
        },
        client: {
          id: client?.id || '',
          business_name: client?.business_name || '',
          full_name: client?.full_name || ''
        }
      };
    });

    console.log(`Successfully transformed ${result.length} client payouts`);
    return result;

  } catch (error) {
    console.error('Error in getFilteredClientPayouts:', error);
    throw error;
  }
}

export function useFilteredClientPayouts() {
  return useQuery({
    queryKey: ['filtered-client-payouts'],
    queryFn: getFilteredClientPayouts,
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 30000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: false,
  });
}

export function useGroupedFilteredClientPayouts() {
  const { data: payouts, ...rest } = useFilteredClientPayouts();

  const groupedPayouts: GroupedClientPayouts = {};
  
  if (payouts) {
    payouts.forEach(payout => {
      const clientId = payout.client_id;
      
      if (!groupedPayouts[clientId]) {
        groupedPayouts[clientId] = {
          client: payout.client,
          payouts: [],
          totalUSD: 0,
          totalLBP: 0
        };
      }
      
      groupedPayouts[clientId].payouts.push(payout);
      groupedPayouts[clientId].totalUSD += payout.net_payout_usd || 0;
      groupedPayouts[clientId].totalLBP += payout.net_payout_lbp || 0;
    });
  }

  return {
    data: groupedPayouts,
    ...rest
  };
}