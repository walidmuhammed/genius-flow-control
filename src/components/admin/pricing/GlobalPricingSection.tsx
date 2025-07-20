import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { DollarSign, Save, Loader2, AlertTriangle } from 'lucide-react';
import { useGlobalPricing, useUpdateGlobalPricing } from '@/hooks/use-pricing';
import { formatCurrency } from '@/utils/format';
import { toast } from 'sonner';

const GlobalPricingSection = () => {
  const { data: globalPricing, isLoading } = useGlobalPricing();
  const updateGlobalPricing = useUpdateGlobalPricing();
  
  const [feeUsd, setFeeUsd] = useState('');
  const [feeLbp, setFeeLbp] = useState('');

  useEffect(() => {
    if (globalPricing) {
      setFeeUsd(globalPricing.default_fee_usd.toString());
      setFeeLbp(globalPricing.default_fee_lbp.toString());
    }
  }, [globalPricing]);

  // Validation functions - allow 0 values and empty strings
  const validateUsd = (value: string) => {
    if (!value || value === '') return true; // Allow empty - will default to 0
    const num = parseFloat(value);
    return !isNaN(num) && num >= 0 && (num * 2) % 1 === 0; // Check if it's a 0.5 increment
  };

  const validateLbp = (value: string) => {
    if (!value || value === '') return true; // Allow empty - will default to 0
    const cleanValue = value.replace(/,/g, '');
    const num = parseInt(cleanValue);
    return !isNaN(num) && num >= 0 && num % 1000 === 0; // Check if it's a thousand
  };

  const handleUsdChange = (value: string) => {
    setFeeUsd(value);
  };

  const handleLbpChange = (value: string) => {
    // Allow only numbers and commas
    const cleanValue = value.replace(/[^\d,]/g, '');
    setFeeLbp(cleanValue);
  };

  const handleSave = () => {
    if (!validateUsd(feeUsd) || !validateLbp(feeLbp)) {
      toast.error("Please enter valid values");
      return;
    }

    const data = {
      default_fee_usd: feeUsd ? parseFloat(feeUsd) : 0, // Default to 0 if empty
      default_fee_lbp: feeLbp ? parseInt(feeLbp.replace(/,/g, '')) : 0, // Default to 0 if empty
    };

    updateGlobalPricing.mutate(data);
  };

  const isFormValid = validateUsd(feeUsd) && validateLbp(feeLbp); // Remove requirement for both fields
  const hasChanges = globalPricing && (
    (feeUsd ? parseFloat(feeUsd) : 0) !== globalPricing.default_fee_usd ||
    (feeLbp ? parseInt(feeLbp.replace(/,/g, '')) : 0) !== globalPricing.default_fee_lbp
  );

  if (isLoading) {
    return (
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-1/3"></div>
            <div className="h-10 bg-muted rounded"></div>
            <div className="h-10 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          Global Default Pricing
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Set the default delivery fee applied to all clients unless overridden
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="fee-usd">Default Fee (USD)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
              <Input
                id="fee-usd"
                type="number"
                step="0.5"
                min="0"
                placeholder="0.00"
                value={feeUsd}
                onChange={(e) => handleUsdChange(e.target.value)}
                className={`pl-9 ${!validateUsd(feeUsd) && feeUsd ? 'border-destructive' : ''}`}
                disabled={updateGlobalPricing.isPending}
              />
              {!validateUsd(feeUsd) && feeUsd && (
                <div className="flex items-center gap-1 text-xs text-destructive mt-1">
                  <AlertTriangle className="h-3 w-3" />
                  Must be in 0.5 increments (e.g., 2.0, 2.5, 3.0)
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Leave empty for $0.00</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fee-lbp">Default Fee (LBP)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground z-10">
                L.L.
              </span>
              <Input
                id="fee-lbp"
                type="text"
                placeholder="0"
                value={feeLbp ? parseInt(feeLbp.replace(/,/g, '')).toLocaleString() : ''}
                onChange={(e) => handleLbpChange(e.target.value)}
                className={`pl-12 ${!validateLbp(feeLbp) && feeLbp ? 'border-destructive' : ''}`}
                disabled={updateGlobalPricing.isPending}
              />
              {!validateLbp(feeLbp) && feeLbp && (
                <div className="flex items-center gap-1 text-xs text-destructive mt-1">
                  <AlertTriangle className="h-3 w-3" />
                  Must be in thousands (e.g., 1,000, 150,000)
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Leave empty for L.L. 0</p>
          </div>
        </div>

        {globalPricing && (
          <>
            <Separator />
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="text-sm font-medium mb-2">Current Global Defaults:</div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>USD: {formatCurrency(globalPricing.default_fee_usd, 'USD')}</span>
                <span>•</span>
                <span>LBP: {formatCurrency(globalPricing.default_fee_lbp, 'LBP')}</span>
              </div>
            </div>
          </>
        )}

        <div className="flex items-center gap-3">
          <Button 
            onClick={handleSave}
            disabled={!isFormValid || !hasChanges || updateGlobalPricing.isPending}
            className="min-w-[120px]"
          >
            {updateGlobalPricing.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
          
          {hasChanges && (
            <span className="text-sm text-amber-600 dark:text-amber-400">
              You have unsaved changes
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default GlobalPricingSection;