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
  const { data, error } = await supabase
    .from('client_payouts')
    .select(`
      *,
      order:order_id (
        order_id,
        reference_number,
        type,
        status,
        customer:customer_id (
          name,
          phone,
          cities:city_id(name),
          governorates:governorate_id(name)
        )
      ),
      client:client_id (
        id,
        business_name,
        full_name
      )
    `)
    .in('payout_status', ['Pending', 'Processing'])
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching filtered client payouts:', error);
    throw error;
  }

  // Filter out payouts for orders that have been marked as 'paid'
  const filteredData = data?.filter(payout => {
    const order = payout.order as any;
    return order && order.status !== 'paid';
  }) || [];

  return filteredData.map(payout => {
    const order = payout.order as any;
    const client = payout.client as any;
    
    return {
      ...payout,
      order: {
        order_id: order?.order_id || 0,
        reference_number: order?.reference_number || '',
        type: order?.type || '',
        status: order?.status || '',
        customer: {
          name: order?.customer?.name || '',
          phone: order?.customer?.phone || '',
          city_name: order?.customer?.cities?.name || '',
          governorate_name: order?.customer?.governorates?.name || ''
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