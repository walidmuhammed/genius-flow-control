import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Eye, CheckCircle, XCircle, MapPin, Calendar, Package, Phone } from 'lucide-react';
import { format } from 'date-fns';
import OrderNoteTooltip from '@/components/orders/OrderNoteTooltip';
import { CourierPickupWithClient } from '@/services/courier-pickups';
import CourierPickupDetailsDialog from './CourierPickupDetailsDialog';

interface CourierPickupsTableMobileProps {
  pickups: CourierPickupWithClient[];
  onStatusUpdate: (pickupId: string, status: string, reason?: string) => void;
  isLoading?: boolean;
}

const CourierPickupsTableMobile: React.FC<CourierPickupsTableMobileProps> = ({
  pickups,
  onStatusUpdate,
  isLoading
}) => {
  const [selectedPickup, setSelectedPickup] = useState<CourierPickupWithClient | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  const getStatusBadge = (status: string): string => {
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

  const handleViewDetails = (pickup: CourierPickupWithClient) => {
    setSelectedPickup(pickup);
    setDetailsDialogOpen(true);
  };

  const getActionButtons = (pickup: CourierPickupWithClient) => {
    const buttons = [];
    
    buttons.push(
      <DropdownMenuItem key="view" onClick={() => handleViewDetails(pickup)}>
        <Eye className="h-4 w-4 mr-2" />
        View Details
      </DropdownMenuItem>
    );

    if (pickup.status !== 'completed') {
      buttons.push(
        <DropdownMenuItem 
          key="complete" 
          onClick={() => onStatusUpdate(pickup.id, 'completed')}
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Mark as Picked Up
        </DropdownMenuItem>
      );
    }

    if (pickup.status !== 'canceled') {
      buttons.push(
        <DropdownMenuItem 
          key="cancel" 
          onClick={() => onStatusUpdate(pickup.id, 'canceled', 'Unsuccessful pickup')}
        >
          <XCircle className="h-4 w-4 mr-2" />
          Mark as Unsuccessful
        </DropdownMenuItem>
      );
    }

    return buttons;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Loading pickups...</div>
      </div>
    );
  }

  if (!pickups?.length) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No pickups found.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {pickups.map((pickup) => (
          <Card key={pickup.id} className="border border-border/50 shadow-sm">
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{pickup.pickup_id}</span>
                    {pickup.note && <OrderNoteTooltip note={pickup.note} />}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {getActionButtons(pickup)}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Shop Info */}
                <div className="space-y-1">
                  <div className="font-medium">{pickup.client_business_name}</div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    {pickup.client_phone}
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <div className="font-medium text-sm">{pickup.location}</div>
                    <div className="text-xs text-muted-foreground">{pickup.address}</div>
                  </div>
                </div>

                {/* Details Row */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    {pickup.package_type && (
                      <div className="flex items-center gap-1">
                        <Package className="h-3 w-3 text-muted-foreground" />
                        <Badge variant="outline" className="text-xs capitalize">
                          {pickup.package_type}
                        </Badge>
                      </div>
                    )}
                    <div className="text-muted-foreground">
                      {pickup.total_orders} order{pickup.total_orders !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <Badge className={getStatusBadge(pickup.status)}>
                    {pickup.status}
                  </Badge>
                </div>

                {/* Date & Vehicle */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {format(new Date(pickup.pickup_date), 'MMM dd, yyyy HH:mm')}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs capitalize">
                    {pickup.vehicle_type || 'Small'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pickup Details Dialog */}
      {selectedPickup && (
        <CourierPickupDetailsDialog
          pickup={selectedPickup}
          open={detailsDialogOpen}
          onOpenChange={(open) => {
            setDetailsDialogOpen(open);
            if (!open) {
              setSelectedPickup(null);
            }
          }}
          onStatusUpdate={onStatusUpdate}
        />
      )}
    </>
  );
};

export default CourierPickupsTableMobile;