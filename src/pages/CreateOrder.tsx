
import React, { useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import CreateOrderForm from '@/components/orders/CreateOrderForm';

const CreateOrder: React.FC = () => {
  useEffect(() => {
    document.title = "Create Order - Orders Management";
  }, []);

  return (
    <MainLayout>
      <CreateOrderForm />
    </MainLayout>
  );
};

export default CreateOrder;
