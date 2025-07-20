import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Users, Plus, Pencil, Trash2, DollarSign, Loader2, AlertTriangle, Package } from 'lucide-react';
import { useClientPricingOverrides, useCreateClientPricingOverride, useUpdateClientPricingOverride, useDeleteClientPricingOverride } from '@/hooks/use-pricing';
import { useAdminClients } from '@/hooks/use-admin-clients';
import { formatCurrency } from '@/utils/format';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import LocationSelector from './LocationSelector';

const ClientPricingSection = () => {
  const { data: overrides, isLoading } = useClientPricingOverrides();
  const { data: clients } = useAdminClients();
  const createOverride = useCreateClientPricingOverride();
  const updateOverride = useUpdateClientPricingOverride();
  const deleteOverride = useDeleteClientPricingOverride();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<{ governorateId?: string; cityId?: string; location?: string }>({});
  const [selectedPackageType, setSelectedPackageType] = useState('');
  const [feeUsd, setFeeUsd] = useState('');
  const [feeLbp, setFeeLbp] = useState('');

  // Validation functions - allow 0 values and empty strings
  const validateUsd = (value: string) => {
    if (!value || value === '') return true; // Allow empty
    const num = parseFloat(value);
    return !isNaN(num) && num >= 0 && (num * 2) % 1 === 0; // Check if it's a 0.5 increment
  };

  const validateLbp = (value: string) => {
    if (!value || value === '') return true; // Allow empty
    const cleanValue = value.replace(/,/g, '');
    const num = parseInt(cleanValue);
    return !isNaN(num) && num >= 0 && num % 1000 === 0; // Check if it's a thousand
  };

  const handleLbpChange = (value: string) => {
    const cleanValue = value.replace(/[^\d,]/g, '');
    setFeeLbp(cleanValue);
  };

  const resetForm = () => {
    setSelectedClientId('');
    setSelectedLocation({});
    setSelectedPackageType('');
    setFeeUsd('');
    setFeeLbp('');
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (override: any) => {
    setSelectedClientId(override.client_id);
    setSelectedLocation({
      governorateId: override.governorate_id || undefined,
      cityId: override.city_id || undefined,
      location: override.governorate_name && override.city_name 
        ? `${override.governorate_name} → ${override.city_name}` 
        : override.governorate_name || undefined
    });
    setSelectedPackageType(override.package_type || '');
    setFeeUsd(override.fee_usd.toString());
    setFeeLbp(override.fee_lbp.toString());
    setEditingId(override.id);
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!selectedClientId) {
      toast.error("Please select a client");
      return;
    }

    // At least one fee must be provided
    if (!feeUsd && !feeLbp) {
      toast.error("Please provide at least one fee amount");
      return;
    }

    if (feeUsd && !validateUsd(feeUsd)) {
      toast.error("USD fee must be in 0.5 increments (e.g., 2.0, 2.5, 3.0, 4.5)");
      return;
    }

    if (feeLbp && !validateLbp(feeLbp)) {
      toast.error("LBP fee must be in thousands (e.g., 1,000, 150,000, 200,000)");
      return;
    }

    const data = {
      client_id: selectedClientId,
      governorate_id: selectedLocation.governorateId || undefined,
      city_id: selectedLocation.cityId || undefined,
      package_type: selectedPackageType && selectedPackageType !== 'none' ? selectedPackageType : undefined,
      fee_usd: feeUsd ? parseFloat(feeUsd) : 0,
      fee_lbp: feeLbp ? parseInt(feeLbp.replace(/,/g, '')) : 0,
    };

    if (editingId) {
      updateOverride.mutate(
        { id: editingId, updates: data },
        { onSuccess: resetForm }
      );
    } else {
      createOverride.mutate(data, { onSuccess: resetForm });
    }
  };

  const isFormValid = selectedClientId && (feeUsd || feeLbp) && validateUsd(feeUsd) && validateLbp(feeLbp);

  // Get available clients (not already having the same override configuration)
  const availableClients = clients?.filter(client => {
    if (editingId) return true; // When editing, allow the current client
    
    // Check if this client already has an override with the same location and package type
    return !overrides?.some(override => 
      override.client_id === client.id &&
      override.governorate_id === selectedLocation.governorateId &&
      override.city_id === selectedLocation.cityId &&
      override.package_type === selectedPackageType
    );
  }) || [];

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
              Override default fees for specific clients, zones, and package types
            </p>
          </div>
          <Button onClick={() => setShowForm(true)}>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Client *</Label>
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

                <LocationSelector
                  value={selectedLocation}
                  onChange={setSelectedLocation}
                  label="Zone (Optional)"
                  placeholder="Any location"
                  allowEmpty={true}
                />

                <div className="space-y-2">
                  <Label>Package Type (Optional)</Label>
                  <Select value={selectedPackageType} onValueChange={setSelectedPackageType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any package type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Any Package Type</SelectItem>
                      <SelectItem value="Parcel">Parcel</SelectItem>
                      <SelectItem value="Document">Document</SelectItem>
                      <SelectItem value="Bulky">Bulky</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Fee (USD)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                    <Input
                      type="number"
                      step="0.5"
                      min="0"
                      placeholder="0.00"
                      value={feeUsd}
                      onChange={(e) => setFeeUsd(e.target.value)}
                      className={`pl-9 ${!validateUsd(feeUsd) && feeUsd ? 'border-destructive' : ''}`}
                    />
                  </div>
                  {!validateUsd(feeUsd) && feeUsd && (
                    <div className="flex items-center gap-1 text-xs text-destructive">
                      <AlertTriangle className="h-3 w-3" />
                      Must be in 0.5 increments (e.g., 2.0, 2.5, 3.0)
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">Leave empty for $0.00</p>
                </div>

                <div className="space-y-2">
                  <Label>Fee (LBP)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground z-10">
                      L.L.
                    </span>
                    <Input
                      type="text"
                      placeholder="0"
                      value={feeLbp ? parseInt(feeLbp.replace(/,/g, '')).toLocaleString() : ''}
                      onChange={(e) => handleLbpChange(e.target.value)}
                      className={`pl-12 ${!validateLbp(feeLbp) && feeLbp ? 'border-destructive' : ''}`}
                    />
                  </div>
                  {!validateLbp(feeLbp) && feeLbp && (
                    <div className="flex items-center gap-1 text-xs text-destructive">
                      <AlertTriangle className="h-3 w-3" />
                      Must be in thousands (e.g., 1,000, 150,000)
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">Leave empty for L.L. 0</p>
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
                  <TableHead>Zone</TableHead>
                  <TableHead>Package Type</TableHead>
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
                      {override.governorate_name || override.city_name ? (
                        <div className="space-y-1">
                          {override.governorate_name && (
                            <div className="font-medium text-sm">{override.governorate_name}</div>
                          )}
                          {override.city_name && (
                            <div className="text-sm text-muted-foreground">{override.city_name}</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Any Zone</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {override.package_type ? (
                        <Badge variant="outline">
                          <Package className="h-3 w-3 mr-1" />
                          {override.package_type}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">Any</span>
                      )}
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