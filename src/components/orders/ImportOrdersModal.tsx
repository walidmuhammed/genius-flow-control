
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, Download, Upload, FileSpreadsheet } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { OrderImportPreview } from './OrderImportPreview';
import { useGovernoratesAndCities } from '@/hooks/use-governorates-and-cities';
import { useCreateOrUpdateCustomer } from '@/hooks/use-customers';
import { useCreateOrder } from '@/hooks/use-orders';
import { useAuth } from '@/hooks/useAuth';
import { parseCSVFile, downloadCSVTemplate, CSVParseResult, ParsedOrderRow } from '@/utils/csvParser';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ImportOrdersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ImportStep = 'upload' | 'preview' | 'creating' | 'success';

export const ImportOrdersModal: React.FC<ImportOrdersModalProps> = ({ 
  open, 
  onOpenChange 
}) => {
  const { user } = useAuth();
  const [step, setStep] = useState<ImportStep>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [parseResult, setParseResult] = useState<CSVParseResult | null>(null);
  const [creationProgress, setCreationProgress] = useState(0);
  const [successCount, setSuccessCount] = useState(0);

  // Hooks for data fetching and mutations
  const { data: governoratesData, isLoading: locationLoading } = useGovernoratesAndCities();
  const createOrUpdateCustomer = useCreateOrUpdateCustomer();
  const createOrder = useCreateOrder();

  const resetModal = () => {
    setStep('upload');
    setFile(null);
    setParseResult(null);
    setCreationProgress(0);
    setSuccessCount(0);
  };

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
    if (files.length > 0) {
      const droppedFile = files[0];
      if (droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.csv')) {
        setFile(droppedFile);
      } else {
        toast.error('Please select a CSV file');
      }
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const parseFile = async () => {
    if (!file || !governoratesData) {
      toast.error('Please select a file and wait for location data to load');
      return;
    }

    try {
      const fileContent = await file.text();
      const result = parseCSVFile(fileContent, governoratesData);
      setParseResult(result);
      setStep('preview');
      
      toast.success(`Parsed ${result.totalRows} rows: ${result.validRows} valid, ${result.invalidRows} invalid`);
    } catch (error: any) {
      console.error('Error parsing CSV:', error);
      toast.error(`Failed to parse CSV: ${error.message}`);
    }
  };

  const createOrdersFromData = async () => {
    if (!parseResult || !governoratesData) return;

    setStep('creating');
    const validOrders = parseResult.orders.filter(order => order.isValid);
    let successCount = 0;
    let failedCount = 0;

    for (let i = 0; i < validOrders.length; i++) {
      try {
        const orderData = validOrders[i];
        
        // Find governorate and city data
        const governorate = governoratesData.find(g => 
          g.name.toLowerCase() === orderData.governorate.toLowerCase()
        );
        const city = governorate?.cities?.find((c: any) => 
          c.name.toLowerCase() === orderData.city.toLowerCase()
        );

        if (!governorate || !city) {
          throw new Error(`Location data not found for ${orderData.governorate}, ${orderData.city}`);
        }

        // Create or update customer
        const customerPayload = {
          name: orderData.fullName,
          phone: orderData.phone,
          address: orderData.address,
          city_id: city.id,
          governorate_id: governorate.id,
          is_work_address: orderData.isWorkAddress,
        };

        const customer = await createOrUpdateCustomer.mutateAsync(customerPayload);

        // Use comprehensive pricing service directly instead of fetch
        const deliveryFeesResponse = await supabase
          .rpc('calculate_comprehensive_delivery_fee', {
            p_client_id: user?.id,
            p_governorate_id: governorate.id,
            p_city_id: city.id,
            p_package_type: orderData.packageType === 'parcel' ? 'Parcel' : 
                          orderData.packageType === 'document' ? 'Document' : 'Bulky'
          });

        const deliveryFees = deliveryFeesResponse.data?.[0] || { 
          total_fee_usd: 5, 
          total_fee_lbp: 150000 
        };

        // Create order
        const orderPayload = {
          type: orderData.orderType === 'Shipment' ? 'Deliver' : orderData.orderType,
          customer_id: customer.id,
          package_type: orderData.packageType,
          package_description: orderData.packageDescription || undefined,
          items_count: orderData.itemsCount,
          allow_opening: orderData.allowInspection,
          cash_collection_enabled: orderData.usdAmount > 0 || orderData.lbpAmount > 0,
          cash_collection_usd: orderData.usdAmount,
          cash_collection_lbp: orderData.lbpAmount,
          delivery_fees_usd: deliveryFees.total_fee_usd || 5,
          delivery_fees_lbp: deliveryFees.total_fee_lbp || 150000,
          note: orderData.deliveryNotes || undefined,
          ...(orderData.orderReference && { reference_number: orderData.orderReference }),
          status: 'New'
        };

        await createOrder.mutateAsync(orderPayload as any);
        successCount++;
        
      } catch (error) {
        console.error(`Error creating order ${i + 1}:`, error);
        failedCount++;
      }

      setCreationProgress(((i + 1) / validOrders.length) * 100);
    }

    setSuccessCount(successCount);
    setStep('success');
    
    if (successCount > 0) {
      toast.success(`Successfully imported ${successCount} orders!`);
    }
    if (failedCount > 0) {
      toast.error(`Failed to import ${failedCount} orders`);
    }
  };

  const onCloseModal = () => {
    resetModal();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onCloseModal}>
      <DialogContent className={step === 'preview' ? "sm:max-w-7xl" : "sm:max-w-2xl"}>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Import Orders
            {step === 'preview' && parseResult && (
              <span className="text-sm font-normal text-muted-foreground">
                - {parseResult.totalRows} rows detected
              </span>
            )}
          </DialogTitle>
        </DialogHeader>
        
        {step === 'upload' && (
          <ScrollArea className="max-h-[70vh]">
            <div className="space-y-6 py-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  Import orders by uploading a CSV file. Use our template for the correct format.
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">
                    Need the template?
                  </p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-sm h-8 px-2 flex items-center gap-1"
                    onClick={downloadCSVTemplate}
                  >
                    <Download className="h-3.5 w-3.5" /> 
                    Download CSV Template
                  </Button>
                </div>
              </div>
              
              <div 
                className={`border-2 border-dashed rounded-lg p-8 ${
                  isDragging ? 'border-primary bg-primary/5' : 'border-gray-300'
                } ${file ? 'bg-blue-50' : 'bg-white'} transition-colors duration-200 text-center`}
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
                      <p className="text-sm text-muted-foreground">or click to browse</p>
                    </div>
                  )}
                  
                  <div>
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90">
                        {file ? 'Choose different file' : 'Browse Files'}
                      </span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        accept=".csv,.xlsx"
                        className="sr-only"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                  
                  {!file && (
                    <p className="text-xs text-muted-foreground">
                      Supported formats: CSV, Excel (.xlsx)
                    </p>
                  )}
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Required Fields:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <div>• Full Name*</div>
                  <div>• Phone Number*</div>
                  <div>• Governorate*</div>
                  <div>• City*</div>
                  <div>• Address Details*</div>
                  <div>• Order Type* (Shipment/Exchange)</div>
                </div>
                <h4 className="text-sm font-medium mt-4">Optional Fields:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <div>• Package Type</div>
                  <div>• Package Description</div>
                  <div>• USD/LBP Amounts</div>
                  <div>• Work Address (true/false)</div>
                  <div>• Allow Inspection</div>
                  <div>• Order Reference</div>
                </div>
              </div>
            </div>
          </ScrollArea>
        )}

        {step === 'preview' && parseResult && (
          <OrderImportPreview
            parseResult={parseResult}
            onProceed={createOrdersFromData}
            onCancel={() => setStep('upload')}
            isCreating={false}
          />
        )}

        {step === 'creating' && (
          <div className="space-y-6 py-8">
            <div className="text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 mb-4">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
              <p className="font-medium text-lg">Creating Orders...</p>
              <p className="text-sm text-muted-foreground">
                Please wait while we create your orders
              </p>
            </div>
            
            <div className="space-y-2">
              <Progress value={creationProgress} className="h-2" />
              <p className="text-center text-sm text-muted-foreground">
                {Math.round(creationProgress)}% complete
              </p>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="space-y-6 py-8 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-lg">Import Complete!</p>
              <p className="text-sm text-muted-foreground mt-2">
                Successfully imported {successCount} orders.
              </p>
            </div>
          </div>
        )}
        
        {(step === 'upload' || step === 'success') && (
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={onCloseModal}
            >
              {step === 'success' ? 'Close' : 'Cancel'}
            </Button>
            {step === 'upload' && (
              <Button 
                disabled={!file || locationLoading}
                onClick={parseFile}
              >
                {locationLoading ? 'Loading...' : 'Continue'}
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};
