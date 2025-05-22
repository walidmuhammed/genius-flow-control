
import React, { useState } from 'react';
import { Info } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

interface CashCollectionFieldsProps {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  usdAmount: string;
  lbpAmount: string;
  onUsdAmountChange: (amount: string) => void;
  onLbpAmountChange: (amount: string) => void;
  deliveryFees: {
    usd: number;
    lbp: number;
  };
  errors?: {
    usdAmount?: string;
    lbpAmount?: string;
  };
}

export function ImprovedCashCollectionFields({
  enabled,
  onEnabledChange,
  usdAmount,
  lbpAmount,
  onUsdAmountChange,
  onLbpAmountChange,
  deliveryFees,
  errors
}: CashCollectionFieldsProps) {
  // Format USD input to handle decimals properly
  const handleUsdInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only numbers and decimal point
    const value = e.target.value.replace(/[^0-9.]/g, '');
    // Ensure only one decimal point
    const decimalParts = value.split('.');
    if (decimalParts.length > 1) {
      const wholeNumber = decimalParts[0];
      const decimal = decimalParts.slice(1).join('').slice(0, 2);
      onUsdAmountChange(`${wholeNumber}.${decimal}`);
    } else {
      onUsdAmountChange(value);
    }
  };

  // Format LBP input to only allow whole numbers with thousand separators
  const handleLbpInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove all non-numeric characters
    const rawValue = e.target.value.replace(/\D/g, '');
    
    // Save the raw value without formatting
    onLbpAmountChange(rawValue);
  };

  // Format display value with thousand separators
  const formattedLbpValue = lbpAmount ? 
    parseInt(lbpAmount).toLocaleString('en-US') : '';

  return (
    <div className="rounded-lg border border-border/20 p-5 bg-white shadow-sm transition-all duration-300 hover:border-topspeed-200/30">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h3 className="font-semibold text-foreground">Cash Collection</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="bg-white border-border/20 shadow-lg rounded-xl">
                <p>Enable if you need to collect cash upon delivery</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Switch 
          checked={enabled} 
          onCheckedChange={onEnabledChange} 
          className="data-[state=checked]:bg-topspeed-600 data-[state=checked]:text-white"
        />
      </div>
      
      {enabled && (
        <div className="space-y-4 pt-2 animate-slide-up">
          {/* USD Amount Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/90">USD Amount</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">$</div>
              <Input 
                type="text" 
                value={usdAmount} 
                onChange={handleUsdInputChange}
                className={cn(
                  "pl-8 pr-4 py-2 border rounded-md bg-white",
                  errors?.usdAmount ? "border-red-500" : "border-input"
                )}
              />
            </div>
            {errors?.usdAmount && <p className="text-topspeed-600 text-xs mt-1.5">{errors.usdAmount}</p>}
          </div>
          
          {/* LBP Amount Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/90">LBP Amount</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">LBP</div>
              <Input 
                type="text" 
                value={formattedLbpValue} 
                onChange={handleLbpInputChange}
                className={cn(
                  "pl-12 pr-4 py-2 border rounded-md bg-white",
                  errors?.lbpAmount ? "border-red-500" : "border-input"
                )}
              />
            </div>
            {errors?.lbpAmount && <p className="text-topspeed-600 text-xs mt-1.5">{errors.lbpAmount}</p>}
          </div>
          
          {/* Delivery Fees */}
          <div className="flex items-center justify-between mt-5 p-3 rounded-md bg-gray-50 border border-gray-100">
            <span className="text-sm font-medium">Delivery Fee:</span>
            <div className="text-sm">
              <span className="font-medium">${deliveryFees.usd}</span> 
              <span className="mx-1 text-muted-foreground">|</span> 
              <span className="font-medium">{deliveryFees.lbp.toLocaleString()} LBP</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
