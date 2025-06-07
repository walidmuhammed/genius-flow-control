
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
  Hash,
  FileText,
  Package2,
  CreditCard,
  AlertCircle,
  MessageSquare,
  Route
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
      case 'New': return <Package className="h-4 w-4" />;
      case 'Pending Pickup': return <Clock className="h-4 w-4" />;
      case 'In Progress': return <Truck className="h-4 w-4" />;
      case 'Heading to Customer': return <MapPin className="h-4 w-4" />;
      case 'Heading to You': return <Route className="h-4 w-4" />;
      case 'Successful': return <Check className="h-4 w-4" />;
      case 'Unsuccessful': return <X className="h-4 w-4" />;
      case 'Returned': return <Package2 className="h-4 w-4" />;
      case 'Paid': return <CreditCard className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'bg-blue-500';
      case 'Pending Pickup': return 'bg-orange-500';
      case 'In Progress': return 'bg-yellow-500';
      case 'Heading to Customer': return 'bg-purple-500';
      case 'Heading to You': return 'bg-indigo-500';
      case 'Successful': return 'bg-green-500';
      case 'Unsuccessful': return 'bg-red-500';
      case 'Returned': return 'bg-gray-500';
      case 'Paid': return 'bg-emerald-500';
      default: return 'bg-gray-500';
    }
  };

  const statusSteps = ['New', 'Pending Pickup', 'In Progress', 'Heading to Customer', 'Successful'];
  const currentStepIndex = statusSteps.findIndex(step => step === order.status);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "w-full max-h-[95vh] p-0 overflow-hidden bg-white",
        isMobile 
          ? "max-w-[95vw] h-[95vh] rounded-t-2xl rounded-b-none" 
          : isTablet 
            ? "max-w-4xl max-h-[90vh]" 
            : "sm:max-w-5xl max-h-[90vh]"
      )}>
        {/* Enhanced Header */}
        <DialogHeader className={cn(
          "border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white",
          isMobile ? "px-4 py-4" : "px-6 py-5"
        )}>
          <div className={cn(
            "flex justify-between gap-4",
            isMobile ? "flex-col space-y-3" : "flex-row items-center"
          )}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#DB271E]/10 rounded-lg flex items-center justify-center">
                <Package className="h-5 w-5 text-[#DB271E]" />
              </div>
              <div>
                <DialogTitle className={cn(
                  "font-semibold text-gray-900",
                  isMobile ? "text-lg" : "text-xl"
                )}>
                  Order #{order.id}
                </DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  {order.referenceNumber && (
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Hash className="h-3 w-3" />
                      <span>{order.referenceNumber}</span>
                    </div>
                  )}
                  <Badge variant="outline" className="text-xs px-2 py-0.5">
                    {order.type}
                  </Badge>
                </div>
              </div>
            </div>
            <div className={cn(
              "flex items-center gap-2",
              isMobile ? "flex-wrap" : ""
            )}>
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
        
        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="overview" className="h-full flex flex-col">
            <div className={cn(isMobile ? "px-4 pt-3" : "px-6 pt-4")}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="overview" className="text-sm">Overview</TabsTrigger>
                <TabsTrigger value="activity" className="text-sm">Activity Log</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="overview" className="flex-1 overflow-hidden mt-0">
              <ScrollArea className={cn(
                "h-full",
                isMobile ? "px-4 pb-4" : "px-6 pb-6"
              )}>
                <div className={cn(
                  "space-y-6",
                  isMobile && "space-y-4"
                )}>
                  {/* Enhanced Status Section */}
                  <motion.div 
                    className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-white", getStatusColor(order.status))}>
                        {getStatusIcon(order.status)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">Order Status</h3>
                        <p className="text-sm text-gray-500">Current progress and timeline</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mb-6">
                      <Badge className={cn("text-white px-4 py-2 font-medium", getStatusColor(order.status))}>
                        {order.status}
                      </Badge>
                      <div className="text-sm text-gray-500">
                        Last updated: {format(new Date(order.lastUpdate), 'PPp')}
                      </div>
                    </div>

                    <div className="mb-4">
                      <Progress value={getStatusProgress()} className="h-2" />
                    </div>
                    
                    <div className="flex justify-between">
                      {statusSteps.map((step, index) => (
                        <div 
                          key={index} 
                          className={cn(
                            "flex flex-col items-center text-center",
                            index <= currentStepIndex ? "opacity-100" : "opacity-40"
                          )}
                          style={{ width: `${100 / statusSteps.length}%` }}
                        >
                          <div className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center mb-2 text-white text-xs",
                            index <= currentStepIndex ? getStatusColor(step) : "bg-gray-200"
                          )}>
                            {getStatusIcon(step)}
                          </div>
                          <span className="text-xs font-medium">{step}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Enhanced Details Grid */}
                  <div className={cn(
                    "grid gap-6",
                    isMobile ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2"
                  )}>
                    {/* Customer Information */}
                    <motion.div 
                      className="bg-white border border-gray-200 rounded-xl p-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900">Customer Details</h3>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Name</label>
                          <p className="text-base font-medium text-gray-900 mt-1">{order.customer.name}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phone</label>
                          <div className="flex items-center gap-2 mt-1">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <p className="text-base text-gray-900">{order.customer.phone}</p>
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Location</label>
                          <div className="flex items-start gap-2 mt-1">
                            <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                            <div>
                              <p className="text-base text-gray-900 font-medium">
                                {order.location.city}, {order.location.area}
                              </p>
                              {order.location.address && (
                                <p className="text-sm text-gray-600 mt-1">{order.location.address}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Financial Information */}
                    <motion.div 
                      className="bg-white border border-gray-200 rounded-xl p-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <DollarSign className="h-4 w-4 text-emerald-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900">Financial Details</h3>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Collection Amount</label>
                          <div className="mt-1">
                            {order.amount.valueUSD > 0 ? (
                              <p className="text-lg font-semibold text-gray-900">${order.amount.valueUSD}</p>
                            ) : order.amount.valueLBP > 0 ? (
                              <p className="text-lg font-semibold text-gray-900">{order.amount.valueLBP.toLocaleString()} LBP</p>
                            ) : (
                              <p className="text-sm text-gray-500">No cash collection</p>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Delivery Fee</label>
                          <div className="mt-1">
                            {order.deliveryCharge.valueUSD > 0 ? (
                              <p className="text-base font-medium text-gray-900">${order.deliveryCharge.valueUSD}</p>
                            ) : order.deliveryCharge.valueLBP > 0 ? (
                              <p className="text-base font-medium text-gray-900">{order.deliveryCharge.valueLBP.toLocaleString()} LBP</p>
                            ) : (
                              <p className="text-sm text-gray-500">—</p>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Order Type</label>
                          <Badge variant="outline" className="mt-1 px-3 py-1">
                            {order.type}
                          </Badge>
                        </div>

                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Created</label>
                          <div className="flex items-center gap-2 mt-1">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <p className="text-base text-gray-900">
                              {format(new Date(order.lastUpdate), 'PPP')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Package Information */}
                    <motion.div 
                      className="bg-white border border-gray-200 rounded-xl p-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Package2 className="h-4 w-4 text-purple-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900">Package Details</h3>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Package Type</label>
                          <p className="text-base text-gray-900 mt-1">Document</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Items Count</label>
                          <p className="text-base text-gray-900 mt-1">1 item</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Opening Allowed</label>
                          <p className="text-base text-gray-900 mt-1">No</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Description</label>
                          <p className="text-sm text-gray-600 mt-1">—</p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Courier Information */}
                    <motion.div 
                      className="bg-white border border-gray-200 rounded-xl p-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                          <Truck className="h-4 w-4 text-orange-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900">Courier Info</h3>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Assigned Courier</label>
                          <p className="text-base text-gray-900 mt-1">—</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Vehicle Type</label>
                          <p className="text-base text-gray-900 mt-1">—</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Contact</label>
                          <p className="text-base text-gray-900 mt-1">—</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Estimated Delivery</label>
                          <p className="text-base text-gray-900 mt-1">—</p>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Notes Section */}
                  {order.note && (
                    <motion.div 
                      className="bg-white border border-gray-200 rounded-xl p-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                          <MessageSquare className="h-4 w-4 text-yellow-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900">Notes</h3>
                      </div>
                      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{order.note}</p>
                      </div>
                    </motion.div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="activity" className="flex-1 overflow-hidden mt-0">
              <ScrollArea className={cn(
                "h-full",
                isMobile ? "px-4 pb-4" : "px-6 pb-6"
              )}>
                {isLoadingLogs ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="w-8 h-8 border-2 border-[#DB271E] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                      <p className="text-sm text-gray-500">Loading activity logs...</p>
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
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="h-6 w-6 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500">No activity logs available for this order.</p>
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
