
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Order, OrderStatus } from '@/components/orders/OrdersTableRow';
import { Progress } from '@/components/ui/progress';
import { Check, Clock, AlertTriangle, Package, ArrowRight, ArrowDown, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface OrderDetailsDialogProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ActivityLog {
  timestamp: string;
  user: string;
  action: string;
}

// Mock activity logs for demonstration
const mockActivityLogs: ActivityLog[] = [
  {
    timestamp: '2025-05-05T14:30:00Z',
    user: 'Admin',
    action: 'Order created'
  },
  {
    timestamp: '2025-05-05T15:45:00Z',
    user: 'System',
    action: 'Order status changed from "New" to "Pending Pickup"'
  },
  {
    timestamp: '2025-05-05T16:20:00Z',
    user: 'Driver: Mohammed Ali',
    action: 'Order picked up from merchant'
  },
  {
    timestamp: '2025-05-05T17:10:00Z',
    user: 'System',
    action: 'Order status changed from "Pending Pickup" to "In Progress"'
  }
];

const OrderDetailsDialog: React.FC<OrderDetailsDialogProps> = ({
  order,
  open,
  onOpenChange
}) => {
  if (!order) return null;

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  };

  // Determine progress path based on order type and status
  const getProgressSteps = () => {
    let steps: OrderStatus[] = [];
    if (order.type === 'Exchange') {
      steps = ['New', 'Pending Pickup', 'In Progress', 'Successful', 'Returned', 'Paid'];
    } else if (order.status === 'Unsuccessful' || order.status === 'Returned') {
      steps = ['New', 'Pending Pickup', 'In Progress', 'Unsuccessful', 'Returned', 'Paid'];
    } else {
      steps = ['New', 'Pending Pickup', 'In Progress', 'Successful', 'Paid'];
    }
    return steps;
  };

  const progressSteps = getProgressSteps();
  const currentStepIndex = progressSteps.indexOf(order.status);
  const progressPercentage = ((currentStepIndex + 1) / progressSteps.length) * 100;

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'New':
        return <Package className="h-5 w-5" />;
      case 'Pending Pickup':
        return <Clock className="h-5 w-5" />;
      case 'In Progress':
        return <ArrowRight className="h-5 w-5" />;
      case 'Heading to Customer':
        return <ArrowRight className="h-5 w-5" />;
      case 'Heading to You':
        return <ArrowDown className="h-5 w-5" />;
      case 'Successful':
        return <Check className="h-5 w-5" />;
      case 'Unsuccessful':
        return <AlertTriangle className="h-5 w-5" />;
      case 'Returned':
        return <ArrowDown className="h-5 w-5" />;
      case 'Paid':
        return <DollarSign className="h-5 w-5" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'New':
        return 'bg-blue-500';
      case 'Pending Pickup':
        return 'bg-orange-500';
      case 'In Progress':
        return 'bg-yellow-500';
      case 'Heading to Customer':
        return 'bg-green-500';
      case 'Heading to You':
        return 'bg-teal-500';
      case 'Successful':
        return 'bg-emerald-500';
      case 'Unsuccessful':
        return 'bg-red-500';
      case 'Returned':
        return 'bg-sky-500';
      case 'Paid':
        return 'bg-indigo-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            Order #{order.id} 
            <Badge className="ml-2 bg-gray-100 text-gray-700">{order.type}</Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Order Summary Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-2">Customer</h3>
              <p className="font-medium">{order.customer.name}</p>
              <p className="text-gray-600 text-sm">{order.customer.phone}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-2">Location</h3>
              <p className="font-medium">{order.location.city}</p>
              <p className="text-gray-600 text-sm">{order.location.area}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-2">Reference Number</h3>
              <p className="font-medium">{order.referenceNumber}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-2">Last Update</h3>
              <p className="font-medium">{format(new Date(order.lastUpdate), 'PPP pp')}</p>
            </div>
          </div>

          <Separator />

          {/* Payment Info Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-2">Amount to Collect</h3>
              {order.amount.valueUSD > 0 || order.amount.valueLBP > 0 ? (
                <div>
                  <p className="font-medium">${formatCurrency(order.amount.valueUSD)}</p>
                  <p className="text-gray-600 text-sm">{formatCurrency(order.amount.valueLBP)} LBP</p>
                </div>
              ) : (
                <p className="text-gray-600">No amount to collect</p>
              )}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-2">Delivery Charge</h3>
              <p className="font-medium">${formatCurrency(order.deliveryCharge.valueUSD)}</p>
              <p className="text-gray-600 text-sm">{formatCurrency(order.deliveryCharge.valueLBP)} LBP</p>
            </div>
          </div>

          <Separator />

          {/* Progress Tracking Section */}
          <div>
            <h3 className="text-base font-medium mb-4">Order Progress</h3>
            <div className="mb-2">
              <Progress value={progressPercentage} className="h-3" />
            </div>
            
            <div className="flex justify-between mt-4">
              {progressSteps.map((step, index) => (
                <div 
                  key={index} 
                  className={cn(
                    "flex flex-col items-center", 
                    index <= currentStepIndex ? "opacity-100" : "opacity-50"
                  )}
                  style={{ width: `${100 / progressSteps.length}%` }}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center mb-2 text-white",
                    index <= currentStepIndex ? getStatusColor(step) : "bg-gray-200"
                  )}>
                    {getStatusIcon(step)}
                  </div>
                  <span className="text-xs text-center">{step}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Notes Section */}
          {order.note && (
            <>
              <div>
                <h3 className="text-base font-medium mb-2">Notes</h3>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-700">{order.note}</p>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Activity Log Section */}
          <div>
            <h3 className="text-base font-medium mb-4">Activity Log</h3>
            <div className="space-y-4">
              {mockActivityLogs.map((log, index) => (
                <div key={index} className="flex gap-4">
                  <div className="min-w-8 flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <Clock className="h-4 w-4 text-gray-500" />
                    </div>
                  </div>
                  <div className="flex-1 pb-4 border-b border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:justify-between mb-1">
                      <p className="font-medium text-gray-900">{log.user}</p>
                      <p className="text-xs text-gray-500">{format(new Date(log.timestamp), 'PPP p')}</p>
                    </div>
                    <p className="text-sm text-gray-700">{log.action}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsDialog;
