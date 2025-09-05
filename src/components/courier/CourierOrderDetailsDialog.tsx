import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { OrderWithCustomer } from '@/services/orders';
import { cn } from '@/lib/utils';
import { CheckCircle, Truck, XCircle, MessageCircle, Phone, MapPin, Package, DollarSign } from 'lucide-react';
import { useAddDeliveryNote } from '@/hooks/use-courier-orders';
import MarkAsDeliveredModal from './MarkAsDeliveredModal';
import MarkAsUnsuccessfulModal from './MarkAsUnsuccessfulModal';

interface CourierOrderDetailsDialogProps {
  order: OrderWithCustomer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMarkPickedUp?: (orderId: string) => void;
  onMarkDelivered?: (orderId: string, data: any) => void;
  onMarkUnsuccessful?: (orderId: string, data: any) => void;
}

export const CourierOrderDetailsDialog: React.FC<CourierOrderDetailsDialogProps> = ({
  order,
  open,
  onOpenChange,
  onMarkPickedUp,
  onMarkDelivered,
  onMarkUnsuccessful
}) => {
  const [deliveryNote, setDeliveryNote] = useState('');
  const [showDeliveredModal, setShowDeliveredModal] = useState(false);
  const [showUnsuccessfulModal, setShowUnsuccessfulModal] = useState(false);
  const addDeliveryNoteMutation = useAddDeliveryNote();

  if (!order) return null;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'pending pickup':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'assigned':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'in progress':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'successful':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'unsuccessful':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'returned':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'awaiting payment':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'paid':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const canMarkPickedUp = ['New', 'Assigned'].includes(order.status);
  const canMarkDelivered = order.status === 'In Progress';
  const canMarkUnsuccessful = order.status === 'In Progress';

  const handleAddNote = async () => {
    if (!deliveryNote.trim()) return;
    
    try {
      await addDeliveryNoteMutation.mutateAsync({
        orderId: order.id,
        note: deliveryNote
      });
      setDeliveryNote('');
    } catch (error) {
      console.error('Error adding delivery note:', error);
    }
  };

  const handleMarkDelivered = async (data: {
    collectedAmountUSD: number;
    collectedAmountLBP: number;
    note?: string;
  }) => {
    if (onMarkDelivered && order) {
      await onMarkDelivered(order.id, {
        collected_amount_usd: data.collectedAmountUSD,
        collected_amount_lbp: data.collectedAmountLBP,
        note: data.note
      });
    }
  };

  const handleMarkUnsuccessful = async (data: {
    reason: string;
    collectedAmountUSD?: number;
    collectedAmountLBP?: number;
    note?: string;
  }) => {
    if (onMarkUnsuccessful && order) {
      await onMarkUnsuccessful(order.id, {
        unsuccessful_reason: data.reason,
        collected_amount_usd: data.collectedAmountUSD || 0,
        collected_amount_lbp: data.collectedAmountLBP || 0,
        note: data.note
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-semibold">
              Order #{order.order_id?.toString().padStart(3, '0') || order.id.slice(0, 8)}
            </DialogTitle>
            <Badge className={cn("px-3 py-1 text-sm font-medium rounded-full border", getStatusColor(order.status))}>
              {order.status}
            </Badge>
          </div>
          <div className="text-sm text-gray-500">
            Reference: {order.reference_number || '-'}
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Customer & Delivery Info */}
          <div className="space-y-6">
            {/* Customer Information */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Customer Information
              </h3>
              <div className="space-y-2">
                <div>
                  <Label className="text-sm text-gray-600">Name</Label>
                  <div className="font-medium">{order.customer?.name}</div>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Phone</Label>
                  <div className="font-medium">{order.customer?.phone}</div>
                </div>
                {order.customer?.secondary_phone && (
                  <div>
                    <Label className="text-sm text-gray-600">Secondary Phone</Label>
                    <div className="font-medium">{order.customer.secondary_phone}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Delivery Address */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Delivery Address
              </h3>
              <div className="space-y-2">
                <div>
                  <Label className="text-sm text-gray-600">Governorate</Label>
                  <div className="font-medium">{order.customer?.governorate_name}</div>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">City</Label>
                  <div className="font-medium">{order.customer?.city_name}</div>
                </div>
                {order.customer?.address && (
                  <div>
                    <Label className="text-sm text-gray-600">Address</Label>
                    <div className="font-medium">{order.customer.address}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Shop Information */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-3">Shop Information</h3>
              <div className="space-y-2">
                <div>
                  <Label className="text-sm text-gray-600">Business Name</Label>
                  <div className="font-medium">{order.profiles?.business_name || 'N/A'}</div>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Contact Phone</Label>
                  <div className="font-medium">{order.profiles?.phone || '-'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Details & Actions */}
          <div className="space-y-6">
            {/* Package Information */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Package className="h-5 w-5" />
                Package Information
              </h3>
              <div className="space-y-2">
                <div>
                  <Label className="text-sm text-gray-600">Package Type</Label>
                  <div className="font-medium">{order.package_type || 'Parcel'}</div>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Items Count</Label>
                  <div className="font-medium">{order.items_count}</div>
                </div>
                {order.package_description && (
                  <div>
                    <Label className="text-sm text-gray-600">Description</Label>
                    <div className="font-medium">{order.package_description}</div>
                  </div>
                )}
                <div>
                  <Label className="text-sm text-gray-600">Allow Opening</Label>
                  <div className="font-medium">{order.allow_opening ? 'Yes' : 'No'}</div>
                </div>
              </div>
            </div>

            {/* Financial Information */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Financial Information
              </h3>
              <div className="space-y-2">
                <div>
                  <Label className="text-sm text-gray-600">Cash Collection</Label>
                  {order.cash_collection_enabled ? (
                    <div>
                      {order.cash_collection_usd > 0 && (
                        <div className="font-medium">${order.cash_collection_usd}</div>
                      )}
                      {order.cash_collection_lbp > 0 && (
                        <div className="font-medium">{order.cash_collection_lbp.toLocaleString()} LBP</div>
                      )}
                    </div>
                  ) : (
                    <div className="font-medium text-gray-500">No cash collection</div>
                  )}
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Delivery Fee</Label>
                  <div>
                    {order.delivery_fees_usd > 0 && (
                      <div className="font-medium">${order.delivery_fees_usd}</div>
                    )}
                    {order.delivery_fees_lbp > 0 && (
                      <div className="font-medium">{order.delivery_fees_lbp.toLocaleString()} LBP</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Notes */}
            {order.note && (
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Order Notes
                </h3>
                <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {order.note}
                </div>
              </div>
            )}

            {/* Add Delivery Note */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-3">Add Delivery Note</h3>
              <div className="space-y-3">
                <Textarea
                  placeholder="Add notes about the delivery..."
                  value={deliveryNote}
                  onChange={(e) => setDeliveryNote(e.target.value)}
                  rows={3}
                />
                <Button 
                  onClick={handleAddNote}
                  disabled={!deliveryNote.trim() || addDeliveryNoteMutation.isPending}
                  className="w-full"
                >
                  {addDeliveryNoteMutation.isPending ? 'Adding...' : 'Add Note'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {canMarkPickedUp && (
            <Button
              onClick={() => {
                onMarkPickedUp?.(order.id);
                onOpenChange(false);
              }}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <Truck className="h-4 w-4 mr-2" />
              Mark as Picked Up
            </Button>
          )}
          
          {canMarkDelivered && (
            <Button
              onClick={() => setShowDeliveredModal(true)}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark as Delivered
            </Button>
          )}
          
          {canMarkUnsuccessful && (
            <Button
              onClick={() => setShowUnsuccessfulModal(true)}
              variant="destructive"
              className="flex-1"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Mark as Unsuccessful
            </Button>
          )}
        </div>
      </DialogContent>

      {/* Delivery Completion Modals */}
      <MarkAsDeliveredModal
        open={showDeliveredModal}
        onOpenChange={setShowDeliveredModal}
        onConfirm={handleMarkDelivered}
        originalAmount={{
          usd: order?.cash_collection_usd || 0,
          lbp: order?.cash_collection_lbp || 0
        }}
      />

      <MarkAsUnsuccessfulModal
        open={showUnsuccessfulModal}
        onOpenChange={setShowUnsuccessfulModal}
        onConfirm={handleMarkUnsuccessful}
      />
    </Dialog>
  );
};