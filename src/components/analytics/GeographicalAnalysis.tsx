
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGeographicalStats } from '@/hooks/use-analytics';
import CurrencyToggle from './CurrencyToggle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatNumber, formatPercent } from '@/utils/format';
import { ChevronRight, MapPin } from 'lucide-react';
import TopRegionsChart from './TopRegionsChart';
import RegionalSummary from './RegionalSummary';

export default function GeographicalAnalysis() {
  const [currency, setCurrency] = useState<'USD' | 'LBP'>('USD');
  const { data: geoStats, isLoading } = useGeographicalStats();
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Regional Performance Analysis</h3>
        <CurrencyToggle currency={currency} onChange={setCurrency} />
      </div>
      
      {/* Regional Analytics Visualization */}
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <TopRegionsChart data={geoStats?.regions} isLoading={isLoading} />
        </div>
        <div>
          <RegionalSummary data={geoStats?.regions} isLoading={isLoading} />
        </div>
      </div>
      
      {/* Regional Breakdown */}
      <Card>
        <CardHeader className="p-4 pb-0">
          <CardTitle>Regional Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-md bg-muted"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                    <div className="h-3 bg-muted rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Accordion 
              type="single" 
              collapsible 
              className="w-full"
              value={selectedRegion || undefined}
              onValueChange={(value) => setSelectedRegion(value || null)}
            >
              {geoStats?.regions.map((region) => (
                <AccordionItem 
                  key={region.name} 
                  value={region.name}
                  className="border-b"
                >
                  <AccordionTrigger className="py-4 hover:no-underline">
                    <motion.div 
                      className="flex items-center justify-between w-full px-2"
                      whileHover={{ x: 4 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 flex items-center justify-center rounded-md 
                          ${region.successRate > 80 ? 'bg-green-100 text-green-700' : 
                            region.successRate > 60 ? 'bg-yellow-100 text-yellow-700' : 
                            'bg-red-100 text-red-700'}`}
                        >
                          <MapPin className="h-5 w-5" />
                        </div>
                        <div className="text-left">
                          <div className="text-base font-semibold">{region.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatNumber(region.totalOrders)} orders
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-8">
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Success Rate</div>
                          <div className="flex items-center gap-2">
                            <Progress value={region.successRate} className="h-2 w-24" />
                            <span className="text-sm font-medium">
                              {formatPercent(region.successRate)}
                            </span>
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Cash Collected</div>
                          <div className="text-sm font-medium">
                            {formatCurrency(
                              currency === 'USD' ? region.cashCollected.usd : region.cashCollected.lbp, 
                              currency
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </AccordionTrigger>
                  
                  <AccordionContent className="pb-4 pt-1 px-2">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>City</TableHead>
                          <TableHead>Orders</TableHead>
                          <TableHead>Success Rate</TableHead>
                          <TableHead>Failure Rate</TableHead>
                          <TableHead>Cash Collected</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {region.cities.map((city) => (
                          <TableRow key={city.name}>
                            <TableCell className="font-medium">{city.name}</TableCell>
                            <TableCell>{formatNumber(city.totalOrders)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress value={city.successRate} className="h-2 w-16" />
                                <span>{formatPercent(city.successRate)}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={city.failureRate > 20 ? 'destructive' : 'outline'}>
                                {formatPercent(city.failureRate)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {formatCurrency(
                                currency === 'USD' ? city.cashCollected.usd : city.cashCollected.lbp,
                                currency
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
