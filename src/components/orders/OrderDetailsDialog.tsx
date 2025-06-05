
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
  Phone,
  CalendarDays,
  FileText,
  DollarSign
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
      <DialogContent className="max-w-4xl max-h-[95vh] w-[95vw] overflow-hidden flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-[#DC291E]" />
                <DialogTitle className="text-xl font-semibold">Order #{order.id}</DialogTitle>
              </div>
              {order.referenceNumber && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-medium">
                  Ref: {order.referenceNumber}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="outline" size="sm" className="rounded-xl">
                <Printer className="h-4 w-4 mr-2" />
                Print Label
              </Button>
              <Button variant="outline" size="sm" className="rounded-xl">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              {order.status === 'New' && (
                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 rounded-xl">
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>
        
        <Tabs defaultValue="overview" className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-700">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-800 rounded-xl">
              <TabsTrigger value="overview" className="rounded-lg">Overview</TabsTrigger>
              <TabsTrigger value="activity" className="rounded-lg">Activity Log</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="overview" className="flex-1 overflow-hidden m-0">
            <ScrollArea className="h-full px-6 py-4">
              <div className="space-y-6">
                {/* Quick Stats Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={cn("text-white text-xs", getStatusColor(order.status))}>
                        {getStatusIcon(order.status)}
                      </Badge>
                      <span className="text-xs text-gray-500 uppercase tracking-wide">Status</span>
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{order.status}</p>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="h-4 w-4 text-blue-500" />
                      <span className="text-xs text-gray-500 uppercase tracking-wide">Type</span>
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{order.type}</p>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-green-500" />
                      <span className="text-xs text-gray-500 uppercase tracking-wide">Amount</span>
                    </div>
                    <div>
                      {order.amount.valueUSD > 0 && (
                        <p className="font-semibold text-gray-900 dark:text-gray-100">${order.amount.valueUSD}</p>
                      )}
                      {order.amount.valueLBP > 0 && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">{order.amount.valueLBP.toLocaleString()} LBP</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                      <CalendarDays className="h-4 w-4 text-purple-500" />
                      <span className="text-xs text-gray-500 uppercase tracking-wide">Created</span>
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                      {format(new Date(order.lastUpdate), 'MMM dd, yyyy')}
                    </p>
                    <p className="text-xs text-gray-500">{format(new Date(order.lastUpdate), 'h:mm a')}</p>
                  </div>
                </div>

                {/* Status Progress Bar */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Order Progress
                  </h3>
                  <div className="mb-6">
                    <Progress value={getStatusProgress()} className="h-3 rounded-full" />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                    {statusSteps.map((step, index) => (
                      <div 
                        key={index} 
                        className={cn(
                          "flex flex-col items-center text-center p-3 rounded-lg transition-all", 
                          index <= currentStepIndex 
                            ? "bg-[#DC291E]/10 border border-[#DC291E]/20" 
                            : "bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                        )}
                      >
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center mb-2 text-white text-sm transition-all",
                          index <= currentStepIndex ? getStatusColor(step) : "bg-gray-300 dark:bg-gray-600"
                        )}>
                          {getStatusIcon(step)}
                        </div>
                        <span className={cn(
                          "text-xs font-medium",
                          index <= currentStepIndex ? "text-[#DC291E]" : "text-gray-500"
                        )}>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Customer Details */}
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Customer Details
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <User className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Name</p>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{order.customer.name}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Phone</p>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{order.customer.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Location</p>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{order.location.city}, {order.location.area}</p>
                          {order.location.address && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{order.location.address}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Delivery & Payment Info */}
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                      <Truck className="h-5 w-5" />
                      Delivery & Payment
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <User className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Courier</p>
                          <p className="font-medium text-gray-900 dark:text-gray-100">Not assigned yet</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <DollarSign className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Payment Type</p>
                          <Badge variant="outline" className="font-medium">
                            {order.amount.valueUSD > 0 || order.amount.valueLBP > 0 ? 'Cash Collection' : 'Prepaid'}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <Truck className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Delivery Fee</p>
                          <div>
                            {order.deliveryCharge.valueUSD > 0 && (
                              <p className="font-medium text-gray-900 dark:text-gray-100">${order.deliveryCharge.valueUSD}</p>
                            )}
                            {order.deliveryCharge.valueLBP > 0 && (
                              <p className="text-sm text-gray-600 dark:text-gray-400">{order.deliveryCharge.valueLBP.toLocaleString()} LBP</p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Last Updated</p>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{format(new Date(order.lastUpdate), 'PPp')}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {order.note && (
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Notes
                    </h3>
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-700 dark:text-gray-300">{order.note}</p>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="activity" className="flex-1 overflow-hidden m-0">
            <ScrollArea className="h-full px-6 py-4">
              {isLoadingLogs ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#DC291E]"></div>
                </div>
              ) : activityLogs && activityLogs.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Activity Timeline</h3>
                  {activityLogs.map((log, index) => (
                    <ActivityLogItem key={log.id} log={log} isLast={index === activityLogs.length - 1} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-500 mb-2">No activity logs</p>
                  <p className="text-sm text-gray-400">Activity will appear here as the order progresses</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

const ActivityLogItem: React.FC<{ log: ActivityLog; isLast: boolean }> = ({ log, isLast }) => {
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

  const getActivityIcon = () => {
    switch (log.action) {
      case 'created':
        return <Package className="h-4 w-4" />;
      case 'updated':
        return <Edit className="h-4 w-4" />;
      case 'status_changed':
        return <Truck className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };
  
  return (
    <div className="relative">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-8 h-8 bg-[#DC291E] rounded-full flex items-center justify-center text-white">
          {getActivityIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">{getActivityDescription()}</p>
                <p className="text-xs text-gray-500 mt-1">
                  By {log.performed_by || 'System'} • {format(new Date(log.created_at), 'PPp')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {!isLast && (
        <div className="absolute left-4 top-8 w-0.5 h-6 bg-gray-200 dark:bg-gray-700" />
      )}
    </div>
  );
};

export default OrderDetailsDialog;
