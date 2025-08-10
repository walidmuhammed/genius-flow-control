import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  getCourierOrders,
  getCourierOrdersByStatus,
  updateOrderStatus,
  addDeliveryNote,
  getCurrentCourierProfile
} from "@/services/courier-orders";
import { OrderStatus } from "@/services/orders";
import { toast } from "sonner";

export function useCourierProfile() {
  return useQuery({
    queryKey: ['courier-profile'],
    queryFn: getCurrentCourierProfile,
    retry: 1
  });
}

export function useCourierOrders() {
  return useQuery({
    queryKey: ['courier-orders'],
    queryFn: getCourierOrders,
    retry: 1
  });
}

export function useCourierOrdersByStatus(status: OrderStatus | undefined) {
  return useQuery({
    queryKey: ['courier-orders', 'status', status],
    queryFn: () => status ? getCourierOrdersByStatus(status) : Promise.resolve([]),
    enabled: !!status,
    retry: 1
  });
}

// Specific status hooks for courier
export function useCourierNewOrders() {
  return useCourierOrdersByStatus('New');
}

export function useCourierPendingPickupOrders() {
  return useCourierOrdersByStatus('Pending Pickup');
}

export function useCourierAssignedOrders() {
  return useCourierOrdersByStatus('Assigned');
}

export function useCourierInProgressOrders() {
  return useCourierOrdersByStatus('In Progress');
}

export function useCourierSuccessfulOrders() {
  return useCourierOrdersByStatus('Successful');
}

export function useCourierUnsuccessfulOrders() {
  return useCourierOrdersByStatus('Unsuccessful');
}

export function useCourierReturnedOrders() {
  return useCourierOrdersByStatus('Returned');
}

export function useCourierAwaitingPaymentOrders() {
  return useCourierOrdersByStatus('Awaiting Payment');
}

export function useCourierPaidOrders() {
  return useCourierOrdersByStatus('Paid');
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ orderId, status, reason }: { orderId: string, status: OrderStatus, reason?: string }) => 
      updateOrderStatus(orderId, status, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courier-orders'] });
      toast.success("Order status updated successfully");
    },
    onError: (error) => {
      toast.error(`Error updating order status: ${error.message}`);
    }
  });
}

export function useAddDeliveryNote() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ orderId, note }: { orderId: string, note: string }) => 
      addDeliveryNote(orderId, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courier-orders'] });
      toast.success("Delivery note added successfully");
    },
    onError: (error) => {
      toast.error(`Error adding delivery note: ${error.message}`);
    }
  });
}