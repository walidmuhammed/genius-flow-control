import React from 'react';
import CourierLayout from '@/components/courier/CourierLayout';
import CourierPickupsContent from '@/components/courier/CourierPickupsContent';

const CourierPickups = () => {
  document.title = "Pickups - Courier Portal";
  
  return (
    <CourierLayout>
      <CourierPickupsContent />
    </CourierLayout>
  );
};

export default CourierPickups;