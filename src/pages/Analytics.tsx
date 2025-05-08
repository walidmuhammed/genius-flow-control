
import React from 'react';
import { motion } from 'framer-motion';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DeliveryPerformance from '@/components/analytics/DeliveryPerformance';
import GeographicalAnalysis from '@/components/analytics/GeographicalAnalysis';
import FinancialSummary from '@/components/analytics/FinancialSummary';
import SalesInsights from '@/components/analytics/SalesInsights';

// Create a client
const queryClient = new QueryClient();

const Analytics: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <MainLayout>
        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col justify-between space-y-2">
            <motion.h1 
              className="text-3xl font-bold tracking-tight"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              Analytics Dashboard
            </motion.h1>
            <motion.p 
              className="text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              Track business performance metrics and insights in real-time
            </motion.p>
          </div>
          
          <Tabs defaultValue="delivery" className="space-y-8">
            <div className="bg-card rounded-lg border shadow-sm overflow-auto">
              <TabsList className="p-0 flex w-full">
                <TabsTrigger 
                  value="delivery" 
                  className="flex-1 rounded-none border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  🚚 Delivery Performance
                </TabsTrigger>
                <TabsTrigger 
                  value="geographical" 
                  className="flex-1 rounded-none border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  🌍 Geographical Analysis
                </TabsTrigger>
                <TabsTrigger 
                  value="financial" 
                  className="flex-1 rounded-none border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  💵 Financial Summary
                </TabsTrigger>
                <TabsTrigger 
                  value="sales" 
                  className="flex-1 rounded-none border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  📈 Sales Insights
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="delivery" className="space-y-8 mt-6 animate-in fade-in-50">
              <DeliveryPerformance />
            </TabsContent>
            
            <TabsContent value="geographical" className="space-y-8 mt-6 animate-in fade-in-50">
              <GeographicalAnalysis />
            </TabsContent>
            
            <TabsContent value="financial" className="space-y-8 mt-6 animate-in fade-in-50">
              <FinancialSummary />
            </TabsContent>
            
            <TabsContent value="sales" className="space-y-8 mt-6 animate-in fade-in-50">
              <SalesInsights />
            </TabsContent>
          </Tabs>
        </motion.div>
      </MainLayout>
    </QueryClientProvider>
  );
};

export default Analytics;
