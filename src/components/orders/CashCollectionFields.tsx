
import React from 'react';
import { Check, Info, X } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import CurrencyDisplay from '@/components/dashboard/CurrencyDisplay';
import CurrencySelector from '@/components/dashboard/CurrencySelector';

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

const CashCollectionFields: React.FC<CashCollectionFieldsProps> = ({
  enabled,
  onEnabledChange,
  usdAmount,
  lbpAmount,
  onUsdAmountChange,
  onLbpAmountChange,
  deliveryFees,
  errors
}) => {
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

  // Format LBP input to only allow whole numbers
  const handleLbpInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only numbers
    const value = e.target.value.replace(/\D/g, '');
    onLbpAmountChange(value);
  };

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
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground/90">USD Amount</span>
              <CurrencySelector type="usd" />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">$</div>
              <input 
                type="text" 
                value={usdAmount} 
                onChange={handleUsdInputChange}
                className={`w-full pl-8 pr-12 py-2.5 border ${errors?.usdAmount ? 'border-topspeed-600 ring-1 ring-topspeed-600/20' : 'border-input'} rounded-lg bg-background shadow-sm focus:ring-2 focus:ring-topspeed-600/10 focus:border-topspeed-300 focus:outline-none transition-all`} 
                placeholder="0.00" 
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button 
                  type="button" 
                  onClick={() => onUsdAmountChange('')} 
                  className="text-muted-foreground hover:text-topspeed-600 rounded-full h-5 w-5 flex items-center justify-center transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            {errors?.usdAmount && <p className="text-topspeed-600 text-xs mt-1.5">{errors.usdAmount}</p>}
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground/90">LBP Amount</span>
              <CurrencySelector type="lbp" />
            </div>
            <div className="relative">
              <input 
                type="text" 
                value={lbpAmount} 
                onChange={handleLbpInputChange}
                className={`w-full pl-3.5 pr-12 py-2.5 border ${errors?.lbpAmount ? 'border-topspeed-600 ring-1 ring-topspeed-600/20' : 'border-input'} rounded-lg bg-background shadow-sm focus:ring-2 focus:ring-topspeed-600/10 focus:border-topspeed-300 focus:outline-none transition-all`} 
                placeholder="0" 
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button 
                  type="button" 
                  onClick={() => onLbpAmountChange('')} 
                  className="text-muted-foreground hover:text-topspeed-600 rounded-full h-5 w-5 flex items-center justify-center transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            {errors?.lbpAmount && <p className="text-topspeed-600 text-xs mt-1.5">{errors.lbpAmount}</p>}
          </div>
          
          <div className="flex items-center justify-between pt-1 bg-muted/20 p-3 rounded-lg mt-4">
            <div className="text-sm font-medium">Delivery Fee:</div>
            <div className="text-sm font-medium">
              <CurrencyDisplay usd={deliveryFees.usd} lbp={deliveryFees.lbp} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashCollectionFields;
