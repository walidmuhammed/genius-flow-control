
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { Check, Clock, AlertTriangle, Package, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PickupData {
  id: string;
  status: "Scheduled" | "Completed" | "Canceled" | "In Progress";
  location: string;
  address: string;
  contactPerson: string;
  contactPhone: string;
  pickupDate: string;
  courier: {
    name: string;
    phone: string;
  };
  requested: boolean;
  pickedUp: boolean;
  validated: boolean;
  note?: string;
}

interface PickupDetailsDialogProps {
  pickup: PickupData | null;
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
    timestamp: '2025-05-04T10:00:00Z',
    user: 'Admin',
    action: 'Pickup scheduled'
  },
  {
    timestamp: '2025-05-04T11:30:00Z',
    user: 'System',
    action: 'Driver assigned: Mohammed Ali'
  },
  {
    timestamp: '2025-05-04T13:45:00Z',
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

  // Determine progress status
  const getProgressPercentage = () => {
    switch (pickup.status) {
      case 'Scheduled':
        return 25;
      case 'In Progress':
        return 50;
      case 'Completed':
        return 100;
      case 'Canceled':
        return 100; // Still 100% complete, just with a different outcome
      default:
        return 0;
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Scheduled':
        return <Clock className="h-5 w-5" />;
      case 'In Progress':
        return <Package className="h-5 w-5" />;
      case 'Completed':
        return <Check className="h-5 w-5" />;
      case 'Canceled':
        return <X className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled':
        return 'bg-blue-500';
      case 'In Progress':
        return 'bg-yellow-500';
      case 'Completed':
        return 'bg-green-500';
      case 'Canceled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  const progressSteps = ['Scheduled', 'In Progress', 'Completed'];
  if (pickup.status === 'Canceled') {
    progressSteps[2] = 'Canceled';
  }
  
  const currentStepIndex = progressSteps.findIndex(step => 
    step.toLowerCase() === pickup.status.toLowerCase()
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Scheduled':
        return <Badge className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full">Scheduled</Badge>;
      case 'In Progress':
        return <Badge className="bg-yellow-50 text-yellow-700 px-2 py-1 rounded-full">In Progress</Badge>;
      case 'Completed':
        return <Badge className="bg-green-50 text-green-700 px-2 py-1 rounded-full">Completed</Badge>;
      case 'Canceled':
        return <Badge className="bg-red-50 text-red-700 px-2 py-1 rounded-full">Canceled</Badge>;
      default:
        return <Badge className="bg-gray-50 text-gray-700 px-2 py-1 rounded-full">{status}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            Pickup #{pickup.id}
            {getStatusBadge(pickup.status)}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Pickup Summary Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-2">Location</h3>
              <p className="font-medium">{pickup.location}</p>
              <p className="text-gray-600 text-sm">{pickup.address}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-2">Contact Person</h3>
              <p className="font-medium">{pickup.contactPerson}</p>
              <p className="text-gray-600 text-sm">{pickup.contactPhone}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-2">Pickup Date</h3>
              <p className="font-medium">{pickup.pickupDate}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-2">Courier</h3>
              <p className="font-medium">{pickup.courier.name}</p>
              <p className="text-gray-600 text-sm">{pickup.courier.phone}</p>
            </div>
          </div>

          <Separator />

          {/* Status Summary Section */}
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center">
              <h3 className="text-sm font-semibold text-gray-500 mb-2">Requested</h3>
              <Badge className={pickup.requested ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                {pickup.requested ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div className="flex flex-col items-center">
              <h3 className="text-sm font-semibold text-gray-500 mb-2">Picked Up</h3>
              <Badge className={pickup.pickedUp ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                {pickup.pickedUp ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div className="flex flex-col items-center">
              <h3 className="text-sm font-semibold text-gray-500 mb-2">Validated</h3>
              <Badge className={pickup.validated ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                {pickup.validated ? 'Yes' : 'No'}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Progress Tracking Section */}
          <div>
            <h3 className="text-base font-medium mb-4">Pickup Progress</h3>
            <div className="mb-2">
              <Progress value={getProgressPercentage()} className="h-3" />
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
                    index <= currentStepIndex ? getStatusColor(
                      index === 2 && pickup.status === 'Canceled' ? 'Canceled' : step
                    ) : "bg-gray-200"
                  )}>
                    {getStatusIcon(
                      index === 2 && pickup.status === 'Canceled' ? 'Canceled' : step
                    )}
                  </div>
                  <span className="text-xs text-center">{step}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Notes Section */}
          {pickup.note && (
            <>
              <div>
                <h3 className="text-base font-medium mb-2">Notes</h3>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-700">{pickup.note}</p>
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

export default PickupDetailsDialog;
