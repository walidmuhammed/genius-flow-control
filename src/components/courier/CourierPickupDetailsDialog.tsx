import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Package, 
  MapPin, 
  Phone, 
  Calendar, 
  Truck, 
  FileText, 
  CheckCircle, 
  XCircle,
  User,
  Building
} from 'lucide-react';
import { format } from 'date-fns';
import { CourierPickupWithClient } from '@/services/courier-pickups';

interface CourierPickupDetailsDialogProps {
  pickup: CourierPickupWithClient;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusUpdate: (pickupId: string, status: string, reason?: string) => void;
}

const CourierPickupDetailsDialog: React.FC<CourierPickupDetailsDialogProps> = ({
  pickup,
  open,
  onOpenChange,
  onStatusUpdate
}) => {
  const [newStatus, setNewStatus] = useState(pickup.status);
  const [reason, setReason] = useState('');
  const [showReasonField, setShowReasonField] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return 'bg-amber-100 text-amber-800 hover:bg-amber-200';
      case 'assigned':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'in progress':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
      case 'completed':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'canceled':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const handleStatusChange = (status: string) => {
    setNewStatus(status);
    setShowReasonField(status === 'canceled');
    if (status !== 'canceled') {
      setReason('');
    }
  };

  const handleMarkAsPickedUp = () => {
    onStatusUpdate(pickup.id, 'completed');
    onOpenChange(false);
  };

  const handleMarkAsUnsuccessful = () => {
    const finalReason = reason.trim() || 'Unsuccessful pickup - no reason provided';
    onStatusUpdate(pickup.id, 'canceled', finalReason);
    onOpenChange(false);
  };

  const handleUpdateStatus = () => {
    const finalReason = showReasonField && reason.trim() ? reason.trim() : undefined;
    onStatusUpdate(pickup.id, newStatus, finalReason);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Pickup Details - {pickup.pickup_id}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Section */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Status</h3>
            <Badge className={getStatusBadge(pickup.status)}>
              {pickup.status}
            </Badge>
          </div>

          <Separator />

          {/* Pickup Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Package className="h-4 w-4" />
                Pickup Information
              </h3>
              
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Pickup ID</Label>
                  <p className="font-medium">{pickup.pickup_id}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Package Type</Label>
                  <p className="font-medium capitalize">{pickup.package_type || 'Not specified'}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Orders Count</Label>
                  <p className="font-medium">{pickup.total_orders} order{pickup.total_orders !== 1 ? 's' : ''}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Vehicle Type</Label>
                  <p className="font-medium capitalize">{pickup.vehicle_type || 'Small'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Building className="h-4 w-4" />
                Shop Information
              </h3>
              
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Business Name</Label>
                  <p className="font-medium">{pickup.client_business_name}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Business Type</Label>
                  <p className="font-medium">{pickup.client_business_type}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                  <p className="font-medium">{pickup.client_phone}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="h-4 w-4" />
              Contact Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Contact Person</Label>
                <p className="font-medium">{pickup.contact_person}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Contact Phone</Label>
                <p className="font-medium">{pickup.contact_phone}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Location Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location
            </h3>
            
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Pickup Location</Label>
                <p className="font-medium">{pickup.location}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Address</Label>
                <p className="font-medium">{pickup.address}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Schedule Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Schedule
            </h3>
            
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Scheduled Pickup Date & Time</Label>
              <p className="font-medium">
                {format(new Date(pickup.pickup_date), 'EEEE, MMMM dd, yyyy')} at {format(new Date(pickup.pickup_date), 'hh:mm a')}
              </p>
            </div>
          </div>

          {pickup.note && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Notes
                </h3>
                <p className="text-muted-foreground bg-muted p-3 rounded-md">{pickup.note}</p>
              </div>
            </>
          )}

          <Separator />

          {/* Actions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Actions</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {pickup.status !== 'completed' && (
                <Button 
                  onClick={handleMarkAsPickedUp}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Picked Up
                </Button>
              )}

              {pickup.status !== 'canceled' && (
                <Button 
                  variant="destructive" 
                  onClick={() => setShowReasonField(true)}
                  className="w-full"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Mark as Unsuccessful
                </Button>
              )}
            </div>

            {/* Status Change */}
            <div className="space-y-3">
              <Label htmlFor="status">Change Status</Label>
              <Select value={newStatus} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="in progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="canceled">Canceled</SelectItem>
                </SelectContent>
              </Select>

              {showReasonField && (
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason (optional)</Label>
                  <Input
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Enter reason for cancellation..."
                  />
                </div>
              )}

              {newStatus !== pickup.status && (
                <Button onClick={handleUpdateStatus} className="w-full">
                  Update Status
                </Button>
              )}
            </div>

            {showReasonField && pickup.status !== 'canceled' && (
              <Button 
                variant="destructive" 
                onClick={handleMarkAsUnsuccessful}
                className="w-full"
              >
                Confirm Unsuccessful Pickup
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CourierPickupDetailsDialog;