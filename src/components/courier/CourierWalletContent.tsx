import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Eye
} from 'lucide-react';

const CourierWalletContent = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth');

  // Mock data - in real app this would come from hooks
  const balanceData = {
    currentBalanceUSD: 245.75,
    currentBalanceLBP: 3686250,
    pendingPayoutUSD: 125.50,
    pendingPayoutLBP: 1882500
  };

  const earningsSummary = {
    totalDeliveries: 47,
    totalEarningsUSD: 542.25,
    totalEarningsLBP: 8133750,
    totalPaidToAdmin: 0,
    totalPendingPayout: 245.75
  };

  const transactions = [
    {
      id: 'TXN-001',
      date: '2024-01-15',
      type: 'Delivery Fee Earned',
      amount: { usd: 12.50, lbp: 187500 },
      orderId: 'ORD-001',
      description: 'Delivery from Beirut to Jounieh',
      status: 'Completed'
    },
    {
      id: 'TXN-002',
      date: '2024-01-15',
      type: 'Delivery Fee Earned',
      amount: { usd: 18.00, lbp: 270000 },
      orderId: 'ORD-002',
      description: 'Delivery from Tripoli to Beirut',
      status: 'Completed'
    },
    {
      id: 'TXN-003',
      date: '2024-01-14',
      type: 'Payout Received',
      amount: { usd: -200.00, lbp: -3000000 },
      orderId: null,
      description: 'Weekly payout - January Week 2',
      status: 'Completed'
    },
    {
      id: 'TXN-004',
      date: '2024-01-14',
      type: 'Delivery Fee Earned',
      amount: { usd: 15.75, lbp: 236250 },
      orderId: 'ORD-003',
      description: 'Delivery from Sidon to Tyre',
      status: 'Completed'
    }
  ];

  const invoices = [
    {
      id: 'INV-001',
      period: 'January 2024 - Week 2',
      totalEarnings: { usd: 385.50, lbp: 5782500 },
      payout: { usd: 200.00, lbp: 3000000 },
      status: 'Paid',
      date: '2024-01-14'
    },
    {
      id: 'INV-002',
      period: 'January 2024 - Week 1',
      totalEarnings: { usd: 298.75, lbp: 4481250 },
      payout: { usd: 150.00, lbp: 2250000 },
      status: 'Paid',
      date: '2024-01-07'
    }
  ];

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
            <div className="text-2xl font-bold">${balanceData.currentBalanceUSD}</div>
            <p className="text-xs text-muted-foreground">
              {balanceData.currentBalanceLBP.toLocaleString()} LBP
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payout</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${balanceData.pendingPayoutUSD}</div>
            <p className="text-xs text-muted-foreground">
              {balanceData.pendingPayoutLBP.toLocaleString()} LBP
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
              <div className="text-2xl font-bold text-blue-600">${earningsSummary.totalPaidToAdmin}</div>
              <p className="text-sm text-gray-500">Paid to Admin</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">${earningsSummary.totalPendingPayout}</div>
              <p className="text-sm text-gray-500">Pending Payout</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Transactions and Invoices */}
      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
          <TabsTrigger value="invoices">Invoice History</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Recent Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.map((transaction) => (
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
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Invoice History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                    <div>
                      <h4 className="font-medium">{invoice.id}</h4>
                      <p className="text-sm text-gray-500">{invoice.period}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-400">{invoice.date}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        Earnings: ${invoice.totalEarnings.usd}
                      </div>
                      <div className="text-sm text-blue-600">
                        Payout: ${invoice.payout.usd}
                      </div>
                      <Badge className={`text-xs mt-1 ${getStatusBadge(invoice.status)}`}>
                        {invoice.status}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CourierWalletContent;