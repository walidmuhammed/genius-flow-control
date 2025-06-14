
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { useOrder, useUpdateOrderWithHistory } from '@/hooks/use-orders';
import { useCustomer } from '@/hooks/use-customers';
import { toast } from 'sonner';
import { OrderWithCustomer } from '@/services/orders';
import CreateOrderForm from '@/components/orders/CreateOrderForm';

const EditOrder = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading } = useOrder(id);
  const { data: customer } = useCustomer(order?.customer_id);
  const updateOrderWithHistory = useUpdateOrderWithHistory();
  
  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#DB271E] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading order...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!order) {
    return (
      <MainLayout>
        <div className="flex justify-center py-12">
          <div className="text-center">
            <p className="text-red-600">Order not found</p>
            <Button onClick={() => navigate('/orders')} className="mt-4">
              Back to Orders
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (order.status !== 'New') {
    return (
      <MainLayout>
        <div className="flex justify-center py-12">
          <div className="text-center">
            <p className="text-red-600">Only NEW orders can be edited</p>
            <Button onClick={() => navigate('/orders')} className="mt-4">
              Back to Orders
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const handleSave = async (formData: any, changeHistory: any[]) => {
    try {
      await updateOrderWithHistory.mutateAsync({
        id: order.id,
        updates: formData,
        changeHistory
      });
      toast.success("Order updated successfully");
      navigate('/orders');
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Failed to update order");
    }
  };

  return (
    <MainLayout>
      <div className="w-full px-4 py-6">
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/orders')}
            className="p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Edit Order #{order.order_id?.toString().padStart(3, '0')}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Modify the order details below
            </p>
          </div>
        </div>

        <CreateOrderForm 
          mode="edit"
          initialOrder={order}
          initialCustomer={customer}
          onSave={handleSave}
        />
      </div>
    </MainLayout>
  );
};

export default EditOrder;
