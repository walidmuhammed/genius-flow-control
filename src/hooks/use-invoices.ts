
import { useQuery } from '@tanstack/react-query';
import { getInvoices, getInvoiceWithOrders } from '@/services/invoices';

export const useInvoices = () => {
  return useQuery({
    queryKey: ['invoices'],
    queryFn: getInvoices,
  });
};

export const useInvoiceWithOrders = (invoiceId: string | null) => {
  return useQuery({
    queryKey: ['invoice', invoiceId],
    queryFn: () => invoiceId ? getInvoiceWithOrders(invoiceId) : null,
    enabled: !!invoiceId,
  });
};
