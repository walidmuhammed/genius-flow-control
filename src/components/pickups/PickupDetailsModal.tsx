
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MapPin, User, Phone, Calendar, Package, Truck, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { getPickupById } from '@/services/pickups';

interface PickupDetailsModalProps {
  pickupId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PickupDetailsModal({ pickupId, open, onOpenChange }: PickupDetailsModalProps) {
  const { data: pickup, isLoading } = useQuery({
    queryKey: ['pickup', pickupId],
    queryFn: () => pickupId ? getPickupById(pickupId) : null,
    enabled: !!pickupId && open
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled': return 'bg-blue-100 text-blue-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Canceled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVehicleLabel = (type: string) => {
    switch (type) {
      case 'small': return 'Small (Motorcycle)';
      case 'medium': return 'Medium (Car)';
      case 'large': return 'Large (Van)';
      default: return type;
    }
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">Loading pickup details...</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!pickup) return null;

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
          {/* Status and Basic Info */}
          <div className="flex items-center justify-between">
            <Badge className={getStatusColor(pickup.status)}>
              {pickup.status}
            </Badge>
            <div className="text-sm text-gray-600">
              Created {format(new Date(pickup.created_at), 'MMM d, yyyy')}
            </div>
          </div>

          {/* Pickup Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Pickup Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Date & Time</label>
                  <p className="text-sm">
                    {format(new Date(pickup.pickup_date), 'EEEE, MMM d, yyyy \'at\' h:mm a')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Vehicle Type</label>
                  <p className="text-sm">{getVehicleLabel(pickup.vehicle_type)}</p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  Address
                </label>
                <p className="text-sm mt-1">{pickup.address}</p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Contact Person</label>
                  <p className="text-sm">{pickup.contact_person}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </label>
                  <p className="text-sm">{pickup.contact_phone}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Courier Information */}
          {(pickup.courier_name || pickup.courier_phone) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Courier Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pickup.courier_name && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Courier Name</label>
                      <p className="text-sm">{pickup.courier_name}</p>
                    </div>
                  )}
                  {pickup.courier_phone && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Courier Phone</label>
                      <p className="text-sm">{pickup.courier_phone}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Orders in Pickup */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5" />
                Orders ({pickup.orders_count})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pickup.orders && pickup.orders.length > 0 ? (
                <div className="space-y-3">
                  {pickup.orders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium">#{order.order_id.toString().padStart(3, '0')}</span>
                        <span className="text-sm text-gray-600 ml-2">{order.customer_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{order.type}</Badge>
                        <Badge variant="outline">{order.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600">No orders found for this pickup.</p>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          {pickup.note && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{pickup.note}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
