
import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface ImportOrdersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ImportOrdersModal: React.FC<ImportOrdersModalProps> = ({
  open,
  onOpenChange
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
  };
  
  const handleImport = async () => {
    if (!file) {
      toast.error("Please select a CSV file to import");
      return;
    }
    
    // Check if it's a CSV file
    if (!file.name.endsWith('.csv')) {
      toast.error("Please upload a CSV file");
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Mock file upload - in a real implementation, this would call an API
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success(`Successfully imported ${file.name}`);
      setFile(null);
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to import orders");
      console.error("Import error:", error);
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Orders</DialogTitle>
          <DialogDescription>
            Upload a CSV file to import multiple orders at once.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6">
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
            <input
              id="file-upload"
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileChange}
            />
            <label htmlFor="file-upload" className="cursor-pointer text-center">
              <Upload className="mx-auto h-10 w-10 text-gray-400 mb-2" />
              <div className="text-sm font-medium">
                {file ? file.name : "Click to upload or drag and drop"}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                CSV files only (max 10MB)
              </p>
            </label>
          </div>
          
          {file && (
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
              <div className="flex items-center">
                <div className="flex-1 truncate">
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFile(null)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Remove
                </Button>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleImport} 
            disabled={!file || isUploading}
            className="bg-[#DB271E] text-white hover:bg-[#c0211a]"
          >
            {isUploading ? "Importing..." : "Import Orders"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
