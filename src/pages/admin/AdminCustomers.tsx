
import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminCustomersContent from '@/components/admin/AdminCustomersContent';

const AdminCustomers = () => {
  document.title = "Customers Management - Admin Panel";
  
  return (
    <AdminLayout>
      <AdminCustomersContent />
    </AdminLayout>
  );
};

export default AdminCustomers;
