
import React from 'react';
import { Package, ArrowLeftRight, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export type OrderType = 'deliver' | 'exchange' | 'return' | 'cash-collection';

interface OrderTypeOption {
  value: OrderType;
  label: string;
  description: string;
  icon: React.ReactNode;
}

interface OrderTypeSelectorProps {
  value: OrderType;
  onChange: (value: OrderType) => void;
  className?: string;
}

const OrderTypeSelector: React.FC<OrderTypeSelectorProps> = ({ value, onChange, className }) => {
  const options: OrderTypeOption[] = [
    {
      value: 'deliver',
      label: 'Deliver',
      description: 'Deliver a package to your customer.',
      icon: <Package className="h-5 w-5 text-primary" />
    },
    {
      value: 'exchange',
      label: 'Exchange',
      description: 'Exchange packages between you and your customer.',
      icon: <ArrowLeftRight className="h-5 w-5 text-primary" />
    },
    {
      value: 'return',
      label: 'Return',
      description: 'Return a package from your customer to you.',
      icon: <ArrowLeft className="h-5 w-5 text-primary" />
    },
    {
      value: 'cash-collection',
      label: 'Cash Collection',
      description: 'Only collect cash from your customer.',
      icon: <Package className="h-5 w-5 text-primary" />
    }
  ];

  return (
    <div className={cn("grid gap-3", className)}>
      {options.map((option) => (
        <div
          key={option.value}
          className={cn(
            "flex items-start gap-3 rounded-lg border p-3 cursor-pointer",
            value === option.value
              ? "border-primary/50 bg-primary/5"
              : "border-border hover:border-primary/30 hover:bg-primary/5"
          )}
          onClick={() => onChange(option.value)}
        >
          <div className="mt-0.5">{option.icon}</div>
          <div>
            <h3 className="font-medium">{option.label}</h3>
            <p className="text-sm text-muted-foreground">{option.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderTypeSelector;
