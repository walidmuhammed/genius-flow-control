
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Printer, Share2, MessageSquare } from 'lucide-react';
import { Order } from './OrdersTableRow';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { useScreenSize } from '@/hooks/useScreenSize';
import { ScrollArea } from '@/components/ui/scroll-area';
import OrderProgressBar from './OrderProgressBar';
import OrderActivityLogs, { mockActivityLogs } from './OrderActivityLogs';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface OrderDetailsDialogProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const OrderDetailsDialog: React.FC<OrderDetailsDialogProps> = ({
  order,
  open,
  onOpenChange,
}) => {
  const { isMobile } = useScreenSize();
  const [activeTab, setActiveTab] = useState('details');

  if (!order) return null;

  const getStatusBadge = (status: string) => {
    const baseClasses = "py-1 px-2 text-xs font-medium rounded-full";
    
    switch (status.toLowerCase()) {
      case 'new':
        return <Badge className={`${baseClasses} bg-blue-50 text-blue-700`}>{status}</Badge>;
      case 'pending pickup':
        return <Badge className={`${baseClasses} bg-orange-50 text-orange-700`}>{status}</Badge>;
      case 'in progress':
        return <Badge className={`${baseClasses} bg-purple-50 text-purple-700`}>{status}</Badge>;
      case 'successful':
        return <Badge className={`${baseClasses} bg-green-50 text-green-700`}>{status}</Badge>;
      case 'unsuccessful':
        return <Badge className={`${baseClasses} bg-red-50 text-red-700`}>{status}</Badge>;
      case 'returned':
        return <Badge className={`${baseClasses} bg-yellow-50 text-yellow-700`}>{status}</Badge>;
      case 'paid':
        return <Badge className={`${baseClasses} bg-teal-50 text-teal-700`}>{status}</Badge>;
      case 'awaiting action':
        return <Badge className={`${baseClasses} bg-amber-100 text-amber-800`}>{status}</Badge>;
      default:
        return <Badge className={`${baseClasses} bg-gray-50 text-gray-700`}>{status}</Badge>;
    }
  };

  const content = (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="w-full"
    >
      <TabsList className="grid grid-cols-2 mb-4 w-full">
        <TabsTrigger value="details">Order Details</TabsTrigger>
        <TabsTrigger value="activity">Activity Logs</TabsTrigger>
      </TabsList>

      <TabsContent value="details" className="space-y-4">
        {/* Order Progress Bar */}
        <div className="mb-6">
          <OrderProgressBar status={order.status} type={order.type} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Order Information</h3>
              <div className="mt-2 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Order ID:</span>
                  <span className="text-sm font-medium">{order.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Reference No.:</span>
                  <span className="text-sm font-medium">{order.referenceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Type:</span>
                  <span className="text-sm font-medium">{order.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Status:</span>
                  {getStatusBadge(order.status)}
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Last Update:</span>
                  <span className="text-sm font-medium">
                    {new Date(order.lastUpdate).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Created At:</span>
                  <span className="text-sm font-medium">
                    {new Date(order.lastUpdate).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Created By:</span>
                  <span className="text-sm font-medium">Admin User</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Customer Information</h3>
              <div className="mt-2 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Name:</span>
                  <span className="text-sm font-medium">{order.customer.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Phone:</span>
                  <span className="text-sm font-medium">{order.customer.phone}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Courier Information</h3>
              <div className="mt-2 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Name:</span>
                  <span className="text-sm font-medium">Ali Hassan</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Phone:</span>
                  <span className="text-sm font-medium">+961 71 123 456</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Note:</span>
                  <span className="text-sm font-medium">Will deliver by 5 PM</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Location Information</h3>
              <div className="mt-2 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">City:</span>
                  <span className="text-sm font-medium">{order.location.city}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Area:</span>
                  <span className="text-sm font-medium">{order.location.area}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Financial Information</h3>
              <div className="mt-2 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Amount (USD):</span>
                  <span className="text-sm font-medium">${order.amount.valueUSD}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Amount (LBP):</span>
                  <span className="text-sm font-medium">{order.amount.valueLBP.toLocaleString()} LBP</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Delivery Fee (USD):</span>
                  <span className="text-sm font-medium">${order.deliveryCharge.valueUSD}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Delivery Fee (LBP):</span>
                  <span className="text-sm font-medium">{order.deliveryCharge.valueLBP.toLocaleString()} LBP</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {order.note && (
          <div>
            <div className="flex items-center gap-1.5 text-sm font-medium text-gray-500">
              <MessageSquare className="h-4 w-4" />
              <h3>Note</h3>
            </div>
            <div className="mt-2 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
              <p className="text-sm">{order.note}</p>
            </div>
          </div>
        )}
      </TabsContent>

      <TabsContent value="activity" className="space-y-4">
        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
          <OrderActivityLogs logs={mockActivityLogs} />
        </div>
      </TabsContent>
    </Tabs>
  );

  const footerButtons = (
    <>
      <Button variant="outline" className="gap-1">
        <Share2 className="h-4 w-4" /> Share
      </Button>
      <Button className="gap-1">
        <Printer className="h-4 w-4" /> Print
      </Button>
    </>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[90vh] rounded-t-xl">
          <SheetHeader>
            <SheetTitle>Order Details</SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-[calc(100%-120px)] mt-4">
            {content}
          </ScrollArea>
          <SheetFooter className="flex gap-2 mt-6 justify-end">
            {footerButtons}
          </SheetFooter>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[750px] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
        </DialogHeader>
        <ScrollArea className="pr-4 max-h-[calc(90vh-180px)]">
          {content}
        </ScrollArea>
        <DialogFooter className="flex gap-2 mt-6">
          {footerButtons}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsDialog;
