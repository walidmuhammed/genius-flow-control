
import React from 'react';
import { DateRangePicker } from './DateRangePicker';

interface OrdersDateFilterProps {
  onDateChange: (range: { from?: Date; to?: Date }) => void;
  className?: string;
}

export const OrdersDateFilter: React.FC<OrdersDateFilterProps> = ({ 
  onDateChange, 
  className 
}) => {
  return (
    <DateRangePicker 
      className={className}
      onDateChange={onDateChange}
    />
  );
};
