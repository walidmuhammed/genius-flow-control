
import React from 'react';
import { Toggle } from '@/components/ui/toggle';
import { Button } from '@/components/ui/button';

interface CurrencyToggleProps {
  currency: 'USD' | 'LBP';
  onChange: (currency: 'USD' | 'LBP') => void;
}

export default function CurrencyToggle({ currency, onChange }: CurrencyToggleProps) {
  return (
    <div className="inline-flex rounded-md shadow-sm bg-muted" role="group">
      <Button
        variant={currency === 'USD' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onChange('USD')}
        className={`rounded-l-md rounded-r-none px-3 ${currency === 'USD' ? '' : 'text-muted-foreground bg-transparent hover:bg-muted'}`}
      >
        USD
      </Button>
      <Button
        variant={currency === 'LBP' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onChange('LBP')}
        className={`rounded-r-md rounded-l-none px-3 ${currency === 'LBP' ? '' : 'text-muted-foreground bg-transparent hover:bg-muted'}`}
      >
        LBP
      </Button>
    </div>
  );
}
