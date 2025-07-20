
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";

export type Ticket = Database["public"]["Tables"]["tickets"]["Row"];
export type TicketMessage = Database["public"]["Tables"]["ticket_messages"]["Row"];

export type TicketCategory = 'Orders Issue' | 'Pickup Issue' | 'Payments and Wallet' | 'Other';
export type TicketStatus = 'New' | 'Processing' | 'Resolved';
export type LinkedEntityType = 'order' | 'pickup' | 'invoice' | null;

export async function getTickets() {
  try {
    console.log('Fetching tickets...');
    
    // Check if user is admin
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    let query = supabase
      .from('tickets')
      .select(`
        *,
        profiles!tickets_created_by_fkey(full_name, business_name)
      `)
      .order('created_at', { ascending: false });

    // If not admin, filter to user's own tickets
    if (userProfile?.user_type !== 'admin') {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        query = query.eq('created_by', user.id);
      }
    }

    const { data, error } = await query;

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
  linked_entity_type?: LinkedEntityType;
  linked_entity_id?: string;
  issue_description?: string;
}) {
  try {
    console.log('Creating ticket with data:', ticket);
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('User not authenticated:', userError);
      toast.error('You must be logged in to create a support ticket');
      return null;
    }

    console.log('User authenticated:', user.id);
    
    const ticketData = {
      category: ticket.category,
      title: ticket.title,
      content: ticket.content,
      status: 'New' as const,
      created_by: user.id,
      linked_entity_type: ticket.linked_entity_type || null,
      linked_entity_id: ticket.linked_entity_id || null,
      issue_description: ticket.issue_description || null
    };

    console.log('Inserting ticket with data:', ticketData);
    
    const { data, error } = await supabase
      .from('tickets')
      .insert([ticketData])
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
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('User not authenticated:', userError);
      toast.error('You must be logged in to send a message');
      return null;
    }

    const { data, error } = await supabase
      .from('ticket_messages')
      .insert([{
        ...message,
        created_by: user.id
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding ticket message:', error);
      toast.error('Failed to send message');
      return null;
    }

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
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', ticketId);

    if (error) {
      console.error('Error updating ticket status:', error);
      toast.error('Failed to update ticket status');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error updating ticket status:', error);
    toast.error('Failed to update ticket status');
    return false;
  }
}
