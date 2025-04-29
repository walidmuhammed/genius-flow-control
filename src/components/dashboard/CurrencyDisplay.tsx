
import React from 'react';
import { cn } from '@/lib/utils';

interface CurrencyDisplayProps {
  usdValue: string | number;
  lbpValue: string | number;
  label: string;
  className?: string;
}

const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({
  usdValue,
  lbpValue,
  label,
  className,
}) => {
  return (
    <div className={cn("flex flex-col", className)}>
      <span className="text-sm text-muted-foreground mb-1">{label}</span>
      <div className="flex flex-wrap gap-2">
        <div className="currency-badge currency-badge-usd">
          <span className="mr-1">$</span>
          {usdValue}
        </div>
        <div className="currency-badge currency-badge-lbp">
          <span className="mr-1">LBP</span>
          {lbpValue}
        </div>
      </div>
    </div>
  );
};

export default CurrencyDisplay;
