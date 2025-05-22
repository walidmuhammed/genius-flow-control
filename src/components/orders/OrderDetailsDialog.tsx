
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Printer, Share2, MessageSquare, MapPin } from 'lucide-react';
import { Order } from './OrdersTableRow';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { useScreenSize } from '@/hooks/useScreenSize';
import { ScrollArea } from '@/components/ui/scroll-area';
import OrderProgressBar from './OrderProgressBar';
import OrderActivityLogs, { mockActivityLogs } from './OrderActivityLogs';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  const {
    isMobile
  } = useScreenSize();
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
  
  // Mock address for display
  const mockAddress = order.location.address || "123 Main Street, Building A, Floor 3, Apartment 301, Near Central Park, Downtown";
  
  const content = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-4 w-full">
          <TabsTrigger value="details" className="text-sm">Order Details</TabsTrigger>
          <TabsTrigger value="activity" className="text-sm">Activity Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-5">
          {/* Order Progress Bar */}
          <div className="mb-6">
            <OrderProgressBar status={order.status} type={order.type} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-5">
              <div className="rounded-lg overflow-hidden border border-gray-100 shadow-sm">
                <div className="bg-gray-50 px-4 py-2.5">
                  <h3 className="text-sm font-medium text-gray-700">Order Information</h3>
                </div>
                <div className="p-4 space-y-3 bg-white">
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

              <div className="rounded-lg overflow-hidden border border-gray-100 shadow-sm">
                <div className="bg-gray-50 px-4 py-2.5">
                  <h3 className="text-sm font-medium text-gray-700">Customer Information</h3>
                </div>
                <div className="p-4 space-y-3 bg-white">
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

              <div className="rounded-lg overflow-hidden border border-gray-100 shadow-sm">
                <div className="bg-gray-50 px-4 py-2.5">
                  <h3 className="text-sm font-medium text-gray-700">Courier Information</h3>
                </div>
                <div className="p-4 space-y-3 bg-white">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Name:</span>
                    <span className="text-sm font-medium">Ali Hassan</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Note:</span>
                    <span className="text-sm font-medium">Will deliver by 5 PM</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-lg overflow-hidden border border-gray-100 shadow-sm">
                <div className="bg-gray-50 px-4 py-2.5">
                  <h3 className="text-sm font-medium text-gray-700">Location Information</h3>
                </div>
                <div className="p-4 space-y-3 bg-white">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">City:</span>
                    <span className="text-sm font-medium">{order.location.city}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Area:</span>
                    <span className="text-sm font-medium">{order.location.area}</span>
                  </div>
                  
                  <div className="pt-1 border-t border-gray-100">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <span className="text-sm text-gray-500 block mb-1">Address:</span>
                        <div className="text-sm font-medium break-words text-gray-800 max-h-20 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 pr-1">
                          {mockAddress}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg overflow-hidden border border-gray-100 shadow-sm">
                <div className="bg-gray-50 px-4 py-2.5">
                  <h3 className="text-sm font-medium text-gray-700">Financial Information</h3>
                </div>
                <div className="p-4 space-y-3 bg-white">
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
            <div className="rounded-lg overflow-hidden border border-gray-100 shadow-sm">
              <div className="bg-gray-50 px-4 py-2.5 flex items-center gap-1.5">
                <MessageSquare className="h-4 w-4 text-gray-500" />
                <h3 className="text-sm font-medium text-gray-700">Note</h3>
              </div>
              <div className="p-4 bg-white">
                <p className="text-sm text-gray-800 break-words">{order.note}</p>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <div className="rounded-lg overflow-hidden border border-gray-100 shadow-sm">
            <div className="bg-gray-50 px-4 py-2.5">
              <h3 className="text-sm font-medium text-gray-700">Activity Timeline</h3>
            </div>
            <div className="p-4 bg-white">
              <OrderActivityLogs logs={mockActivityLogs} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
    
  const footerButtons = (
    <div className="flex gap-2">
      <Button variant="outline" className="gap-1.5">
        <Share2 className="h-4 w-4" /> Share
      </Button>
      <Button className="gap-1.5">
        <Printer className="h-4 w-4" /> Print
      </Button>
    </div>
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
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="px-6 py-4 border-b border-gray-100">
          <DialogTitle>Order Details</DialogTitle>
        </DialogHeader>
        <ScrollArea className="px-6 py-4 max-h-[calc(90vh-140px)]">
          {content}
        </ScrollArea>
        <DialogFooter className="flex gap-2 px-6 py-4 border-t border-gray-100">
          {footerButtons}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsDialog;
