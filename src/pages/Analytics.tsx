
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Calendar, ChevronLeft, ChevronRight, Filter, RefreshCcw, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

import MissionControl from '@/components/analytics/MissionControl';
import FinancialFlow from '@/components/analytics/FinancialFlow';
import GeographicalAnalysis from '@/components/analytics/GeographicalAnalysis';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client
const queryClient = new QueryClient();

const Analytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('mission-control');
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to?: Date;
  }>({
    from: new Date(),
    to: undefined,
  });
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Function to refresh data
  const refreshData = () => {
    queryClient.invalidateQueries();
  };

  return (
    <QueryClientProvider client={queryClient}>
      <MainLayout>
        <motion.div 
          className="flex flex-col space-y-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <motion.h1 
                className="text-2xl sm:text-3xl font-bold tracking-tight"
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
                Track your business performance in real-time with detailed metrics and insights.
              </motion.p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !dateRange && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} -{" "}
                          {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <CalendarComponent
                    mode="range"
                    selected={dateRange}
                    onSelect={(range) => {
                      setDateRange(range || { from: new Date() });
                      if (range?.to) setIsDatePickerOpen(false);
                    }}
                    initialFocus
                  />
                  <div className="p-3 border-t border-border flex justify-between">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setIsDatePickerOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => {
                        refreshData();
                        setIsDatePickerOpen(false);
                      }}
                    >
                      Apply Range
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
              
              <Button variant="outline" size="icon" onClick={refreshData}>
                <RefreshCcw className="h-4 w-4" />
              </Button>
              
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
              
              <Button variant="outline">
                <Share className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="mission-control" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <div className="bg-card rounded-lg border shadow-sm">
              <TabsList className="grid w-full grid-cols-3 lg:grid-cols-3 rounded-none">
                <TabsTrigger 
                  value="mission-control" 
                  className="rounded-none border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  Live Mission Control
                </TabsTrigger>
                <TabsTrigger 
                  value="financial" 
                  className="rounded-none border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  Financial Flow
                </TabsTrigger>
                <TabsTrigger 
                  value="geographical" 
                  className="rounded-none border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  Geographical Analysis
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="mission-control" className="space-y-8 mt-6">
              <MissionControl />
            </TabsContent>
            
            <TabsContent value="financial" className="space-y-8 mt-6">
              <FinancialFlow />
            </TabsContent>
            
            <TabsContent value="geographical" className="space-y-8 mt-6">
              <GeographicalAnalysis />
            </TabsContent>
          </Tabs>
        </motion.div>
      </MainLayout>
    </QueryClientProvider>
  );
};

export default Analytics;
