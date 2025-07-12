import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Eye, MoreHorizontal, UserPlus, CheckCircle, XCircle, Clock } from 'lucide-react';
import { AdminPickupWithClient } from '@/services/admin-pickups';
import { formatDate } from '@/utils/format';
import AdminPickupDetailsDialog from './AdminPickupDetailsDialog';

interface AdminPickupsTableProps {
  pickups: AdminPickupWithClient[];
  onStatusUpdate: (pickupId: string, status: string) => void;
  onCourierAssign: (pickupId: string) => void;
  isLoading?: boolean;
}

const AdminPickupsTable: React.FC<AdminPickupsTableProps> = ({
  pickups,
  onStatusUpdate,
  onCourierAssign,
  isLoading
}) => {
  const [selectedPickup, setSelectedPickup] = useState<AdminPickupWithClient | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'scheduled':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400';
      case 'assigned':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'in progress':
        return 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400';
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400';
      case 'canceled':
        return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const handleViewDetails = (pickup: AdminPickupWithClient) => {
    setSelectedPickup(pickup);
    setDetailsOpen(true);
  };

  const getActionButtons = (pickup: AdminPickupWithClient) => {
    const statusLower = pickup.status.toLowerCase();
    const buttons = [];

    if (statusLower === 'scheduled') {
      buttons.push(
        <DropdownMenuItem key="assign" onClick={() => onCourierAssign(pickup.id)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Assign Courier
        </DropdownMenuItem>
      );
    }

    if (statusLower === 'assigned' || statusLower === 'in progress') {
      buttons.push(
        <DropdownMenuItem key="complete" onClick={() => onStatusUpdate(pickup.id, 'Completed')}>
          <CheckCircle className="h-4 w-4 mr-2" />
          Mark Complete
        </DropdownMenuItem>
      );
    }

    if (statusLower !== 'completed' && statusLower !== 'canceled') {
      buttons.push(
        <DropdownMenuItem 
          key="cancel" 
          onClick={() => onStatusUpdate(pickup.id, 'Canceled')}
          className="text-red-600"
        >
          <XCircle className="h-4 w-4 mr-2" />
          Cancel Pickup
        </DropdownMenuItem>
      );
    }

    return buttons;
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card">
        <div className="p-6">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Pickup ID</TableHead>
              <TableHead className="font-semibold">Store / Client</TableHead>
              <TableHead className="font-semibold">Pickup Date & Time</TableHead>
              <TableHead className="font-semibold">Courier</TableHead>
              <TableHead className="font-semibold">Orders</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pickups.map((pickup) => (
              <TableRow key={pickup.id} className="hover:bg-muted/50 transition-colors">
                <TableCell className="font-medium text-primary">
                  {pickup.pickup_id}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{pickup.client_business_name}</span>
                    <span className="text-sm text-muted-foreground">
                      {pickup.client_name} • {pickup.client_business_type}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {formatDate(new Date(pickup.pickup_date))}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {pickup.location}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {pickup.courier_name ? (
                    <div className="flex flex-col">
                      <span className="font-medium">{pickup.courier_name}</span>
                      {pickup.courier_phone && (
                        <span className="text-sm text-muted-foreground">
                          {pickup.courier_phone}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">Unassigned</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{pickup.total_orders} orders</span>
                    {(pickup.total_cash_usd > 0 || pickup.total_cash_lbp > 0) && (
                      <span className="text-sm text-muted-foreground">
                        Cash: ${pickup.total_cash_usd.toFixed(2)}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={getStatusBadge(pickup.status)}>
                    {pickup.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex justify-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetails(pickup)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(pickup)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {getActionButtons(pickup)}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {pickups.length === 0 && (
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No pickups found</p>
          </div>
        )}
      </div>

      {selectedPickup && (
        <AdminPickupDetailsDialog
          pickup={selectedPickup}
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
          onStatusUpdate={onStatusUpdate}
          onCourierAssign={onCourierAssign}
        />
      )}
    </>
  );
};

export default AdminPickupsTable;