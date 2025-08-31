import { useMutation, useQueryClient } from '@tanstack/react-query';
import { assignCourierToOrders } from '@/services/orders';
import { toast } from 'sonner';

interface AssignCourierToOrdersParams {
  orderIds: string[];
  courierId: string;
  courierName: string;
}

export function useAssignCourierToOrders() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ orderIds, courierId, courierName }: AssignCourierToOrdersParams) =>
      assignCourierToOrders(orderIds, courierId, courierName),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['courier-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      
      if (result.successfulOrders.length > 0) {
        toast.success(`${result.successfulOrders.length} order(s) assigned successfully`);
      }
      
      if (result.errors.length > 0) {
        result.errors.forEach(error => {
          toast.error(`Order ${error.orderId}: ${error.error}`);
        });
      }
    },
    onError: (error: Error) => {
      toast.error(`Error assigning courier: ${error.message}`);
    }
  });
}