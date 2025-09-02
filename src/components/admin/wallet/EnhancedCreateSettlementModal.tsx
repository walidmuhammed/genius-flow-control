import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import CurrencyDisplay from '@/components/orders/CurrencyDisplay';
import { Calculator, Edit3, Save, X, AlertTriangle, CheckCircle, Undo2 } from 'lucide-react';
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

const EnhancedCreateSettlementModal: React.FC<CreateSettlementModalProps> = ({
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
  const [originalFees, setOriginalFees] = useState<Record<string, { usd: number; lbp: number }>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Filter selected orders
  const selectedOrders = orders.filter(order => selectedOrderIds.includes(order.id));

  // Initialize fees when modal opens
  useEffect(() => {
    if (isOpen) {
      const initialFees: Record<string, { usd: number; lbp: number }> = {};
      const originalFeesRecord: Record<string, { usd: number; lbp: number }> = {};
      
      selectedOrders.forEach(order => {
        const fees = {
          usd: order.courier_fee_usd || 2,
          lbp: order.courier_fee_lbp || 75000
        };
        initialFees[order.id] = fees;
        originalFeesRecord[order.id] = { ...fees };
      });
      
      setFeeChanges(initialFees);
      setOriginalFees(originalFeesRecord);
      setValidationErrors({});
    } else {
      // Reset when modal closes
      setNotes('');
      setEditingFees({});
      setFeeChanges({});
      setOriginalFees({});
      setValidationErrors({});
      setIsProcessing(false);
    }
  }, [isOpen, selectedOrders]);

  // Validate fees in real-time
  const validateFees = useCallback((orderId: string, fees: { usd: number; lbp: number }) => {
    const errors: Record<string, string> = { ...validationErrors };
    
    if (fees.usd < 0) {
      errors[`${orderId}_usd`] = 'USD fee cannot be negative';
    } else {
      delete errors[`${orderId}_usd`];
    }
    
    if (fees.lbp < 0) {
      errors[`${orderId}_lbp`] = 'LBP fee cannot be negative';
    } else {
      delete errors[`${orderId}_lbp`];
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).filter(key => key.startsWith(orderId)).length === 0;
  }, [validationErrors]);

  // Calculate totals with enhanced logic
  const calculateTotals = () => {
    let totalCollectedUSD = 0;
    let totalCollectedLBP = 0;
    let totalCourierFeesUSD = 0;
    let totalCourierFeesLBP = 0;
    let hasChanges = false;

    selectedOrders.forEach(order => {
      totalCollectedUSD += (order.collected_amount_usd || 0);
      totalCollectedLBP += (order.collected_amount_lbp || 0);
      
      const fees = feeChanges[order.id] || { 
        usd: order.courier_fee_usd || 2, 
        lbp: order.courier_fee_lbp || 75000 
      };
      totalCourierFeesUSD += fees.usd;
      totalCourierFeesLBP += fees.lbp;

      // Check if fees have been modified
      const original = originalFees[order.id];
      if (original && (fees.usd !== original.usd || fees.lbp !== original.lbp)) {
        hasChanges = true;
      }
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
      direction,
      hasChanges
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

  const handleFeeChange = (orderId: string, field: 'usd' | 'lbp', value: number) => {
    const newFees = { ...editingFees[orderId], [field]: value };
    setEditingFees({
      ...editingFees,
      [orderId]: newFees
    });
    validateFees(orderId, newFees);
  };

  const handleFeeSave = (orderId: string) => {
    const newFees = editingFees[orderId];
    if (newFees && validateFees(orderId, newFees)) {
      setFeeChanges({
        ...feeChanges,
        [orderId]: newFees
      });
      setEditingFees(prev => {
        const updated = { ...prev };
        delete updated[orderId];
        return updated;
      });
      toast.success('Fee updated successfully');
    } else {
      toast.error('Please fix validation errors before saving');
    }
  };

  const handleFeeCancel = (orderId: string) => {
    setEditingFees(prev => {
      const updated = { ...prev };
      delete updated[orderId];
      return updated;
    });
    // Clear validation errors for this order
    const newErrors = { ...validationErrors };
    Object.keys(newErrors).forEach(key => {
      if (key.startsWith(orderId)) {
        delete newErrors[key];
      }
    });
    setValidationErrors(newErrors);
  };

  const handleResetFee = (orderId: string) => {
    const originalFee = originalFees[orderId];
    if (originalFee) {
      setFeeChanges({
        ...feeChanges,
        [orderId]: { ...originalFee }
      });
      toast.success('Fee reset to original value');
    }
  };

  const handleCreateSettlement = async () => {
    if (Object.keys(validationErrors).length > 0) {
      toast.error('Please fix all validation errors before creating settlement');
      return;
    }

    setIsProcessing(true);
    try {
      // Update changed fees with batching for better performance
      const feeUpdatePromises = Object.entries(feeChanges)
        .filter(([orderId, fees]) => {
          const originalOrder = selectedOrders.find(o => o.id === orderId);
          const original = originalFees[orderId];
          return originalOrder && original && 
                 (fees.usd !== original.usd || fees.lbp !== original.lbp);
        })
        .map(([orderId, fees]) => adjustCourierFeeInOrder(orderId, fees.usd, fees.lbp));

      if (feeUpdatePromises.length > 0) {
        await Promise.all(feeUpdatePromises);
        toast.success(`Updated fees for ${feeUpdatePromises.length} orders`);
      }

      // Create the settlement
      await createSettlement.mutateAsync({
        courier_id: courierId,
        order_ids: selectedOrderIds,
        notes: notes.trim()
      });

      onClose();
      toast.success(`Settlement created successfully for ${courierName}`);
    } catch (error) {
      console.error('Error creating settlement:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create settlement';
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  const hasValidationErrors = Object.keys(validationErrors).length > 0;
  const canCreateSettlement = selectedOrders.length > 0 && !hasValidationErrors && !isProcessing;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Create Settlement for {courierName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Enhanced Settlement Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Settlement Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Orders Selected</div>
                  <div className="text-2xl font-bold text-primary">{selectedOrders.length}</div>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Total Collected</div>
                  <CurrencyDisplay 
                    valueUSD={totals.totalCollectedUSD} 
                    valueLBP={totals.totalCollectedLBP} 
                  />
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Courier Fees</div>
                  <div className="flex flex-col items-center">
                    <CurrencyDisplay 
                      valueUSD={totals.totalCourierFeesUSD} 
                      valueLBP={totals.totalCourierFeesLBP} 
                    />
                    {totals.hasChanges && (
                      <Badge variant="secondary" className="mt-1 text-xs">
                        <Edit3 className="h-3 w-3 mr-1" />
                        Modified
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Net Balance</div>
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
            </CardContent>
          </Card>

          {/* Validation Alerts */}
          {hasValidationErrors && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Please fix the validation errors in the fee fields below before creating the settlement.
              </AlertDescription>
            </Alert>
          )}

          {totals.hasChanges && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                You have modified courier fees. These changes will be saved before creating the settlement.
              </AlertDescription>
            </Alert>
          )}

          {/* Enhanced Orders Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Details & Fee Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Collected</TableHead>
                      <TableHead className="min-w-[200px]">Courier Fee</TableHead>
                      <TableHead>Net Amount</TableHead>
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
                      const original = originalFees[order.id];
                      const hasChanged = original && 
                        (currentFees.usd !== original.usd || currentFees.lbp !== original.lbp);
                      const netUSD = (order.collected_amount_usd || 0) - currentFees.usd;
                      const netLBP = (order.collected_amount_lbp || 0) - currentFees.lbp;

                      return (
                        <TableRow key={order.id} className={hasChanged ? 'bg-yellow-50' : undefined}>
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
                                <div className="space-y-2">
                                  <div>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      value={isEditing.usd}
                                      onChange={(e) => handleFeeChange(order.id, 'usd', Number(e.target.value))}
                                      className={`w-20 h-8 text-xs ${
                                        validationErrors[`${order.id}_usd`] ? 'border-destructive' : ''
                                      }`}
                                      placeholder="USD"
                                    />
                                    {validationErrors[`${order.id}_usd`] && (
                                      <div className="text-xs text-destructive mt-1">
                                        {validationErrors[`${order.id}_usd`]}
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <Input
                                      type="number"
                                      step="1000"
                                      min="0"
                                      value={isEditing.lbp}
                                      onChange={(e) => handleFeeChange(order.id, 'lbp', Number(e.target.value))}
                                      className={`w-24 h-8 text-xs ${
                                        validationErrors[`${order.id}_lbp`] ? 'border-destructive' : ''
                                      }`}
                                      placeholder="LBP"
                                    />
                                    {validationErrors[`${order.id}_lbp`] && (
                                      <div className="text-xs text-destructive mt-1">
                                        {validationErrors[`${order.id}_lbp`]}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex flex-col gap-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleFeeSave(order.id)}
                                    className="h-6 w-6 p-0"
                                    disabled={!!validationErrors[`${order.id}_usd`] || !!validationErrors[`${order.id}_lbp`]}
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
                                <div className="flex-1">
                                  <CurrencyDisplay 
                                    valueUSD={currentFees.usd} 
                                    valueLBP={currentFees.lbp} 
                                  />
                                  {hasChanged && (
                                    <Badge variant="secondary" className="mt-1 text-xs">
                                      Modified
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleFeeEdit(order.id)}
                                    className="h-6 w-6 p-0"
                                  >
                                    <Edit3 className="h-3 w-3" />
                                  </Button>
                                  {hasChanged && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleResetFee(order.id)}
                                      className="h-6 w-6 p-0"
                                      title="Reset to original fee"
                                    >
                                      <Undo2 className="h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
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
                            <Badge variant={order.status === 'Successful' ? 'default' : 'destructive'}>
                              {order.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Notes Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Settlement Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="settlement-notes">Add notes about this settlement (optional)</Label>
                <Textarea
                  id="settlement-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter any relevant notes about this settlement, fee adjustments, or special circumstances..."
                  rows={3}
                  className="resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {selectedOrders.length} orders selected • {totals.hasChanges ? 'Fee changes detected' : 'No changes'}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} disabled={isProcessing}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateSettlement}
                disabled={!canCreateSettlement}
                className="flex items-center gap-2"
              >
                <Calculator className="h-4 w-4" />
                {isProcessing ? 'Creating Settlement...' : 'Create Settlement'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedCreateSettlementModal;