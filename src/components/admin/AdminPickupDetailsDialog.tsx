import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, 
  User, 
  Phone, 
  Calendar, 
  Package, 
  Clock,
  Building,
  CreditCard,
  UserPlus,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { AdminPickupWithClient } from '@/services/admin-pickups';
import { formatDate } from '@/utils/format';

interface AdminPickupDetailsDialogProps {
  pickup: AdminPickupWithClient;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusUpdate: (pickupId: string, status: string) => void;
  onCourierAssign: (pickupId: string) => void;
}

const AdminPickupDetailsDialog: React.FC<AdminPickupDetailsDialogProps> = ({
  pickup,
  open,
  onOpenChange,
  onStatusUpdate,
  onCourierAssign
}) => {
  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'scheduled':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'assigned':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'in progress':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'canceled':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getActionButtons = () => {
    const statusLower = pickup.status.toLowerCase();
    const buttons = [];

    if (statusLower === 'scheduled') {
      buttons.push(
        <Button 
          key="assign" 
          onClick={() => onCourierAssign(pickup.id)}
          className="flex-1"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Assign Courier
        </Button>
      );
    }

    if (statusLower === 'assigned' || statusLower === 'in progress') {
      buttons.push(
        <Button 
          key="complete" 
          onClick={() => onStatusUpdate(pickup.id, 'Completed')}
          className="flex-1"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Mark Complete
        </Button>
      );
    }

    if (statusLower !== 'completed' && statusLower !== 'canceled') {
      buttons.push(
        <Button 
          key="cancel" 
          variant="outline"
          onClick={() => onStatusUpdate(pickup.id, 'Canceled')}
          className="flex-1 text-red-600 hover:text-red-700"
        >
          <XCircle className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      );
    }

    return buttons;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] max-w-5xl h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center justify-between">
            <span className="text-xl font-bold">Pickup Details</span>
            <Badge variant="outline" className={getStatusBadge(pickup.status)}>
              {pickup.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <div className="space-y-6">
          {/* Pickup Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Pickup Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{pickup.pickup_id}</p>
                    <p className="text-sm text-muted-foreground">Pickup ID</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{formatDate(new Date(pickup.pickup_date))}</p>
                    <p className="text-sm text-muted-foreground">Pickup Date</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{formatDate(new Date(pickup.created_at))}</p>
                    <p className="text-sm text-muted-foreground">Created</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Business Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{pickup.client_business_name}</p>
                    <p className="text-sm text-muted-foreground">{pickup.client_business_type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{pickup.client_name}</p>
                    <p className="text-sm text-muted-foreground">Business Owner</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Contact & Location */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{pickup.contact_person}</p>
                    <p className="text-sm text-muted-foreground">Contact Person</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{pickup.contact_phone}</p>
                    <p className="text-sm text-muted-foreground">Phone Number</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Pickup Location</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                  <div>
                    <p className="font-medium">{pickup.location}</p>
                    {pickup.address && (
                      <p className="text-sm text-muted-foreground mt-1">{pickup.address}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Courier Assignment */}
          {pickup.courier_name && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Assigned Courier</h3>
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{pickup.courier_name}</p>
                    {pickup.courier_phone && (
                      <p className="text-sm text-muted-foreground">{pickup.courier_phone}</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Order Summary */}
          <Separator />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Order Summary</h3>
              <div className="flex items-center gap-3">
                <Package className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{pickup.total_orders} orders</p>
                  <p className="text-sm text-muted-foreground">Total orders in pickup</p>
                </div>
              </div>
            </div>

            {(pickup.total_cash_usd > 0 || pickup.total_cash_lbp > 0) && (
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Cash Collection</h3>
                <div className="flex items-center gap-3">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">${pickup.total_cash_usd.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">
                      {pickup.total_cash_lbp.toLocaleString()} LBP
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          {pickup.note && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Notes</h3>
                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-sm">{pickup.note}</p>
                </div>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <Separator />
          <div className="flex gap-3">
            {getActionButtons()}
          </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminPickupDetailsDialog;