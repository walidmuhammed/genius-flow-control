import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { OrderWithCustomer } from '@/services/orders';
import { ShippingLabel } from './ShippingLabel';
import { transformOrdersToLabelData, LabelData } from '@/services/labelData';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';
import { Printer, Download, ZoomIn, ZoomOut } from 'lucide-react';

export type LabelSize = 'A6' | 'A5' | 'A4';

interface PrintLabelModalProps {
  orders: OrderWithCustomer[];
  isOpen: boolean;
  onClose: () => void;
}

export const PrintLabelModal: React.FC<PrintLabelModalProps> = ({
  orders,
  isOpen,
  onClose
}) => {
  const [size, setSize] = useState<LabelSize>('A6');
  const [zoom, setZoom] = useState(1);
  const [labelData, setLabelData] = useState<LabelData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isOpen && orders.length > 0) {
      setIsLoading(true);
      transformOrdersToLabelData(orders)
        .then(setLabelData)
        .catch((error) => {
          console.error('Error transforming orders:', error);
          toast.error('Failed to prepare labels');
        })
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, orders]);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    pageStyle: `
      @page {
        size: ${size === 'A6' ? '105mm 148mm' : size === 'A5' ? '148mm 210mm' : '210mm 297mm'};
        margin: 0;
      }
      @media print {
        body { -webkit-print-color-adjust: exact; }
      }
    `,
    onAfterPrint: () => {
      toast.success('Labels sent to printer');
    },
    onPrintError: () => {
      toast.error('Print failed');
    }
  });

  const handleDownloadPDF = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const html2canvas = await import('html2canvas');
      
      if (!printRef.current) return;

      const canvas = await html2canvas.default(printRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: size === 'A6' ? [105, 148] : size === 'A5' ? [148, 210] : 'a4'
      });

      const imgWidth = size === 'A6' ? 105 : size === 'A5' ? 148 : 210;
      const imgHeight = size === 'A6' ? 148 : size === 'A5' ? 210 : 297;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`shipping-labels-${size.toLowerCase()}.pdf`);
      
      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    }
  };

  const zoomIn = () => setZoom(prev => Math.min(prev + 0.25, 2));
  const zoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            Print Shipping Label{orders.length > 1 ? 's' : ''} ({orders.length} order{orders.length > 1 ? 's' : ''})
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-6 h-full">
          {/* Controls */}
          <div className="w-64 flex-shrink-0 space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Label Size</label>
              <Select value={size} onValueChange={(value: LabelSize) => setSize(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A6">A6 (105×148mm) - Thermal</SelectItem>
                  <SelectItem value="A5">A5 (148×210mm) - Half Page</SelectItem>
                  <SelectItem value="A4">A4 (210×297mm) - Full Page</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Zoom</label>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={zoomOut}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm min-w-12 text-center">{Math.round(zoom * 100)}%</span>
                <Button variant="outline" size="sm" onClick={zoomIn}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Button onClick={handlePrint} className="w-full" disabled={isLoading}>
                <Printer className="h-4 w-4 mr-2" />
                Print Labels
              </Button>
              
              <Button onClick={handleDownloadPDF} variant="outline" className="w-full" disabled={isLoading}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>

            <div className="text-xs text-muted-foreground">
              <p>• Both QR Code and Barcode included</p>
              <p>• Ready for {size === 'A6' ? 'thermal printers' : size === 'A5' ? 'half-page printing' : 'full-page printing'}</p>
              <p>• Print at 100% scale</p>
            </div>
          </div>

          {/* Preview */}
          <div className="flex-1 overflow-auto bg-muted/20 rounded-lg p-4">
            <div 
              className="origin-top-left transition-transform duration-200"
              style={{ transform: `scale(${zoom})` }}
            >
              <div ref={printRef} className="bg-white">
                {isLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-muted-foreground">Preparing labels...</div>
                  </div>
                ) : (
                  labelData.map((data, index) => (
                    <div key={data.trackingNumber} className={index > 0 ? 'page-break-before' : ''}>
                      <ShippingLabel data={data} size={size} />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};