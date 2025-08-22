import React, { useState } from 'react';
import { Download, Plus, Search, ChevronDown, ChevronRight, Building2, Phone, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useGroupedFilteredClientPayouts, useUpdatePayoutStatus } from '@/hooks/use-client-payouts';
import { createInvoice } from '@/services/invoices';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const ClientPayoutsTab = () => {
  const { data: groupedPayouts = {}, isLoading } = useGroupedFilteredClientPayouts();
  const updatePayoutStatus = useUpdatePayoutStatus();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayouts, setSelectedPayouts] = useState<string[]>([]);
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);

  // Filter grouped payouts based on search
  const filteredGroupedPayouts = Object.entries(groupedPayouts || {}).filter(([clientId, group]) => {
    if (!searchTerm) return true;
    
    const businessName = group.client.business_name?.toLowerCase() || '';
    const fullName = group.client.full_name?.toLowerCase() || '';
    const hasMatchingOrder = group.payouts.some(payout => 
      payout.order?.reference_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payout.order?.order_id.toString().includes(searchTerm.toLowerCase())
    );
    
    return businessName.includes(searchTerm.toLowerCase()) || 
           fullName.includes(searchTerm.toLowerCase()) || 
           hasMatchingOrder;
  });

  const toggleClientExpansion = (clientId: string) => {
    const newExpanded = new Set(expandedClients);
    if (newExpanded.has(clientId)) {
      newExpanded.delete(clientId);
    } else {
      newExpanded.add(clientId);
    }
    setExpandedClients(newExpanded);
  };

  const handleSelectPayout = (payoutId: string, checked: boolean) => {
    if (checked) {
      setSelectedPayouts([...selectedPayouts, payoutId]);
    } else {
      setSelectedPayouts(selectedPayouts.filter(id => id !== payoutId));
    }
  };

  const handleSelectAllForClient = (clientPayouts: any[], checked: boolean) => {
    const payoutIds = clientPayouts.map(p => p.id);
    if (checked) {
      setSelectedPayouts([...selectedPayouts, ...payoutIds.filter(id => !selectedPayouts.includes(id))]);
    } else {
      setSelectedPayouts(selectedPayouts.filter(id => !payoutIds.includes(id)));
    }
  };

  const getNetPayoutDisplay = (netUSD: number, netLBP: number) => {
    if (netUSD > 0 || netLBP > 0) {
      return { color: 'text-green-600', prefix: '' };
    } else if (netUSD < 0 || netLBP < 0) {
      return { color: 'text-red-600', prefix: 'Due: ' };
    }
    return { color: 'text-muted-foreground', prefix: '' };
  };

  const handleGenerateInvoice = async () => {
    if (selectedPayouts.length === 0) {
      toast.error('Please select payouts to invoice');
      return;
    }

    try {
      setIsGeneratingInvoice(true);
      
      // Create invoice for selected orders
      const orderIds = selectedPayouts.map(payoutId => {
        const [, group] = filteredGroupedPayouts.find(([, g]) => 
          g.payouts.some(p => p.id === payoutId)
        ) || [];
        return group?.payouts.find(p => p.id === payoutId)?.order_id;
      }).filter(Boolean);

      const invoice = await createInvoice(orderIds);
      
      // Update payout status to "In Progress"
      await updatePayoutStatus.mutateAsync({
        payoutIds: selectedPayouts,
        status: 'In Progress',
        invoiceId: invoice.id
      });
      
      setSelectedPayouts([]);
      toast.success('Invoice generated and payouts updated');
    } catch (error) {
      toast.error('Failed to generate invoice');
    } finally {
      setIsGeneratingInvoice(false);
    }
  };

  const handleMarkAsPaid = async () => {
    if (selectedPayouts.length === 0) {
      toast.error('Please select payouts to mark as paid');
      return;
    }

    try {
      await updatePayoutStatus.mutateAsync({
        payoutIds: selectedPayouts,
        status: 'In Progress'
      });
      setSelectedPayouts([]);
      toast.success('Payouts marked as paid');
    } catch (error) {
      toast.error('Failed to mark payouts as paid');
    }
  };

  const getTotalSelectedAmounts = () => {
    let totalUSD = 0;
    let totalLBP = 0;
    
    selectedPayouts.forEach(payoutId => {
      const [, group] = filteredGroupedPayouts.find(([, g]) => 
        g.payouts.some(p => p.id === payoutId)
      ) || [];
      const payout = group?.payouts.find(p => p.id === payoutId);
      if (payout) {
        totalUSD += payout.net_payout_usd || 0;
        totalLBP += payout.net_payout_lbp || 0;
      }
    });
    
    return { totalUSD, totalLBP };
  };

  const { totalUSD, totalLBP } = getTotalSelectedAmounts();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading client payouts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Search */}
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
                  placeholder="Search by client name, order ID, or reference..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {selectedPayouts.length > 0 && (
            <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg mb-4">
              <div className="space-y-1">
                <p className="font-medium">
                  {selectedPayouts.length} payouts selected
                </p>
                <p className="text-sm text-muted-foreground">
                  Total: ${totalUSD.toFixed(2)} / LBP {totalLBP.toLocaleString()}
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
                <Button 
                  onClick={handleMarkAsPaid}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <DollarSign className="h-4 w-4" />
                  Mark as Paid
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

      {/* Grouped Client Payouts */}
      <div className="space-y-4">
        {filteredGroupedPayouts.map(([clientId, group]) => (
          <Card key={clientId}>
            <Collapsible 
              open={expandedClients.has(clientId)}
              onOpenChange={() => toggleClientExpansion(clientId)}
            >
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {expandedClients.has(clientId) ? (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      )}
                      <div className="flex items-center gap-3">
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <h3 className="font-semibold text-lg">
                            {group.client.business_name || group.client.full_name || `Client ${clientId.slice(-8)}`}
                          </h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <Phone className="h-3 w-3" />
                            {group.client.phone || 'No phone'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">
                        ${group.totalPendingUSD.toFixed(2)}
                        {group.totalPendingLBP > 0 && (
                          <span className="text-sm text-muted-foreground ml-2">
                            / LBP {group.totalPendingLBP.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {group.orderCount} orders pending
                      </p>
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between mb-4 p-2 bg-muted/30 rounded">
                    <Checkbox
                      checked={group.payouts.length > 0 && group.payouts.every(p => selectedPayouts.includes(p.id))}
                      onCheckedChange={(checked) => handleSelectAllForClient(group.payouts, checked as boolean)}
                    />
                    <span className="text-sm text-muted-foreground">
                      Select all payouts for this client
                    </span>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12"></TableHead>
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
                        {group.payouts.map((payout) => {
                          const netDisplay = getNetPayoutDisplay(payout.net_payout_usd || 0, payout.net_payout_lbp || 0);
                          return (
                            <TableRow key={payout.id}>
                              <TableCell>
                                <Checkbox
                                  checked={selectedPayouts.includes(payout.id)}
                                  onCheckedChange={(checked) => handleSelectPayout(payout.id, checked as boolean)}
                                />
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="font-medium">#{payout.order?.order_id || 'N/A'}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {payout.order?.reference_number || 'N/A'}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="font-medium">{payout.order?.customer?.name || 'N/A'}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {payout.order?.customer?.phone || 'N/A'}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="text-sm">{payout.order?.customer?.governorate_name || 'N/A'}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {payout.order?.customer?.city_name || 'N/A'}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {payout.order?.package_type || 'Standard'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="font-medium">${(payout.collected_amount_usd || 0).toFixed(2)}</div>
                                  <div className="text-sm text-muted-foreground">
                                    LBP {(payout.collected_amount_lbp || 0).toLocaleString()}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="font-medium">${(payout.delivery_fee_usd || 0).toFixed(2)}</div>
                                  <div className="text-sm text-muted-foreground">
                                    LBP {(payout.delivery_fee_lbp || 0).toLocaleString()}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className={cn("font-medium", netDisplay.color)}>
                                    {netDisplay.prefix}${Math.abs(payout.net_payout_usd || 0).toFixed(2)}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    LBP {Math.abs(payout.net_payout_lbp || 0).toLocaleString()}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={
                                  payout.payout_status === 'Paid' ? 'default' : 
                                  payout.payout_status === 'In Progress' ? 'secondary' : 
                                  'outline'
                                }>
                                  {payout.payout_status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}
        
        {filteredGroupedPayouts.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No client payouts found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ClientPayoutsTab;