import React, { useState } from 'react';
import { Download, Calculator, Search, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useOrders } from '@/hooks/use-orders';
import { useCouriers } from '@/hooks/use-couriers';
import { toast } from 'sonner';

const CourierSettlementsTab = () => {
  const { data: orders = [] } = useOrders();
  const { data: couriers = [] } = useCouriers();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourier, setSelectedCourier] = useState<string>('all');
  const [defaultCourierFee, setDefaultCourierFee] = useState({ usd: 2, lbp: 75000 });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Filter to show only successful orders with couriers
  const completedOrders = orders.filter(order => 
    order.status === 'Successful' && order.courier_id
  );
  
  // Filter orders based on search and courier selection
  const filteredOrders = completedOrders.filter(order => {
    const matchesSearch = !searchTerm || 
      order.reference_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.courier_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.order_id.toString().includes(searchTerm);
    
    const matchesCourier = selectedCourier === 'all' || order.courier_id === selectedCourier;
    
    return matchesSearch && matchesCourier;
  });

  // Group orders by courier
  const courierOrders = filteredOrders.reduce((acc, order) => {
    const courierId = order.courier_id || 'unknown';
    if (!acc[courierId]) {
      acc[courierId] = [];
    }
    acc[courierId].push(order);
    return acc;
  }, {} as Record<string, typeof filteredOrders>);

  const calculateCourierBalance = (courierOrders: typeof filteredOrders) => {
    let totalCollectedUSD = 0;
    let totalCollectedLBP = 0;
    let totalCourierFeeUSD = 0;
    let totalCourierFeeLBP = 0;

    courierOrders.forEach(order => {
      // Amount collected from customers
      totalCollectedUSD += (order.cash_collection_usd || 0) + (order.delivery_fees_usd || 0);
      totalCollectedLBP += (order.cash_collection_lbp || 0) + (order.delivery_fees_lbp || 0);
      
      // Courier fee (assuming default for now - could be customized per courier)
      totalCourierFeeUSD += defaultCourierFee.usd;
      totalCourierFeeLBP += defaultCourierFee.lbp;
    });

    // Net balance = Amount courier owes platform (collected - their fee)
    const netBalanceUSD = totalCollectedUSD - totalCourierFeeUSD;
    const netBalanceLBP = totalCollectedLBP - totalCourierFeeLBP;

    return {
      totalCollectedUSD,
      totalCollectedLBP,
      totalCourierFeeUSD,
      totalCourierFeeLBP,
      netBalanceUSD,
      netBalanceLBP,
      orderCount: courierOrders.length
    };
  };

  const handleCreateSettlement = (courierId: string) => {
    toast.success(`Settlement created for courier ${courierId.slice(-8)}`);
  };

  const handleUpdateCourierFees = () => {
    toast.success('Default courier fees updated');
    setIsSettingsOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Courier Settlements</CardTitle>
            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Courier Settings
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Default Courier Fees</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fee-usd">Default Fee (USD)</Label>
                    <Input
                      id="fee-usd"
                      type="number"
                      step="0.5"
                      value={defaultCourierFee.usd}
                      onChange={(e) => setDefaultCourierFee(prev => ({
                        ...prev,
                        usd: Number(e.target.value)
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fee-lbp">Default Fee (LBP)</Label>
                    <Input
                      id="fee-lbp"
                      type="number"
                      step="1000"
                      value={defaultCourierFee.lbp}
                      onChange={(e) => setDefaultCourierFee(prev => ({
                        ...prev,
                        lbp: Number(e.target.value)
                      }))}
                    />
                  </div>
                  <Button onClick={handleUpdateCourierFees} className="w-full">
                    Update Fees
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by order ID, courier name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedCourier} onValueChange={setSelectedCourier}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by courier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Couriers</SelectItem>
                {couriers.map(courier => (
                  <SelectItem key={courier.id} value={courier.id}>
                    {courier.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Courier Settlements */}
      <div className="space-y-4">
        {Object.entries(courierOrders).map(([courierId, orders]) => {
          const balance = calculateCourierBalance(orders);
          const courier = couriers.find(c => c.id === courierId);
          
          return (
            <Card key={courierId}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">
                      {courier?.full_name || `Courier ${courierId.slice(-8)}`}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {balance.orderCount} orders completed
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        Balance: ${balance.netBalanceUSD.toFixed(2)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        LBP {balance.netBalanceLBP.toLocaleString()}
                      </div>
                    </div>
                    <Button 
                      onClick={() => handleCreateSettlement(courierId)}
                      className="flex items-center gap-2"
                    >
                      <Calculator className="h-4 w-4" />
                      Create Settlement
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center p-3 bg-secondary/20 rounded-lg">
                    <div className="text-sm text-muted-foreground">Total Collected</div>
                    <div className="font-bold">${balance.totalCollectedUSD.toFixed(2)}</div>
                    <div className="text-xs">LBP {balance.totalCollectedLBP.toLocaleString()}</div>
                  </div>
                  <div className="text-center p-3 bg-secondary/20 rounded-lg">
                    <div className="text-sm text-muted-foreground">Courier Fees</div>
                    <div className="font-bold">${balance.totalCourierFeeUSD.toFixed(2)}</div>
                    <div className="text-xs">LBP {balance.totalCourierFeeLBP.toLocaleString()}</div>
                  </div>
                  <div className="text-center p-3 bg-secondary/20 rounded-lg">
                    <div className="text-sm text-muted-foreground">Net Due</div>
                    <div className="font-bold text-green-600">${balance.netBalanceUSD.toFixed(2)}</div>
                    <div className="text-xs">LBP {balance.netBalanceLBP.toLocaleString()}</div>
                  </div>
                  <div className="text-center p-3 bg-secondary/20 rounded-lg">
                    <div className="text-sm text-muted-foreground">Orders</div>
                    <div className="font-bold">{balance.orderCount}</div>
                    <div className="text-xs">Completed</div>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Amount Collected</TableHead>
                        <TableHead>Courier Fee</TableHead>
                        <TableHead>Net Due</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => {
                        const totalCollected = (order.cash_collection_usd || 0) + (order.delivery_fees_usd || 0);
                        const netDue = totalCollected - defaultCourierFee.usd;
                        
                        return (
                          <TableRow key={order.id}>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-medium">#{order.order_id}</div>
                                <div className="text-sm text-muted-foreground">
                                  {order.reference_number}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{order.customer?.name || 'N/A'}</div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-medium">${totalCollected.toFixed(2)}</div>
                                <div className="text-sm text-muted-foreground">
                                  LBP {((order.cash_collection_lbp || 0) + (order.delivery_fees_lbp || 0)).toLocaleString()}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-medium">${defaultCourierFee.usd.toFixed(2)}</div>
                                <div className="text-sm text-muted-foreground">
                                  LBP {defaultCourierFee.lbp.toLocaleString()}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-medium text-green-600">${netDue.toFixed(2)}</div>
                                <div className="text-sm text-muted-foreground">
                                  LBP {(((order.cash_collection_lbp || 0) + (order.delivery_fees_lbp || 0)) - defaultCourierFee.lbp).toLocaleString()}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">Pending</Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {Object.keys(courierOrders).length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No courier settlements found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CourierSettlementsTab;