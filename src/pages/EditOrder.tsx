
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { useOrder } from '@/hooks/use-orders';
import { Card, CardContent } from '@/components/ui/card';
import CreateOrderForm from '@/components/orders/CreateOrderForm';

const EditOrder: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: order, isLoading, error } = useOrder(id);

  useEffect(() => {
    document.title = "Edit Order - Orders Management";
  }, []);

  useEffect(() => {
    // Only allow editing NEW orders
    if (order && order.status !== 'New') {
      navigate('/orders');
      return;
    }
  }, [order, navigate]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
          <Card className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-64 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  if (error || !order) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="text-center py-12">
            <p className="text-red-600">Order not found or you don't have permission to edit it.</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Edit Order #{order.order_id?.toString().padStart(3, '0')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Update the order details below
            </p>
          </div>
        </div>

        <CreateOrderForm 
          initialOrder={order}
          isEditing={true}
        />
      </div>
    </MainLayout>
  );
};

export default EditOrder;
