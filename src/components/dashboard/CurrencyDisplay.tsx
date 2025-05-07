
import React from 'react';
import { cn } from '@/lib/utils';

interface CurrencyDisplayProps {
  usd: number;
  lbp: number;
  label?: string;
  className?: string;
  // For backward compatibility
  usdValue?: number;
  lbpValue?: string | number;
}

const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({
  usd,
  lbp,
  usdValue,
  lbpValue,
  label,
  className,
}) => {
  // Use either the new prop names (usd, lbp) or fall back to the old ones (usdValue, lbpValue)
  const displayUsd = usd !== undefined ? usd : (usdValue || 0);
  const displayLbp = lbp !== undefined ? lbp : (lbpValue || 0);
  
  return (
    <div className={cn("flex flex-col", className)}>
      {label && <span className="text-sm text-muted-foreground mb-1">{label}</span>}
      <div className="flex flex-wrap gap-2">
        <div className="currency-badge currency-badge-usd">
          <span className="mr-1">$</span>
          {displayUsd}
        </div>
        <div className="currency-badge currency-badge-lbp">
          <span className="mr-1">LBP</span>
          {typeof displayLbp === 'number' ? displayLbp.toLocaleString() : displayLbp}
        </div>
      </div>
    </div>
  );
};

export default CurrencyDisplay;
