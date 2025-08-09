import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  getOrders, 
  getOrderById, 
  createOrder, 
  updateOrder, 
  deleteOrder,
  getOrdersByStatus,
  getOrdersWithDateRange,
  Order 
} from "@/services/orders";
import { toast } from "sonner";

export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: getOrders
  });
}

export function useOrdersByStatus(status: Order['status'] | undefined) {
  return useQuery({
    queryKey: ['orders', 'status', status],
    queryFn: () => status ? getOrdersByStatus(status) : Promise.resolve([]),
    enabled: !!status
  });
}

// Add hooks for new statuses
export function useAssignedOrders() {
  return useOrdersByStatus('Assigned');
}

export function useAwaitingPaymentOrders() {
  return useOrdersByStatus('Awaiting Payment');
}

export function useOnHoldOrders() {
  return useOrdersByStatus('On Hold');
}

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => id ? getOrderById(id) : Promise.resolve(null),
    enabled: !!id,
    staleTime: 0 // Always fetch fresh data for editing
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (order: Omit<Order, 'id' | 'order_id' | 'reference_number' | 'created_at' | 'updated_at'>) => 
      createOrder(order),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success("Order created successfully");
    },
    onError: (error) => {
      toast.error(`Error creating order: ${error.message}`);
    }
  });
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: Partial<Omit<Order, 'id' | 'order_id' | 'reference_number' | 'created_at' | 'updated_at'>> }) => 
      updateOrder(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.id] });
      toast.success("Order updated successfully");
    },
    onError: (error) => {
      toast.error(`Error updating order: ${error.message}`);
    }
  });
}

export function useOrdersWithDateRange(startDate: string | null, endDate: string | null) {
  return useQuery({
    queryKey: ['orders', 'date-range', startDate, endDate],
    queryFn: () => startDate && endDate ? getOrdersWithDateRange(startDate, endDate) : Promise.resolve([]),
    enabled: !!(startDate && endDate)
  });
}

export function useDeleteOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => deleteOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success("Order archived successfully");
    },
    onError: (error) => {
      toast.error(`Error archiving order: ${error.message}`);
    }
  });
}
