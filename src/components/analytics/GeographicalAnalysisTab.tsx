
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useOrdersWithDateRange } from '@/hooks/use-orders';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { MapPin, TrendingUp, Clock, AlertTriangle } from 'lucide-react';

interface GeographicalAnalysisTabProps {
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

const GeographicalAnalysisTab: React.FC<GeographicalAnalysisTabProps> = ({ dateRange }) => {
  const { data: orders = [], isLoading } = useOrdersWithDateRange(
    dateRange.startDate,
    dateRange.endDate
  );

  // Lebanese governorates
  const governorates = [
    'Akkar', 'Baalbek-Hermel', 'Beirut', 'Beqaa', 
    'Mount Lebanon', 'North Lebanon', 'South Lebanon'
  ];

  // Group orders by governorate
  const governorateData = React.useMemo(() => {
    const grouped: { [key: string]: {
      orders: number;
      successful: number;
      failed: number;
      totalValue: number;
      avgDeliveryTime: number;
    }} = {};

    // Initialize all governorates
    governorates.forEach(gov => {
      grouped[gov] = {
        orders: 0,
        successful: 0,
        failed: 0,
        totalValue: 0,
        avgDeliveryTime: 0
      };
    });

    orders.forEach(order => {
      const gov = order.customer?.governorate_name || 'Unknown';
      if (grouped[gov]) {
        grouped[gov].orders++;
        grouped[gov].totalValue += (order.cash_collection_usd || 0) + (order.cash_collection_lbp || 0) / 1500;
        
        if (order.status === 'Successful') {
          grouped[gov].successful++;
        } else if (order.status === 'Unsuccessful' || order.status === 'Returned') {
          grouped[gov].failed++;
        }
      }
    });

    return Object.entries(grouped)
      .map(([name, data]) => ({
        governorate: name,
        orders: data.orders,
        successful: data.successful,
        failed: data.failed,
        totalValue: data.totalValue,
        successRate: data.orders > 0 ? ((data.successful / data.orders) * 100).toFixed(1) : '0'
      }))
      .sort((a, b) => b.orders - a.orders);
  }, [orders]);

  // Top performing regions
  const topRegions = governorateData
    .filter(item => item.orders > 0)
    .slice(0, 5);

  // Most orders region
  const mostOrdersRegion = topRegions[0];
  
  // Highest value region
  const highestValueRegion = governorateData
    .filter(item => item.orders > 0)
    .sort((a, b) => b.totalValue - a.totalValue)[0];

  // Most failed deliveries region
  const mostFailedRegion = governorateData
    .filter(item => item.failed > 0)
    .sort((a, b) => b.failed - a.failed)[0];

  // Best success rate region
  const bestSuccessRateRegion = governorateData
    .filter(item => item.orders > 0)
    .sort((a, b) => parseFloat(b.successRate) - parseFloat(a.successRate))[0];

  const stats = [
    {
      title: 'Most Orders',
      value: mostOrdersRegion?.governorate || 'N/A',
      subtitle: `${mostOrdersRegion?.orders || 0} orders`,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      title: 'Highest Revenue',
      value: highestValueRegion?.governorate || 'N/A',
      subtitle: `$${highestValueRegion?.totalValue.toFixed(2) || '0'}`,
      icon: MapPin,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      title: 'Best Success Rate',
      value: bestSuccessRateRegion?.governorate || 'N/A',
      subtitle: `${bestSuccessRateRegion?.successRate || 0}%`,
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    },
    {
      title: 'Most Failed',
      value: mostFailedRegion?.governorate || 'N/A',
      subtitle: `${mostFailedRegion?.failed || 0} failed`,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-900/20'
    }
  ];

  // Colors for pie chart
  const colors = ['#DC291E', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#06B6D4'];

  if (isLoading) {
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
        {/* Orders by Governorate */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Orders by Governorate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topRegions}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="governorate" 
                    stroke="#6B7280"
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis stroke="#6B7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="orders" fill="#DC291E" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Distribution */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Revenue Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topRegions}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="totalValue"
                    label={({ governorate, totalValue }) => 
                      totalValue > 0 ? `${governorate}: $${totalValue.toFixed(0)}` : null
                    }
                  >
                    {topRegions.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [`$${parseFloat(value).toFixed(2)}`, 'Revenue']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Regional Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Governorate</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">Orders</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">Success Rate</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">Revenue</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">Failed</th>
                </tr>
              </thead>
              <tbody>
                {governorateData
                  .filter(item => item.orders > 0)
                  .map((item, index) => (
                  <tr key={item.governorate} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                      {item.governorate}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant="outline">{item.orders}</Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge 
                        variant={parseFloat(item.successRate) >= 80 ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {item.successRate}%
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-sm">
                      ${item.totalValue.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {item.failed > 0 ? (
                        <Badge variant="destructive" className="text-xs">{item.failed}</Badge>
                      ) : (
                        <span className="text-gray-400">0</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default GeographicalAnalysisTab;
