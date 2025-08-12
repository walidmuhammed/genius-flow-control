import React from 'react';
import CourierLayout from '@/components/courier/CourierLayout';
import CourierDashboardContent from '@/components/courier/CourierDashboardContent';
import CourierProtectedRoute from '@/components/auth/CourierProtectedRoute';

const CourierDashboard = () => {
  document.title = "Dashboard - Courier Portal";
  
  return (
    <CourierProtectedRoute>
      <CourierLayout>
        <CourierDashboardContent />
      </CourierLayout>
    </CourierProtectedRoute>
  );
};

export default CourierDashboard;