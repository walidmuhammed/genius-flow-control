import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface MarkAsUnsuccessfulModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: {
    reason: string;
    collectedAmountUSD?: number;
    collectedAmountLBP?: number;
    collectedCurrency?: 'USD' | 'LBP';
    note?: string;
  }) => void;
}

const unsuccessfulReasons = [
  'Customer absent',
  'Customer refused',
  'Wrong address',
  'Incomplete payment',
  'Other'
];

const MarkAsUnsuccessfulModal = ({ 
  open, 
  onOpenChange, 
  onConfirm 
}: MarkAsUnsuccessfulModalProps) => {
  const [reason, setReason] = useState('');
  const [hasPartialPayment, setHasPartialPayment] = useState(false);
  const [currency, setCurrency] = useState<'USD' | 'LBP'>('USD');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason) {
      toast.error('Please select a reason');
      return;
    }

    let collectedAmountUSD = 0;
    let collectedAmountLBP = 0;
    let collectedCurrency: 'USD' | 'LBP' | undefined = undefined;

    if (hasPartialPayment && amount) {
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount < 0) {
        toast.error('Please enter a valid amount');
        return;
      }
      
      collectedAmountUSD = currency === 'USD' ? numAmount : 0;
      collectedAmountLBP = currency === 'LBP' ? numAmount : 0;
      collectedCurrency = currency;
    }

    setLoading(true);
    try {
      await onConfirm({
        reason,
        collectedAmountUSD: collectedAmountUSD || undefined,
        collectedAmountLBP: collectedAmountLBP || undefined,
        collectedCurrency,
        note: note.trim() || undefined
      });
      
      // Reset form
      setReason('');
      setHasPartialPayment(false);
      setAmount('');
      setNote('');
      setCurrency('USD');
      onOpenChange(false);
    } catch (error) {
      console.error('Error marking as unsuccessful:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mark as Unsuccessful</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Unsuccessful Delivery</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {unsuccessfulReasons.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="hasPartialPayment"
                checked={hasPartialPayment}
                onChange={(e) => setHasPartialPayment(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="hasPartialPayment">Partial payment collected</Label>
            </div>
          </div>

          {hasPartialPayment && (
            <>
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
                  Partial Amount {currency === 'USD' ? '($)' : '(LBP)'}
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step={currency === 'USD' ? '0.01' : '1'}
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={currency === 'USD' ? '0.00' : '0'}
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="note">Additional Notes (Optional)</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Any additional details about why delivery was unsuccessful..."
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
              variant="destructive"
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Marking...' : 'Mark as Unsuccessful'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MarkAsUnsuccessfulModal;