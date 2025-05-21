
import React, { useState } from 'react';
import { FileBarChart, PackageSearch, CheckCheck } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import OrdersTable from '@/components/orders/OrdersTable';
import { EmptyState } from '@/components/ui/empty-state';

// Mock data for orders
const mockOrders = [
  {
    id: "ORD-001",
    referenceNumber: "REF12345",
    type: "Shipment",
    customer: "John Doe",
    location: "Beirut",
    amount: "$120.00",
    deliveryFees: "$5.00",
    status: "Pending",
    notes: "Handle with care"
  },
  {
    id: "ORD-002",
    referenceNumber: "REF67890",
    type: "Exchange",
    customer: "Jane Smith",
    location: "Tripoli",
    amount: "$85.50",
    deliveryFees: "$3.50",
    status: "New",
    notes: "Fragile items"
  },
  {
    id: "ORD-003",
    referenceNumber: "REF54321",
    type: "Shipment",
    customer: "Robert Johnson",
    location: "Sidon",
    amount: "$210.75",
    deliveryFees: "$7.25",
    status: "Completed",
    notes: "Express delivery"
  }
];

const OrdersList: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  
  const toggleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId) 
        : [...prev, orderId]
    );
  };
  
  const toggleSelectAll = (checked: boolean) => {
    setSelectedOrders(checked ? mockOrders.map(order => order.id) : []);
  };
  
  const renderEmptyState = () => {
    switch(activeTab) {
      case 'new':
        return (
          <EmptyState 
            icon={FileBarChart}
            title="No new orders today"
            description="No new orders have been created today."
            actionLabel="Create Order"
            actionHref="/orders/new"
          />
        );
      case 'pending':
        return (
          <EmptyState 
            icon={PackageSearch}
            title="No pending pickups"
            description="No orders are pending pickup at the moment."
            actionLabel="Schedule Pickup"
            actionHref="/pickups"
          />
        );
      case 'awaitingAction':
        return (
          <EmptyState 
            icon={CheckCheck}
            title="No orders awaiting action"
            description="There are no orders that require your attention right now."
            actionLabel="Create Order"
            actionHref="/orders/new"
          />
        );
      default:
        return (
          <EmptyState 
            icon={FileBarChart}
            title="No orders found"
            description="There are no orders matching your current filters."
            actionLabel="Create Order"
            actionHref="/orders/new"
          />
        );
    }
  };
  
  return (
    <MainLayout>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white border border-border/10 rounded-lg text-sm font-medium shadow-sm hover:bg-muted/10 transition-colors">
            Import
          </button>
          <button className="px-4 py-2 bg-[#DB271E] text-white rounded-lg text-sm font-medium shadow-sm hover:bg-[#c0211a] transition-colors">
            Create Order
          </button>
        </div>
      </div>
      
      <div className="mt-6">
        <div className="flex gap-4 border-b border-border/10">
          <button 
            className={`px-4 py-2.5 text-sm font-medium transition-colors ${activeTab === 'all' ? 'text-[#DB271E] border-b-2 border-[#DB271E]' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => setActiveTab('all')}
          >
            All Orders
          </button>
          <button 
            className={`px-4 py-2.5 text-sm font-medium transition-colors ${activeTab === 'new' ? 'text-[#DB271E] border-b-2 border-[#DB271E]' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => setActiveTab('new')}
          >
            New
          </button>
          <button 
            className={`px-4 py-2.5 text-sm font-medium transition-colors ${activeTab === 'pending' ? 'text-[#DB271E] border-b-2 border-[#DB271E]' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending
          </button>
          <button 
            className={`px-4 py-2.5 text-sm font-medium transition-colors ${activeTab === 'awaitingAction' ? 'text-[#DB271E] border-b-2 border-[#DB271E]' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => setActiveTab('awaitingAction')}
          >
            Awaiting Action
          </button>
        </div>
      </div>
      
      {/* Render orders table or empty state */}
      {mockOrders.length > 0 ? (
        <OrdersTable 
          orders={mockOrders}
          selectedOrders={selectedOrders}
          toggleSelectAll={toggleSelectAll}
          toggleSelectOrder={toggleSelectOrder}
        />
      ) : (
        renderEmptyState()
      )}
    </MainLayout>
  );
};

export default OrdersList;
