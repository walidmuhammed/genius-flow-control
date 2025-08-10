import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
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
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20';
      case 'assigned':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20 hover:bg-yellow-500/20';
      case 'in progress':
        return 'bg-orange-500/10 text-orange-600 border-orange-500/20 hover:bg-orange-500/20';
      case 'completed':
        return 'bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20';
      case 'canceled':
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20 hover:bg-gray-500/20';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20 hover:bg-gray-500/20';
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
      buttons.push(<DropdownMenuItem key="assign" onClick={() => onCourierAssign(pickup.id)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Assign Courier
        </DropdownMenuItem>);
    }
    if (statusLower === 'assigned' || statusLower === 'in progress') {
      buttons.push(<DropdownMenuItem key="complete" onClick={() => onStatusUpdate(pickup.id, 'Completed')}>
          <CheckCircle className="h-4 w-4 mr-2" />
          Mark Complete
        </DropdownMenuItem>);
    }
    if (statusLower !== 'completed' && statusLower !== 'canceled') {
      buttons.push(<DropdownMenuItem key="cancel" onClick={() => onStatusUpdate(pickup.id, 'Canceled')} className="text-red-600">
          <XCircle className="h-4 w-4 mr-2" />
          Cancel Pickup
        </DropdownMenuItem>);
    }
    return buttons;
  };
  if (isLoading) {
    return <div className="rounded-lg border bg-card">
        <div className="p-6">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-muted animate-pulse rounded" />)}
          </div>
        </div>
      </div>;
  }
  return <>
      <div className="rounded-lg border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Pickup ID</TableHead>
              <TableHead className="font-semibold">Shop Name & Phone</TableHead>
              <TableHead className="font-semibold">Pickup Location</TableHead>
              <TableHead className="font-semibold">Orders</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Scheduled Date & Time</TableHead>
              <TableHead className="font-semibold">Vehicle Type</TableHead>
              <TableHead className="font-semibold text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pickups.map(pickup => <TableRow key={pickup.id} className="hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => handleViewDetails(pickup)}>
                <TableCell className="font-medium text-primary">
                  <div className="flex items-center gap-2">
                    {pickup.pickup_id}
                    {pickup.note && <div className="flex items-center">
                        
                      </div>}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{pickup.client_business_name}</span>
                    <span className="text-sm text-muted-foreground">
                      {pickup.contact_phone}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{pickup.location}</span>
                    <span className="text-sm text-muted-foreground">
                      {pickup.address || 'No specific address'}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{pickup.total_orders} orders</span>
                    {(pickup.total_cash_usd > 0 || pickup.total_cash_lbp > 0) && <span className="text-sm text-muted-foreground">
                        Cash: ${pickup.total_cash_usd.toFixed(2)}
                      </span>}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={getStatusBadge(pickup.status)}>
                    {pickup.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {formatDate(new Date(pickup.pickup_date))}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(pickup.pickup_date).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-medium capitalize">
                    {pickup.vehicle_type || 'Small'}
                  </span>
                </TableCell>
                <TableCell onClick={e => e.stopPropagation()}>
                  <div className="flex justify-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleViewDetails(pickup)}>
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
              </TableRow>)}
          </TableBody>
        </Table>
        
        {pickups.length === 0 && <div className="text-center py-12">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No pickups found</p>
          </div>}
      </div>

      {selectedPickup && <AdminPickupDetailsDialog pickup={selectedPickup} open={detailsOpen} onOpenChange={setDetailsOpen} onStatusUpdate={onStatusUpdate} onCourierAssign={onCourierAssign} />}
    </>;
};
export default AdminPickupsTable;