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
  const [amountUSD, setAmountUSD] = useState('');
  const [amountLBP, setAmountLBP] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason) {
      toast.error('Please select a reason');
      return;
    }

    const numAmountUSD = parseFloat(amountUSD) || 0;
    const numAmountLBP = parseFloat(amountLBP) || 0;

    if (numAmountUSD < 0 || numAmountLBP < 0) {
      toast.error('Please enter valid amounts');
      return;
    }

    setLoading(true);
    try {
      await onConfirm({
        reason,
        collectedAmountUSD: numAmountUSD > 0 ? numAmountUSD : undefined,
        collectedAmountLBP: numAmountLBP > 0 ? numAmountLBP : undefined,
        note: note.trim() || undefined
      });
      
      // Reset form
      setReason('');
      setAmountUSD('');
      setAmountLBP('');
      setNote('');
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
            <Label>Partial payment collected</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amountUSD">Amount (USD)</Label>
            <Input
              id="amountUSD"
              type="number"
              step="0.01"
              min="0"
              value={amountUSD}
              onChange={(e) => setAmountUSD(e.target.value)}
              placeholder="$0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amountLBP">Amount (LBP)</Label>
            <Input
              id="amountLBP"
              type="number"
              step="1"
              min="0"
              value={amountLBP}
              onChange={(e) => setAmountLBP(e.target.value)}
              placeholder="0 LBP"
            />
          </div>

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