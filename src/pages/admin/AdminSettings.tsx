
import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';

const AdminSettings = () => {
  document.title = "Settings - Admin Panel";
  
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Admin Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configure system settings and preferences
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">System Configuration</h3>
          <p className="text-gray-600 dark:text-gray-400">Coming soon...</p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
