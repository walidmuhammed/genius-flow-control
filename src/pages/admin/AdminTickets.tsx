
import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';

const AdminTickets = () => {
  document.title = "Support Tickets - Admin Panel";
  
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Support Tickets
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage customer support tickets and inquiries
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Ticket Management</h3>
          <p className="text-gray-600 dark:text-gray-400">Coming soon...</p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminTickets;
