
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
  );
};

export default CurrencySelector;
