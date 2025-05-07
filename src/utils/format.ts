
/**
 * Format a number with commas for thousands
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat().format(value);
}

/**
 * Format a value as currency
 */
export function formatCurrency(value: number, currency: string = 'USD', compact: boolean = false): string {
  const options: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 2,
  };
  
  if (compact) {
    options.notation = 'compact';
  }
  
  return new Intl.NumberFormat('en-US', options).format(value);
}

/**
 * Format a value as a percentage
 */
export function formatPercent(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(value / 100);
}

/**
 * Format a date to a human readable string
 */
export function formatDate(date: Date | string): string {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
}

/**
 * Format a date to time string
 */
export function formatTime(date: Date | string): string {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

/**
 * Format a date to include both date and time
 */
export function formatDateTime(date: Date | string): string {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}
