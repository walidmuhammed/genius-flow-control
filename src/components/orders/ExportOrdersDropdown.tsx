
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface ExportOrdersDropdownProps {
  selectedOrdersCount?: number;
  totalFilteredCount?: number;
  className?: string;
}

export const ExportOrdersDropdown: React.FC<ExportOrdersDropdownProps> = ({
  selectedOrdersCount = 0,
  totalFilteredCount = 0,
  className
}) => {
  const [open, setOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<string | null>("excel");
  
  const handleExport = () => {
    if (!selectedOption) {
      toast.error("Please select what to export");
      return;
    }
    
    toast.success(`Exporting ${selectedOption} as ${selectedFormat === 'excel' ? 'Excel CSV' : 'Plain CSV'}`);
    setOpen(false);
    // In a real app, this would trigger an API call to export data
  };
  
  return (
    <>
      <Button variant="outline" size="sm" className={className} onClick={() => setOpen(true)}>
        <Download className="mr-2 h-4 w-4" />
        Export
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg">Export Orders</DialogTitle>
          </DialogHeader>
          
          <div className="py-4 space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700">What do you want to export?</h3>
              <RadioGroup value={selectedOption || ""} onValueChange={setSelectedOption} className="space-y-3">
                <div className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-muted/30 transition-colors">
                  <RadioGroupItem value="current" id="current" />
                  <Label htmlFor="current" className="flex-1 cursor-pointer">Current Page</Label>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </div>
                
                <div className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-muted/30 transition-colors">
                  <RadioGroupItem value="all" id="all" />
                  <Label htmlFor="all" className="flex-1 cursor-pointer">All Orders</Label>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </div>
                
                {selectedOrdersCount > 0 && (
                  <div className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-muted/30 transition-colors">
                    <RadioGroupItem value={`selected (${selectedOrdersCount})`} id="selected" />
                    <Label htmlFor="selected" className="flex-1 cursor-pointer">
                      Selected Orders ({selectedOrdersCount})
                    </Label>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
                
                {totalFilteredCount > 0 && (
                  <div className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-muted/30 transition-colors">
                    <RadioGroupItem value={`filtered (${totalFilteredCount})`} id="filtered" />
                    <Label htmlFor="filtered" className="flex-1 cursor-pointer">
                      Orders matching search ({totalFilteredCount})
                    </Label>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
                
                <div className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-muted/30 transition-colors">
                  <RadioGroupItem value="date-range" id="date-range" />
                  <Label htmlFor="date-range" className="flex-1 cursor-pointer">Orders by Date Range</Label>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700">Format</h3>
              <RadioGroup value={selectedFormat || ""} onValueChange={setSelectedFormat} className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="excel" id="excel" />
                  <Label htmlFor="excel">CSV for Excel</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="plain" id="plain" />
                  <Label htmlFor="plain">Plain CSV</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleExport} 
              disabled={!selectedOption}
              className={!selectedOption ? "opacity-50" : ""}
            >
              <Download className="mr-2 h-4 w-4" />
              Export {selectedOption ? selectedOption : ""}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
