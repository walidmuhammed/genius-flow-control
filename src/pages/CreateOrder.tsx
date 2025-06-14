
import React from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { useCreateOrder } from '@/hooks/use-orders';
import { useCreateCustomer } from '@/hooks/use-customers';
import { toast } from 'sonner';
import { Order } from '@/services/orders';
import { useScreenSize } from '@/hooks/useScreenSize';
import CreateOrderForm from '@/components/orders/CreateOrderForm';

const CreateOrder = () => {
  const navigate = useNavigate();
  const { isMobile } = useScreenSize();
  const createCustomer = useCreateCustomer();
  const createOrder = useCreateOrder();

  const handleSave = async (formData: any) => {
    try {
      // Create customer first (if needed)
      // This logic would need to be implemented based on phone lookup
      
      const orderData: Omit<Order, 'id' | 'order_id' | 'reference_number' | 'created_at' | 'updated_at'> = {
        ...formData,
        customer_id: 'temp-customer-id' // This would be the actual customer ID
      };

      await createOrder.mutateAsync(orderData);
      toast.success("Order created successfully");
      navigate('/orders');
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Failed to create order");
    }
  };

  const handleCreateAnother = async (formData: any) => {
    try {
      const orderData: Omit<Order, 'id' | 'order_id' | 'reference_number' | 'created_at' | 'updated_at'> = {
        ...formData,
        customer_id: 'temp-customer-id'
      };

      await createOrder.mutateAsync(orderData);
      toast.success("Order created successfully. Create another one.");
      // Form will reset automatically
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Failed to create order");
    }
  };

  return (
    <MainLayout className="bg-gray-50/30">
      <div className="min-h-screen w-full">
        <div className="w-full px-4 py-6">
          {!isMobile && (
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Create New Order</h1>
                <p className="text-sm text-gray-500 mt-1">Fill in the details to create a new delivery order</p>
              </div>
            </div>
          )}

          <CreateOrderForm 
            mode="create"
            onSave={handleSave}
            onCreateAnother={handleCreateAnother}
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default CreateOrder;
