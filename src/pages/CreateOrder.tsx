
import React, { useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import CreateOrderForm from '@/components/orders/CreateOrderForm';

const CreateOrder: React.FC = () => {
  useEffect(() => {
    document.title = "Create Order - Orders Management";
  }, []);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Create New Order
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Fill out the form below to create a new delivery order
            </p>
          </div>
        </div>

        <CreateOrderForm />
      </div>
    </MainLayout>
  );
};

export default CreateOrder;
