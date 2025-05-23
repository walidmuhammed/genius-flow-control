
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ActivityLog {
  id: string;
  entity_type: 'order' | 'customer' | 'pickup' | 'ticket' | 'ticket_message';
  entity_id: string;
  action: 'created' | 'updated' | 'deleted' | 'status_changed';
  details: Record<string, any>;
  performed_by: string;
  created_at: string;
}

export async function getActivityLogs(limit: number = 50): Promise<ActivityLog[]> {
  try {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching activity logs:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error fetching activity logs:', error);
    return [];
  }
}

export async function getActivityLogsByEntityType(
  entityType: ActivityLog['entity_type'], 
  limit: number = 50
): Promise<ActivityLog[]> {
  try {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('entity_type', entityType)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error(`Error fetching ${entityType} activity logs:`, error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error(`Unexpected error fetching ${entityType} activity logs:`, error);
    return [];
  }
}

export async function getActivityLogsByEntityId(
  entityId: string, 
  limit: number = 50
): Promise<ActivityLog[]> {
  try {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error(`Error fetching activity logs for entity ${entityId}:`, error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error(`Unexpected error fetching activity logs for entity ${entityId}:`, error);
    return [];
  }
}
