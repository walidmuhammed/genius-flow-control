import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';

const AdminWallet = () => {
  document.title = "Wallet Management - Admin Panel";
  
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Wallet Management
          </h1>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <p className="text-gray-600 dark:text-gray-400">
            Admin wallet management features will be implemented here.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminWallet;