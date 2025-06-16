
import React, { useState } from 'react';
import { Search, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePickups } from '@/hooks/use-pickups';
import type { Pickup } from '@/services/pickups';

interface PickupSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (pickup: Pickup) => void;
  selectedPickupId?: string;
}

const PickupSelectionModal: React.FC<PickupSelectionModalProps> = ({
  open,
  onOpenChange,
  onSelect,
  selectedPickupId
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: pickups = [] } = usePickups();

  const filteredPickups = pickups.filter(pickup => 
    pickup.pickup_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pickup.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pickup.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (pickup: Pickup) => {
    onSelect(pickup);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Pickup</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 flex-1 flex flex-col">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search pickups by ID, location, or status..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-2">
            {filteredPickups.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No pickups found</p>
              </div>
            ) : (
              filteredPickups.map(pickup => (
                <div
                  key={pickup.id}
                  className={`p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                    selectedPickupId === pickup.id ? 'border-primary bg-primary/5' : ''
                  }`}
                  onClick={() => handleSelect(pickup)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">{pickup.pickup_id}</p>
                      <p className="text-sm text-muted-foreground">{pickup.location}</p>
                    </div>
                    <Badge variant="outline">{pickup.status}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {pickup.address}
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PickupSelectionModal;
