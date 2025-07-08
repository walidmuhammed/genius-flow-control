
import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminCouriersContent from '@/components/admin/AdminCouriersContent';

const AdminCouriers = () => {
  document.title = "Couriers Management - Admin Panel";
  
  return (
    <AdminLayout>
      <AdminCouriersContent />
    </AdminLayout>
  );
};

export default AdminCouriers;
