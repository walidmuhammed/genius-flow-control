
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, Download, Upload } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';

interface ImportOrdersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ImportOrdersModal: React.FC<ImportOrdersModalProps> = ({ 
  open, 
  onOpenChange 
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type === 'text/csv') {
      setFile(files[0]);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };
  
  const handleUpload = () => {
    if (!file) return;
    
    setUploadState('uploading');
    
    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        setUploadState('success');
        setTimeout(() => {
          onOpenChange(false);
          setFile(null);
          setUploadProgress(0);
          setUploadState('idle');
        }, 1500);
      }
    }, 300);
  };
  
  const downloadTemplate = () => {
    // In a real app, this would download a CSV template file
    const csvContent = 'reference_number,customer_name,customer_phone,city,area,type,amount_usd,amount_lbp,delivery_charge_usd,delivery_charge_lbp,note\n,,,,,,,,,,';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'orders_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Import Orders</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-6 py-4">
            {uploadState !== 'success' && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  Import orders by uploading a CSV file with the required format.
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">
                    Don't have the template?
                  </p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-sm h-8 px-2 flex items-center gap-1"
                    onClick={downloadTemplate}
                  >
                    <Download className="h-3.5 w-3.5" /> 
                    Download CSV template
                  </Button>
                </div>
              </div>
            )}
            
            {uploadState === 'uploading' ? (
              <div className="space-y-4 py-8">
                <p className="text-center font-medium">Uploading file...</p>
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-center text-sm text-muted-foreground">
                  {uploadProgress}% complete
                </p>
              </div>
            ) : uploadState === 'success' ? (
              <div className="space-y-4 py-8 text-center">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mx-auto">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-base">Upload Successful</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your orders have been imported successfully.
                  </p>
                </div>
              </div>
            ) : (
              <div 
                className={`border-2 border-dashed rounded-lg p-8 ${isDragging ? 'border-[#DB271E] bg-[#DB271E]/5' : 'border-gray-300'} ${file ? 'bg-blue-50' : 'bg-white'} transition-colors duration-200 text-center`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className={`rounded-full p-3 ${file ? 'bg-blue-100' : 'bg-gray-100'}`}>
                    <Upload className={`h-6 w-6 ${file ? 'text-blue-600' : 'text-gray-500'}`} />
                  </div>
                  
                  {file ? (
                    <div className="space-y-2">
                      <p className="font-medium">File Selected: {file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="font-medium">Drag and drop your CSV file</p>
                      <p className="text-sm text-muted-foreground">or</p>
                    </div>
                  )}
                  
                  <div>
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#DB271E] hover:bg-[#c0211a]">
                        {file ? 'Choose different file' : 'Browse files'}
                      </span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        accept=".csv"
                        className="sr-only"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                  
                  {!file && (
                    <p className="text-xs text-muted-foreground">
                      Supported format: CSV
                    </p>
                  )}
                </div>
              </div>
            )}
            
            {uploadState === 'error' && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  There was an error uploading your file. Please try again.
                </AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2 mt-4">
              <h4 className="text-sm font-medium">Guidelines for importing orders:</h4>
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                <li>The CSV file must contain all required fields.</li>
                <li>Customer details must include full name and valid phone number.</li>
                <li>Make sure to specify the correct order type (Deliver, Exchange, Cash Collection, Return).</li>
                <li>Use the template for the correct format.</li>
              </ul>
            </div>
          </div>
        </ScrollArea>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button 
            disabled={!file || uploadState === 'uploading' || uploadState === 'success'}
            onClick={handleUpload}
          >
            Import Orders
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
