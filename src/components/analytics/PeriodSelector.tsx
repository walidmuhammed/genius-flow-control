
import React from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';

interface PeriodSelectorProps {
  period: 'daily' | 'weekly' | 'monthly';
  onPeriodChange: (period: 'daily' | 'weekly' | 'monthly') => void;
}

export default function PeriodSelector({ period, onPeriodChange }: PeriodSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <ToggleGroup type="single" value={period} onValueChange={(value) => value && onPeriodChange(value as 'daily' | 'weekly' | 'monthly')}>
        <ToggleGroupItem value="daily" aria-label="Toggle daily view" className="text-xs px-3 rounded-full">
          Daily
        </ToggleGroupItem>
        <ToggleGroupItem value="weekly" aria-label="Toggle weekly view" className="text-xs px-3 rounded-full">
          Weekly
        </ToggleGroupItem>
        <ToggleGroupItem value="monthly" aria-label="Toggle monthly view" className="text-xs px-3 rounded-full">
          Monthly
        </ToggleGroupItem>
      </ToggleGroup>
      
      <Button variant="outline" size="sm" className="rounded-full w-9 h-9 p-0">
        <Calendar className="h-4 w-4" />
        <span className="sr-only">Calendar</span>
      </Button>
    </div>
  );
}
