
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getTickets, 
  getTicketById, 
  getTicketMessages,
  createTicket,
  addTicketMessage,
  updateTicketStatus,
  type Ticket,
  type TicketMessage,
  type TicketStatus,
  type TicketCategory 
} from '@/services/tickets';
import { toast } from 'sonner';

export function useTickets() {
  return useQuery({
    queryKey: ['tickets'],
    queryFn: getTickets
  });
}

export function useTicket(ticketId: string | undefined) {
  return useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: () => ticketId ? getTicketById(ticketId) : null,
    enabled: !!ticketId
  });
}

export function useTicketMessages(ticketId: string | undefined) {
  return useQuery({
    queryKey: ['ticket-messages', ticketId],
    queryFn: () => ticketId ? getTicketMessages(ticketId) : [],
    enabled: !!ticketId
  });
}

export function useCreateTicket() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createTicket,
    onSuccess: (newTicket) => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast.success('Support ticket created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create support ticket');
      console.error('Error creating ticket:', error);
    }
  });
}

export function useAddTicketMessage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: addTicketMessage,
    onSuccess: (newMessage) => {
      if (newMessage) {
        queryClient.invalidateQueries({ queryKey: ['ticket-messages', newMessage.ticket_id] });
        queryClient.invalidateQueries({ queryKey: ['tickets'] });
        toast.success('Message sent successfully');
      }
    },
    onError: (error) => {
      toast.error('Failed to send message');
      console.error('Error sending message:', error);
    }
  });
}

export function useUpdateTicketStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ ticketId, status }: { ticketId: string; status: TicketStatus }) => 
      updateTicketStatus(ticketId, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ticket', variables.ticketId] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast.success(`Ticket marked as ${variables.status}`);
    },
    onError: (error) => {
      toast.error('Failed to update ticket status');
      console.error('Error updating ticket status:', error);
    }
  });
}
