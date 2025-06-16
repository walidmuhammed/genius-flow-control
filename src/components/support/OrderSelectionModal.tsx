
import React, { useState } from 'react';
import { Search, Package } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useOrders } from '@/hooks/use-orders';
import type { OrderWithCustomer } from '@/services/orders';

interface OrderSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (order: OrderWithCustomer) => void;
  selectedOrderId?: string;
}

const OrderSelectionModal: React.FC<OrderSelectionModalProps> = ({
  open,
  onOpenChange,
  onSelect,
  selectedOrderId
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: orders = [] } = useOrders();

  const filteredOrders = orders.filter(order => 
    order.reference_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (order: OrderWithCustomer) => {
    onSelect(order);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col bg-background border shadow-lg">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Select Order</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 flex-1 flex flex-col min-h-0">
          <div className="relative flex-shrink-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search orders by reference, customer, or status..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
            {filteredOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No orders found</p>
              </div>
            ) : (
              filteredOrders.map(order => (
                <div
                  key={order.id}
                  className={`p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                    selectedOrderId === order.id ? 'border-primary bg-primary/5' : ''
                  }`}
                  onClick={() => handleSelect(order)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">{order.reference_number}</p>
                      <p className="text-sm text-muted-foreground">{order.customer.name}</p>
                    </div>
                    <Badge variant="outline">{order.status}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {order.customer.city_name}, {order.customer.governorate_name}
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="flex justify-end gap-2 pt-4 border-t flex-shrink-0">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderSelectionModal;
