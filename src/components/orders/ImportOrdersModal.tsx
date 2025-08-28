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
import { ImportProgressIndicator } from './ImportProgressIndicator';
import { useGovernoratesAndCities } from '@/hooks/use-governorates-and-cities';
import { useSearchCustomersByPhone, useCreateOrUpdateCustomer } from '@/hooks/use-customers';
import { useCreateOrder } from '@/hooks/use-orders';
import { useAuth } from '@/hooks/useAuth';
import { parseCSVFile, downloadCSVTemplate, CSVParseResult, ParsedOrderRow } from '@/utils/csvParser';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logCustomerSearchDebug } from '@/utils/customerDebug';

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
  
  const handleUpdateOrder = (rowIndex: number, updatedOrder: ParsedOrderRow) => {
    if (!parseResult) return;
    
    const newOrders = [...parseResult.orders];
    newOrders[rowIndex] = updatedOrder;
    
    // Recalculate counts
    const validRows = newOrders.filter(o => o.isValid).length;
    const invalidRows = newOrders.length - validRows;
    
    setParseResult({
      ...parseResult,
      orders: newOrders,
      validRows,
      invalidRows,
      hasErrors: invalidRows > 0
    });
  };

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

        // Create or update customer with proper client association
        const customerPayload = {
          name: orderData.fullName,
          phone: orderData.phone,
          address: orderData.address,
          city_id: city.id,
          governorate_id: governorate.id,
          is_work_address: orderData.isWorkAddress,
        };

        // For imports, we need to determine the target client
        // If we're an admin importing for a specific client, use that client ID
        // Otherwise, use the current user's ID
        let targetClientId = user?.id;
        
        console.log('📦 Import: Creating customer for target client:', targetClientId);
        const customer = await createOrUpdateCustomer.mutateAsync({ 
          customer: customerPayload, 
          targetClientId 
        });

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
      <DialogContent className={`
        flex flex-col h-[95vh] max-h-[95vh] w-[95vw] max-w-none p-0
        ${step === 'preview' ? 'lg:max-w-[90vw] xl:max-w-7xl' : 'sm:max-w-2xl'}
      `}>
        {/* Fixed Header */}
        <DialogHeader className="flex-shrink-0 px-6 py-4 border-b bg-background">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <FileSpreadsheet className="h-6 w-6 text-primary" />
            Import Orders
            {step === 'preview' && parseResult && (
              <span className="text-sm font-normal text-muted-foreground">
                - {parseResult.totalRows} rows detected
              </span>
            )}
          </DialogTitle>
          
          {/* Progress Indicator */}
          <ImportProgressIndicator currentStep={step} />
        </DialogHeader>
        
        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-hidden">
          {step === 'upload' && (
            <ScrollArea className="h-full">
              <div className="space-y-6 p-6">
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-medium">Upload Your Orders</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Import multiple orders at once using a CSV file. Make sure your data follows our template format.
                  </p>
                </div>
                
                <div className="flex items-center justify-center">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-2"
                    onClick={downloadCSVTemplate}
                  >
                    <Download className="h-4 w-4" /> 
                    Download CSV Template
                  </Button>
                </div>
                
                <div 
                  className={`border-2 border-dashed rounded-xl p-10 transition-all duration-300 text-center ${
                    isDragging 
                      ? 'border-primary bg-primary/5 scale-[1.02]' 
                      : file 
                        ? 'border-green-300 bg-green-50' 
                        : 'border-border bg-background hover:border-primary/40 hover:bg-accent/20'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="flex flex-col items-center justify-center space-y-5">
                    <div className={`rounded-full p-4 transition-colors ${
                      file 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-primary/10 text-primary'
                    }`}>
                      <Upload className="h-8 w-8" />
                    </div>
                    
                    {file ? (
                      <div className="space-y-2">
                        <p className="font-semibold text-green-800">File Selected</p>
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024).toFixed(1)} KB • Ready to process
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="font-semibold text-foreground">Drag and drop your CSV file here</p>
                        <p className="text-sm text-muted-foreground">or click the button below to browse</p>
                      </div>
                    )}
                    
                    <div>
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <span className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-primary-foreground bg-primary hover:bg-primary/90 transition-colors shadow-sm">
                          {file ? 'Choose Different File' : 'Browse Files'}
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
                        Supports CSV and Excel files up to 10MB
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
            <div className="h-full">
              <OrderImportPreview
                parseResult={parseResult}
                onProceed={createOrdersFromData}
                onCancel={() => setStep('upload')}
                isCreating={false}
                onUpdateOrder={handleUpdateOrder}
              />
            </div>
          )}

          {step === 'creating' && (
            <div className="flex items-center justify-center h-full p-6">
              <div className="space-y-8 text-center max-w-md">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-6">
                  <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
                <h3 className="font-semibold text-xl mb-2">Creating Your Orders</h3>
                <p className="text-sm text-muted-foreground">
                  We're processing your orders and setting up customer profiles. This may take a few moments.
                </p>
                
                <div className="space-y-3">
                  <Progress value={creationProgress} className="h-3 rounded-full" />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{Math.round(creationProgress)}% complete</span>
                    <span className="text-muted-foreground">
                      {parseResult ? `${Math.ceil((creationProgress / 100) * parseResult.validRows)} of ${parseResult.validRows}` : ''}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="flex items-center justify-center h-full p-6">
              <div className="space-y-8 text-center max-w-md">
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100 mb-4">
                  <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-2xl text-green-800">Import Successful!</h3>
                  <p className="text-base text-muted-foreground">
                    Successfully imported <span className="font-semibold text-green-700">{successCount}</span> orders. 
                    They're now ready for processing and delivery.
                  </p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800">
                    Your orders have been added to your dashboard and are visible in the Orders section.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Fixed Footer */}
        {(step === 'upload' || step === 'success') && (
          <DialogFooter className="flex-shrink-0 px-6 py-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex gap-2 w-full sm:w-auto sm:justify-end">
              <Button 
                variant="outline" 
                onClick={onCloseModal}
                className="flex-1 sm:flex-none"
              >
                {step === 'success' ? 'Close' : 'Cancel'}
              </Button>
              {step === 'upload' && (
                <Button 
                  disabled={!file || locationLoading}
                  onClick={parseFile}
                  className="flex-1 sm:flex-none bg-primary hover:bg-primary/90"
                >
                  {locationLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                      Loading locations...
                    </div>
                  ) : (
                    'Validate & Preview'
                  )}
                </Button>
              )}
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};
