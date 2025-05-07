
import React from 'react';
import { cn } from '@/lib/utils';

interface CurrencyDisplayProps {
  usd: number;
  lbp: number;
  label?: string;
  className?: string;
}

const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({
  usd,
  lbp,
  label,
  className,
}) => {
  return (
    <div className={cn("flex flex-col", className)}>
      {label && <span className="text-sm text-muted-foreground mb-1">{label}</span>}
      <div className="flex flex-wrap gap-2">
        <div className="currency-badge currency-badge-usd">
          <span className="mr-1">$</span>
          {usd}
        </div>
        <div className="currency-badge currency-badge-lbp">
          <span className="mr-1">LBP</span>
          {typeof lbp === 'number' ? lbp.toLocaleString() : lbp}
        </div>
      </div>
    </div>
  );
};

export default CurrencyDisplay;
