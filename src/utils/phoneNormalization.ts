// Standardized phone number normalization utilities
export function formatPhoneForStorage(phone: string): string {
  if (!phone) return '';
  
  // Remove all non-digit characters
  let digits = phone.replace(/\D/g, '');
  
  // Remove Lebanese country code if present
  if (digits.startsWith('961')) {
    digits = digits.slice(3);
  }
  
  // Remove leading zero
  if (digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  
  // Validate Lebanese mobile number format
  if (!/^(3|70|71|76|78|79|81|82)\d{6}$/.test(digits)) {
    throw new Error('Invalid Lebanese mobile number format');
  }
  
  // Return in standard storage format: +961 XX XXX XXX
  const formatted = `+961 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
  return formatted;
}

export function formatPhoneForDisplay(phone: string): string {
  if (!phone) return '';
  
  // If already formatted, return as is
  if (phone.startsWith('+961 ') && phone.length === 15) {
    return phone;
  }
  
  try {
    return formatPhoneForStorage(phone);
  } catch {
    return phone; // Return original if formatting fails
  }
}

export function normalizePhoneForMatching(phone: string): string {
  if (!phone) return '';
  
  // Remove all non-digit characters
  let digits = phone.replace(/\D/g, '');
  
  // Remove Lebanese country code if present
  if (digits.startsWith('961')) {
    digits = digits.slice(3);
  }
  
  // Remove leading zero
  if (digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  
  return digits;
}

export function arePhoneNumbersEqual(phone1: string, phone2: string): boolean {
  const normalized1 = normalizePhoneForMatching(phone1);
  const normalized2 = normalizePhoneForMatching(phone2);
  return normalized1 === normalized2;
}