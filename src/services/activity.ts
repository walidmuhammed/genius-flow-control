
import { supabase } from "@/integrations/supabase/client";

export interface ActivityLog {
  id: string;
  entity_type: 'order' | 'pickup' | 'customer';
  entity_id: string;
  action: string;
  details: any;
  performed_by: string;
  created_at: string;
}

export async function getActivityLogs(limit: number = 50) {
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error('Error fetching activity logs:', error);
    throw error;
  }
  
  return data as ActivityLog[];
}

export async function getActivityLogsByEntityType(entityType: ActivityLog['entity_type'], limit: number = 50) {
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('entity_type', entityType)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error(`Error fetching activity logs for entity type ${entityType}:`, error);
    throw error;
  }
  
  return data as ActivityLog[];
}

export async function getActivityLogsByEntityId(entityId: string, limit: number = 50) {
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('entity_id', entityId)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error(`Error fetching activity logs for entity id ${entityId}:`, error);
    throw error;
  }
  
  return data as ActivityLog[];
}
