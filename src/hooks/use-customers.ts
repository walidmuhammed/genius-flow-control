import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  getCustomers, 
  getCustomerById, 
  createCustomer, 
  updateCustomer, 
  searchCustomersByPhone,
  findCustomerByExactPhone,
  Customer 
} from "@/services/customers";
import { toast } from "sonner";
import { isValidLebaneseMobileNumber } from "@/utils/customerSearch";

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

  // Enhanced completeness logic for Lebanese mobile prefixes
  const lebanesePrefixes = ["3", "70", "71", "76", "78", "79", "81", "82"];
  const validLebanese = isValidLebaneseMobileNumber(phone);

  // Only search if phone number is complete:
  // For Lebanon: valid Lebanese mobile number (per new utility)
  // Else: (keep old fallback if needed for intl)
  const isCompleteNumber = validLebanese || (
    cleanPhone.length >= 8 &&
    // Full international format: +961 + 8 digits
    (cleanPhone.startsWith('961') && cleanPhone.length === 11) ||
    // For non-Lebanese: 8 digits or more (as fallback)
    (cleanPhone.length === 8 && lebanesePrefixes.some(prefix => cleanPhone.startsWith(prefix)))
  );

  return useQuery({
    queryKey: ['customers', 'search', phone],
    queryFn: () => isCompleteNumber ? searchCustomersByPhone(phone) : Promise.resolve([]),
    enabled: isCompleteNumber,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useFindCustomerByExactPhone(phone: string) {
  return useQuery({
    queryKey: ['customers', 'exact', phone],
    queryFn: () => findCustomerByExactPhone(phone),
    enabled: isValidLebaneseMobileNumber(phone),
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
}

export function useCreateOrUpdateCustomer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (customerData: any) => {
      // First, try to find an existing customer with the exact phone number
      const existingCustomer = await findCustomerByExactPhone(customerData.phone);
      
      if (existingCustomer) {
        // Update existing customer with new information
        return await updateCustomer(existingCustomer.id, {
          name: customerData.name,
          secondary_phone: customerData.secondary_phone,
          address: customerData.address,
          city_id: customerData.city_id,
          governorate_id: customerData.governorate_id,
          is_work_address: customerData.is_work_address
        });
      } else {
        // Create new customer
        return await createCustomer(customerData);
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customers', 'search'] });
      queryClient.invalidateQueries({ queryKey: ['customers', 'exact'] });
      
      toast.success("Customer saved successfully");
    },
    onError: (error: any) => {
      toast.error(`Error with customer: ${error.message}`);
    }
  });
}
