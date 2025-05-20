
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, X, Eye } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pickup } from '@/services/pickups';
import { mapPickupToComponentFormat, PickupData } from '@/utils/pickupMappers';
import PickupDetailsDialog from '@/components/pickups/PickupDetailsDialog';
import { formatDate } from '@/utils/format';

interface PickupsTableProps {
  pickups: Pickup[];
  selectedPickups: string[];
  toggleSelectAll: (checked: boolean) => void;
  toggleSelectPickup: (pickupId: string) => void;
  showActions?: boolean;
}

const PickupsTable: React.FC<PickupsTableProps> = ({ 
  pickups, 
  selectedPickups, 
  toggleSelectAll, 
  toggleSelectPickup,
  showActions = true 
}) => {
  const [selectedPickup, setSelectedPickup] = useState<PickupData | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  
  const handleViewPickupDetails = (pickup: Pickup) => {
    setSelectedPickup(mapPickupToComponentFormat(pickup));
    setDetailsDialogOpen(true);
  };
  
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'in progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'canceled':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  return (
    <>
      <div className="rounded-2xl border border-white/40 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] overflow-hidden bg-white/85 backdrop-blur-md mt-4 transition-all duration-300 hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)]">
        {selectedPickups.length > 0 && (
          <div className="bg-topspeed-50/90 py-3 px-6 flex justify-between items-center border-b border-border/10">
            <div className="text-sm font-medium text-topspeed-700">
              {selectedPickups.length} pickups selected
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className="rounded-xl border border-border/30 hover:bg-topspeed-50 hover:text-topspeed-600 transition-colors duration-200"
              >
                Print Details
              </Button>
              <Button 
                variant="outline"
                size="sm"
                onClick={() => toggleSelectAll(false)}
                className="rounded-xl border border-border/30 hover:bg-topspeed-50 hover:text-topspeed-600 transition-colors duration-200"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/20 hover:bg-muted/30 border-b border-border/10">
                <TableHead className="w-12 h-11 pl-4">
                  <Checkbox 
                    checked={selectedPickups.length === pickups.length && pickups.length > 0}
                    onCheckedChange={(checked) => toggleSelectAll(!!checked)}
                    className="data-[state=checked]:bg-topspeed-600 data-[state=checked]:border-topspeed-600"
                  />
                </TableHead>
                <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">
                  Pickup ID
                </TableHead>
                <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">
                  Location
                </TableHead>
                <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">
                  Contact
                </TableHead>
                <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">
                  Date
                </TableHead>
                <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">
                  Status
                </TableHead>
                {showActions && (
                  <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider text-center">
                    Actions
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {pickups.map((pickup) => (
                <TableRow 
                  key={pickup.id} 
                  className="border-b border-border/5 hover:bg-muted/20 transition-colors duration-200"
                >
                  <TableCell className="pl-4">
                    <Checkbox 
                      checked={selectedPickups.includes(pickup.id)}
                      onCheckedChange={() => toggleSelectPickup(pickup.id)}
                      className="data-[state=checked]:bg-topspeed-600 data-[state=checked]:border-topspeed-600"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{pickup.pickup_id || 'N/A'}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{pickup.location}</span>
                      <span className="text-xs text-muted-foreground mt-0.5">
                        {pickup.address || 'No address provided'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{pickup.contact_person}</span>
                      <span className="text-xs text-muted-foreground mt-0.5">
                        {pickup.contact_phone}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {formatDate(pickup.pickup_date)}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={`${getStatusColor(pickup.status)} border px-2.5 py-0.5 text-xs font-medium rounded-full shadow-sm`}
                    >
                      {pickup.status}
                    </Badge>
                  </TableCell>
                  {showActions && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-lg hover:bg-muted/50 transition-all duration-200" 
                          onClick={() => handleViewPickupDetails(pickup)}
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Button>
                        {pickup.status === 'Scheduled' && (
                          <Button
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 rounded-lg text-green-600 hover:text-green-700 hover:bg-green-50 transition-all duration-200"
                          >
                            <Check className="h-4 w-4" />
                            <span className="sr-only">Complete</span>
                          </Button>
                        )}
                        {pickup.status === 'Scheduled' && (
                          <Button
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-all duration-200"
                          >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Cancel</span>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="bg-white border-t border-border/10 px-6 py-4 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{1}</span> to <span className="font-medium text-foreground">{pickups.length}</span> of <span className="font-medium text-foreground">{pickups.length}</span> pickups
          </span>
          
          <div className="flex items-center gap-1">
            <button className="p-2 border border-border/20 rounded-lg hover:bg-muted/30 transition-colors duration-200">
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            <button className="h-8 w-8 bg-topspeed-600 text-white rounded-lg flex items-center justify-center text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200">1</button>
            
            <button className="p-2 border border-border/20 rounded-lg hover:bg-muted/30 transition-colors duration-200">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      
      {selectedPickup && (
        <PickupDetailsDialog 
          pickup={selectedPickup}
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
        />
      )}
    </>
  );
};

export default PickupsTable;
