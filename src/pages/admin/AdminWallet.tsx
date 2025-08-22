import React, { useState } from 'react';
import { DollarSign, CreditCard, Users, FileText } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ClientPayoutsTab from '@/components/admin/wallet/ClientPayoutsTab';
import CourierSettlementsTab from '@/components/admin/wallet/CourierSettlementsTab';
import InvoicesListTab from '@/components/admin/wallet/InvoicesListTab';
import { useOrders } from '@/hooks/use-orders';
import { useInvoices } from '@/hooks/use-invoices';
import { markInvoiceAsPaid } from '@/services/invoice-status';

const AdminWallet = () => {
  document.title = "Financial Operations - Admin Panel";
  
  const { data: orders = [] } = useOrders();
  const { data: invoices = [] } = useInvoices();
  
  // Calculate KPIs
  const paidOrders = orders.filter(order => order.status === 'Successful');
  const totalCollectedUSD = paidOrders.reduce((sum, order) => sum + (order.collected_amount_usd || 0), 0);
  const totalCollectedLBP = paidOrders.reduce((sum, order) => sum + (order.collected_amount_lbp || 0), 0);
  const totalDeliveryFeesUSD = paidOrders.reduce((sum, order) => sum + (order.delivery_fees_usd || 0), 0);
  const totalDeliveryFeesLBP = paidOrders.reduce((sum, order) => sum + (order.delivery_fees_lbp || 0), 0);
  const pendingPayoutUSD = totalCollectedUSD - totalDeliveryFeesUSD;
  const pendingPayoutLBP = totalCollectedLBP - totalDeliveryFeesLBP;
  
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">
            Financial Operations
          </h1>
        </div>
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Collected Today</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalCollectedUSD.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                LBP {totalCollectedLBP.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Client Payouts Pending</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${pendingPayoutUSD.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                LBP {pendingPayoutLBP.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paid Orders</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{paidOrders.length}</div>
              <p className="text-xs text-muted-foreground">
                Orders completed
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Invoices</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{invoices.length}</div>
              <p className="text-xs text-muted-foreground">
                Generated invoices
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="payouts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="payouts">Client Payouts</TabsTrigger>
            <TabsTrigger value="settlements">Courier Settlements</TabsTrigger>
            <TabsTrigger value="invoices">Generated Invoices</TabsTrigger>
          </TabsList>
          
          <TabsContent value="payouts" className="space-y-6">
            <ClientPayoutsTab />
          </TabsContent>
          
          <TabsContent value="settlements" className="space-y-6">
            <CourierSettlementsTab />
          </TabsContent>
          
          <TabsContent value="invoices" className="space-y-6">
            <InvoicesListTab />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminWallet;