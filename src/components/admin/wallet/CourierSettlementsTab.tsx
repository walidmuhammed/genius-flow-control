import React, { useState } from 'react';
import { Calculator, Search, Settings, HandCoins, CheckCircle, Clock, DollarSign, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useCouriers } from '@/hooks/use-couriers';
import { useCourierSettlements, useCourierBalance, useOpenOrdersByCourier, useCreateCourierSettlement, useRecordCashHandover, useMarkSettlementPaid } from '@/hooks/use-courier-settlements';
import { useCourierPricingDefaults, useUpdateCourierPricingDefaults } from '@/hooks/use-courier-pricing';
import CurrencyDisplay from '@/components/orders/CurrencyDisplay';
import { toast } from 'sonner';

const CourierSettlementsTab = () => {
  const { data: couriers = [] } = useCouriers();
  const { data: settlements = [] } = useCourierSettlements();
  const { data: pricingDefaults = [] } = useCourierPricingDefaults();
  const updatePricingDefaults = useUpdateCourierPricingDefaults();
  const createSettlement = useCreateCourierSettlement();
  const recordCashHandover = useRecordCashHandover();
  const markAsPaid = useMarkSettlementPaid();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourier, setSelectedCourier] = useState<string>('all');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedCourierForDetails, setSelectedCourierForDetails] = useState<string | null>(null);
  const [isCreateSettlementOpen, setIsCreateSettlementOpen] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [settlementNotes, setSettlementNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash Handover');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedSettlementId, setSelectedSettlementId] = useState<string | null>(null);
  
  // Get pricing defaults for settings
  const parcelPricing = pricingDefaults.find(p => p.package_type === 'parcel');
  const documentPricing = pricingDefaults.find(p => p.package_type === 'document');
  const bulkyPricing = pricingDefaults.find(p => p.package_type === 'bulky');

  // Filter couriers based on search
  const filteredCouriers = couriers.filter(courier => {
    const matchesSearch = !searchTerm || 
      courier.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      courier.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCourier = selectedCourier === 'all' || courier.id === selectedCourier;
    
    return matchesSearch && matchesCourier;
  });

  // Hook for selected courier details
  const { data: courierBalance } = useCourierBalance(selectedCourierForDetails || undefined);
  const { data: openOrders = [] } = useOpenOrdersByCourier(selectedCourierForDetails || undefined);

  const handleCreateSettlement = async () => {
    if (!selectedCourierForDetails || selectedOrders.length === 0) {
      toast.error('Please select orders to create settlement');
      return;
    }

    try {
      await createSettlement.mutateAsync({
        courier_id: selectedCourierForDetails,
        order_ids: selectedOrders,
        notes: settlementNotes
      });
      
      setIsCreateSettlementOpen(false);
      setSelectedOrders([]);
      setSettlementNotes('');
      setSelectedCourierForDetails(null);
    } catch (error) {
      console.error('Error creating settlement:', error);
    }
  };

  const handleCashHandover = async (settlementId: string) => {
    try {
      await recordCashHandover.mutateAsync(settlementId);
    } catch (error) {
      console.error('Error recording cash handover:', error);
    }
  };

  const handleMarkAsPaid = async () => {
    if (!selectedSettlementId) return;
    
    try {
      await markAsPaid.mutateAsync({
        settlementId: selectedSettlementId,
        paymentMethod,
        notes: paymentNotes
      });
      setPaymentNotes('');
      setIsPaymentDialogOpen(false);
      setSelectedSettlementId(null);
    } catch (error) {
      console.error('Error marking settlement as paid:', error);
    }
  };

  const handleUpdateCourierFees = async () => {
    try {
      if (parcelPricing) {
        await updatePricingDefaults.mutateAsync({
          id: parcelPricing.id,
          updates: {
            base_fee_usd: parcelPricing.base_fee_usd,
            base_fee_lbp: parcelPricing.base_fee_lbp
          }
        });
      }
      setIsSettingsOpen(false);
    } catch (error) {
      console.error('Error updating pricing defaults:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'In Progress':
        return <Badge variant="outline"><HandCoins className="h-3 w-3 mr-1" />In Progress</Badge>;
      case 'Paid':
        return <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />Paid</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getDirectionBadge = (direction: string, balance: { usd: number; lbp: number }) => {
    if (direction === 'courier_to_admin') {
      return (
        <div className="text-right">
          <Badge variant="default" className="bg-green-100 text-green-800">
            Courier owes Admin
          </Badge>
          <div className="text-sm mt-1">
            <CurrencyDisplay valueUSD={Math.abs(balance.usd)} valueLBP={Math.abs(balance.lbp)} />
          </div>
        </div>
      );
    } else {
      return (
        <div className="text-right">
          <Badge variant="destructive" className="bg-red-100 text-red-800">
            Admin owes Courier
          </Badge>
          <div className="text-sm mt-1">
            <CurrencyDisplay valueUSD={Math.abs(balance.usd)} valueLBP={Math.abs(balance.lbp)} />
          </div>
        </div>
      );
    }
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
                    <Label>Parcel Fee (USD)</Label>
                    <Input
                      type="number"
                      step="0.5"
                      value={parcelPricing?.base_fee_usd || 2}
                      readOnly
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Document Fee (USD)</Label>
                    <Input
                      type="number"
                      step="0.5"
                      value={documentPricing?.base_fee_usd || 1.5}
                      readOnly
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Bulky Fee (USD)</Label>
                    <Input
                      type="number"
                      step="0.5"
                      value={bulkyPricing?.base_fee_usd || 3}
                      readOnly
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
                  placeholder="Search by courier name..."
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

      {/* Courier List */}
      <div className="space-y-4">
        {filteredCouriers.map((courier) => {
          const courierSettlements = settlements.filter(s => s.courier_id === courier.id);
          
          return (
            <Card key={courier.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">
                      {courier.full_name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {courier.phone} • {courier.vehicle_type}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedCourierForDetails(courier.id)}
                      className="flex items-center gap-2"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              {courierSettlements.length > 0 && (
                <CardContent>
                  <div className="space-y-2">
                    <h4 className="font-medium">Recent Settlements</h4>
                    {courierSettlements.slice(0, 3).map((settlement) => (
                      <div key={settlement.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{settlement.settlement_id}</span>
                          {getStatusBadge(settlement.status)}
                        </div>
                        <div className="flex items-center gap-2">
                          {getDirectionBadge(settlement.direction, {
                            usd: settlement.balance_usd,
                            lbp: settlement.balance_lbp
                          })}
                          {settlement.status === 'Pending' && settlement.direction === 'courier_to_admin' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleCashHandover(settlement.id)}
                            >
                              <HandCoins className="h-3 w-3 mr-1" />
                              Record Cash
                            </Button>
                          )}
                          {settlement.status === 'In Progress' && (
                            <Button 
                              size="sm"
                              onClick={() => {
                                setSelectedSettlementId(settlement.id);
                                setIsPaymentDialogOpen(true);
                              }}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Mark Paid
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Courier Details Dialog */}
      <Dialog open={!!selectedCourierForDetails} onOpenChange={() => setSelectedCourierForDetails(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {couriers.find(c => c.id === selectedCourierForDetails)?.full_name} - Open Orders
            </DialogTitle>
          </DialogHeader>
          
          {courierBalance && (
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 bg-secondary/20 rounded-lg">
                <div className="text-sm text-muted-foreground">Cash to Hand Over</div>
                <CurrencyDisplay 
                  valueUSD={courierBalance.totalCollectedUSD} 
                  valueLBP={courierBalance.totalCollectedLBP} 
                />
              </div>
              <div className="text-center p-3 bg-secondary/20 rounded-lg">
                <div className="text-sm text-muted-foreground">Fees Owed</div>
                <CurrencyDisplay 
                  valueUSD={courierBalance.totalCourierFeesUSD} 
                  valueLBP={courierBalance.totalCourierFeesLBP} 
                />
              </div>
              <div className="text-center p-3 bg-secondary/20 rounded-lg">
                <div className="text-sm text-muted-foreground">Net Balance</div>
                <CurrencyDisplay 
                  valueUSD={courierBalance.balanceUSD} 
                  valueLBP={courierBalance.balanceLBP} 
                />
              </div>
              <div className="text-center p-3 bg-secondary/20 rounded-lg">
                <div className="text-sm text-muted-foreground">Open Orders</div>
                <div className="text-2xl font-bold">{courierBalance.orderCount}</div>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Open Orders</h3>
            <Button 
              onClick={() => setIsCreateSettlementOpen(true)}
              disabled={selectedOrders.length === 0}
              className="flex items-center gap-2"
            >
              <Calculator className="h-4 w-4" />
              Create Settlement ({selectedOrders.length})
            </Button>
          </div>

          <div className="overflow-auto max-h-96">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedOrders.length === openOrders.length && openOrders.length > 0}
                      onCheckedChange={(checked) => {
                        setSelectedOrders(checked ? openOrders.map(o => o.id) : []);
                      }}
                    />
                  </TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Collected</TableHead>
                  <TableHead>Courier Fee</TableHead>
                  <TableHead>Net</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {openOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedOrders.includes(order.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedOrders([...selectedOrders, order.id]);
                          } else {
                            setSelectedOrders(selectedOrders.filter(id => id !== order.id));
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">#{order.order_id}</div>
                        <div className="text-sm text-muted-foreground">{order.reference_number}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{order.customer?.name || 'N/A'}</div>
                    </TableCell>
                    <TableCell>
                      <CurrencyDisplay 
                        valueUSD={order.collected_amount_usd || 0} 
                        valueLBP={order.collected_amount_lbp || 0} 
                      />
                    </TableCell>
                    <TableCell>
                      <CurrencyDisplay 
                        valueUSD={order.courier_fee_usd || 0} 
                        valueLBP={order.courier_fee_lbp || 0} 
                      />
                    </TableCell>
                    <TableCell>
                      <CurrencyDisplay 
                        valueUSD={(order.collected_amount_usd || 0) - (order.courier_fee_usd || 0)} 
                        valueLBP={(order.collected_amount_lbp || 0) - (order.courier_fee_lbp || 0)} 
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Settlement Dialog */}
      <Dialog open={isCreateSettlementOpen} onOpenChange={setIsCreateSettlementOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Settlement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Notes (Optional)</Label>
              <Textarea
                value={settlementNotes}
                onChange={(e) => setSettlementNotes(e.target.value)}
                placeholder="Add any notes about this settlement..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateSettlementOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateSettlement}>
                Create Settlement
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Settlement as Paid</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash Handover">Cash Handover</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Wallet Adjustment">Wallet Adjustment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Notes (Optional)</Label>
              <Textarea
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                placeholder="Add payment details or notes..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleMarkAsPaid}>
                Mark as Paid
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {filteredCouriers.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No couriers found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CourierSettlementsTab;