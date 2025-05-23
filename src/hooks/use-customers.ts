
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  getCustomers, 
  getCustomerById, 
  createCustomer, 
  updateCustomer, 
  searchCustomersByPhone,
  Customer
} from "@/services/customers";
import { toast } from "sonner";

export function useCustomers() {
  return useQuery({
    queryKey: ['customers'],
    queryFn: getCustomers
  });
}

export function useCustomer(id: string | undefined) {
  return useQuery({
    queryKey: ['customer', id],
    queryFn: () => id ? getCustomerById(id) : Promise.resolve(null),
    enabled: !!id
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => 
      createCustomer(customer),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success("Customer created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Error creating customer: ${error.message}`);
    }
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: Partial<Omit<Customer, 'id' | 'created_at' | 'updated_at'>> }) => {
      // Transform "_none" values to null for city_id and governorate_id
      const processedUpdates = { ...updates };
      if (processedUpdates.city_id === "_none") {
        processedUpdates.city_id = null;
      }
      if (processedUpdates.governorate_id === "_none") {
        processedUpdates.governorate_id = null;
      }
      
      return updateCustomer(id, processedUpdates);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer', variables.id] });
      toast.success("Customer updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Error updating customer: ${error.message}`);
    }
  });
}

export function useSearchCustomersByPhone(phone: string) {
  return useQuery({
    queryKey: ['customers', 'search', phone],
    queryFn: () => phone ? searchCustomersByPhone(phone) : Promise.resolve([]),
    enabled: phone.length > 2,
    staleTime: 0, // Don't cache results
    gcTime: 0, // Don't keep results in cache
    refetchOnWindowFocus: false, // Don't refetch when window gets focus
    refetchOnMount: true // Always refetch when component mounts
  });
}
