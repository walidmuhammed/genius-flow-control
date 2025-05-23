
import { useQuery } from "@tanstack/react-query";
import { getActivityLogs, getActivityLogsByEntityType, getActivityLogsByEntityId } from "@/services/activity";

export function useActivityLogs(limit: number = 50) {
  return useQuery({
    queryKey: ['activity-logs', limit],
    queryFn: () => getActivityLogs(limit)
  });
}

export function useActivityLogsByEntityType(entityType: string, limit: number = 50) {
  return useQuery({
    queryKey: ['activity-logs', 'entity-type', entityType, limit],
    queryFn: () => getActivityLogsByEntityType(entityType as any, limit),
    enabled: !!entityType
  });
}

export function useActivityLogsByEntityId(entityId: string, limit: number = 50) {
  return useQuery({
    queryKey: ['activity-logs', 'entity-id', entityId, limit],
    queryFn: () => getActivityLogsByEntityId(entityId, limit),
    enabled: !!entityId
  });
}
