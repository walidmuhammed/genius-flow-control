
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGeographicalStats } from '@/hooks/use-analytics';
import { Skeleton } from '@/components/ui/skeleton';
import { formatNumber, formatPercent } from '@/utils/format';
import { MapPin, Clock } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import LebanonMap from '@/components/analytics/LebanonMap';

export default function GeographicalAnalysis() {
  const { data, isLoading } = useGeographicalStats();
  const [activeRegion, setActiveRegion] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold">Geographical Analysis</h2>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Regional Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="map" className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="map">Map</TabsTrigger>
              <TabsTrigger value="data">Data Table</TabsTrigger>
            </TabsList>
            
            <TabsContent value="map" className="space-y-4">
              {isLoading ? (
                <Skeleton className="h-[400px] w-full" />
              ) : (
                <div className="h-[400px] border rounded-lg overflow-hidden">
                  <LebanonMap 
                    data={data?.mapData || []}
                    onRegionClick={(region) => setActiveRegion(region)}
                    activeRegion={activeRegion}
                  />
                </div>
              )}
              
              {activeRegion && data?.regions && (
                <Card>
                  <CardHeader className="py-2">
                    <CardTitle className="text-md flex items-center gap-2">
                      <MapPin className="h-4 w-4" /> {activeRegion} Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    {(() => {
                      const region = data.regions.find(r => r.name === activeRegion);
                      if (!region) return null;
                      
                      return (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Orders</p>
                            <p className="font-bold">{formatNumber(region.totalOrders)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Success Rate</p>
                            <p className="font-bold">{formatPercent(region.successRate)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Avg. Delivery Time</p>
                            <p className="font-bold">{formatNumber(region.averageDeliveryTime)} min</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Cash Collected</p>
                            <p className="font-bold">${formatNumber(region.cashCollected.usd)}</p>
                          </div>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="data">
              {isLoading ? (
                <Skeleton className="h-[400px] w-full" />
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[180px]">Region</TableHead>
                        <TableHead className="text-right">Orders</TableHead>
                        <TableHead className="text-right">Success Rate</TableHead>
                        <TableHead className="text-right">Avg. Time</TableHead>
                        <TableHead className="text-right">Cash Collected (USD)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data?.regions.map((region) => (
                        <TableRow key={region.name}>
                          <TableCell className="font-medium">{region.name}</TableCell>
                          <TableCell className="text-right">{formatNumber(region.totalOrders)}</TableCell>
                          <TableCell className="text-right">{formatPercent(region.successRate)}</TableCell>
                          <TableCell className="text-right">{formatNumber(region.averageDeliveryTime)} min</TableCell>
                          <TableCell className="text-right">${formatNumber(region.cashCollected.usd)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              
              {!isLoading && data?.regions && data.regions.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-md font-medium mb-3">Cities Breakdown</h3>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>City</TableHead>
                          <TableHead>Region</TableHead>
                          <TableHead className="text-right">Orders</TableHead>
                          <TableHead className="text-right">Success Rate</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.regions.flatMap(region => 
                          region.cities.slice(0, 3).map(city => (
                            <TableRow key={`${region.name}-${city.name}`}>
                              <TableCell className="font-medium">{city.name}</TableCell>
                              <TableCell className="text-muted-foreground">{region.name}</TableCell>
                              <TableCell className="text-right">{formatNumber(city.totalOrders)}</TableCell>
                              <TableCell className="text-right">{formatPercent(city.successRate)}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
