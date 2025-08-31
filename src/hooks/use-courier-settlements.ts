import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  getCourierSettlements,
  getCourierSettlementById,
  getSettlementOrders,
  getOpenOrdersByCourier,
  createCourierSettlement,
  recordCashHandover,
  markSettlementPaid,
  getCourierBalance,
  CreateSettlementData
} from "@/services/courier-settlements";
import { toast } from "sonner";

export function useCourierSettlements() {
  return useQuery({
    queryKey: ['courier-settlements'],
    queryFn: getCourierSettlements
  });
}

export function useCourierSettlement(id: string | undefined) {
  return useQuery({
    queryKey: ['courier-settlement', id],
    queryFn: () => id ? getCourierSettlementById(id) : Promise.resolve(null),
    enabled: !!id
  });
}

export function useSettlementOrders(settlementId: string | undefined) {
  return useQuery({
    queryKey: ['settlement-orders', settlementId],
    queryFn: () => settlementId ? getSettlementOrders(settlementId) : Promise.resolve([]),
    enabled: !!settlementId
  });
}

export function useOpenOrdersByCourier(courierId: string | undefined) {
  return useQuery({
    queryKey: ['open-orders-by-courier', courierId],
    queryFn: () => courierId ? getOpenOrdersByCourier(courierId) : Promise.resolve([]),
    enabled: !!courierId
  });
}

export function useCourierBalance(courierId: string | undefined) {
  return useQuery({
    queryKey: ['courier-balance', courierId],
    queryFn: () => courierId ? getCourierBalance(courierId) : Promise.resolve(null),
    enabled: !!courierId
  });
}

export function useCreateCourierSettlement() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateSettlementData) => createCourierSettlement(data),
    onSuccess: (settlement) => {
      queryClient.invalidateQueries({ queryKey: ['courier-settlements'] });
      queryClient.invalidateQueries({ queryKey: ['open-orders-by-courier'] });
      queryClient.invalidateQueries({ queryKey: ['courier-balance'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success(`Settlement ${settlement.settlement_id} created successfully`);
    },
    onError: (error) => {
      toast.error(`Error creating settlement: ${error.message}`);
    }
  });
}

export function useRecordCashHandover() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (settlementId: string) => recordCashHandover(settlementId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courier-settlements'] });
      queryClient.invalidateQueries({ queryKey: ['settlement-orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success("Cash handover recorded successfully");
    },
    onError: (error) => {
      toast.error(`Error recording cash handover: ${error.message}`);
    }
  });
}

export function useMarkSettlementPaid() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ settlementId, paymentMethod, notes }: { 
      settlementId: string; 
      paymentMethod: string; 
      notes?: string; 
    }) => markSettlementPaid(settlementId, paymentMethod, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courier-settlements'] });
      queryClient.invalidateQueries({ queryKey: ['settlement-orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['courier-balance'] });
      toast.success("Settlement marked as paid");
    },
    onError: (error) => {
      toast.error(`Error marking settlement as paid: ${error.message}`);
    }
  });
}