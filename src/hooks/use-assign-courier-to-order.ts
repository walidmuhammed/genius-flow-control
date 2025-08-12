import { useMutation, useQueryClient } from '@tanstack/react-query';
import { assignCourierToOrder } from '@/services/orders';
import { toast } from 'sonner';

interface AssignCourierToOrderParams {
  orderId: string;
  courierId: string;
  courierName: string;
}

export function useAssignCourierToOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ orderId, courierId, courierName }: AssignCourierToOrderParams) =>
      assignCourierToOrder(orderId, courierId, courierName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['courier-orders'] });
      toast.success("Courier assigned successfully");
    },
    onError: (error: Error) => {
      toast.error(`Error assigning courier: ${error.message}`);
    }
  });
}