
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Eye, MoreHorizontal } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Pickup } from '@/services/pickups';
import { format } from 'date-fns';
import PickupDetailsDialog from './PickupDetailsDialog';

interface PickupsTableProps {
  pickups: Pickup[];
  selectedPickups: string[];
  toggleSelectAll: (checked: boolean) => void;
  toggleSelectPickup: (pickupId: string) => void;
}

const PickupsTable: React.FC<PickupsTableProps> = ({ 
  pickups,
  selectedPickups,
  toggleSelectAll,
  toggleSelectPickup
}) => {
  const [selectedPickup, setSelectedPickup] = useState<Pickup | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  
  const handleViewPickupDetails = (pickup: Pickup) => {
    setSelectedPickup(pickup);
    setDetailsDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled':
        return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-600 border-yellow-200';
      case 'Completed':
        return 'bg-green-100 text-green-600 border-green-200';
      case 'Canceled':
        return 'bg-red-100 text-red-600 border-red-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };
  
  return (
    <>
      <div className="rounded-xl border border-border/10 shadow-sm overflow-hidden bg-white mt-4">
        {selectedPickups.length > 0 && (
          <div className="bg-topspeed-50/80 py-3 px-6 flex justify-between items-center border-b border-border/10">
            <div className="text-sm font-medium text-topspeed-700">
              {selectedPickups.length} pickups selected
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-1.5 rounded-lg bg-white text-sm border border-border/20 shadow-sm flex items-center gap-2 hover:border-topspeed-200 transition-colors">
                Print Labels
              </button>
              <button 
                className="px-4 py-1.5 rounded-lg bg-white text-sm border border-border/20 shadow-sm hover:text-topspeed-600 transition-colors"
                onClick={() => toggleSelectAll(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/40 border-b border-border/10">
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
                  Pickup Date
                </TableHead>
                <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">
                  Courier
                </TableHead>
                <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">
                  Status
                </TableHead>
                <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider text-center">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pickups.map((pickup) => (
                <TableRow 
                  key={pickup.id}
                  className="hover:bg-muted/5 border-b border-border/5"
                >
                  <TableCell className="pl-4">
                    <Checkbox 
                      checked={selectedPickups.includes(pickup.id)}
                      onCheckedChange={() => toggleSelectPickup(pickup.id)}
                      className="data-[state=checked]:bg-topspeed-600 data-[state=checked]:border-topspeed-600"
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {pickup.pickup_id || "—"}
                  </TableCell>
                  <TableCell>
                    {pickup.location}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{pickup.contact_person}</span>
                      <span className="text-sm text-muted-foreground">{pickup.contact_phone}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {pickup.pickup_date ? format(new Date(pickup.pickup_date), 'MMM dd, yyyy') : "—"}
                  </TableCell>
                  <TableCell>
                    {pickup.courier_name || "Not Assigned"}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={`${getStatusColor(pickup.status)} font-medium`}
                    >
                      {pickup.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => handleViewPickupDetails(pickup)}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View details</span>
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">More options</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem>Mark as Completed</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            Cancel Pickup
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              
              {pickups.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                    No pickups scheduled for today
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        <div className="bg-white border-t border-border/10 px-6 py-4 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{1}</span> to <span className="font-medium text-foreground">{pickups.length}</span> of <span className="font-medium text-foreground">{pickups.length}</span> pickups
          </span>
          
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Button variant="default" size="sm" className="h-8 w-8 p-0">
              1
            </Button>
            
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <PickupDetailsDialog 
        pickup={selectedPickup}
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
      />
    </>
  );
};

export default PickupsTable;
