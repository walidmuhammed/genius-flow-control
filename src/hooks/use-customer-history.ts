import { useQuery } from "@tanstack/react-query";
import { getCustomerHistory, CustomerHistoryEntry } from "@/services/customerHistory";

export function useCustomerHistory(customerId: string | undefined) {
  return useQuery({
    queryKey: ['customer-history', customerId],
    queryFn: () => customerId ? getCustomerHistory(customerId) : Promise.resolve([]),
    enabled: !!customerId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}