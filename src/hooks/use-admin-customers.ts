import { useQuery } from "@tanstack/react-query";
import { getAdminCustomers, getAdminCustomerById } from "@/services/admin-customers";

export function useAdminCustomers() {
  return useQuery({
    queryKey: ['admin-customers'],
    queryFn: getAdminCustomers
  });
}

export function useAdminCustomer(id: string | undefined) {
  return useQuery({
    queryKey: ['admin-customer', id],
    queryFn: () => id ? getAdminCustomerById(id) : Promise.resolve(null),
    enabled: !!id
  });
}