// Security event logger that only logs in development
export const securityLog = {
  warn: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[SECURITY WARNING] ${message}`, data);
    }
  },
  error: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.error(`[SECURITY ERROR] ${message}`, data);
    }
  },
  info: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.info(`[SECURITY INFO] ${message}`, data);
    }
  }
};

// Production-safe error messages
export const getGenericErrorMessage = (context: string): string => {
  const messages = {
    auth: 'Authentication failed. Please check your credentials.',
    network: 'Network error. Please try again.',
    permission: 'You do not have permission to perform this action.',
    validation: 'Invalid input provided.',
    default: 'An error occurred. Please try again.',
  };
  
  return messages[context as keyof typeof messages] || messages.default;
};