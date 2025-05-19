
import React from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

interface CurrencyToggleProps {
  currency: 'USD' | 'LBP';
  onChange: (currency: 'USD' | 'LBP') => void;
}

export default function CurrencyToggle({ currency, onChange }: CurrencyToggleProps) {
  return (
    <ToggleGroup type="single" value={currency} onValueChange={(value) => value && onChange(value as 'USD' | 'LBP')} className="border rounded-full p-0.5">
      <ToggleGroupItem 
        value="USD" 
        aria-label="Toggle USD currency"
        className="data-[state=on]:bg-topspeed-600 data-[state=on]:text-white rounded-full text-xs px-3 h-7"
      >
        USD
      </ToggleGroupItem>
      <ToggleGroupItem 
        value="LBP" 
        aria-label="Toggle LBP currency"
        className="data-[state=on]:bg-topspeed-600 data-[state=on]:text-white rounded-full text-xs px-3 h-7"
      >
        LBP
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
