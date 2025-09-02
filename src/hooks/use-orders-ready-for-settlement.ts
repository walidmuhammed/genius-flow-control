import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getOrdersReadyForSettlement, requestSettlementPayout } from '@/services/courier-settlements';

export interface OrderReadyForSettlement {
  id: string;
  order_id: number;
  status: string;
  courier_settlement_status: string;
  collected_amount_usd: number;
  collected_amount_lbp: number;
  courier_fee_usd: number;
  courier_fee_lbp: number;
  created_at: string;
  customers: {
    name: string;
    phone: string;
  };
}

// Get orders ready for settlement for a specific courier
export const useOrdersReadyForSettlement = (courierId: string | undefined) => {
  return useQuery({
    queryKey: ['orders-ready-for-settlement', courierId],
    queryFn: async (): Promise<OrderReadyForSettlement[]> => {
      if (!courierId) return [];
      return await getOrdersReadyForSettlement(courierId);
    },
    enabled: !!courierId,
  });
};