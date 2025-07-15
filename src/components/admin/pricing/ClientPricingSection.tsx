import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Users, Plus, Pencil, Trash2, DollarSign, Loader2 } from 'lucide-react';
import { useClientPricingOverrides, useCreateClientPricingOverride, useUpdateClientPricingOverride, useDeleteClientPricingOverride } from '@/hooks/use-pricing';
import { useAdminClients } from '@/hooks/use-admin-clients';
import { formatCurrency } from '@/utils/format';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ClientPricingSection = () => {
  const { data: overrides, isLoading } = useClientPricingOverrides();
  const { data: clients } = useAdminClients();
  const createOverride = useCreateClientPricingOverride();
  const updateOverride = useUpdateClientPricingOverride();
  const deleteOverride = useDeleteClientPricingOverride();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [feeUsd, setFeeUsd] = useState('');
  const [feeLbp, setFeeLbp] = useState('');

  const resetForm = () => {
    setSelectedClientId('');
    setFeeUsd('');
    setFeeLbp('');
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (override: any) => {
    setSelectedClientId(override.client_id);
    setFeeUsd(override.fee_usd.toString());
    setFeeLbp(override.fee_lbp.toString());
    setEditingId(override.id);
    setShowForm(true);
  };

  const handleSubmit = () => {
    const data = {
      client_id: selectedClientId,
      fee_usd: parseFloat(feeUsd),
      fee_lbp: parseFloat(feeLbp),
    };

    if (editingId) {
      updateOverride.mutate(
        { id: editingId, updates: { fee_usd: data.fee_usd, fee_lbp: data.fee_lbp } },
        { onSuccess: resetForm }
      );
    } else {
      createOverride.mutate(data, { onSuccess: resetForm });
    }
  };

  const isFormValid = selectedClientId && feeUsd && feeLbp && parseFloat(feeUsd) > 0 && parseFloat(feeLbp) > 0;

  // Get available clients (not already having overrides)
  const availableClients = clients?.filter(client => 
    !overrides?.some(override => override.client_id === client.id)
  ) || [];

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
              <Users className="h-5 w-5 text-secondary" />
              Client-Specific Pricing
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Override default fees for specific clients
            </p>
          </div>
          <Button onClick={() => setShowForm(true)} disabled={availableClients.length === 0}>
            <Plus className="h-4 w-4 mr-2" />
            Add Override
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showForm && (
          <Card className="mb-6 border-dashed">
            <CardHeader>
              <CardTitle className="text-lg">
                {editingId ? 'Edit Client Pricing' : 'Add Client Pricing Override'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Client</Label>
                  <Select value={selectedClientId} onValueChange={setSelectedClientId} disabled={!!editingId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      {(editingId ? clients || [] : availableClients).map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.business_name || client.full_name}
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
                      step="0.01"
                      min="0"
                      placeholder="4.00"
                      value={feeUsd}
                      onChange={(e) => setFeeUsd(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Fee (LBP)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                      L.L.
                    </span>
                    <Input
                      type="number"
                      step="1000"
                      min="0"
                      placeholder="150000"
                      value={feeLbp}
                      onChange={(e) => setFeeLbp(e.target.value)}
                      className="pl-12"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button 
                  onClick={handleSubmit}
                  disabled={!isFormValid || createOverride.isPending || updateOverride.isPending}
                >
                  {(createOverride.isPending || updateOverride.isPending) ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  {editingId ? 'Update Override' : 'Create Override'}
                </Button>
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {overrides && overrides.length > 0 ? (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Fee (USD)</TableHead>
                  <TableHead>Fee (LBP)</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overrides.map((override) => (
                  <TableRow key={override.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {override.business_name || override.client_name || 'Unknown Client'}
                        </div>
                        {override.business_name && override.client_name && (
                          <div className="text-sm text-muted-foreground">
                            {override.client_name}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {formatCurrency(override.fee_usd, 'USD')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {formatCurrency(override.fee_lbp, 'LBP')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(override.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(override)}
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
                              <AlertDialogTitle>Delete Client Pricing Override</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this pricing override? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteOverride.mutate(override.id)}
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
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No client pricing overrides configured</p>
            <p className="text-sm">Add overrides to customize pricing for specific clients</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClientPricingSection;