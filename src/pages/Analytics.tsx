
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Download, Truck, MapPin, DollarSign } from 'lucide-react';
import DeliveryPerformanceTab from '@/components/analytics/DeliveryPerformanceTab';
import GeographicalAnalysisTab from '@/components/analytics/GeographicalAnalysisTab';
import FinancialSummaryTab from '@/components/analytics/FinancialSummaryTab';
import DateRangeFilter from '@/components/analytics/DateRangeFilter';

const Analytics: React.FC = () => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date().toISOString()
  });

  return (
    <MainLayout>
      <motion.div 
        className="space-y-6 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <motion.h1 
              className="text-3xl font-bold text-gray-900 dark:text-white"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              Analytics Dashboard
            </motion.h1>
            <motion.p 
              className="text-gray-600 dark:text-gray-400 mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              Real-time insights into your logistics performance
            </motion.p>
          </div>
          
          <div className="flex items-center space-x-3">
            <DateRangeFilter 
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
            />
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="delivery" className="w-full">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <TabsList className="grid w-full grid-cols-3 bg-white dark:bg-gray-800 border shadow-sm rounded-xl p-1">
              <TabsTrigger 
                value="delivery" 
                className="flex items-center gap-2 rounded-lg data-[state=active]:bg-[#DC291E] data-[state=active]:text-white"
              >
                <Truck className="h-4 w-4" />
                <span className="hidden sm:inline">Delivery Performance</span>
                <span className="sm:hidden">Delivery</span>
              </TabsTrigger>
              <TabsTrigger 
                value="geographical" 
                className="flex items-center gap-2 rounded-lg data-[state=active]:bg-[#DC291E] data-[state=active]:text-white"
              >
                <MapPin className="h-4 w-4" />
                <span className="hidden sm:inline">Geographical Analysis</span>
                <span className="sm:hidden">Geography</span>
              </TabsTrigger>
              <TabsTrigger 
                value="financial" 
                className="flex items-center gap-2 rounded-lg data-[state=active]:bg-[#DC291E] data-[state=active]:text-white"
              >
                <DollarSign className="h-4 w-4" />
                <span className="hidden sm:inline">Financial Summary</span>
                <span className="sm:hidden">Financial</span>
              </TabsTrigger>
            </TabsList>
          </motion.div>
          
          <div className="mt-6">
            <TabsContent value="delivery" className="space-y-6">
              <DeliveryPerformanceTab dateRange={dateRange} />
            </TabsContent>
            
            <TabsContent value="geographical" className="space-y-6">
              <GeographicalAnalysisTab dateRange={dateRange} />
            </TabsContent>
            
            <TabsContent value="financial" className="space-y-6">
              <FinancialSummaryTab dateRange={dateRange} />
            </TabsContent>
          </div>
        </Tabs>
      </motion.div>
    </MainLayout>
  );
};

export default Analytics;
