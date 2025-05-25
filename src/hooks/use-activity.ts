
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ActivityLog {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  details: any;
  performed_by: string;
  created_at: string;
}

// Mock activity data for now - replace with real Supabase query later
const mockActivityLogs: ActivityLog[] = [
  {
    id: '1',
    entity_type: 'order',
    entity_id: 'order-123',
    action: 'created',
    details: { order_ref: 'REF-12345', amount: 150 },
    performed_by: 'Ahmed Electronics',
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    entity_type: 'customer',
    entity_id: 'customer-456',
    action: 'updated',
    details: { field_changed: 'phone', old_value: '+961 1 111111', new_value: '+961 1 222222' },
    performed_by: 'Admin',
    created_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: '3',
    entity_type: 'order',
    entity_id: 'order-789',
    action: 'status_changed',
    details: { old_status: 'New', new_status: 'In Progress' },
    performed_by: 'Courier Ali',
    created_at: new Date(Date.now() - 7200000).toISOString()
  }
];

export function useActivityLogs() {
  return useQuery({
    queryKey: ['activity-logs'],
    queryFn: async () => {
      // For now, return mock data
      // TODO: Replace with real Supabase query when activity_logs table is ready
      return mockActivityLogs;
    }
  });
}

export function useActivityLogsByEntityId(entityId: string | undefined, limit: number = 50) {
  return useQuery({
    queryKey: ['activity-logs', 'entity', entityId],
    queryFn: async () => {
      if (!entityId) return [];
      
      // For now, filter mock data by entity_id
      // TODO: Replace with real Supabase query when activity_logs table is ready
      return mockActivityLogs.filter(log => log.entity_id === entityId).slice(0, limit);
    },
    enabled: !!entityId
  });
}
