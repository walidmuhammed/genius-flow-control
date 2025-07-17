
import React from 'react';

interface CurrencyDisplayProps {
  valueUSD: number | null;
  valueLBP: number | null;
}

const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({ valueUSD, valueLBP }) => {
  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return '0';
    return amount.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  };

  if ((valueUSD === null || valueUSD <= 0) && (valueLBP === null || valueLBP <= 0)) {
    return (
      <div className="flex flex-col">
        <span className="text-gray-500">$0</span>
        <span className="text-gray-500 text-xs mt-0.5">0 LBP</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <span className="text-gray-900 font-medium">
        ${formatCurrency(valueUSD)}
      </span>
      <span className="mt-0.5 text-xs font-medium text-gray-700">
        {formatCurrency(valueLBP)} LBP
      </span>
    </div>
  );
};

export default CurrencyDisplay;
