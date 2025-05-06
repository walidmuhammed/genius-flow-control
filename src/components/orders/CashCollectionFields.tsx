
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
  deliveryFees: { usd: number; lbp: number };
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
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <Checkbox 
          id="cash-collection" 
          checked={enabled} 
          onCheckedChange={handleToggle}
        />
        <div className="space-y-1">
          <label htmlFor="cash-collection" className="text-sm font-medium leading-none">
            Cash collection
          </label>
          <p className="text-xs text-gray-500">
            Your customer shall pay this amount to courier upon delivery.
          </p>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="space-y-2">
          <Label>USD Amount</Label>
          <Input 
            type="text"
            value={usdAmount} 
            onChange={handleUsdChange}
            placeholder="0.00" 
            disabled={!enabled} 
            className={!enabled ? "opacity-50" : ""}
          />
        </div>
        
        <div className="space-y-2">
          <Label>LBP Amount</Label>
          <Input 
            type="text"
            value={lbpAmount} 
            onChange={handleLbpChange}
            placeholder="0" 
            disabled={!enabled} 
            className={!enabled ? "opacity-50" : ""}
          />
        </div>
        
        {validationError && (
          <div className="text-sm text-red-500 mt-2 flex items-center gap-1">
            <Info className="h-4 w-4" />
            <span>{validationError}</span>
          </div>
        )}
        
        <div className="space-y-2 mt-4">
          <Label className="text-gray-600">Delivery Fees</Label>
          <div className="bg-gray-50 border border-gray-200 p-3 rounded-md space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600">USD:</span>
              <span className="font-medium">${formatCurrency(deliveryFees.usd)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">LBP:</span>
              <span className="font-medium">{formatCurrency(deliveryFees.lbp)} LBP</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashCollectionFields;
