
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useFinancialStats } from '@/hooks/use-analytics';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatCurrency } from '@/utils/format';
import ChartCard from './ChartCard';
import CurrencyToggle from './CurrencyToggle';
import PeriodToggle from './PeriodToggle';

export default function FinancialFlow() {
  const [currency, setCurrency] = useState<'USD' | 'LBP'>('USD');
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  
  const { data: financialStats, isLoading } = useFinancialStats(period);

  const COLORS = ['#4f46e5', '#10b981', '#f97316', '#ef4444'];
  
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-4">
        <CurrencyToggle currency={currency} onChange={setCurrency} />
        <PeriodToggle period={period} onChange={setPeriod} />
      </div>
      
      {/* Cash Flow Chart */}
      <ChartCard
        title="Total Cash Flow"
        description="Total cash collected over time"
        isLoading={isLoading}
        className="col-span-2"
        headerRight={<div className="text-sm text-muted-foreground">{period === 'daily' ? 'Last 30 days' : period === 'weekly' ? 'Last 12 weeks' : 'Last 12 months'}</div>}
        chart={
          <div className="h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={financialStats?.cashFlow || []}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorUsd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="colorLbp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis 
                  tick={{ fontSize: 12 }} 
                  tickFormatter={(value) => formatCurrency(value, currency, true)} 
                />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value, currency), currency]} 
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey={currency.toLowerCase()}
                  stroke={currency === 'USD' ? '#4f46e5' : '#f97316'}
                  fillOpacity={1}
                  fill={`url(#color${currency})`}
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        }
      />
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* COD vs Online Payments */}
        <ChartCard
          title="Payment Methods"
          description="Distribution of payment methods"
          isLoading={isLoading}
          chart={
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={financialStats?.paymentMethods || []}
                  layout="vertical"
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tickFormatter={(value) => `${value}%`} />
                  <YAxis dataKey="method" type="category" width={100} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                  <Legend />
                  <Bar dataKey="percentage" barSize={30} radius={[0, 4, 4, 0]}>
                    {(financialStats?.paymentMethods || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          }
        />
        
        {/* Failed Collections */}
        <ChartCard
          title="Cash Collection Success Rate"
          description="Successful vs. Failed Cash Collections"
          isLoading={isLoading}
          chart={
            <div className="h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="70%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { 
                        name: 'Collected', 
                        value: financialStats?.failedCollections.collected || 0 
                      },
                      { 
                        name: 'Failed', 
                        value: financialStats?.failedCollections.failed || 0 
                      }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#ef4444" />
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [value, name]} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          }
        />
        
        {/* Avg Cash per Order */}
        <ChartCard
          title="Average Cash per Order"
          description="Average amount collected per successful order"
          isLoading={isLoading}
          chart={
            <div className="flex flex-col items-center justify-center h-[200px]">
              <div className="text-3xl font-bold mb-2">
                {formatCurrency(
                  currency === 'USD' 
                    ? (financialStats?.avgCashPerOrder.usd || 0) 
                    : (financialStats?.avgCashPerOrder.lbp || 0),
                  currency
                )}
              </div>
              
              {financialStats?.avgCashPerOrder.trend && (
                <div className={`text-sm ${financialStats.avgCashPerOrder.trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {financialStats.avgCashPerOrder.trend >= 0 ? '↑' : '↓'} {Math.abs(financialStats.avgCashPerOrder.trend).toFixed(1)}% from previous {period}
                </div>
              )}
              
              <div className="w-full mt-6">
                <ResponsiveContainer width="100%" height={60}>
                  <BarChart 
                    data={[{ value: currency === 'USD' ? (financialStats?.avgCashPerOrder.usd || 0) : (financialStats?.avgCashPerOrder.lbp || 0) }]}
                    layout="vertical"
                    margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                  >
                    <Bar 
                      dataKey="value" 
                      fill={currency === 'USD' ? '#4f46e5' : '#f97316'} 
                      radius={[4, 4, 4, 4]} 
                      barSize={20} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          }
        />
        
        {/* Refund Rate */}
        <ChartCard
          title="Exchange/Refund Rate"
          description="Percentage of orders that were exchanged or refunded"
          isLoading={isLoading}
          chart={
            <div className="h-[200px] flex flex-col items-center justify-center">
              <div className="text-3xl font-bold mb-2">
                {financialStats?.refundRate ? financialStats.refundRate.toFixed(1) : '0.0'}%
              </div>
              
              <div className="w-full mt-6">
                <ResponsiveContainer width="100%" height={60}>
                  <BarChart
                    layout="vertical"
                    data={[{ name: 'Refund Rate', value: financialStats?.refundRate || 0 }]}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <XAxis type="number" domain={[0, 100]} hide />
                    <Bar 
                      dataKey="value" 
                      fill="#ef4444" 
                      background={{ fill: '#e5e7eb' }}
                      radius={[4, 4, 4, 4]}
                      barSize={20}
                    >
                      {/* This is where the error was happening - we need to safely handle undefined values */}
                      <LabelList 
                        dataKey="value" 
                        position="insideRight" 
                        formatter={(value: number | null | undefined) => {
                          // Safely handle undefined or null values
                          if (value === undefined || value === null) return '0.0%';
                          return `${value.toFixed(1)}%`;
                        }} 
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          }
        />
      </div>
    </div>
  );
}

// Helper component for labels in charts
const LabelList = (props: any) => {
  const { x, y, width, height, value, formatter } = props;
  // Apply the formatter safely - if formatter doesn't exist or value is undefined, handle it gracefully
  const formattedValue = formatter && value !== undefined && value !== null 
    ? formatter(value) 
    : (value !== undefined && value !== null ? value : '');
  
  return (
    <text 
      x={x + width - 10} 
      y={y + height / 2} 
      fill="#fff" 
      textAnchor="end" 
      dominantBaseline="middle"
    >
      {formattedValue}
    </text>
  );
};
