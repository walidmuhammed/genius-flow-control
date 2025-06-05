
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
  Calendar,
  DollarSign,
  FileText,
  Hash,
  Building,
  CreditCard,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

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
      case 'New': return <Package className="h-4 w-4" />;
      case 'Pending Pickup': return <Clock className="h-4 w-4" />;
      case 'In Progress': return <Truck className="h-4 w-4" />;
      case 'Heading to Customer': return <MapPin className="h-4 w-4" />;
      case 'Successful': return <Check className="h-4 w-4" />;
      case 'Unsuccessful': return <X className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'bg-blue-500';
      case 'Pending Pickup': return 'bg-orange-500';
      case 'In Progress': return 'bg-yellow-500';
      case 'Heading to Customer': return 'bg-purple-500';
      case 'Successful': return 'bg-green-500';
      case 'Unsuccessful': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const statusSteps = ['New', 'Pending Pickup', 'In Progress', 'Heading to Customer', 'Successful'];
  const currentStepIndex = statusSteps.findIndex(step => step === order.status);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[95vh] p-0 overflow-hidden rounded-2xl">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#DB271E] rounded-xl flex items-center justify-center">
                <Package className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Order #{order.id}
                </DialogTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {order.referenceNumber || 'No Reference Number'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="outline" size="sm" className="h-9 text-xs rounded-lg">
                <Printer className="h-4 w-4 mr-2" />
                Print Label
              </Button>
              {order.status === 'New' && (
                <>
                  <Button variant="outline" size="sm" className="h-9 text-xs rounded-lg">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 h-9 text-xs rounded-lg">
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogHeader>
        
        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="overview" className="h-full flex flex-col">
            <div className="px-6 pt-4">
              <TabsList className="grid w-full grid-cols-2 mb-4 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                <TabsTrigger value="overview" className="text-sm rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
                  Order Details
                </TabsTrigger>
                <TabsTrigger value="activity" className="text-sm rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
                  Activity Log
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="overview" className="flex-1 overflow-hidden mt-0">
              <ScrollArea className="h-[calc(95vh-200px)] px-6 pb-6">
                <div className="space-y-6">
                  {/* Order Status Card */}
                  <motion.div 
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                      <Truck className="h-5 w-5 text-[#DB271E]" />
                      Order Status & Progress
                    </h3>
                    
                    <div className="flex items-center gap-4 mb-6">
                      <Badge className={cn("text-white px-4 py-2 text-sm font-medium", getStatusColor(order.status))}>
                        {order.status}
                      </Badge>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Last updated: {format(new Date(order.lastUpdate), 'PPp')}
                      </div>
                    </div>

                    <div className="mb-6">
                      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <span>Progress</span>
                        <span>{Math.round(getStatusProgress())}%</span>
                      </div>
                      <Progress value={getStatusProgress()} className="h-3 rounded-full" />
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                      {statusSteps.map((step, index) => (
                        <div 
                          key={index} 
                          className={cn(
                            "flex flex-col items-center text-center p-3 rounded-lg transition-all", 
                            index <= currentStepIndex 
                              ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300" 
                              : "bg-gray-50 dark:bg-gray-800 text-gray-400"
                          )}
                        >
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center mb-2 text-white text-sm transition-all",
                            index <= currentStepIndex ? getStatusColor(step) : "bg-gray-300 dark:bg-gray-600"
                          )}>
                            {getStatusIcon(step)}
                          </div>
                          <span className="text-xs font-medium">{step}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Order Details Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Customer Information */}
                    <motion.div 
                      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                        <User className="h-5 w-5 text-[#DB271E]" />
                        Customer Information
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <User className="h-5 w-5 text-gray-400 mt-1" />
                          <div>
                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</label>
                            <p className="text-base font-semibold text-gray-900 dark:text-gray-100">{order.customer.name}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Phone className="h-5 w-5 text-gray-400 mt-1" />
                          <div>
                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Primary Phone</label>
                            <p className="text-base font-medium text-gray-900 dark:text-gray-100">{order.customer.phone}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <MapPin className="h-5 w-5 text-gray-400 mt-1" />
                          <div>
                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Delivery Location</label>
                            <div>
                              <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                                {order.location.city}, {order.location.area}
                              </p>
                              {order.location.address && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{order.location.address}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Order Information */}
                    <motion.div 
                      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                        <Package className="h-5 w-5 text-[#DB271E]" />
                        Order Information
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <Hash className="h-5 w-5 text-gray-400 mt-1" />
                          <div>
                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Order ID</label>
                            <p className="text-base font-semibold text-[#DB271E]">#{order.id}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <FileText className="h-5 w-5 text-gray-400 mt-1" />
                          <div>
                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Reference Number</label>
                            <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                              {order.referenceNumber || 'Not provided'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Building className="h-5 w-5 text-gray-400 mt-1" />
                          <div>
                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Service Type</label>
                            <Badge variant="outline" className="mt-1 px-3 py-1 text-sm">
                              {order.type}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Calendar className="h-5 w-5 text-gray-400 mt-1" />
                          <div>
                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Created Date</label>
                            <p className="text-base text-gray-900 dark:text-gray-100">
                              {format(new Date(order.lastUpdate), 'PPPP')}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {format(new Date(order.lastUpdate), 'p')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Financial Information */}
                    <motion.div 
                      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-[#DB271E]" />
                        Financial Details
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <CreditCard className="h-5 w-5 text-gray-400 mt-1" />
                          <div className="flex-1">
                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Cash Collection</label>
                            <div className="mt-1">
                              {order.amount.valueUSD > 0 && (
                                <p className="text-lg font-bold text-green-600 dark:text-green-400">${order.amount.valueUSD}</p>
                              )}
                              {order.amount.valueLBP > 0 && (
                                <p className="text-sm text-gray-600 dark:text-gray-400">{order.amount.valueLBP.toLocaleString()} LBP</p>
                              )}
                              {order.amount.valueUSD === 0 && order.amount.valueLBP === 0 && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">No cash collection</p>
                              )}
                            </div>
                          </div>
                        </div>
                        <Separator />
                        <div className="flex items-start gap-3">
                          <Truck className="h-5 w-5 text-gray-400 mt-1" />
                          <div className="flex-1">
                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Delivery Fee</label>
                            <div className="mt-1">
                              {order.deliveryCharge.valueUSD > 0 && (
                                <p className="text-base font-semibold text-gray-900 dark:text-gray-100">${order.deliveryCharge.valueUSD}</p>
                              )}
                              {order.deliveryCharge.valueLBP > 0 && (
                                <p className="text-sm text-gray-600 dark:text-gray-400">{order.deliveryCharge.valueLBP.toLocaleString()} LBP</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Additional Details */}
                    <motion.div 
                      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-[#DB271E]" />
                        Additional Information
                      </h3>
                      <div className="space-y-4">
                        {order.note ? (
                          <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Special Instructions</label>
                            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 whitespace-pre-wrap">{order.note}</p>
                          </div>
                        ) : (
                          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No special instructions provided</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="activity" className="flex-1 overflow-hidden mt-0">
              <ScrollArea className="h-[calc(95vh-200px)] px-6 pb-6">
                {isLoadingLogs ? (
                  <div className="flex justify-center py-8">
                    <div className="text-center">
                      <div className="w-8 h-8 border-2 border-[#DB271E] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Loading activity logs...</div>
                    </div>
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
                  <div className="flex justify-center py-12">
                    <div className="text-center">
                      <Clock className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">No activity logs available for this order.</p>
                    </div>
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
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{getActivityDescription()}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {format(new Date(log.created_at), 'PPp')}
        </p>
      </div>
      <p className="text-xs text-gray-600 dark:text-gray-400">
        By {log.performed_by || 'System'}
      </p>
    </div>
  );
};

export default OrderDetailsDialog;
