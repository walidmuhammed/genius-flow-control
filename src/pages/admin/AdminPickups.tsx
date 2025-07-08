
import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminPickupsContent from '@/components/admin/AdminPickupsContent';

const AdminPickups = () => {
  document.title = "Pickups Management - Admin Panel";
  
  return (
    <AdminLayout>
      <AdminPickupsContent />
    </AdminLayout>
  );
};

export default AdminPickups;
