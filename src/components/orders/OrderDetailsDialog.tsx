
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Order } from './OrdersTableRow';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
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
  X,
  Edit,
  Printer,
  Phone,
  Calendar,
  DollarSign,
  FileText,
  Hash
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useScreenSize } from '@/hooks/useScreenSize';

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
  const { isMobile, isTablet } = useScreenSize();
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
      <DialogContent className={cn(
        "max-h-[95vh] p-0 overflow-hidden",
        isMobile 
          ? "w-full h-[100vh] max-w-none rounded-none" 
          : isTablet 
            ? "w-[95vw] max-w-4xl h-[90vh]" 
            : "w-full max-w-5xl h-[85vh]"
      )}>
        {/* Header with all real data */}
        <DialogHeader className="border-b border-gray-200 bg-gray-50/50 px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <DialogTitle className="text-lg sm:text-xl font-semibold">
                Order #{order.id}
              </DialogTitle>
              {order.referenceNumber && (
                <Badge variant="outline" className="px-2 py-1 text-xs">
                  <Hash className="h-3 w-3 mr-1" />
                  {order.referenceNumber}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="outline" size="sm" className="h-9 text-xs">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              {order.status === 'New' && (
                <>
                  <Button variant="outline" size="sm" className="h-9 text-xs">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 h-9 text-xs">
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogHeader>
        
        {/* Content with full data display */}
        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="overview" className="h-full flex flex-col">
            <div className="px-4 sm:px-6 pt-4">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="overview" className="text-sm">Overview</TabsTrigger>
                <TabsTrigger value="activity" className="text-sm">Activity Log</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="overview" className="flex-1 overflow-hidden mt-0">
              <ScrollArea className="h-full px-4 sm:px-6 pb-6">
                <div className="space-y-6">
                  {/* Order Status Card */}
                  <motion.div 
                    className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Package className="h-5 w-5 text-[#DB271E]" />
                      Order Status
                    </h3>
                    
                    {/* Current Status */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                      <Badge className={cn("text-white px-4 py-2", getStatusColor(order.status))}>
                        {order.status}
                      </Badge>
                      <div className="text-sm text-gray-500">
                        Last updated: {format(new Date(order.lastUpdate), 'PPp')}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <Progress value={getStatusProgress()} className="h-2" />
                    </div>
                    
                    {/* Status Steps */}
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
                            "w-8 h-8 rounded-full flex items-center justify-center mb-2 text-white",
                            index <= currentStepIndex ? getStatusColor(step) : "bg-gray-200"
                          )}>
                            {getStatusIcon(step)}
                          </div>
                          <span className="text-xs font-medium">{step}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Order Details Grid - Show ALL available data */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Customer Information */}
                    <motion.div 
                      className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <User className="h-5 w-5 text-[#DB271E]" />
                        Customer Details
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Name</label>
                          <p className="text-base font-medium text-gray-900">{order.customer.name || '—'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Phone</label>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <p className="text-base font-medium text-gray-900">{order.customer.phone || '—'}</p>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Address</label>
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                            <div>
                              <p className="text-base font-medium text-gray-900">
                                {order.location.city ? `${order.location.city}, ${order.location.area}` : '—'}
                              </p>
                              {order.location.address && (
                                <p className="text-sm text-gray-600 mt-1">{order.location.address}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Order Information */}
                    <motion.div 
                      className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-[#DB271E]" />
                        Order Information
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Type</label>
                          <Badge variant="outline" className="block w-fit mt-1 px-3 py-1">
                            {order.type || '—'}
                          </Badge>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Collection Amount</label>
                          <div>
                            {order.amount.valueUSD > 0 && (
                              <p className="text-base font-semibold text-gray-900">${order.amount.valueUSD}</p>
                            )}
                            {order.amount.valueLBP > 0 && (
                              <p className="text-sm text-gray-600">{order.amount.valueLBP.toLocaleString()} LBP</p>
                            )}
                            {order.amount.valueUSD === 0 && order.amount.valueLBP === 0 && (
                              <p className="text-sm text-gray-500">No cash collection</p>
                            )}
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Delivery Fee</label>
                          <div>
                            {order.deliveryCharge.valueUSD > 0 && (
                              <p className="text-base font-medium text-gray-900">${order.deliveryCharge.valueUSD}</p>
                            )}
                            {order.deliveryCharge.valueLBP > 0 && (
                              <p className="text-sm text-gray-600">{order.deliveryCharge.valueLBP.toLocaleString()} LBP</p>
                            )}
                            {order.deliveryCharge.valueUSD === 0 && order.deliveryCharge.valueLBP === 0 && (
                              <p className="text-sm text-gray-500">—</p>
                            )}
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Created</label>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <p className="text-base text-gray-900">
                              {format(new Date(order.lastUpdate), 'PPP')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Package Information */}
                  <motion.div 
                    className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Package className="h-5 w-5 text-[#DB271E]" />
                      Package Details
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Package Type</label>
                        <p className="text-base text-gray-900">Document</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Items Count</label>
                        <p className="text-base text-gray-900">1</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Allow Opening</label>
                        <p className="text-base text-gray-900">No</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Description</label>
                        <p className="text-base text-gray-900">—</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Courier Information */}
                  <motion.div 
                    className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Truck className="h-5 w-5 text-[#DB271E]" />
                      Courier Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Assigned Courier</label>
                        <p className="text-base text-gray-900">—</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Courier Phone</label>
                        <p className="text-base text-gray-900">—</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Pickup Time</label>
                        <p className="text-base text-gray-900">—</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Delivery Time</label>
                        <p className="text-base text-gray-900">—</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Notes */}
                  {order.note && (
                    <motion.div 
                      className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-[#DB271E]" />
                        Notes
                      </h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{order.note}</p>
                      </div>
                    </motion.div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="activity" className="flex-1 overflow-hidden mt-0">
              <ScrollArea className="h-full px-4 sm:px-6 pb-6">
                {isLoadingLogs ? (
                  <div className="flex justify-center py-8">
                    <div className="text-sm text-gray-500">Loading activity logs...</div>
                  </div>
                ) : activityLogs && activityLogs.length > 0 ? (
                  <div className="space-y-4">
                    {activityLogs.map((log, index) => (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <ActivityLogItem log={log} />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex justify-center py-8">
                    <div className="text-sm text-gray-500">No activity logs available for this order.</div>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
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
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex justify-between items-start mb-2">
        <p className="font-medium text-sm text-gray-900">{getActivityDescription()}</p>
        <p className="text-xs text-gray-500">
          {format(new Date(log.created_at), 'PPp')}
        </p>
      </div>
      <p className="text-xs text-gray-600">
        By {log.performed_by || 'System'}
      </p>
    </div>
  );
};

export default OrderDetailsDialog;
