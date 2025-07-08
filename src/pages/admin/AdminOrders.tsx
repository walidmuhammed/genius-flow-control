
import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminOrdersContent from '@/components/admin/AdminOrdersContent';

const AdminOrders = () => {
  document.title = "Orders Management - Admin Panel";
  
  return (
    <AdminLayout>
      <AdminOrdersContent />
    </AdminLayout>
  );
};

export default AdminOrders;
