import React from 'react';
import CourierLayout from '@/components/courier/CourierLayout';
import CourierSupportContent from '@/components/courier/CourierSupportContent';

const CourierSupport = () => {
  document.title = "Support - Courier Portal";
  
  return (
    <CourierLayout>
      <CourierSupportContent />
    </CourierLayout>
  );
};

export default CourierSupport;