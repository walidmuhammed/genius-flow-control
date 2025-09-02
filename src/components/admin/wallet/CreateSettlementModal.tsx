import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import CurrencyDisplay from '@/components/orders/CurrencyDisplay';
import { Calculator, Edit3, Save, X } from 'lucide-react';
import { useCreateCourierSettlement } from '@/hooks/use-courier-settlements';
import { adjustCourierFeeInOrder } from '@/services/courier-settlements';
import { toast } from 'sonner';

interface CreateSettlementModalProps {
  isOpen: boolean;
  onClose: () => void;
  courierId: string;
  courierName: string;
  orders: Array<{
    id: string;
    order_id: number;
    reference_number: string;
    collected_amount_usd?: number;
    collected_amount_lbp?: number;
    courier_fee_usd?: number;
    courier_fee_lbp?: number;
    status: string;
    created_at: string;
    customer?: {
      id: string;
      name: string;
    };
  }>;
  selectedOrderIds: string[];
}

const CreateSettlementModal: React.FC<CreateSettlementModalProps> = ({
  isOpen,
  onClose,
  courierId,
  courierName,
  orders,
  selectedOrderIds
}) => {
  const createSettlement = useCreateCourierSettlement();
  const [notes, setNotes] = useState('');
  const [editingFees, setEditingFees] = useState<Record<string, { usd: number; lbp: number }>>({});
  const [feeChanges, setFeeChanges] = useState<Record<string, { usd: number; lbp: number }>>({});
  
  // Filter selected orders
  const selectedOrders = orders.filter(order => selectedOrderIds.includes(order.id));

  // Initialize fee changes when modal opens
  useEffect(() => {
    if (isOpen) {
      const initialChanges: Record<string, { usd: number; lbp: number }> = {};
      selectedOrders.forEach(order => {
        initialChanges[order.id] = {
          usd: order.courier_fee_usd || 2,
          lbp: order.courier_fee_lbp || 75000
        };
      });
      setFeeChanges(initialChanges);
    }
  }, [isOpen, selectedOrders]);

  // Calculate totals with fee adjustments
  const calculateTotals = () => {
    let totalCollectedUSD = 0;
    let totalCollectedLBP = 0;
    let totalCourierFeesUSD = 0;
    let totalCourierFeesLBP = 0;

    selectedOrders.forEach(order => {
      totalCollectedUSD += (order.collected_amount_usd || 0);
      totalCollectedLBP += (order.collected_amount_lbp || 0);
      
      // Use adjusted fees if available
      const fees = feeChanges[order.id] || { 
        usd: order.courier_fee_usd || 2, 
        lbp: order.courier_fee_lbp || 75000 
      };
      totalCourierFeesUSD += fees.usd;
      totalCourierFeesLBP += fees.lbp;
    });

    const balanceUSD = totalCollectedUSD - totalCourierFeesUSD;
    const balanceLBP = totalCollectedLBP - totalCourierFeesLBP;
    const direction = (balanceUSD >= 0 && balanceLBP >= 0) ? 'courier_to_admin' : 'admin_to_courier';

    return {
      totalCollectedUSD,
      totalCollectedLBP,
      totalCourierFeesUSD,
      totalCourierFeesLBP,
      balanceUSD,
      balanceLBP,
      direction
    };
  };

  const totals = calculateTotals();

  const handleFeeEdit = (orderId: string) => {
    const currentFee = feeChanges[orderId];
    setEditingFees({
      ...editingFees,
      [orderId]: { ...currentFee }
    });
  };

  const handleFeeSave = (orderId: string) => {
    const newFees = editingFees[orderId];
    if (newFees && newFees.usd >= 0 && newFees.lbp >= 0) {
      setFeeChanges({
        ...feeChanges,
        [orderId]: newFees
      });
      setEditingFees(prev => {
        const updated = { ...prev };
        delete updated[orderId];
        return updated;
      });
    } else {
      toast.error('Courier fees must be non-negative');
    }
  };

  const handleFeeCancel = (orderId: string) => {
    setEditingFees(prev => {
      const updated = { ...prev };
      delete updated[orderId];
      return updated;
    });
  };

  const handleCreateSettlement = async () => {
    try {
      // First, update any changed fees
      const feeUpdatePromises = Object.entries(feeChanges).map(([orderId, fees]) => {
        const originalOrder = selectedOrders.find(o => o.id === orderId);
        if (originalOrder && 
            (fees.usd !== (originalOrder.courier_fee_usd || 2) || 
             fees.lbp !== (originalOrder.courier_fee_lbp || 75000))) {
          return adjustCourierFeeInOrder(orderId, fees.usd, fees.lbp);
        }
        return Promise.resolve();
      });

      await Promise.all(feeUpdatePromises);

      // Then create the settlement
      await createSettlement.mutateAsync({
        courier_id: courierId,
        order_ids: selectedOrderIds,
        notes
      });

      // Reset form and close
      setNotes('');
      setFeeChanges({});
      setEditingFees({});
      onClose();
      
      toast.success(`Settlement created successfully for ${courierName}`);
    } catch (error) {
      console.error('Error creating settlement:', error);
      toast.error('Failed to create settlement');
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Create Settlement for {courierName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Settlement Summary */}
          <div className="grid grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Orders Selected</div>
              <div className="text-lg font-bold">{selectedOrders.length}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Total Collected</div>
              <CurrencyDisplay 
                valueUSD={totals.totalCollectedUSD} 
                valueLBP={totals.totalCollectedLBP} 
              />
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Courier Fees</div>
              <CurrencyDisplay 
                valueUSD={totals.totalCourierFeesUSD} 
                valueLBP={totals.totalCourierFeesLBP} 
              />
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Net Balance</div>
              <div className="flex flex-col items-center">
                <CurrencyDisplay 
                  valueUSD={Math.abs(totals.balanceUSD)} 
                  valueLBP={Math.abs(totals.balanceLBP)} 
                />
                <Badge 
                  variant={totals.direction === 'courier_to_admin' ? 'default' : 'destructive'}
                  className="mt-1 text-xs"
                >
                  {totals.direction === 'courier_to_admin' ? 'Courier → Admin' : 'Admin → Courier'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Collected</TableHead>
                  <TableHead>Courier Fee</TableHead>
                  <TableHead>Net</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedOrders.map((order) => {
                  const isEditing = editingFees[order.id];
                  const currentFees = feeChanges[order.id] || {
                    usd: order.courier_fee_usd || 2,
                    lbp: order.courier_fee_lbp || 75000
                  };
                  const netUSD = (order.collected_amount_usd || 0) - currentFees.usd;
                  const netLBP = (order.collected_amount_lbp || 0) - currentFees.lbp;

                  return (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">#{order.order_id}</div>
                          <div className="text-xs text-muted-foreground">
                            {order.reference_number}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{order.customer?.name || 'Unknown'}</TableCell>
                      <TableCell>
                        <CurrencyDisplay 
                          valueUSD={order.collected_amount_usd || 0} 
                          valueLBP={order.collected_amount_lbp || 0} 
                        />
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <div className="space-y-1">
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={isEditing.usd}
                                onChange={(e) => setEditingFees({
                                  ...editingFees,
                                  [order.id]: { ...isEditing, usd: Number(e.target.value) }
                                })}
                                className="w-20 h-8 text-xs"
                                placeholder="USD"
                              />
                              <Input
                                type="number"
                                step="1000"
                                min="0"
                                value={isEditing.lbp}
                                onChange={(e) => setEditingFees({
                                  ...editingFees,
                                  [order.id]: { ...isEditing, lbp: Number(e.target.value) }
                                })}
                                className="w-20 h-8 text-xs"
                                placeholder="LBP"
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleFeeSave(order.id)}
                                className="h-6 w-6 p-0"
                              >
                                <Save className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleFeeCancel(order.id)}
                                className="h-6 w-6 p-0"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <CurrencyDisplay 
                              valueUSD={currentFees.usd} 
                              valueLBP={currentFees.lbp} 
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleFeeEdit(order.id)}
                              className="h-6 w-6 p-0"
                            >
                              <Edit3 className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <CurrencyDisplay 
                          valueUSD={netUSD} 
                          valueLBP={netLBP} 
                        />
                      </TableCell>
                      <TableCell>
                        <Badge variant={order.status === 'Delivered' ? 'default' : 'destructive'}>
                          {order.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="settlement-notes">Settlement Notes (Optional)</Label>
            <Textarea
              id="settlement-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this settlement..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateSettlement}
              disabled={createSettlement.isPending || selectedOrders.length === 0}
              className="flex items-center gap-2"
            >
              <Calculator className="h-4 w-4" />
              Create Settlement
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSettlementModal;