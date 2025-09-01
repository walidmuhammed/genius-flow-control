import React, { useState } from 'react';
import { Search, Calculator, HandCoins, CheckCircle, Clock, DollarSign, User, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  useCouriersWithOpenOrders, 
  useCourierSettlements, 
  useOpenOrdersByCourier, 
  useCreateCourierSettlement, 
  useRecordCashHandover, 
  useMarkSettlementPaid 
} from '@/hooks/use-courier-settlements';
import CurrencyDisplay from '@/components/orders/CurrencyDisplay';
import { toast } from 'sonner';

const CourierSettlementsTab = () => {
  const { data: couriersWithOpenOrders = [], isLoading } = useCouriersWithOpenOrders();
  const { data: settlements = [] } = useCourierSettlements();
  const createSettlement = useCreateCourierSettlement();
  const recordCashHandover = useRecordCashHandover();
  const markAsPaid = useMarkSettlementPaid();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourier, setSelectedCourier] = useState<string>('all');
  const [selectedCourierForDetails, setSelectedCourierForDetails] = useState<string | null>(null);
  const [isCreateSettlementOpen, setIsCreateSettlementOpen] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [settlementNotes, setSettlementNotes] = useState('');
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedSettlementId, setSelectedSettlementId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('Cash Handover');
  const [paymentNotes, setPaymentNotes] = useState('');

  const { data: openOrders = [] } = useOpenOrdersByCourier(selectedCourierForDetails || undefined);

  // Filter couriers based on search
  const filteredCouriers = couriersWithOpenOrders.filter(courier => {
    const matchesSearch = !searchTerm || 
      courier.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      courier.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCourier = selectedCourier === 'all' || courier.id === selectedCourier;
    
    return matchesSearch && matchesCourier;
  });

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
      await recordCashHandover.mutateAsync({ settlementId });
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

  const getDirectionBadge = (direction: string, balanceUSD: number, balanceLBP: number) => {
    const isPositive = balanceUSD >= 0 && balanceLBP >= 0;
    
    if (direction === 'courier_to_admin' || isPositive) {
      return (
        <div className="text-right">
          <Badge variant="default" className="bg-green-100 text-green-800 mb-1">
            Courier → Admin
          </Badge>
          <div className="text-sm">
            <CurrencyDisplay valueUSD={Math.abs(balanceUSD)} valueLBP={Math.abs(balanceLBP)} />
          </div>
        </div>
      );
    } else {
      return (
        <div className="text-right">
          <Badge variant="destructive" className="bg-red-100 text-red-800 mb-1">
            Admin → Courier
          </Badge>
          <div className="text-sm">
            <CurrencyDisplay valueUSD={Math.abs(balanceUSD)} valueLBP={Math.abs(balanceLBP)} />
          </div>
        </div>
      );
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HandCoins className="h-5 w-5" />
            Courier Settlements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by courier name or phone..."
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
                {couriersWithOpenOrders.map(courier => (
                  <SelectItem key={courier.id} value={courier.id}>
                    {courier.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Couriers List */}
      {filteredCouriers.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Couriers with Open Orders</h3>
            <p className="text-muted-foreground">
              All couriers have settled their orders or there are no delivered orders.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredCouriers.map((courier) => {
            const courierSettlements = settlements.filter(s => s.courier_id === courier.id);
            const direction = courier.balanceUSD >= 0 && courier.balanceLBP >= 0 ? 'courier_to_admin' : 'admin_to_courier';
            
            return (
              <Card key={courier.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={courier.avatar_url} />
                        <AvatarFallback>
                          <User className="h-6 w-6" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{courier.full_name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {courier.phone} • {courier.vehicle_type || 'Motorcycle'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Button 
                        variant="outline"
                        onClick={() => setSelectedCourierForDetails(courier.id)}
                        className="mb-2"
                      >
                        View Details
                      </Button>
                      {getDirectionBadge(direction, courier.balanceUSD, courier.balanceLBP)}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{courier.orderCount}</div>
                      <div className="text-sm text-muted-foreground">Open Orders</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-sm font-medium text-green-600">Collected</div>
                      <CurrencyDisplay 
                        valueUSD={courier.totalCollectedUSD} 
                        valueLBP={courier.totalCollectedLBP} 
                      />
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-sm font-medium text-orange-600">Courier Fees</div>
                      <CurrencyDisplay 
                        valueUSD={courier.totalCourierFeesUSD} 
                        valueLBP={courier.totalCourierFeesLBP} 
                      />
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-sm font-medium text-purple-600">Net Balance</div>
                      <CurrencyDisplay 
                        valueUSD={courier.balanceUSD} 
                        valueLBP={courier.balanceLBP} 
                      />
                    </div>
                  </div>

                  {courierSettlements.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Recent Settlements</h4>
                      {courierSettlements.slice(0, 2).map((settlement) => (
                        <div key={settlement.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                          <div className="flex items-center gap-3">
                            <span className="font-medium">{settlement.settlement_id}</span>
                            {getStatusBadge(settlement.status)}
                          </div>
                          <div className="flex items-center gap-2">
                            {getDirectionBadge(settlement.direction, settlement.balance_usd, settlement.balance_lbp)}
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
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Courier Details Dialog */}
      <Dialog open={!!selectedCourierForDetails} onOpenChange={() => setSelectedCourierForDetails(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {couriersWithOpenOrders.find(c => c.id === selectedCourierForDetails)?.full_name} - Settlement Details
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{openOrders.length}</div>
                    <div className="text-sm text-muted-foreground">Open Orders</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-center">
                    <div className="text-sm font-medium text-green-600">Cash to Hand Over</div>
                    <CurrencyDisplay 
                      valueUSD={couriersWithOpenOrders.find(c => c.id === selectedCourierForDetails)?.totalCollectedUSD || 0} 
                      valueLBP={couriersWithOpenOrders.find(c => c.id === selectedCourierForDetails)?.totalCollectedLBP || 0} 
                    />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-center">
                    <div className="text-sm font-medium text-orange-600">Fees Owed</div>
                    <CurrencyDisplay 
                      valueUSD={couriersWithOpenOrders.find(c => c.id === selectedCourierForDetails)?.totalCourierFeesUSD || 0} 
                      valueLBP={couriersWithOpenOrders.find(c => c.id === selectedCourierForDetails)?.totalCourierFeesLBP || 0} 
                    />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-center">
                    <div className="text-sm font-medium text-purple-600">Net Balance</div>
                    <CurrencyDisplay 
                      valueUSD={couriersWithOpenOrders.find(c => c.id === selectedCourierForDetails)?.balanceUSD || 0} 
                      valueLBP={couriersWithOpenOrders.find(c => c.id === selectedCourierForDetails)?.balanceLBP || 0} 
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center">
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

            {/* Orders Table */}
            <div className="border rounded-lg">
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
                    <TableHead>Status</TableHead>
                    <TableHead>Collected</TableHead>
                    <TableHead>Courier Fee</TableHead>
                    <TableHead>Net</TableHead>
                    <TableHead>Date</TableHead>
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
                        <Badge variant={order.status === 'Delivered' ? 'default' : 'secondary'}>
                          {order.status}
                        </Badge>
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
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Settlement Dialog */}
      <Dialog open={isCreateSettlementOpen} onOpenChange={setIsCreateSettlementOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Settlement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Selected Orders: {selectedOrders.length}</Label>
              <p className="text-sm text-muted-foreground">
                Creating settlement for {selectedOrders.length} orders
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about this settlement..."
                value={settlementNotes}
                onChange={(e) => setSettlementNotes(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateSettlementOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateSettlement} disabled={createSettlement.isPending}>
                {createSettlement.isPending ? 'Creating...' : 'Create Settlement'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mark as Paid Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Settlement as Paid</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
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
            <div className="space-y-2">
              <Label htmlFor="payment-notes">Notes (Optional)</Label>
              <Textarea
                id="payment-notes"
                placeholder="Add any notes about this payment..."
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleMarkAsPaid} disabled={markAsPaid.isPending}>
                {markAsPaid.isPending ? 'Processing...' : 'Mark as Paid'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourierSettlementsTab;