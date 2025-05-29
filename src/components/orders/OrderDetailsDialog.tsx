
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Order } from './OrdersTableRow';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useActivityLogsByEntityId } from '@/hooks/use-activity';
import { ActivityLog } from '@/services/activity';
import { format } from 'date-fns';
import { 
  Package, 
  User, 
  MapPin, 
  Truck, 
  Clock, 
  Check, 
  AlertTriangle, 
  X,
  Edit,
  Printer,
  Trash2,
  Phone
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
    20
  );
  
  if (!order) return null;

  const getStatusProgress = () => {
    const statusOrder = ['New', 'Pending Pickup', 'In Progress', 'Heading to Customer', 'Successful'];
    const currentIndex = statusOrder.indexOf(order.status);
    return currentIndex >= 0 ? ((currentIndex + 1) / statusOrder.length) * 100 : 0;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'New':
        return <Package className="h-4 w-4" />;
      case 'Pending Pickup':
        return <Clock className="h-4 w-4" />;
      case 'In Progress':
        return <Truck className="h-4 w-4" />;
      case 'Heading to Customer':
        return <MapPin className="h-4 w-4" />;
      case 'Successful':
        return <Check className="h-4 w-4" />;
      case 'Unsuccessful':
        return <X className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New':
        return 'bg-blue-500';
      case 'Pending Pickup':
        return 'bg-orange-500';
      case 'In Progress':
        return 'bg-yellow-500';
      case 'Heading to Customer':
        return 'bg-purple-500';
      case 'Successful':
        return 'bg-green-500';
      case 'Unsuccessful':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const statusSteps = ['New', 'Pending Pickup', 'In Progress', 'Heading to Customer', 'Successful'];
  const currentStepIndex = statusSteps.findIndex(step => step === order.status);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              Order #{order.id}
              <Badge variant="outline" className="ml-2">
                {order.referenceNumber || 'No Reference'}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Printer className="h-4 w-4 mr-2" />
                Print Label
              </Button>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              {order.status === 'New' && (
                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="overview" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activity">Activity Log</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="flex-1 overflow-hidden">
            <ScrollArea className="h-full pr-2">
              <div className="space-y-6">
                {/* Order Overview */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Order Overview
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Status</p>
                      <Badge className={cn("text-white", getStatusColor(order.status))}>
                        {order.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Type</p>
                      <p className="font-medium">{order.type}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Amount</p>
                      <div>
                        {order.amount.valueUSD > 0 && (
                          <p className="font-medium">${order.amount.valueUSD}</p>
                        )}
                        {order.amount.valueLBP > 0 && (
                          <p className="text-sm text-gray-600">{order.amount.valueLBP.toLocaleString()} LBP</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Delivery Fee</p>
                      <div>
                        {order.deliveryCharge.valueUSD > 0 && (
                          <p className="font-medium">${order.deliveryCharge.valueUSD}</p>
                        )}
                        {order.deliveryCharge.valueLBP > 0 && (
                          <p className="text-sm text-gray-600">{order.deliveryCharge.valueLBP.toLocaleString()} LBP</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Progress Bar */}
                <div className="bg-white border rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Progress</h3>
                  <div className="mb-4">
                    <Progress value={getStatusProgress()} className="h-2" />
                  </div>
                  <div className="flex justify-between">
                    {statusSteps.map((step, index) => (
                      <div 
                        key={index} 
                        className={cn(
                          "flex flex-col items-center text-center", 
                          index <= currentStepIndex ? "opacity-100" : "opacity-50"
                        )}
                        style={{ width: `${100 / statusSteps.length}%` }}
                      >
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center mb-2 text-white text-sm",
                          index <= currentStepIndex ? getStatusColor(step) : "bg-gray-200"
                        )}>
                          {getStatusIcon(step)}
                        </div>
                        <span className="text-xs">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Customer Details */}
                  <div className="bg-white border rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Customer Details
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Name</p>
                        <p className="font-medium">{order.customer.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Phone</p>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <p className="font-medium">{order.customer.phone}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Location</p>
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                          <div>
                            <p className="font-medium">{order.location.city}, {order.location.area}</p>
                            {order.location.address && (
                              <p className="text-sm text-gray-600 mt-1">{order.location.address}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Info */}
                  <div className="bg-white border rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Truck className="h-5 w-5" />
                      Delivery Info
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Courier</p>
                        <p className="font-medium">Not assigned yet</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Payment State</p>
                        <Badge variant="outline">
                          {order.amount.valueUSD > 0 || order.amount.valueLBP > 0 ? 'Cash Collection' : 'Prepaid'}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Last Update</p>
                        <p className="font-medium">{format(new Date(order.lastUpdate), 'PPp')}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {order.note && (
                  <div className="bg-white border rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-sm text-gray-700">{order.note}</p>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="activity" className="flex-1 overflow-hidden">
            <ScrollArea className="h-full pr-2">
              {isLoadingLogs ? (
                <p className="text-sm text-center text-gray-500 py-4">Loading activity logs...</p>
              ) : activityLogs && activityLogs.length > 0 ? (
                <div className="space-y-4">
                  {activityLogs.map((log) => (
                    <ActivityLogItem key={log.id} log={log} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-center text-gray-500 py-4">No activity logs available for this order.</p>
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
    <div className="border-l-2 border-blue-200 pl-4 py-2">
      <div className="flex justify-between items-start">
        <p className="font-medium text-sm">{getActivityDescription()}</p>
        <p className="text-xs text-gray-500">
          {format(new Date(log.created_at), 'PPp')}
        </p>
      </div>
      <p className="text-xs text-gray-500 mt-1">
        By {log.performed_by || 'System'}
      </p>
    </div>
  );
};

export default OrderDetailsDialog;
