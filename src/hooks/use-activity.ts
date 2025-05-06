
import { useQuery } from "@tanstack/react-query";
import { 
  getActivityLogs, 
  getActivityLogsByEntityType, 
  getActivityLogsByEntityId,
  ActivityLog
} from "@/services/activity";

export function useActivityLogs(limit: number = 50) {
  return useQuery({
    queryKey: ['activity', { limit }],
    queryFn: () => getActivityLogs(limit)
  });
}

export function useActivityLogsByEntityType(entityType: ActivityLog['entity_type'] | undefined, limit: number = 50) {
  return useQuery({
    queryKey: ['activity', 'entity-type', entityType, { limit }],
    queryFn: () => entityType ? getActivityLogsByEntityType(entityType, limit) : Promise.resolve([]),
    enabled: !!entityType
  });
}

export function useActivityLogsByEntityId(entityId: string | undefined, limit: number = 50) {
  return useQuery({
    queryKey: ['activity', 'entity-id', entityId, { limit }],
    queryFn: () => entityId ? getActivityLogsByEntityId(entityId, limit) : Promise.resolve([]),
    enabled: !!entityId
  });
}
