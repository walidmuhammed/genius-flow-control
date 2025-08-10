import React from 'react';
import CourierLayout from '@/components/courier/CourierLayout';
import CourierOrdersContent from '@/components/courier/CourierOrdersContent';

const CourierOrders = () => {
  document.title = "My Orders - Courier Portal";
  
  return (
    <CourierLayout>
      <CourierOrdersContent />
    </CourierLayout>
  );
};

export default CourierOrders;