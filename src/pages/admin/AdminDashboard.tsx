
import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminOverview from '@/components/admin/AdminOverview';

const AdminDashboard = () => {
  document.title = "Admin Dashboard - Topspeed";
  
  return (
    <AdminLayout>
      <AdminOverview />
    </AdminLayout>
  );
};

export default AdminDashboard;
