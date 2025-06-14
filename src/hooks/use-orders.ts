
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  getOrders, 
  getOrderById, 
  createOrder, 
  updateOrder, 
  getOrdersByStatus,
  getOrdersWithDateRange,
  archiveOrder,
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

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => id ? getOrderById(id) : Promise.resolve(null),
    enabled: !!id
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (order: Omit<Order, 'id' | 'order_id' | 'reference_number' | 'created_at' | 'updated_at' | 'archived' | 'edited' | 'edit_history'>) => 
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
    mutationFn: ({ id, updates, editHistory }: { id: string, updates: Partial<Omit<Order, 'id' | 'order_id' | 'reference_number' | 'created_at' | 'updated_at'>>, editHistory?: any[] }) => 
      updateOrder(id, updates, editHistory),
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

export function useArchiveOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => archiveOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success("Order archived successfully");
    },
    onError: (error) => {
      toast.error(`Error archiving order: ${error.message}`);
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
