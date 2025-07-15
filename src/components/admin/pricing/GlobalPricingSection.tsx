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

  // Validation functions
  const validateUsd = (value: string) => {
    const num = parseFloat(value);
    return !isNaN(num) && num >= 0 && (num * 2) % 1 === 0; // Check if it's a 0.5 increment
  };

  const validateLbp = (value: string) => {
    const num = parseInt(value.replace(/,/g, ''));
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
    const usdValue = parseFloat(feeUsd);
    const lbpValue = parseInt(feeLbp.replace(/,/g, ''));
    
    // Validate USD is 0.5 increment
    if (!validateUsd(feeUsd)) {
      toast.error("USD fee must be in 0.5 increments (e.g., 2.0, 2.5, 3.0, 4.5)");
      return;
    }
    
    // Validate LBP is thousands
    if (!validateLbp(feeLbp)) {
      toast.error("LBP fee must be in thousands (e.g., 1,000, 150,000, 200,000)");
      return;
    }

    updateGlobalPricing.mutate({
      default_fee_usd: usdValue,
      default_fee_lbp: lbpValue,
    });
  };

  const isFormValid = feeUsd && feeLbp && validateUsd(feeUsd) && validateLbp(feeLbp);
  const hasChanges = globalPricing && (
    parseFloat(feeUsd) !== globalPricing.default_fee_usd ||
    parseInt(feeLbp.replace(/,/g, '')) !== globalPricing.default_fee_lbp
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
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="fee-usd"
                type="number"
                step="0.5"
                min="0"
                placeholder="4.00"
                value={feeUsd}
                onChange={(e) => handleUsdChange(e.target.value)}
                className={`pl-9 ${!validateUsd(feeUsd) && feeUsd ? 'border-destructive' : ''}`}
              />
              {!validateUsd(feeUsd) && feeUsd && (
                <div className="flex items-center gap-1 text-xs text-destructive mt-1">
                  <AlertTriangle className="h-3 w-3" />
                  Must be in 0.5 increments (e.g., 2.0, 2.5, 3.0)
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fee-lbp">Default Fee (LBP)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                L.L.
              </span>
              <Input
                id="fee-lbp"
                type="text"
                placeholder="150,000"
                value={feeLbp ? parseInt(feeLbp.replace(/,/g, '')).toLocaleString() : ''}
                onChange={(e) => handleLbpChange(e.target.value)}
                className={`pl-12 ${!validateLbp(feeLbp) && feeLbp ? 'border-destructive' : ''}`}
              />
              {!validateLbp(feeLbp) && feeLbp && (
                <div className="flex items-center gap-1 text-xs text-destructive mt-1">
                  <AlertTriangle className="h-3 w-3" />
                  Must be in thousands (e.g., 1,000, 150,000)
                </div>
              )}
            </div>
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