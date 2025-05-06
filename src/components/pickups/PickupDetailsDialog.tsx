
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import ActivityLog, { ActivityLogItem } from '@/components/shared/ActivityLog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

export interface Pickup {
  id: string;
  storeId: string;
  storeName: string;
  address: {
    city: string;
    area: string;
    details: string;
  };
  contact: {
    name: string;
    phone: string;
  };
  numberOfOrders: number;
  status: 'Scheduled' | 'On the way' | 'Completed' | 'Cancelled' | 'Failed';
  scheduledTime: string;
  driver?: {
    name: string;
    phone: string;
    vehicleInfo?: string;
  };
  notes?: string;
}

interface PickupDetailsDialogProps {
  pickup: Pickup | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Mock activity logs for demonstration
const mockActivityLogs: ActivityLogItem[] = [
  {
    timestamp: '2025-05-05T10:30:00Z',
    user: 'Admin',
    action: 'Pickup scheduled'
  },
  {
    timestamp: '2025-05-05T11:15:00Z',
    user: 'System',
    action: 'Driver assigned: Mohammed Ali'
  },
  {
    timestamp: '2025-05-05T12:40:00Z',
    user: 'Driver: Mohammed Ali',
    action: 'On the way to pickup location'
  }
];

const PickupDetailsDialog: React.FC<PickupDetailsDialogProps> = ({
  pickup,
  open,
  onOpenChange
}) => {
  if (!pickup) return null;
  
  const getStatusBadge = () => {
    switch (pickup.status) {
      case 'Scheduled':
        return <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">Scheduled</Badge>;
      case 'On the way':
        return <Badge variant="outline" className="bg-yellow-50 border-yellow-200 text-yellow-700">On the way</Badge>;
      case 'Completed':
        return <Badge variant="outline" className="bg-emerald-50 border-emerald-200 text-emerald-700">Completed</Badge>;
      case 'Cancelled':
        return <Badge variant="outline" className="bg-red-50 border-red-200 text-red-700">Cancelled</Badge>;
      case 'Failed':
        return <Badge variant="outline" className="bg-gray-50 border-gray-200 text-gray-700">Failed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  const getProgressPercentage = () => {
    switch (pickup.status) {
      case 'Scheduled': return 25;
      case 'On the way': return 50;
      case 'Completed': return 100;
      case 'Cancelled': return 100;
      case 'Failed': return 100;
      default: return 0;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="sticky top-0 z-10 bg-white shadow-sm px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl flex items-center gap-2 font-semibold">
              Pickup #{pickup.id}
            </DialogTitle>
            {getStatusBadge()}
          </div>
        </DialogHeader>
        
        <Tabs defaultValue="details" className="px-6 py-5">
          <TabsList className="mb-4 bg-gray-100/80 p-1 rounded-lg">
            <TabsTrigger value="details" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Pickup Details
            </TabsTrigger>
            <TabsTrigger value="activity" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Activity Log
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-7 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/50 p-4 rounded-lg border border-gray-100">
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-gray-500">Store</h3>
                <p className="font-medium text-gray-900">{pickup.storeName}</p>
                <p className="text-gray-600 text-sm">ID: {pickup.storeId}</p>
              </div>
              
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-gray-500">Address</h3>
                <p className="font-medium text-gray-900">{pickup.address.city}, {pickup.address.area}</p>
                <p className="text-gray-600 text-sm">{pickup.address.details}</p>
              </div>
              
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-gray-500">Contact</h3>
                <p className="font-medium text-gray-900">{pickup.contact.name}</p>
                <p className="text-gray-600 text-sm">{pickup.contact.phone}</p>
              </div>
              
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-gray-500">Scheduled Time</h3>
                <p className="font-medium text-gray-900">{format(new Date(pickup.scheduledTime), 'PPP pp')}</p>
              </div>
            </div>

            <div className="bg-gray-50/50 border border-gray-100 rounded-lg p-4">
              <div className="flex justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-800">Pickup Progress</h3>
                <span className="text-sm text-gray-500">{pickup.status}</span>
              </div>
              <Progress value={getProgressPercentage()} className="h-2" />
            </div>

            {pickup.driver && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="text-base font-medium text-gray-800">Driver Information</h3>
                  <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500">Driver Name</p>
                        <p className="font-medium">{pickup.driver.name}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500">Contact Number</p>
                        <p className="font-medium">{pickup.driver.phone}</p>
                      </div>
                      {pickup.driver.vehicleInfo && (
                        <div className="space-y-1 col-span-2">
                          <p className="text-sm text-gray-500">Vehicle Information</p>
                          <p className="font-medium">{pickup.driver.vehicleInfo}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-lg p-4">
              <div>
                <h3 className="text-base font-medium text-blue-800">Orders to Pickup</h3>
                <p className="text-sm text-blue-600 mt-1">Total orders included in this pickup</p>
              </div>
              <div className="bg-white border border-blue-200 rounded-full px-4 py-2 text-xl font-semibold text-blue-700 shadow-sm">
                {pickup.numberOfOrders}
              </div>
            </div>

            {pickup.notes && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h3 className="text-base font-medium text-gray-800">Notes</h3>
                  <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-lg">
                    <p className="text-sm text-gray-700">{pickup.notes}</p>
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

export default PickupDetailsDialog;
