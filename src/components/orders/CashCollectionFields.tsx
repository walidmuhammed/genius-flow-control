
import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Info } from 'lucide-react';

interface CashCollectionFieldsProps {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  usdAmount: string;
  lbpAmount: string;
  onUsdAmountChange: (value: string) => void;
  onLbpAmountChange: (value: string) => void;
  deliveryFees: {
    usd: number;
    lbp: number;
  };
}

const CashCollectionFields: React.FC<CashCollectionFieldsProps> = ({
  enabled,
  onEnabledChange,
  usdAmount,
  lbpAmount,
  onUsdAmountChange,
  onLbpAmountChange,
  deliveryFees
}) => {
  const [validationError, setValidationError] = useState<string | null>(null);

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  };

  // Validate the fields when values change
  useEffect(() => {
    if (enabled) {
      const usd = parseFloat(usdAmount) || 0;
      const lbp = parseFloat(lbpAmount) || 0;
      if (usd <= 0 && lbp <= 0) {
        setValidationError("At least one currency amount must be greater than 0");
      } else {
        setValidationError(null);
      }
    } else {
      setValidationError(null);
    }
  }, [enabled, usdAmount, lbpAmount]);

  // Handle USD amount change with validation
  const handleUsdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const isValid = !value || /^\d*\.?\d*$/.test(value);
    if (isValid) {
      onUsdAmountChange(value);
    }
  };

  // Handle LBP amount change with validation
  const handleLbpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const isValid = !value || /^\d*$/.test(value);
    if (isValid) {
      onLbpAmountChange(value);
    }
  };

  // Handle checkbox toggle
  const handleToggle = (checked: boolean | "indeterminate") => {
    const isChecked = checked === true;
    onEnabledChange(isChecked);
    if (!isChecked) {
      onUsdAmountChange('0');
      onLbpAmountChange('0');
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-start space-x-3 mb-5">
        <Checkbox 
          id="cash-collection"
          checked={enabled}
          onCheckedChange={handleToggle}
          className="mt-1"
        />
        <div className="space-y-1.5">
          <label 
            htmlFor="cash-collection" 
            className="text-base font-medium leading-none cursor-pointer"
          >
            Cash collection
          </label>
          <p className="text-sm text-gray-500">
            Your customer shall pay this amount to courier upon delivery.
          </p>
        </div>
      </div>
      
      <div className="space-y-5 pl-7">
        <div className="space-y-2.5 transition-opacity duration-200" style={{ opacity: enabled ? 1 : 0.6 }}>
          <div className="flex items-center justify-between">
            <Label htmlFor="usd-amount" className="text-sm font-medium">USD Amount</Label>
            {enabled && parseFloat(usdAmount) > 0 && (
              <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                Active
              </span>
            )}
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <Input
              id="usd-amount"
              type="text"
              value={usdAmount}
              onChange={handleUsdChange}
              placeholder="0.00"
              disabled={!enabled}
              className="pl-7 transition-all border-gray-200 focus:border-primary/50"
            />
          </div>
        </div>
        
        <div className="space-y-2.5 transition-opacity duration-200" style={{ opacity: enabled ? 1 : 0.6 }}>
          <div className="flex items-center justify-between">
            <Label htmlFor="lbp-amount" className="text-sm font-medium">LBP Amount</Label>
            {enabled && parseFloat(lbpAmount) > 0 && (
              <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                Active
              </span>
            )}
          </div>
          <Input
            id="lbp-amount"
            type="text"
            value={lbpAmount}
            onChange={handleLbpChange}
            placeholder="0"
            disabled={!enabled}
            className="transition-all border-gray-200 focus:border-primary/50"
          />
        </div>
        
        {validationError && (
          <div className="text-sm text-red-500 flex items-center gap-1.5 bg-red-50 p-2.5 rounded-md border border-red-100">
            <Info className="h-4 w-4 flex-shrink-0" />
            <span>{validationError}</span>
          </div>
        )}
        
        <div className="space-y-3 pt-2">
          <Label className="text-sm font-medium text-gray-700">Delivery Fees</Label>
          <div className="bg-gray-50 border border-gray-200 p-4 rounded-md space-y-2 transition-all hover:bg-gray-100/50">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">USD:</span>
              <span className="font-medium text-gray-800">${formatCurrency(deliveryFees.usd)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">LBP:</span>
              <span className="font-medium text-gray-800">{formatCurrency(deliveryFees.lbp)} LBP</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashCollectionFields;
