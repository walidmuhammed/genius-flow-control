import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { DollarSign, Save, Loader2 } from 'lucide-react';
import { useGlobalPricing, useUpdateGlobalPricing } from '@/hooks/use-pricing';
import { formatCurrency } from '@/utils/format';

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

  const handleSave = () => {
    updateGlobalPricing.mutate({
      default_fee_usd: parseFloat(feeUsd),
      default_fee_lbp: parseFloat(feeLbp),
    });
  };

  const isFormValid = feeUsd && feeLbp && parseFloat(feeUsd) > 0 && parseFloat(feeLbp) > 0;
  const hasChanges = globalPricing && (
    parseFloat(feeUsd) !== globalPricing.default_fee_usd ||
    parseFloat(feeLbp) !== globalPricing.default_fee_lbp
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
                step="0.01"
                min="0"
                placeholder="4.00"
                value={feeUsd}
                onChange={(e) => setFeeUsd(e.target.value)}
                className="pl-9"
              />
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
                type="number"
                step="1000"
                min="0"
                placeholder="150000"
                value={feeLbp}
                onChange={(e) => setFeeLbp(e.target.value)}
                className="pl-12"
              />
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