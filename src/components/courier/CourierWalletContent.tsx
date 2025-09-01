import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Wallet, 
  DollarSign, 
  TrendingUp, 
  Download,
  Calendar,
  CreditCard,
  Package,
  ArrowUpRight,
  ArrowDownLeft,
  Eye,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCourierBalance, useCourierSettlements, useOpenOrdersByCourier } from '@/hooks/use-courier-settlements';
import { format } from 'date-fns';

const CourierWalletContent = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth');
  const { user } = useAuth();
  
  // Fetch real data using hooks
  const { data: balance, isLoading: balanceLoading } = useCourierBalance(user?.id);
  const { data: settlements, isLoading: settlementsLoading } = useCourierSettlements();
  const { data: openOrders, isLoading: ordersLoading } = useOpenOrdersByCourier(user?.id);

  // Filter settlements for current courier
  const courierSettlements = settlements?.filter(s => s.courier_id === user?.id) || [];

  // Calculate earnings summary from balance data
  const earningsSummary = {
    totalDeliveries: balance?.orderCount || 0,
    totalEarningsUSD: (balance?.totalCourierFeesUSD || 0),
    totalEarningsLBP: (balance?.totalCourierFeesLBP || 0),
    balanceUSD: balance?.balanceUSD || 0,
    balanceLBP: balance?.balanceLBP || 0
  };

  // Transform open orders to transaction-like format
  const transactions = openOrders?.map(order => ({
    id: order.id,
    date: format(new Date(order.created_at), 'yyyy-MM-dd'),
    type: 'Delivery Fee Earned',
    amount: { 
      usd: order.courier_fee_usd || 0, 
      lbp: order.courier_fee_lbp || 0 
    },
    orderId: `ORD-${order.order_id}`,
    description: `Order ${order.reference_number} - ${order.customer?.name || 'Unknown Customer'}`,
    status: order.status === 'Successful' ? 'Completed' : 'Pending'
  })) || [];

  if (balanceLoading || settlementsLoading || ordersLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Wallet</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Track your earnings and manage payouts
            </p>
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-48" />
      </div>
    );
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'Delivery Fee Earned':
        return <ArrowUpRight className="h-4 w-4 text-green-500" />;
      case 'Payout Received':
        return <ArrowDownLeft className="h-4 w-4 text-blue-500" />;
      default:
        return <DollarSign className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
      case 'Paid':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Wallet</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Track your earnings and manage payouts
          </p>
        </div>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Request Payout
        </Button>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${earningsSummary.balanceUSD.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {earningsSummary.balanceLBP.toLocaleString()} LBP
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payout</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${earningsSummary.balanceUSD.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {earningsSummary.balanceLBP.toLocaleString()} LBP
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Period Selector */}
      <div className="flex items-center gap-4">
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="thisWeek">This Week</SelectItem>
            <SelectItem value="thisMonth">This Month</SelectItem>
            <SelectItem value="lastMonth">Last Month</SelectItem>
            <SelectItem value="last3Months">Last 3 Months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Earnings Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Earnings Summary - This Month
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{earningsSummary.totalDeliveries}</div>
              <p className="text-sm text-gray-500">Total Deliveries</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">${earningsSummary.totalEarningsUSD}</div>
              <p className="text-sm text-gray-500">Total Earnings</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">$0.00</div>
              <p className="text-sm text-gray-500">Paid to Admin</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">${earningsSummary.balanceUSD.toFixed(2)}</div>
              <p className="text-sm text-gray-500">Pending Balance</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Transactions and Invoices */}
      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">Unsettled Orders</TabsTrigger>
          <TabsTrigger value="invoices">Settlement History</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Unsettled Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No unsettled orders found
                  </div>
                ) : (
                  transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div>
                        <h4 className="font-medium">{transaction.type}</h4>
                        <p className="text-sm text-gray-500">{transaction.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-400">{transaction.date}</span>
                          {transaction.orderId && (
                            <>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-gray-400">{transaction.orderId}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-semibold ${transaction.amount.usd > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.amount.usd > 0 ? '+' : ''}${Math.abs(transaction.amount.usd)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {Math.abs(transaction.amount.lbp).toLocaleString()} LBP
                      </div>
                      <Badge className={`text-xs mt-1 ${getStatusBadge(transaction.status)}`}>
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Settlement History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {courierSettlements.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No settlements yet
                  </div>
                ) : (
                  courierSettlements.map((settlement) => (
                    <div key={settlement.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                      <div>
                        <h4 className="font-medium">{settlement.settlement_id}</h4>
                        <p className="text-sm text-gray-500">
                          Balance: ${settlement.balance_usd} / {settlement.balance_lbp.toLocaleString()} LBP
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-400">
                            {format(new Date(settlement.created_at), 'yyyy-MM-dd')}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          Collected: ${settlement.total_collected_usd}
                        </div>
                        <div className="text-sm text-blue-600">
                          Fee: ${settlement.total_courier_fees_usd}
                        </div>
                        <Badge className={`text-xs mt-1 ${getStatusBadge(settlement.status)}`}>
                          {settlement.status}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CourierWalletContent;