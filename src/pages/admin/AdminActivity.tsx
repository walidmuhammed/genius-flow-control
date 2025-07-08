
import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';

const AdminActivity = () => {
  document.title = "Analytics - Admin Panel";
  
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View system analytics and activity reports
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Orders Analytics</h3>
            <p className="text-gray-600 dark:text-gray-400">Coming soon...</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Revenue Reports</h3>
            <p className="text-gray-600 dark:text-gray-400">Coming soon...</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
            <p className="text-gray-600 dark:text-gray-400">Coming soon...</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminActivity;
