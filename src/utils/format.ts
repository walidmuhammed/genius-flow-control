
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(value);
};

export const formatPercent = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    maximumFractionDigits: 1,
    minimumFractionDigits: 0,
  }).format(value / 100);
};

export const formatCurrency = (
  value: number,
  currency: string = 'USD',
  compact: boolean = false
): string => {
  const options: Intl.NumberFormatOptions = {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  };
  
  if (compact && value >= 1000) {
    options.notation = 'compact';
    options.compactDisplay = 'short';
  }
  
  return new Intl.NumberFormat('en-US', options).format(value);
};
