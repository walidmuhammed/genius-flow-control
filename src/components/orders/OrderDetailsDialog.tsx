
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Order } from '@/components/orders/OrdersTableRow';
import OrderProgressBar from './OrderProgressBar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import ActivityLog, { ActivityLogItem } from '@/components/shared/ActivityLog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface OrderDetailsDialogProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Mock activity logs for demonstration
const mockActivityLogs: ActivityLogItem[] = [
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="sticky top-0 z-10 bg-white shadow-sm px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl flex items-center gap-2 font-semibold">
              Order #{order.id}
            </DialogTitle>
            <Badge variant="outline" className="bg-gray-100 text-gray-700 font-medium">
              {order.type}
            </Badge>
          </div>
        </DialogHeader>
        
        <Tabs defaultValue="details" className="px-6 py-5">
          <TabsList className="mb-4 bg-gray-100/80 p-1 rounded-lg">
            <TabsTrigger value="details" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Order Details
            </TabsTrigger>
            <TabsTrigger value="activity" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Activity Log
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-7 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/50 p-4 rounded-lg border border-gray-100">
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-gray-500">Customer</h3>
                <p className="font-medium text-gray-900">{order.customer.name}</p>
                <p className="text-gray-600 text-sm">{order.customer.phone}</p>
              </div>
              
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-gray-500">Location</h3>
                <p className="font-medium text-gray-900">{order.location.city}</p>
                <p className="text-gray-600 text-sm">{order.location.area}</p>
              </div>
              
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-gray-500">Reference Number</h3>
                <p className="font-medium text-gray-900">{order.referenceNumber}</p>
              </div>
              
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-gray-500">Last Update</h3>
                <p className="font-medium text-gray-900">{format(new Date(order.lastUpdate), 'PPP pp')}</p>
              </div>
            </div>

            <Separator />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-gray-500">Amount to Collect</h3>
                {order.amount.valueUSD > 0 || order.amount.valueLBP > 0 ? (
                  <div className="space-y-0.5 mt-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">USD</Badge>
                      <p className="font-medium text-gray-900">${formatCurrency(order.amount.valueUSD)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">LBP</Badge>
                      <p className="text-gray-900">{formatCurrency(order.amount.valueLBP)} LBP</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 italic mt-2">No amount to collect</p>
                )}
              </div>
              
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-gray-500">Delivery Charge</h3>
                <div className="space-y-0.5 mt-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">USD</Badge>
                    <p className="font-medium text-gray-900">${formatCurrency(order.deliveryCharge.valueUSD)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">LBP</Badge>
                    <p className="text-gray-900">{formatCurrency(order.deliveryCharge.valueLBP)} LBP</p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-base font-medium text-gray-800">Order Progress</h3>
              <OrderProgressBar 
                status={order.status} 
                type={order.type}
                className="py-4"
              />
            </div>

            {order.note && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h3 className="text-base font-medium text-gray-800">Notes</h3>
                  <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-lg">
                    <p className="text-sm text-gray-700">{order.note}</p>
                  </div>
                </div>
              </>
            )}
          </TabsContent>
          
          <TabsContent value="activity" className="animate-fade-in">
            <div className="bg-white rounded-lg border border-gray-100 p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-6">Activity Log</h3>
              <ActivityLog items={mockActivityLogs} />
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsDialog;
