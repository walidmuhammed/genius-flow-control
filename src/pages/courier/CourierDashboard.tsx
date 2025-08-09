import React from 'react';
import CourierLayout from '@/components/courier/CourierLayout';
import CourierDashboardContent from '@/components/courier/CourierDashboardContent';

const CourierDashboard = () => {
  document.title = "Dashboard - Courier Portal";
  
  return (
    <CourierLayout>
      <CourierDashboardContent />
    </CourierLayout>
  );
};

export default CourierDashboard;