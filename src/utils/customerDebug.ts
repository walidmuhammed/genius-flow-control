// Customer debugging utilities

export function logCustomerSearchDebug(searchPhone: string, foundCustomers: any[], currentUser: any) {
  console.group('🔍 Customer Search Debug');
  console.log('📱 Search phone:', searchPhone);
  console.log('👤 Current user:', currentUser?.id, currentUser?.user_type);
  console.log('🔢 Found customers count:', foundCustomers?.length || 0);
  
  if (foundCustomers && foundCustomers.length > 0) {
    foundCustomers.forEach((customer, index) => {
      console.log(`👥 Customer ${index + 1}:`, {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        created_by: customer.created_by,
        belongsToCurrentUser: customer.created_by === currentUser?.id
      });
    });
  } else {
    console.log('❌ No customers found');
  }
  console.groupEnd();
}

export function logPhoneNormalization(originalPhone: string, normalizedPhone: string) {
  console.log('📞 Phone normalization:', {
    original: originalPhone,
    normalized: normalizedPhone,
    match: originalPhone === normalizedPhone ? '✅' : '❌'
  });
}