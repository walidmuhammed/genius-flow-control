
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Order } from './OrdersTableRow';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useActivityLogsByEntityId } from '@/hooks/use-activity';
import type { ActivityLog } from '@/services/activity';
import { format } from 'date-fns';

interface OrderDetailsDialogProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const OrderDetailsDialog: React.FC<OrderDetailsDialogProps> = ({ 
  order, 
  open, 
  onOpenChange 
}) => {
  const { data: activityLogs, isLoading: isLoadingLogs } = useActivityLogsByEntityId(
    order?.id,
    20 // Limit to last 20 activities
  );
  
  if (!order) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-lg">
            Order #{order.id} 
            <span className="ml-2 text-sm text-muted-foreground font-normal">
              ({order.referenceNumber})
            </span>
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="details" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="mb-4">
            <TabsTrigger value="details">Order Details</TabsTrigger>
            <TabsTrigger value="activity">Activity Log</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="flex-1 overflow-hidden">
            <ScrollArea className="h-full pr-2">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Order Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Status</p>
                      <Badge variant={
                        order.status === 'New' ? 'default' :
                        order.status === 'Pending Pickup' ? 'secondary' :
                        order.status === 'In Progress' ? 'secondary' :
                        order.status === 'Heading to Customer' ? 'secondary' :
                        order.status === 'Heading to You' ? 'secondary' :
                        order.status === 'Successful' ? 'secondary' :
                        order.status === 'Unsuccessful' ? 'destructive' :
                        order.status === 'Returned' ? 'destructive' :
                        order.status === 'Paid' ? 'secondary' :
                        order.status === 'Awaiting Action' ? 'outline' :
                        'default'
                      } className="mt-1">
                        {order.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Type</p>
                      <p className="font-medium">{order.type}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Amount</p>
                      <p className="font-medium">
                        {order.amount.valueUSD > 0 && `$${order.amount.valueUSD} `}
                        {order.amount.valueLBP > 0 && `${order.amount.valueLBP.toLocaleString()} LBP`}
                        {order.amount.valueUSD === 0 && order.amount.valueLBP === 0 && '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Delivery Fee</p>
                      <p className="font-medium">
                        {order.deliveryCharge.valueUSD > 0 && `$${order.deliveryCharge.valueUSD} `}
                        {order.deliveryCharge.valueLBP > 0 && `${order.deliveryCharge.valueLBP.toLocaleString()} LBP`}
                        {order.deliveryCharge.valueUSD === 0 && order.deliveryCharge.valueLBP === 0 && '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Last Update</p>
                      <p className="font-medium">{format(new Date(order.lastUpdate), 'PPp')}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Customer Details</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Name</p>
                      <p className="font-medium">{order.customer.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="font-medium">{order.customer.phone}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Location</p>
                      <p className="font-medium">{order.location.city}, {order.location.area}</p>
                      {order.location.address && (
                        <p className="text-sm text-muted-foreground mt-1">{order.location.address}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                {order.note && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Notes</h3>
                    <div className="bg-muted/40 p-3 rounded-md text-sm">
                      {order.note}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="activity" className="flex-1 overflow-hidden">
            <ScrollArea className="h-full pr-2">
              {isLoadingLogs ? (
                <p className="text-sm text-center text-muted-foreground py-4">Loading activity logs...</p>
              ) : activityLogs && activityLogs.length > 0 ? (
                <div className="space-y-4">
                  {activityLogs.map((log) => (
                    <ActivityLogItem key={log.id} log={log} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-center text-muted-foreground py-4">No activity logs available for this order.</p>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

const ActivityLogItem: React.FC<{ log: ActivityLog }> = ({ log }) => {
  const getActivityDescription = () => {
    switch (log.action) {
      case 'created':
        return 'Order was created';
      case 'updated':
        return 'Order was updated';
      case 'deleted':
        return 'Order was deleted';
      case 'status_changed':
        const oldStatus = log.details?.old?.status;
        const newStatus = log.details?.new?.status;
        return `Status changed from ${oldStatus || 'Unknown'} to ${newStatus || 'Unknown'}`;
      default:
        return 'Activity performed';
    }
  };
  
  return (
    <div className="border-l-2 border-muted pl-4 py-1">
      <div className="flex justify-between items-start">
        <p className="font-medium text-sm">{getActivityDescription()}</p>
        <p className="text-xs text-muted-foreground">
          {format(new Date(log.created_at), 'PPp')}
        </p>
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        By {log.performed_by || 'System'}
      </p>
    </div>
  );
};

export default OrderDetailsDialog;
