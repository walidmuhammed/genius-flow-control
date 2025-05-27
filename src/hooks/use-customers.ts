
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
    onError: (error) => {
      toast.error(`Error creating customer: ${error.message}`);
    }
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: Partial<Omit<Customer, 'id' | 'created_at' | 'updated_at'>> }) => 
      updateCustomer(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer', variables.id] });
      toast.success("Customer updated successfully");
    },
    onError: (error) => {
      toast.error(`Error updating customer: ${error.message}`);
    }
  });
}

// Updated to only search when phone number is complete (10+ digits after country code)
export function useSearchCustomersByPhone(phone: string) {
  // Only search if phone number is complete (has at least 8 digits after +961)
  const isCompleteNumber = phone && phone.replace(/\D/g, '').length >= 11; // +961 + 8 digits minimum
  
  return useQuery({
    queryKey: ['customers', 'search', phone],
    queryFn: () => isCompleteNumber ? searchCustomersByPhone(phone) : Promise.resolve([]),
    enabled: isCompleteNumber,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
