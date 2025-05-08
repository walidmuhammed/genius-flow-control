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
  return <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <h3 className="font-medium">Cash Collection</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Enable if you need to collect cash upon delivery</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Switch checked={enabled} onCheckedChange={onEnabledChange} />
      </div>
      
      {enabled && <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">USD Amount</span>
              <CurrencySelector type="usd" />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">$</div>
              <input type="text" value={usdAmount} onChange={e => {
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
          }} className={`w-full pl-8 pr-12 py-2 border ${errors?.usdAmount ? 'border-red-500' : 'border-gray-300'} rounded-md`} placeholder="0.00" />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button type="button" onClick={() => onUsdAmountChange('')} className="text-gray-400 hover:text-gray-600">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            {errors?.usdAmount && <p className="text-red-500 text-xs mt-1">{errors.usdAmount}</p>}
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">LBP Amount</span>
              <CurrencySelector type="lbp" />
            </div>
            <div className="relative">
              <input type="text" value={lbpAmount} onChange={e => {
            // Allow only numbers
            const value = e.target.value.replace(/\D/g, '');
            onLbpAmountChange(value);
          }} className={`w-full pl-3 pr-12 py-2 border ${errors?.lbpAmount ? 'border-red-500' : 'border-gray-300'} rounded-md`} placeholder="0" />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button type="button" onClick={() => onLbpAmountChange('')} className="text-gray-400 hover:text-gray-600">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            {errors?.lbpAmount && <p className="text-red-500 text-xs mt-1">{errors.lbpAmount}</p>}
          </div>
          
          <div className="flex items-center justify-between pt-1">
            <div className="text-sm font-medium">Delivery Fee:</div>
            <div className="text-sm">
              <CurrencyDisplay usd={deliveryFees.usd} lbp={deliveryFees.lbp} />
            </div>
          </div>
          
          
        </div>}
    </div>;
};
export default CashCollectionFields;