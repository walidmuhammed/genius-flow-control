import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { MapPin, Plus, Pencil, Trash2, DollarSign, Loader2 } from 'lucide-react';
import { useZonePricingRules, useCreateZonePricingRule, useUpdateZonePricingRule, useDeleteZonePricingRule } from '@/hooks/use-pricing';
import { useAdminClients } from '@/hooks/use-admin-clients';
import { useGovernorates } from '@/hooks/use-governorates';
import { formatCurrency } from '@/utils/format';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ZonePricingSection = () => {
  const { data: rules, isLoading } = useZonePricingRules();
  const { data: clients } = useAdminClients();
  const { data: governorates } = useGovernorates();
  const createRule = useCreateZonePricingRule();
  const updateRule = useUpdateZonePricingRule();
  const deleteRule = useDeleteZonePricingRule();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedGovernorateId, setSelectedGovernorateId] = useState('');
  const [feeUsd, setFeeUsd] = useState('');
  const [feeLbp, setFeeLbp] = useState('');

  const resetForm = () => {
    setSelectedClientId('');
    setSelectedGovernorateId('');
    setFeeUsd('');
    setFeeLbp('');
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (rule: any) => {
    setSelectedClientId(rule.client_id || '');
    setSelectedGovernorateId(rule.governorate_id || '');
    setFeeUsd(rule.fee_usd.toString());
    setFeeLbp(rule.fee_lbp.toString());
    setEditingId(rule.id);
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!selectedGovernorateId || !selectedClientId || (!feeUsd && !feeLbp)) {
      return;
    }

    const data = {
      governorate_id: selectedGovernorateId,
      fee_usd: feeUsd ? parseFloat(feeUsd) : 0,
      fee_lbp: feeLbp ? parseFloat(feeLbp.replace(/,/g, '')) : 0,
      client_id: selectedClientId,
    };

    if (editingId) {
      updateRule.mutate(
        { id: editingId, updates: { fee_usd: data.fee_usd, fee_lbp: data.fee_lbp } },
        { onSuccess: resetForm }
      );
    } else {
      createRule.mutate(data, { onSuccess: resetForm });
    }
  };

  const isFormValid = selectedGovernorateId && selectedClientId && (feeUsd || feeLbp) && 
    ((feeUsd && parseFloat(feeUsd) > 0) || (feeLbp && parseFloat(feeLbp.replace(/,/g, '')) > 0));

  if (isLoading) {
    return (
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-1/3"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Zone-Based Pricing
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Set custom pricing for specific governorates per client
            </p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Zone Rule
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showForm && (
          <Card className="mb-6 border-dashed">
            <CardHeader>
              <CardTitle className="text-lg">
                {editingId ? 'Edit Zone Pricing' : 'Add Zone Pricing Rule'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Client *</Label>
                  <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients?.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.business_name || client.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Governorate *</Label>
                  <Select value={selectedGovernorateId} onValueChange={setSelectedGovernorateId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select governorate" />
                    </SelectTrigger>
                    <SelectContent>
                      {governorates?.map((gov) => (
                        <SelectItem key={gov.id} value={gov.id}>
                          {gov.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Fee (USD)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      step="0.5"
                      min="0"
                      placeholder="4.00"
                      value={feeUsd}
                      onChange={(e) => setFeeUsd(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Enter either USD or LBP (or both)</p>
                </div>

                <div className="space-y-2">
                  <Label>Fee (LBP)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                      L.L.
                    </span>
                    <Input
                      type="text"
                      placeholder="150,000"
                      value={feeLbp ? parseInt(feeLbp.replace(/,/g, '')).toLocaleString() : ''}
                      onChange={(e) => setFeeLbp(e.target.value.replace(/,/g, ''))}
                      className="pl-12"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button 
                  onClick={handleSubmit}
                  disabled={!isFormValid || createRule.isPending || updateRule.isPending}
                >
                  {(createRule.isPending || updateRule.isPending) ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  {editingId ? 'Update Rule' : 'Create Rule'}
                </Button>
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {rules && rules.length > 0 ? (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Governorate</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Fee (USD)</TableHead>
                  <TableHead>Fee (LBP)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell>
                      <div className="font-medium">{rule.governorate_name}</div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {rule.business_name || rule.client_name}
                        </div>
                        {rule.business_name && rule.client_name && (
                          <div className="text-sm text-muted-foreground">
                            {rule.client_name}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {formatCurrency(rule.fee_usd, 'USD')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {formatCurrency(rule.fee_lbp, 'LBP')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={rule.is_active ? "default" : "secondary"}>
                        {rule.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(rule)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="ghost" className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Zone Pricing Rule</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this zone pricing rule? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteRule.mutate(rule.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No zone pricing rules configured</p>
            <p className="text-sm">Add rules to set governorate-specific pricing for clients</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ZonePricingSection;