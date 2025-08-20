import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface MarkAsDeliveredModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: {
    collectedAmountUSD: number;
    collectedAmountLBP: number;
    collectedCurrency: 'USD' | 'LBP';
    note?: string;
  }) => void;
  expectedAmount?: {
    usd: number;
    lbp: number;
  };
}

const MarkAsDeliveredModal = ({ 
  open, 
  onOpenChange, 
  onConfirm, 
  expectedAmount 
}: MarkAsDeliveredModalProps) => {
  const [currency, setCurrency] = useState<'USD' | 'LBP'>('USD');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      await onConfirm({
        collectedAmountUSD: currency === 'USD' ? numAmount : 0,
        collectedAmountLBP: currency === 'LBP' ? numAmount : 0,
        collectedCurrency: currency,
        note: note.trim() || undefined
      });
      
      // Reset form
      setAmount('');
      setNote('');
      setCurrency('USD');
      onOpenChange(false);
    } catch (error) {
      console.error('Error marking as delivered:', error);
    } finally {
      setLoading(false);
    }
  };

  const expectedAmountDisplay = expectedAmount ? 
    (currency === 'USD' ? `$${expectedAmount.usd}` : `${expectedAmount.lbp.toLocaleString()} LBP`) : '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mark as Delivered</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select value={currency} onValueChange={(value: 'USD' | 'LBP') => setCurrency(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="LBP">LBP (ل.ل)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">
              Collected Amount {currency === 'USD' ? '($)' : '(LBP)'}
              {expectedAmountDisplay && (
                <span className="text-sm text-muted-foreground ml-2">
                  Expected: {expectedAmountDisplay}
                </span>
              )}
            </Label>
            <Input
              id="amount"
              type="number"
              step={currency === 'USD' ? '0.01' : '1'}
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={currency === 'USD' ? '0.00' : '0'}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Delivery Note (Optional)</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Any additional notes about the delivery..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Marking...' : 'Mark as Delivered'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MarkAsDeliveredModal;