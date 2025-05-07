
import React from 'react';
import { Button } from '@/components/ui/button';

interface PeriodToggleProps {
  period: 'daily' | 'weekly' | 'monthly';
  onChange: (period: 'daily' | 'weekly' | 'monthly') => void;
}

export default function PeriodToggle({ period, onChange }: PeriodToggleProps) {
  return (
    <div className="inline-flex rounded-md shadow-sm bg-muted" role="group">
      <Button
        variant={period === 'daily' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onChange('daily')}
        className={`rounded-l-md rounded-r-none px-3 ${period === 'daily' ? '' : 'text-muted-foreground bg-transparent hover:bg-muted'}`}
      >
        Daily
      </Button>
      <Button
        variant={period === 'weekly' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onChange('weekly')}
        className={`px-3 rounded-none ${period === 'weekly' ? '' : 'text-muted-foreground bg-transparent hover:bg-muted'}`}
      >
        Weekly
      </Button>
      <Button
        variant={period === 'monthly' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onChange('monthly')}
        className={`rounded-r-md rounded-l-none px-3 ${period === 'monthly' ? '' : 'text-muted-foreground bg-transparent hover:bg-muted'}`}
      >
        Monthly
      </Button>
    </div>
  );
}
