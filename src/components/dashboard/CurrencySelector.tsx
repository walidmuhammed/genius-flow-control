
import React from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type CurrencyType = 'usd' | 'lbp' | string;

interface CurrencySelectorProps {
  type: CurrencyType;
  value?: CurrencyType;
  onChange?: (currency: CurrencyType) => void;
  className?: string;
}

const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  type,
  value,
  onChange,
  className,
}) => {
  const displayType = type === 'usd' ? 'USD' : type === 'lbp' ? 'LBP' : type.toUpperCase();
  const currencies: CurrencyType[] = ['usd', 'lbp'];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={className}
        >
          {displayType}
          <ChevronDown className="ml-1 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {onChange && currencies.map((currency) => (
          <DropdownMenuItem
            key={currency}
            onClick={() => onChange(currency)}
            className="flex justify-between"
          >
            {currency === 'usd' ? 'USD' : 'LBP'}
            {value === currency && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CurrencySelector;
