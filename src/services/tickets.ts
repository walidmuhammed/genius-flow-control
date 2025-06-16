
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";

export type Ticket = Database["public"]["Tables"]["tickets"]["Row"];
export type TicketMessage = Database["public"]["Tables"]["ticket_messages"]["Row"];

export type TicketCategory = 'Delay Delivery' | 'Technical Issue' | 'Payment Issue' | 'Order Issue' | 'Pickup Issue' | 'Return Issue' | 'Packaging Issue' | 'Other';

export type TicketStatus = 'Open' | 'Resolved' | 'Closed';

export async function getTickets() {
  try {
    console.log('Fetching tickets...');
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Failed to load support tickets');
      return [];
    }

    console.log('Fetched tickets:', data);
    return data || [];
  } catch (error) {
    console.error('Unexpected error fetching tickets:', error);
    toast.error('Failed to load support tickets');
    return [];
  }
}

export async function getTicketById(id: string) {
  try {
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select('*')
      .eq('id', id)
      .single();

    if (ticketError) {
      console.error('Error fetching ticket:', ticketError);
      toast.error('Failed to load ticket details');
      return null;
    }

    return ticket;
  } catch (error) {
    console.error('Unexpected error fetching ticket:', error);
    toast.error('Failed to load ticket details');
    return null;
  }
}

export async function getTicketMessages(ticketId: string) {
  try {
    const { data, error } = await supabase
      .from('ticket_messages')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching ticket messages:', error);
      toast.error('Failed to load ticket messages');
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error fetching ticket messages:', error);
    toast.error('Failed to load ticket messages');
    return [];
  }
}

export async function createTicket(ticket: {
  category: string;
  title: string;
  content: string;
}) {
  try {
    console.log('Creating ticket with data:', ticket);
    
    const { data, error } = await supabase
      .from('tickets')
      .insert([{
        category: ticket.category,
        title: ticket.title,
        content: ticket.content,
        status: 'Open'
      }])
      .select()
      .single();

    if (error) {
      console.error('Database error creating ticket:', error);
      toast.error(`Failed to create support ticket: ${error.message}`);
      return null;
    }

    console.log('Ticket created successfully:', data);
    toast.success('Support ticket created successfully');
    return data;
  } catch (error) {
    console.error('Unexpected error creating ticket:', error);
    toast.error('Failed to create support ticket');
    return null;
  }
}

export async function addTicketMessage(message: {
  ticket_id: string;
  sender: string;
  content: string;
}) {
  try {
    const { data, error } = await supabase
      .from('ticket_messages')
      .insert([message])
      .select()
      .single();

    if (error) {
      console.error('Error adding ticket message:', error);
      toast.error('Failed to send message');
      return null;
    }

    // Update the ticket's updated_at timestamp
    await supabase
      .from('tickets')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', message.ticket_id);

    return data;
  } catch (error) {
    console.error('Unexpected error adding ticket message:', error);
    toast.error('Failed to send message');
    return null;
  }
}

export async function updateTicketStatus(ticketId: string, status: TicketStatus) {
  try {
    const { error } = await supabase
      .from('tickets')
      .update({ status })
      .eq('id', ticketId);

    if (error) {
      console.error('Error updating ticket status:', error);
      toast.error('Failed to update ticket status');
      return false;
    }

    toast.success(`Ticket marked as ${status}`);
    return true;
  } catch (error) {
    console.error('Unexpected error updating ticket status:', error);
    toast.error('Failed to update ticket status');
    return false;
  }
}
