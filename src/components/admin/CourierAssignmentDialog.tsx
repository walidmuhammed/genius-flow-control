import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { User, MapPin, Phone } from 'lucide-react';
import { useAvailableCouriers, useAssignCourierToPickup } from '@/hooks/use-admin-pickups';

interface CourierAssignmentDialogProps {
  pickupId: string;
  pickupLocation: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CourierAssignmentDialog: React.FC<CourierAssignmentDialogProps> = ({
  pickupId,
  pickupLocation,
  open,
  onOpenChange
}) => {
  const [selectedCourier, setSelectedCourier] = useState<string>('');
  const { data: couriers, isLoading: couriersLoading } = useAvailableCouriers();
  const assignCourier = useAssignCourierToPickup();

  const handleAssign = () => {
    if (!selectedCourier) return;
    
    const courier = couriers?.find(c => c.id === selectedCourier);
    if (!courier) return;

    assignCourier.mutate({
      pickupId,
      courierName: courier.full_name,
      courierPhone: courier.phone || undefined
    }, {
      onSuccess: () => {
        setSelectedCourier('');
        onOpenChange(false);
      }
    });
  };

  const selectedCourierData = couriers?.find(c => c.id === selectedCourier);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Courier</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Pickup Location</Label>
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{pickupLocation}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="courier">Select Courier</Label>
            <Select value={selectedCourier} onValueChange={setSelectedCourier}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a courier..." />
              </SelectTrigger>
              <SelectContent>
                {couriersLoading ? (
                  <SelectItem value="loading" disabled>Loading couriers...</SelectItem>
                ) : couriers?.length === 0 ? (
                  <SelectItem value="no-couriers" disabled>No available couriers</SelectItem>
                ) : (
                  couriers?.map((courier) => (
                    <SelectItem key={courier.id} value={courier.id}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{courier.full_name}</span>
                        {courier.vehicle_type && (
                          <span className="text-xs text-muted-foreground">
                            ({courier.vehicle_type})
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {selectedCourierData && (
            <div className="space-y-2">
              <Label>Courier Details</Label>
              <div className="p-3 bg-muted/50 rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{selectedCourierData.full_name}</span>
                </div>
                {selectedCourierData.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedCourierData.phone}</span>
                  </div>
                )}
                {selectedCourierData.vehicle_type && (
                  <div className="text-sm text-muted-foreground">
                    Vehicle: {selectedCourierData.vehicle_type}
                  </div>
                )}
                {selectedCourierData.assigned_zones && selectedCourierData.assigned_zones.length > 0 && (
                  <div className="text-sm text-muted-foreground">
                    Zones: {selectedCourierData.assigned_zones.join(', ')}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAssign}
              disabled={!selectedCourier || assignCourier.isPending}
              className="flex-1"
            >
              {assignCourier.isPending ? 'Assigning...' : 'Assign Courier'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CourierAssignmentDialog;