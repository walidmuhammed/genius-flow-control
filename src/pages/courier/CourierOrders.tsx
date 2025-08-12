import React from 'react';
import CourierLayout from '@/components/courier/CourierLayout';
import CourierOrdersContent from '@/components/courier/CourierOrdersContent';
import CourierProtectedRoute from '@/components/auth/CourierProtectedRoute';

const CourierOrders = () => {
  document.title = "My Orders - Courier Portal";
  
  return (
    <CourierProtectedRoute>
      <CourierLayout>
        <CourierOrdersContent />
      </CourierLayout>
    </CourierProtectedRoute>
  );
};

export default CourierOrders;