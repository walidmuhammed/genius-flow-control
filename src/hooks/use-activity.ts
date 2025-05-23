
import { useQuery } from "@tanstack/react-query";
import { 
  getActivityLogs, 
  getActivityLogsByEntityType, 
  getActivityLogsByEntityId,
  ActivityLog
} from "@/services/activity";
import { toast } from 'sonner';

export function useActivityLogs(limit: number = 50) {
  return useQuery({
    queryKey: ['activity', { limit }],
    queryFn: () => getActivityLogs(limit),
    onError: (error) => {
      toast.error('Failed to load activity logs');
      console.error('Error loading activity logs:', error);
    }
  });
}

export function useActivityLogsByEntityType(entityType: ActivityLog['entity_type'] | undefined, limit: number = 50) {
  return useQuery({
    queryKey: ['activity', 'entity-type', entityType, { limit }],
    queryFn: () => entityType ? getActivityLogsByEntityType(entityType, limit) : Promise.resolve([]),
    enabled: !!entityType,
    onError: (error) => {
      toast.error(`Failed to load ${entityType} activity logs`);
      console.error(`Error loading ${entityType} activity logs:`, error);
    }
  });
}

export function useActivityLogsByEntityId(entityId: string | undefined, limit: number = 50) {
  return useQuery({
    queryKey: ['activity', 'entity-id', entityId, { limit }],
    queryFn: () => entityId ? getActivityLogsByEntityId(entityId, limit) : Promise.resolve([]),
    enabled: !!entityId,
    onError: (error) => {
      toast.error('Failed to load activity logs for this item');
      console.error(`Error loading activity logs for entity ${entityId}:`, error);
    }
  });
}
