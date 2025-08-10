import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Eye, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import OrderNoteTooltip from '@/components/orders/OrderNoteTooltip';
import { CourierPickupWithClient } from '@/services/courier-pickups';
import CourierPickupDetailsDialog from './CourierPickupDetailsDialog';

interface CourierPickupsTableProps {
  pickups: CourierPickupWithClient[];
  onStatusUpdate: (pickupId: string, status: string, reason?: string) => void;
  isLoading?: boolean;
}

const CourierPickupsTable: React.FC<CourierPickupsTableProps> = ({
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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Pickup ID</TableHead>
            <TableHead>Shop Info</TableHead>
            <TableHead>Pickup Location</TableHead>
            <TableHead>Package Type</TableHead>
            <TableHead>Orders</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Scheduled Date/Time</TableHead>
            <TableHead>Vehicle</TableHead>
            <TableHead className="w-[50px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pickups.map((pickup) => (
            <TableRow key={pickup.id} className="cursor-pointer hover:bg-muted/50">
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <span>{pickup.pickup_id}</span>
                  {pickup.note && <OrderNoteTooltip note={pickup.note} />}
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="font-medium">{pickup.client_business_name}</div>
                  <div className="text-sm text-muted-foreground">{pickup.client_phone}</div>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="font-medium">{pickup.location}</div>
                  <div className="text-sm text-muted-foreground">{pickup.address}</div>
                </div>
              </TableCell>
              <TableCell>
                {pickup.package_type ? (
                  <Badge variant="outline" className="capitalize">
                    {pickup.package_type}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell>{pickup.total_orders}</TableCell>
              <TableCell>
                <Badge className={getStatusBadge(pickup.status)}>
                  {pickup.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="font-medium">
                    {format(new Date(pickup.pickup_date), 'MMM dd, yyyy')}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(pickup.pickup_date), 'hh:mm a')}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize">
                  {pickup.vehicle_type || 'Small'}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {getActionButtons(pickup)}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

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

export default CourierPickupsTable;