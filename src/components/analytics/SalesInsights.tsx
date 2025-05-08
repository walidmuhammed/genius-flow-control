
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSalesInsightsStats } from '@/hooks/use-analytics';
import { Skeleton } from '@/components/ui/skeleton';
import { formatNumber, formatCurrency } from '@/utils/format';
import { Users, RepeatIcon, DollarSign, BarChartHorizontalIcon, PieChart as PieChartIcon } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SalesInsights() {
  const { data, isLoading } = useSalesInsightsStats();
  
  // Colors for the charts
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#F97316'];
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold">Sales Insights</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Customers */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" /> Top Customers
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {isLoading ? (
              <div className="space-y-2">
                {Array(5).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {data?.topCustomers.slice(0, 5).map((customer, index) => (
                  <div key={customer.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        <Avatar>
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {customer.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatNumber(customer.totalOrders)} orders · ${formatNumber(customer.totalSpent.usd)}
                        </p>
                      </div>
                    </div>
                    <div className="text-lg font-bold">#{index + 1}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Repeat Order Frequency */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <RepeatIcon className="h-5 w-5" /> Repeat Order Frequency
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {isLoading ? (
              <Skeleton className="h-[250px] w-full" />
            ) : (
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data?.repeatOrderFrequency || []}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="repeats" 
                      label={{ value: 'Number of Orders', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis 
                      label={{ value: 'Number of Customers', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      formatter={(value: number) => [formatNumber(value), 'Customers']}
                      labelFormatter={(value) => `Placed ${value} order${value > 1 ? 's' : ''}`}
                    />
                    <Bar 
                      dataKey="customerCount" 
                      fill="#8B5CF6"
                      name="Customers"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Average Order Value */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5" /> Average Order Value
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-6 w-1/2" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">USD</p>
                  <p className="text-2xl font-bold">${formatNumber(data?.averageOrderValue.usd || 0)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">LBP</p>
                  <p className="text-2xl font-bold">{formatNumber(data?.averageOrderValue.lbp || 0)}</p>
                </div>
                <div className="flex items-center">
                  <div className={`mr-2 ${data?.averageOrderValue.trend && data.averageOrderValue.trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {data?.averageOrderValue.trend && data.averageOrderValue.trend > 0 ? '↑' : '↓'}
                  </div>
                  <p className="text-sm">
                    <span className={`font-medium ${data?.averageOrderValue.trend && data.averageOrderValue.trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {Math.abs(data?.averageOrderValue.trend || 0)}%
                    </span>
                    <span className="text-muted-foreground"> vs last period</span>
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Categories */}
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChartHorizontalIcon className="h-5 w-5" /> Top Categories
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {isLoading ? (
              <Skeleton className="h-[250px] w-full" />
            ) : (
              <Tabs defaultValue="volume" className="w-full">
                <TabsList className="mb-2">
                  <TabsTrigger value="volume">By Volume</TabsTrigger>
                  <TabsTrigger value="revenue">By Revenue</TabsTrigger>
                </TabsList>
                
                <TabsContent value="volume">
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        layout="vertical"
                        data={data?.topCategories.slice(0, 5) || []}
                        margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis 
                          dataKey="name" 
                          type="category" 
                          tick={{ fontSize: 12 }}
                          width={80}
                        />
                        <Tooltip formatter={(value: number) => [formatNumber(value), 'Orders']} />
                        <Bar 
                          dataKey="count" 
                          fill="#3B82F6" 
                          name="Orders" 
                          radius={[0, 4, 4, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>
                
                <TabsContent value="revenue">
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        layout="vertical"
                        data={data?.topCategories.slice(0, 5) || []}
                        margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis 
                          dataKey="name" 
                          type="category" 
                          tick={{ fontSize: 12 }}
                          width={80}
                        />
                        <Tooltip formatter={(value: number) => [`$${formatNumber(value)}`, 'Revenue']} />
                        <Bar 
                          dataKey="revenue.usd" 
                          fill="#10B981" 
                          name="Revenue (USD)" 
                          radius={[0, 4, 4, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Most Exchanged Items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <PieChartIcon className="h-5 w-5" /> Most Exchanged Items
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {isLoading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : (
            <div className="flex flex-col md:flex-row gap-4 items-center justify-center h-[300px]">
              {/* Pie Chart */}
              <div className="h-full w-full md:w-1/2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data?.mostExchangedItems || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {data?.mostExchangedItems.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number, name: string) => [formatNumber(value), name]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              {/* Legend Table */}
              <div className="w-full md:w-1/2 overflow-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left">
                      <th className="pb-2">Item Type</th>
                      <th className="pb-2 text-right">Count</th>
                      <th className="pb-2 text-right">Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.mostExchangedItems.map((item, index) => (
                      <tr key={item.name} className="border-t">
                        <td className="py-2 flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-2" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }} 
                          />
                          {item.name}
                        </td>
                        <td className="py-2 text-right">{formatNumber(item.count)}</td>
                        <td className="py-2 text-right">{item.percentage.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
