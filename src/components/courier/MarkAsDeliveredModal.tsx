import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface MarkAsDeliveredModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: {
    collectedAmountUSD: number;
    collectedAmountLBP: number;
    note?: string;
  }) => void;
  originalAmount: {
    usd: number;
    lbp: number;
  };
}

const MarkAsDeliveredModal = ({ 
  open, 
  onOpenChange, 
  onConfirm, 
  originalAmount 
}: MarkAsDeliveredModalProps) => {
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      await onConfirm({
        collectedAmountUSD: originalAmount.usd,
        collectedAmountLBP: originalAmount.lbp,
        note: note.trim() || undefined
      });
      
      // Reset form
      setNote('');
      onOpenChange(false);
    } catch (error) {
      console.error('Error marking as delivered:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mark as Delivered</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amountUSD">Collected Amount (USD)</Label>
            <Input
              id="amountUSD"
              type="text"
              value={originalAmount.usd > 0 ? `$${originalAmount.usd}` : '$0'}
              readOnly
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amountLBP">Collected Amount (LBP)</Label>
            <Input
              id="amountLBP"
              type="text"
              value={originalAmount.lbp > 0 ? `${originalAmount.lbp.toLocaleString()} LBP` : '0 LBP'}
              readOnly
              className="bg-muted"
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