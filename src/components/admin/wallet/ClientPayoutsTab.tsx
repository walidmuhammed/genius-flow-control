import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useGroupedFilteredClientPayouts } from '@/hooks/use-filtered-client-payouts';
import { useQueryClient } from '@tanstack/react-query';
import { createInvoice } from '@/services/invoices';
import { toast } from 'sonner';
import { formatCurrency } from '@/utils/format';
import { 
  ChevronDown, 
  ChevronRight, 
  Building2, 
  Phone, 
  FileText, 
  DollarSign, 
  Download,
  Receipt,
  Loader2
} from 'lucide-react';

const ClientPayoutsTab = () => {
  const [selectedPayouts, setSelectedPayouts] = useState<string[]>([]);
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);
  
  const { data: groupedPayouts = {}, isLoading } = useGroupedFilteredClientPayouts();
  const queryClient = useQueryClient();

  // Filter out empty groups and convert to array for easier handling
  const filteredGroupedPayouts = useMemo(() => {
    return Object.entries(groupedPayouts).filter(([, group]) => group.payouts.length > 0);
  }, [groupedPayouts]);

  // Calculate totals for selected payouts
  const selectedTotals = useMemo(() => {
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
  }, [selectedPayouts, filteredGroupedPayouts]);

  // Get unique client IDs from selected payouts
  const selectedClientIds = useMemo(() => {
    const clientIds = new Set<string>();
    selectedPayouts.forEach(payoutId => {
      const [, group] = filteredGroupedPayouts.find(([, g]) => 
        g.payouts.some(p => p.id === payoutId)
      ) || [];
      const payout = group?.payouts.find(p => p.id === payoutId);
      if (payout) {
        clientIds.add(payout.client_id);
      }
    });
    return clientIds;
  }, [selectedPayouts, filteredGroupedPayouts]);

  const handleGenerateInvoice = async () => {
    if (selectedPayouts.length === 0) {
      toast.error('Please select orders to generate invoice');
      return;
    }

    // Validate all selected payouts belong to the same client
    if (selectedClientIds.size > 1) {
      toast.error('Please select orders from the same client only');
      return;
    }

    try {
      setIsGeneratingInvoice(true);
      
      // Extract order UUIDs from selected payouts  
      const orderIds = selectedPayouts.map(payoutId => {
        const [, group] = filteredGroupedPayouts.find(([, g]) => 
          g.payouts.some(p => p.id === payoutId)
        ) || [];
        const payout = group?.payouts.find(p => p.id === payoutId);
        return payout?.id; // Use the UUID id, which is the actual order UUID
      }).filter(Boolean);

      console.log('🔵 Creating invoice for order IDs:', orderIds);
      console.log('🔵 Selected client IDs:', Array.from(selectedClientIds));

      // Create invoice using the database function
      const invoice = await createInvoice(orderIds);
      
      console.log('✅ Invoice created successfully:', invoice);
      
      // Clear selections and refresh data
      setSelectedPayouts([]);
      
      // Refresh the client payouts data
      queryClient.invalidateQueries({ queryKey: ['filtered-client-payouts'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      
      toast.success(`Invoice ${(invoice as any)?.invoice_id || 'generated'} created successfully`);
    } catch (error: any) {
      console.error('Error generating invoice:', error);
      toast.error(error.message || 'Failed to generate invoice');
    } finally {
      setIsGeneratingInvoice(false);
    }
  };

  const toggleClientExpansion = (clientId: string) => {
    const newExpanded = new Set(expandedClients);
    if (newExpanded.has(clientId)) {
      newExpanded.delete(clientId);
    } else {
      newExpanded.add(clientId);
    }
    setExpandedClients(newExpanded);
  };

  const handleSelectAll = (clientId: string, checked: boolean) => {
    const group = groupedPayouts[clientId];
    if (!group) return;

    if (checked) {
      const newSelected = [...selectedPayouts, ...group.payouts.map(p => p.id)];
      setSelectedPayouts(newSelected);
    } else {
      const payoutIdsToRemove = new Set(group.payouts.map(p => p.id));
      setSelectedPayouts(selectedPayouts.filter(id => !payoutIdsToRemove.has(id)));
    }
  };

  const handleSelectPayout = (payoutId: string, checked: boolean) => {
    if (checked) {
      setSelectedPayouts([...selectedPayouts, payoutId]);
    } else {
      setSelectedPayouts(selectedPayouts.filter(id => id !== payoutId));
    }
  };

  const isClientFullySelected = (clientId: string): boolean => {
    const group = groupedPayouts[clientId];
    if (!group) return false;
    return group.payouts.every(p => selectedPayouts.includes(p.id));
  };

  const isClientPartiallySelected = (clientId: string): boolean => {
    const group = groupedPayouts[clientId];
    if (!group) return false;
    return group.payouts.some(p => selectedPayouts.includes(p.id)) && !isClientFullySelected(clientId);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Client Payouts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Loading client payouts...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Client Payouts
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Generate invoices for completed orders that are ready for client payout
          </p>
        </CardHeader>
        <CardContent>
          {selectedPayouts.length > 0 && (
            <div className="mb-6 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">Selected Orders Summary</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedPayouts.length} orders selected
                    {selectedClientIds.size > 1 && (
                      <span className="text-destructive ml-2">
                        ⚠ Multiple clients selected
                      </span>
                    )}
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-sm">
                      Total: <strong>{formatCurrency(selectedTotals.totalUSD, 'USD')}</strong>
                    </span>
                    <span className="text-sm">
                      <strong>{formatCurrency(selectedTotals.totalLBP, 'LBP')}</strong>
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    onClick={handleGenerateInvoice}
                    disabled={isGeneratingInvoice || selectedClientIds.size > 1}
                    className="flex items-center gap-2"
                  >
                    {isGeneratingInvoice ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <FileText className="h-4 w-4" />
                    )}
                    {isGeneratingInvoice ? 'Generating...' : 'Generate Invoice'}
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Export CSV
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Client Groups */}
      {filteredGroupedPayouts.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No pending payouts</h3>
              <p className="text-muted-foreground">
                All orders have been paid or are not yet ready for invoicing.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
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
                          <Checkbox
                            checked={isClientFullySelected(clientId)}
                            onCheckedChange={(checked) => handleSelectAll(clientId, checked as boolean)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <Building2 className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <h3 className="font-semibold text-lg">
                              {group.client.business_name || group.client.full_name || `Client ${clientId.slice(-8)}`}
                            </h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                              <Phone className="h-3 w-3" />
                              No phone available
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold">
                          {formatCurrency(group.totalUSD, 'USD')}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(group.totalLBP, 'LBP')}
                        </div>
                        <Badge variant="secondary" className="mt-1">
                          {group.payouts.length} orders
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <Separator className="mb-4" />
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12"></TableHead>
                          <TableHead>Order</TableHead>
                          <TableHead>Reference</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Package</TableHead>
                          <TableHead>Collected (USD)</TableHead>
                          <TableHead>Collected (LBP)</TableHead>
                          <TableHead>Delivery Fee (USD)</TableHead>
                          <TableHead>Delivery Fee (LBP)</TableHead>
                          <TableHead>Net Payout (USD)</TableHead>
                          <TableHead>Net Payout (LBP)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {group.payouts.map((payout) => (
                          <TableRow key={payout.id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedPayouts.includes(payout.id)}
                                onCheckedChange={(checked) => handleSelectPayout(payout.id, checked as boolean)}
                              />
                            </TableCell>
                            <TableCell className="font-medium">
                              #{payout.order?.order_id || 'N/A'}
                            </TableCell>
                            <TableCell>
                              {payout.order?.reference_number || 'N/A'}
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
                                Standard
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">
                              {formatCurrency(payout.collected_amount_usd, 'USD')}
                            </TableCell>
                            <TableCell className="font-medium">
                              {formatCurrency(payout.collected_amount_lbp, 'LBP')}
                            </TableCell>
                            <TableCell>
                              {formatCurrency(payout.delivery_fee_usd, 'USD')}
                            </TableCell>
                            <TableCell>
                              {formatCurrency(payout.delivery_fee_lbp, 'LBP')}
                            </TableCell>
                            <TableCell className="font-medium text-green-600">
                              {formatCurrency(payout.net_payout_usd, 'USD')}
                            </TableCell>
                            <TableCell className="font-medium text-green-600">
                              {formatCurrency(payout.net_payout_lbp, 'LBP')}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientPayoutsTab;