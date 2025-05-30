
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useOrdersWithDateRange } from '@/hooks/use-orders';
import { useInvoices } from '@/hooks/use-invoices';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, FileText, TrendingUp, Download, Eye } from 'lucide-react';
import { format } from 'date-fns';

interface FinancialSummaryTabProps {
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

const FinancialSummaryTab: React.FC<FinancialSummaryTabProps> = ({ dateRange }) => {
  const { data: orders = [], isLoading: ordersLoading } = useOrdersWithDateRange(
    dateRange.startDate,
    dateRange.endDate
  );
  const { data: invoices = [], isLoading: invoicesLoading } = useInvoices();

  // Calculate financial metrics
  const totalCollectedUSD = orders.reduce((sum, order) => sum + (order.cash_collection_usd || 0), 0);
  const totalCollectedLBP = orders.reduce((sum, order) => sum + (order.cash_collection_lbp || 0), 0);
  const totalDeliveryFeesUSD = orders.reduce((sum, order) => sum + (order.delivery_fees_usd || 0), 0);
  const totalDeliveryFeesLBP = orders.reduce((sum, order) => sum + (order.delivery_fees_lbp || 0), 0);
  
  // Convert LBP to USD for calculations (approximate rate)
  const exchangeRate = 1500;
  const totalCollectedUSDEquivalent = totalCollectedUSD + (totalCollectedLBP / exchangeRate);
  const totalDeliveryFeesUSDEquivalent = totalDeliveryFeesUSD + (totalDeliveryFeesLBP / exchangeRate);
  const netEarnings = totalCollectedUSDEquivalent - totalDeliveryFeesUSDEquivalent;

  // Paid vs Unpaid orders
  const paidOrders = orders.filter(o => o.status === 'Paid').length;
  const unpaidOrders = orders.filter(o => o.status === 'Successful' && o.status !== 'Paid').length;

  // Daily cash flow data
  const dailyCashFlowData = React.useMemo(() => {
    const grouped: { [key: string]: { usd: number; lbp: number; fees: number } } = {};
    orders.forEach(order => {
      const date = new Date(order.created_at).toISOString().split('T')[0];
      if (!grouped[date]) {
        grouped[date] = { usd: 0, lbp: 0, fees: 0 };
      }
      grouped[date].usd += (order.cash_collection_usd || 0);
      grouped[date].lbp += (order.cash_collection_lbp || 0) / exchangeRate;
      grouped[date].fees += (order.delivery_fees_usd || 0) + ((order.delivery_fees_lbp || 0) / exchangeRate);
    });
    
    return Object.entries(grouped)
      .map(([date, data]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        collected: data.usd + data.lbp,
        fees: data.fees,
        net: (data.usd + data.lbp) - data.fees
      }))
      .slice(-14); // Last 14 days
  }, [orders]);

  // Delivery fees vs collected comparison
  const comparisonData = [
    { name: 'Collected Amount', value: totalCollectedUSDEquivalent, color: '#10B981' },
    { name: 'Delivery Fees', value: totalDeliveryFeesUSDEquivalent, color: '#DC291E' }
  ];

  // Payment status pie chart
  const paymentStatusData = [
    { name: 'Paid', value: paidOrders, color: '#10B981' },
    { name: 'Unpaid', value: unpaidOrders, color: '#F59E0B' }
  ].filter(item => item.value > 0);

  // Recent invoices (filter by date range)
  const recentInvoices = invoices
    .filter(invoice => {
      const invoiceDate = new Date(invoice.created_at);
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      return invoiceDate >= startDate && invoiceDate <= endDate;
    })
    .slice(0, 5);

  const stats = [
    {
      title: 'Total Collected',
      value: `$${totalCollectedUSDEquivalent.toFixed(2)}`,
      subtitle: `₪${totalCollectedLBP.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      title: 'Delivery Fees',
      value: `$${totalDeliveryFeesUSDEquivalent.toFixed(2)}`,
      subtitle: `₪${totalDeliveryFeesLBP.toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      title: 'Net Earnings',
      value: `$${netEarnings.toFixed(2)}`,
      subtitle: netEarnings >= 0 ? 'Profit' : 'Loss',
      icon: FileText,
      color: netEarnings >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: netEarnings >= 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'
    },
    {
      title: 'Invoices',
      value: recentInvoices.length.toString(),
      subtitle: `${paidOrders} paid orders`,
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    }
  ];

  const handleExportPDF = () => {
    console.log('Exporting PDF...');
    // Implement PDF export logic
  };

  const handleExportCSV = () => {
    console.log('Exporting CSV...');
    // Implement CSV export logic
  };

  if (ordersLoading || invoicesLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.title}</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{stat.value}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{stat.subtitle}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cash Flow Over Time */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Cash Flow Over Time (USD)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyCashFlowData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px'
                    }}
                    formatter={(value: any, name: string) => [
                      `$${parseFloat(value).toFixed(2)}`,
                      name.charAt(0).toUpperCase() + name.slice(1)
                    ]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="collected" 
                    stroke="#10B981" 
                    strokeWidth={3}
                    name="collected"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="fees" 
                    stroke="#DC291E" 
                    strokeWidth={3}
                    name="fees"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="net" 
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    name="net"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Payment Status */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Payment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {paymentStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentStatusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {paymentStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No payment data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue vs Fees Comparison */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Revenue vs Delivery Fees</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px'
                  }}
                  formatter={(value: any) => [`$${parseFloat(value).toFixed(2)}`, 'Amount']}
                />
                <Bar dataKey="value" fill="#DC291E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent Invoices & Export */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-0 shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Recent Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            {recentInvoices.length > 0 ? (
              <div className="space-y-3">
                {recentInvoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{invoice.invoice_id}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {format(new Date(invoice.created_at), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        ${invoice.total_amount_usd.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {invoice.merchant_name}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No invoices found for this period
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Export Reports</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleExportPDF}
              className="w-full flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export PDF Report
            </Button>
            <Button 
              onClick={handleExportCSV}
              variant="outline"
              className="w-full flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV Data
            </Button>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Reports include all data from the selected date range
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default FinancialSummaryTab;
