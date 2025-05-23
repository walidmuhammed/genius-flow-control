
import { supabase } from "@/integrations/supabase/client";

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

    return data.map(transformActivityLog) || [];
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

    return data.map(transformActivityLog) || [];
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

    return data.map(transformActivityLog) || [];
  } catch (error) {
    console.error(`Unexpected error fetching activity logs for entity ${entityId}:`, error);
    return [];
  }
}

// Helper function to transform activity log data to match our interface
function transformActivityLog(log: any): ActivityLog {
  // Validate and ensure the entity_type is one of the expected values
  let entityType: ActivityLog['entity_type'] = 'order';
  if (
    log.entity_type === 'order' || 
    log.entity_type === 'customer' || 
    log.entity_type === 'pickup' || 
    log.entity_type === 'ticket' || 
    log.entity_type === 'ticket_message'
  ) {
    entityType = log.entity_type;
  }

  // Validate and ensure action is one of the expected values
  let action: ActivityLog['action'] = 'created';
  if (
    log.action === 'created' || 
    log.action === 'updated' || 
    log.action === 'deleted' || 
    log.action === 'status_changed'
  ) {
    action = log.action;
  }

  return {
    id: log.id,
    entity_type: entityType,
    entity_id: log.entity_id,
    action: action,
    details: log.details || {},
    performed_by: log.performed_by || 'System',
    created_at: log.created_at
  };
}
