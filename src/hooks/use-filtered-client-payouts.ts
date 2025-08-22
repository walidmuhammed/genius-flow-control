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
  // Get orders that are eligible for invoicing:
  // - Status is 'Successful' (completed deliveries)
  // - payment_status is 'pending' (not yet invoiced or paid)
  // - invoice_id is NULL (not already in an invoice)
  const { data, error } = await supabase
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
      collected_amount_usd,
      collected_amount_lbp,
      delivery_fees_usd,
      delivery_fees_lbp,
      created_at,
      customer:customer_id (
        name,
        phone,
        cities:city_id(name),
        governorates:governorate_id(name)
      ),
      profiles:client_id (
        id,
        business_name,
        full_name
      )
    `)
    .eq('status', 'Successful')
    .eq('payment_status', 'pending')
    .is('invoice_id', null)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching filtered client payouts:', error);
    throw error;
  }

  // Transform the data to match the expected ClientPayout format
  return (data || []).map(order => {
    const customer = order.customer as any;
    const client = order.profiles as any;
    
    const collected_usd = order.collected_amount_usd || 0;
    const collected_lbp = order.collected_amount_lbp || 0;
    const delivery_usd = order.delivery_fees_usd || 0;
    const delivery_lbp = order.delivery_fees_lbp || 0;
    
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
          city_name: customer?.cities?.name || '',
          governorate_name: customer?.governorates?.name || ''
        }
      },
      client: {
        id: client?.id || '',
        business_name: client?.business_name || '',
        full_name: client?.full_name || ''
      }
    };
  });
}

export function useFilteredClientPayouts() {
  return useQuery({
    queryKey: ['filtered-client-payouts'],
    queryFn: getFilteredClientPayouts,
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