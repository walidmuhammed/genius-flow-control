import React, { useState } from 'react';
import { Download, Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useOrders } from '@/hooks/use-orders';
import { createInvoice } from '@/services/invoices';
import { toast } from 'sonner';

const ClientPayoutsTab = () => {
  const { data: orders = [] } = useOrders();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<string>('all');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);

  // Filter to show only successful orders
  const paidOrders = orders.filter(order => order.status === 'Successful');
  
  // Get unique clients
  const clients = Array.from(new Set(paidOrders.map(order => order.client_id).filter(Boolean)));
  
  // Filter orders based on search and client selection
  const filteredOrders = paidOrders.filter(order => {
    const matchesSearch = !searchTerm || 
      order.reference_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.order_id.toString().includes(searchTerm);
    
    const matchesClient = selectedClient === 'all' || order.client_id === selectedClient;
    
    return matchesSearch && matchesClient;
  });

  const handleSelectOrder = (orderId: string, checked: boolean) => {
    if (checked) {
      setSelectedOrders([...selectedOrders, orderId]);
    } else {
      setSelectedOrders(selectedOrders.filter(id => id !== orderId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrders(filteredOrders.map(order => order.id));
    } else {
      setSelectedOrders([]);
    }
  };

  const calculateNetPayout = (order: any) => {
    const collectedUSD = order.cash_collection_usd || 0;
    const collectedLBP = order.cash_collection_lbp || 0;
    const deliveryFeeUSD = order.delivery_fees_usd || 0;
    const deliveryFeeLBP = order.delivery_fees_lbp || 0;
    
    return {
      usd: collectedUSD - deliveryFeeUSD,
      lbp: collectedLBP - deliveryFeeLBP
    };
  };

  const handleGenerateInvoice = async () => {
    if (selectedOrders.length === 0) {
      toast.error('Please select orders to invoice');
      return;
    }

    try {
      setIsGeneratingInvoice(true);
      await createInvoice(selectedOrders);
      toast.success('Invoice generated successfully');
      setSelectedOrders([]);
    } catch (error) {
      toast.error('Failed to generate invoice');
    } finally {
      setIsGeneratingInvoice(false);
    }
  };

  const totalSelectedPayoutUSD = selectedOrders.reduce((sum, orderId) => {
    const order = filteredOrders.find(o => o.id === orderId);
    return sum + (order ? calculateNetPayout(order).usd : 0);
  }, 0);

  const totalSelectedPayoutLBP = selectedOrders.reduce((sum, orderId) => {
    const order = filteredOrders.find(o => o.id === orderId);
    return sum + (order ? calculateNetPayout(order).lbp : 0);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Client Payouts Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by order ID or reference..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by client" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clients</SelectItem>
                {clients.map(clientId => (
                  <SelectItem key={clientId} value={clientId || ''}>
                    Client {clientId?.slice(-8)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedOrders.length > 0 && (
            <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg mb-4">
              <div className="space-y-1">
                <p className="font-medium">
                  {selectedOrders.length} orders selected
                </p>
                <p className="text-sm text-muted-foreground">
                  Total Payout: ${totalSelectedPayoutUSD.toFixed(2)} / LBP {totalSelectedPayoutLBP.toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleGenerateInvoice}
                  disabled={isGeneratingInvoice}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Generate Invoice
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export CSV
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={filteredOrders.length > 0 && selectedOrders.length === filteredOrders.length}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Package</TableHead>
                  <TableHead>Amount Collected</TableHead>
                  <TableHead>Delivery Fee</TableHead>
                  <TableHead>Net Payout</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => {
                  const netPayout = calculateNetPayout(order);
                  return (
                    <TableRow key={order.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedOrders.includes(order.id)}
                          onCheckedChange={(checked) => handleSelectOrder(order.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">#{order.order_id}</div>
                          <div className="text-sm text-muted-foreground">
                            {order.reference_number}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{order.customer?.name || 'N/A'}</div>
                          <div className="text-sm text-muted-foreground">
                            {order.customer?.phone || 'N/A'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">{order.customer?.governorate_name || 'N/A'}</div>
                          <div className="text-sm text-muted-foreground">
                            {order.customer?.city_name || 'N/A'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {order.package_type || 'Standard'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">${(order.cash_collection_usd || 0).toFixed(2)}</div>
                          <div className="text-sm text-muted-foreground">
                            LBP {(order.cash_collection_lbp || 0).toLocaleString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">${(order.delivery_fees_usd || 0).toFixed(2)}</div>
                          <div className="text-sm text-muted-foreground">
                            LBP {(order.delivery_fees_lbp || 0).toLocaleString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-green-600">${netPayout.usd.toFixed(2)}</div>
                          <div className="text-sm text-muted-foreground">
                            LBP {netPayout.lbp.toLocaleString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={order.invoice_id ? "default" : "secondary"}>
                          {order.invoice_id ? 'Invoiced' : 'Pending'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientPayoutsTab;