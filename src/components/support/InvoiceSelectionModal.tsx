
import React, { useState } from 'react';
import { Search, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useInvoices } from '@/hooks/use-invoices';
import type { Invoice } from '@/services/invoices';

interface InvoiceSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (invoice: Invoice) => void;
  selectedInvoiceId?: string;
}

const InvoiceSelectionModal: React.FC<InvoiceSelectionModalProps> = ({
  open,
  onOpenChange,
  onSelect,
  selectedInvoiceId
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: invoices = [] } = useInvoices();

  const filteredInvoices = invoices.filter(invoice => 
    invoice.invoice_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.merchant_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (invoice: Invoice) => {
    onSelect(invoice);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Invoice</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 flex-1 flex flex-col">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search invoices by ID or merchant..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-2">
            {filteredInvoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No invoices found</p>
              </div>
            ) : (
              filteredInvoices.map(invoice => (
                <div
                  key={invoice.id}
                  className={`p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                    selectedInvoiceId === invoice.id ? 'border-primary bg-primary/5' : ''
                  }`}
                  onClick={() => handleSelect(invoice)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">{invoice.invoice_id}</p>
                      <p className="text-sm text-muted-foreground">{invoice.merchant_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${invoice.net_payout_usd}</p>
                      <p className="text-sm text-muted-foreground">Net Payout</p>
                    </div>
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

export default InvoiceSelectionModal;
