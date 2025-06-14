
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { OrderWithCustomer } from '@/services/orders';
import { formatDate } from '@/utils/format';
import { Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useArchiveOrder } from '@/hooks/use-orders';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface OrderDetailsDialogProps {
  order: OrderWithCustomer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const OrderDetailsDialog: React.FC<OrderDetailsDialogProps> = ({
  order,
  open,
  onOpenChange,
}) => {
  const navigate = useNavigate();
  const archiveOrderMutation = useArchiveOrder();
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);

  if (!order) return null;

  const isNewStatus = order.status === 'New';

  const handleEdit = () => {
    navigate(`/orders/${order.id}/edit`);
    onOpenChange(false);
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      await archiveOrderMutation.mutateAsync(order.id);
      setShowDeleteDialog(false);
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'pending pickup':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'in progress':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'heading to customer':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'heading to you':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'successful':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'unsuccessful':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'returned':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'paid':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'deliver':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'exchange':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'cash collection':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span>Order #{order.order_id?.toString().padStart(3, '0')}</span>
                <Badge variant="outline" className={getStatusColor(order.status)}>
                  {order.status}
                </Badge>
              </div>
              {isNewStatus && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEdit}
                    className="flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDelete}
                    className="flex items-center gap-2 text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Edit History Section */}
            {order.edited && order.edit_history && order.edit_history.length > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Edit className="h-4 w-4 text-orange-600" />
                  <span className="font-medium text-orange-900">📝 This order was edited.</span>
                </div>
                <div className="space-y-2">
                  {order.edit_history.map((change: any, index: number) => (
                    <div key={index} className="text-sm">
                      <span className="font-medium">Changed: {change.field}:</span>
                      <span className="text-gray-600"> "{change.oldValue}" → "{change.newValue}"</span>
                      {change.timestamp && (
                        <span className="text-xs text-gray-500 ml-2">
                          ({formatDate(new Date(change.timestamp))})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Order Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Order Information</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Reference:</span>
                    <span className="ml-2 font-medium">{order.reference_number || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Type:</span>
                    <Badge variant="outline" className={`ml-2 ${getTypeColor(order.type)}`}>
                      {order.type}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-gray-600">Package:</span>
                    <span className="ml-2">{order.package_type}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Items:</span>
                    <span className="ml-2">{order.items_count}</span>
                  </div>
                  {order.package_description && (
                    <div>
                      <span className="text-gray-600">Description:</span>
                      <span className="ml-2">{order.package_description}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-600">Allow Opening:</span>
                    <span className="ml-2">{order.allow_opening ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Customer Information</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <span className="ml-2 font-medium">{order.customer?.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Phone:</span>
                    <span className="ml-2">{order.customer?.phone}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Location:</span>
                    <span className="ml-2">
                      {order.customer?.city_name}, {order.customer?.governorate_name}
                    </span>
                  </div>
                  {order.customer?.address && (
                    <div>
                      <span className="text-gray-600">Address:</span>
                      <span className="ml-2">{order.customer.address}</span>
                    </div>
                  )}
                  {order.customer?.is_work_address && (
                    <div>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        Work Address
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Financial Information */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Financial Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Cash Collection</h4>
                  {order.cash_collection_enabled ? (
                    <div className="space-y-1 text-sm">
                      {order.cash_collection_usd > 0 && (
                        <div>${order.cash_collection_usd}</div>
                      )}
                      {order.cash_collection_lbp > 0 && (
                        <div>{order.cash_collection_lbp.toLocaleString()} LBP</div>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">No cash collection</span>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Delivery Fees</h4>
                  <div className="space-y-1 text-sm">
                    {order.delivery_fees_usd > 0 && (
                      <div>${order.delivery_fees_usd}</div>
                    )}
                    {order.delivery_fees_lbp > 0 && (
                      <div>{order.delivery_fees_lbp.toLocaleString()} LBP</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {order.note && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Notes</h3>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {order.note}
                  </p>
                </div>
              </>
            )}

            <Separator />

            {/* Timestamps */}
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Created:</span>
                <div>{formatDate(new Date(order.created_at))}</div>
              </div>
              <div>
                <span className="font-medium">Last Updated:</span>
                <div>{formatDate(new Date(order.updated_at))}</div>
              </div>
            </div>

            {order.courier_name && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Courier Information</h3>
                <div className="text-sm">
                  <span className="text-gray-600">Assigned to:</span>
                  <span className="ml-2 font-medium">{order.courier_name}</span>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this order? This will archive it and it won't be visible in the list anymore.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              className="bg-red-600 hover:bg-red-700"
              disabled={archiveOrderMutation.isPending}
            >
              {archiveOrderMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default OrderDetailsDialog;
