
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

// Updated to only search when phone number is complete (full Lebanese number)
export function useSearchCustomersByPhone(phone: string) {
  // Clean the phone number for validation
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Only search if phone number is complete:
  // Lebanese numbers: +961 followed by 8 digits (total 11 digits with country code)
  // Or local format: starting with 03, 70, 71, 76, 78, 79, 81 (8 digits total)
  const isCompleteNumber = cleanPhone.length >= 8 && (
    // Full international format: +961 + 8 digits
    (cleanPhone.startsWith('961') && cleanPhone.length === 11) ||
    // Local format: 8 digits starting with valid prefixes
    (cleanPhone.length === 8 && /^(03|70|71|76|78|79|81)/.test(cleanPhone))
  );
  
  return useQuery({
    queryKey: ['customers', 'search', phone],
    queryFn: () => isCompleteNumber ? searchCustomersByPhone(phone) : Promise.resolve([]),
    enabled: isCompleteNumber,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
