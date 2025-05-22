
import React from 'react';
import { Activity, User, Package, Truck, CheckCheck, AlertCircle, ArrowLeftRight } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';

export interface ActivityLog {
  id: string;
  action: string;
  description: string;
  actor: string;
  actorType: 'system' | 'user' | 'courier';
  timestamp: string;
}

interface OrderActivityLogsProps {
  logs: ActivityLog[];
}

const OrderActivityLogs: React.FC<OrderActivityLogsProps> = ({ logs }) => {
  // Helper function to get the icon based on the action
  const getActionIcon = (action: string, actorType: string) => {
    switch (action) {
      case 'created':
        return <Package className="h-4 w-4" />;
      case 'assigned':
        return <Truck className="h-4 w-4" />;
      case 'status_changed':
        return <ArrowLeftRight className="h-4 w-4" />;
      case 'completed':
        return <CheckCheck className="h-4 w-4" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  // Helper function to get the actor icon based on the actor type
  const getActorIcon = (actorType: string) => {
    switch (actorType) {
      case 'system':
        return <Activity className="h-4 w-4 text-blue-500" />;
      case 'user':
        return <User className="h-4 w-4 text-green-500" />;
      case 'courier':
        return <Truck className="h-4 w-4 text-orange-500" />;
      default:
        return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  // No logs message
  if (logs.length === 0) {
    return (
      <div className="py-10 text-center">
        <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
        <h3 className="text-lg font-medium text-muted-foreground">No activity logs</h3>
        <p className="text-sm text-muted-foreground/80 mt-1">
          Activity logs will appear here once there are updates to this order.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-4">
        {logs.map((log) => (
          <div key={log.id} className="relative pl-6 pb-8 border-l border-border/30 last:border-0 last:pb-0">
            <span className="absolute left-[-8px] p-1 rounded-full bg-white border border-border/20">
              {getActorIcon(log.actorType)}
            </span>
            <div className="ml-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium">
                    {log.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    By {log.actor}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(log.timestamp), 'MMM d, yyyy h:mm a')}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

// Mock data for testing
export const mockActivityLogs: ActivityLog[] = [
  {
    id: "1",
    action: "created",
    description: "Order was created",
    actor: "John Smith",
    actorType: "user",
    timestamp: "2023-06-01T09:30:00Z"
  },
  {
    id: "2",
    action: "status_changed",
    description: "Status changed from New to Pending Pickup",
    actor: "System",
    actorType: "system",
    timestamp: "2023-06-01T10:15:00Z"
  },
  {
    id: "3",
    action: "assigned",
    description: "Order assigned to courier Ali Hassan",
    actor: "Jane Doe",
    actorType: "user",
    timestamp: "2023-06-01T11:00:00Z"
  },
  {
    id: "4",
    action: "status_changed",
    description: "Status changed from Pending Pickup to In Progress",
    actor: "Ali Hassan",
    actorType: "courier",
    timestamp: "2023-06-02T09:15:00Z"
  },
  {
    id: "5",
    action: "status_changed",
    description: "Status changed from In Progress to Successful",
    actor: "Ali Hassan",
    actorType: "courier",
    timestamp: "2023-06-02T14:45:00Z"
  },
  {
    id: "6",
    action: "completed",
    description: "Delivery completed successfully",
    actor: "Ali Hassan",
    actorType: "courier",
    timestamp: "2023-06-02T14:50:00Z"
  }
];

export default OrderActivityLogs;
