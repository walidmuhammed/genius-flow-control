import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Users, Plus, Pencil, Trash2, DollarSign, Loader2, AlertTriangle, Package, Search, Check, ChevronsUpDown, MapPin, X } from 'lucide-react';
import { useClientPricingOverrides, useCreateClientPricingOverride, useUpdateClientPricingOverride, useDeleteClientPricingOverride } from '@/hooks/use-pricing';
import { useAdminClients } from '@/hooks/use-admin-clients';
import { useGovernorates } from '@/hooks/use-governorates';
import { formatCurrency } from '@/utils/format';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface GovernorateOverride {
  id: string;
  governorateId: string;
  governorateName: string;
  feeUsd: string;
  feeLbp: string;
}

interface PackageTypeExtra {
  id: string;
  packageType: 'Parcel' | 'Document' | 'Bulky';
  extraUsd: string;
  extraLbp: string;
}

const ClientPricingSection = () => {
  const { data: overrides, isLoading } = useClientPricingOverrides();
  const { data: clients } = useAdminClients();
  const { data: governorates } = useGovernorates();
  const createOverride = useCreateClientPricingOverride();
  const updateOverride = useUpdateClientPricingOverride();
  const deleteOverride = useDeleteClientPricingOverride();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Client selection with search
  const [selectedClientId, setSelectedClientId] = useState('');
  const [clientSearchOpen, setClientSearchOpen] = useState(false);
  const [clientSearchValue, setClientSearchValue] = useState('');
  
  // Default fallback fees
  const [defaultFeeUsd, setDefaultFeeUsd] = useState('');
  const [defaultFeeLbp, setDefaultFeeLbp] = useState('');
  
  // Governorate overrides
  const [governorateOverrides, setGovernorateOverrides] = useState<GovernorateOverride[]>([]);
  
  // Package type extras
  const [packageTypeExtras, setPackageTypeExtras] = useState<PackageTypeExtra[]>([]);

  // Validation functions
  const validateUsd = (value: string) => {
    if (!value || value === '') return true;
    const num = parseFloat(value);
    return !isNaN(num) && num >= 0 && (num * 2) % 1 === 0;
  };

  const validateLbp = (value: string) => {
    if (!value || value === '') return true;
    const cleanValue = value.replace(/,/g, '');
    const num = parseInt(cleanValue);
    return !isNaN(num) && num >= 0 && num % 1000 === 0;
  };

  const formatLbpInput = (value: string) => {
    const cleanValue = value.replace(/[^\d]/g, '');
    if (cleanValue) {
      return parseInt(cleanValue).toLocaleString();
    }
    return '';
  };

  // Client search functionality
  const filteredClients = useMemo(() => {
    if (!clients) return [];
    return clients.filter(client => {
      const searchTerm = clientSearchValue.toLowerCase();
      const businessName = (client.business_name || '').toLowerCase();
      const fullName = (client.full_name || '').toLowerCase();
      const phone = (client.phone || '').toLowerCase();
      
      return businessName.includes(searchTerm) || 
             fullName.includes(searchTerm) || 
             phone.includes(searchTerm);
    });
  }, [clients, clientSearchValue]);

  const selectedClient = clients?.find(c => c.id === selectedClientId);

  const resetForm = () => {
    setSelectedClientId('');
    setClientSearchValue('');
    setDefaultFeeUsd('');
    setDefaultFeeLbp('');
    setGovernorateOverrides([]);
    setPackageTypeExtras([]);
    setEditingId(null);
    setShowForm(false);
  };

  // Governorate override handlers
  const addGovernorateOverride = () => {
    const newOverride: GovernorateOverride = {
      id: Date.now().toString(),
      governorateId: '',
      governorateName: '',
      feeUsd: '',
      feeLbp: ''
    };
    setGovernorateOverrides([...governorateOverrides, newOverride]);
  };

  const updateGovernorateOverride = (id: string, field: keyof GovernorateOverride, value: string) => {
    setGovernorateOverrides(prev => prev.map(override => {
      if (override.id === id) {
        const updated = { ...override, [field]: value };
        if (field === 'governorateId') {
          const governorate = governorates?.find(g => g.id === value);
          updated.governorateName = governorate?.name || '';
        }
        return updated;
      }
      return override;
    }));
  };

  const removeGovernorateOverride = (id: string) => {
    setGovernorateOverrides(prev => prev.filter(override => override.id !== id));
  };

  // Package type extra handlers
  const addPackageTypeExtra = () => {
    const newExtra: PackageTypeExtra = {
      id: Date.now().toString(),
      packageType: 'Parcel',
      extraUsd: '',
      extraLbp: ''
    };
    setPackageTypeExtras([...packageTypeExtras, newExtra]);
  };

  const updatePackageTypeExtra = (id: string, field: keyof PackageTypeExtra, value: string) => {
    setPackageTypeExtras(prev => prev.map(extra => 
      extra.id === id ? { ...extra, [field]: value } : extra
    ));
  };

  const removePackageTypeExtra = (id: string) => {
    setPackageTypeExtras(prev => prev.filter(extra => extra.id !== id));
  };

  const handleEdit = (override: any) => {
    // For now, we'll disable editing since we need to restructure this
    // to handle the new comprehensive format
    toast.info("Edit functionality will be added in the next update");
  };

  const handleSubmit = () => {
    if (!selectedClientId) {
      toast.error("Please select a client");
      return;
    }

    // Validate default fees - at least one must be provided
    if (!defaultFeeUsd && !defaultFeeLbp) {
      toast.error("Please provide at least one default fee amount");
      return;
    }

    if (defaultFeeUsd && !validateUsd(defaultFeeUsd)) {
      toast.error("Default USD fee must be in 0.5 increments");
      return;
    }

    if (defaultFeeLbp && !validateLbp(defaultFeeLbp)) {
      toast.error("Default LBP fee must be in thousands");
      return;
    }

    // Validate governorate overrides
    for (const override of governorateOverrides) {
      if (!override.governorateId) {
        toast.error("Please select a governorate for all overrides");
        return;
      }
      if (!override.feeUsd && !override.feeLbp) {
        toast.error("Each governorate override must have at least one fee");
        return;
      }
      if (override.feeUsd && !validateUsd(override.feeUsd)) {
        toast.error("All USD fees must be in 0.5 increments");
        return;
      }
      if (override.feeLbp && !validateLbp(override.feeLbp)) {
        toast.error("All LBP fees must be in thousands");
        return;
      }
    }

    // Validate package type extras
    for (const extra of packageTypeExtras) {
      if (!extra.extraUsd && !extra.extraLbp) {
        toast.error("Each package type extra must have at least one fee");
        return;
      }
      if (extra.extraUsd && !validateUsd(extra.extraUsd)) {
        toast.error("All extra USD fees must be in 0.5 increments");
        return;
      }
      if (extra.extraLbp && !validateLbp(extra.extraLbp)) {
        toast.error("All extra LBP fees must be in thousands");
        return;
      }
    }

    // Create the default override first
    const defaultData = {
      client_id: selectedClientId,
      fee_usd: defaultFeeUsd ? parseFloat(defaultFeeUsd) : 0,
      fee_lbp: defaultFeeLbp ? parseInt(defaultFeeLbp.replace(/,/g, '')) : 0,
    };

    createOverride.mutate(defaultData, {
      onSuccess: () => {
        // Then create governorate overrides
        governorateOverrides.forEach(override => {
          const govData = {
            client_id: selectedClientId,
            governorate_id: override.governorateId,
            fee_usd: override.feeUsd ? parseFloat(override.feeUsd) : 0,
            fee_lbp: override.feeLbp ? parseInt(override.feeLbp.replace(/,/g, '')) : 0,
          };
          createOverride.mutate(govData);
        });

        // Then create package type extras
        packageTypeExtras.forEach(extra => {
          const packageData = {
            client_id: selectedClientId,
            package_type: extra.packageType,
            fee_usd: extra.extraUsd ? parseFloat(extra.extraUsd) : 0,
            fee_lbp: extra.extraLbp ? parseInt(extra.extraLbp.replace(/,/g, '')) : 0,
          };
          createOverride.mutate(packageData);
        });

        resetForm();
        toast.success("Client pricing configuration saved successfully");
      }
    });
  };

  const isFormValid = selectedClientId && (defaultFeeUsd || defaultFeeLbp);

  // Get available governorates for selection
  const availableGovernorates = governorates?.filter(gov => 
    !governorateOverrides.some(override => override.governorateId === gov.id)
  ) || [];

  // Get available package types for selection
  const availablePackageTypes = ['Parcel', 'Document', 'Bulky'].filter(type =>
    !packageTypeExtras.some(extra => extra.packageType === type)
  );

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
              <CardTitle className="text-lg">Add Client Pricing Configuration</CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure comprehensive pricing rules for a specific client
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Client Selection */}
              <div className="space-y-2">
                <Label className="text-base font-medium">1. Select Client *</Label>
                <Popover open={clientSearchOpen} onOpenChange={setClientSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={clientSearchOpen}
                      className="w-full justify-between"
                    >
                      {selectedClient ? (
                        <div className="flex flex-col items-start">
                          <span className="font-medium">
                            {selectedClient.business_name || selectedClient.full_name}
                          </span>
                          {selectedClient.phone && (
                            <span className="text-sm text-muted-foreground">
                              (+961-{selectedClient.phone})
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Search and select client...</span>
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput 
                        placeholder="Search by name or phone..." 
                        value={clientSearchValue}
                        onValueChange={setClientSearchValue}
                      />
                      <CommandEmpty>No clients found.</CommandEmpty>
                      <CommandGroup>
                        <CommandList>
                          {filteredClients.map((client) => (
                            <CommandItem
                              key={client.id}
                              value={client.id}
                              onSelect={() => {
                                setSelectedClientId(client.id);
                                setClientSearchOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedClientId === client.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {client.business_name || client.full_name}
                                </span>
                                {client.phone && (
                                  <span className="text-sm text-muted-foreground">
                                    (+961-{client.phone})
                                  </span>
                                )}
                              </div>
                            </CommandItem>
                          ))}
                        </CommandList>
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <Separator />

              {/* Default Delivery Fees */}
              <div className="space-y-4">
                <Label className="text-base font-medium">2. Default Delivery Fee (Fallback) *</Label>
                <p className="text-sm text-muted-foreground">
                  This fee will be used when no governorate-specific pricing is defined
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Fee (USD)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                      <Input
                        type="number"
                        step="0.5"
                        min="0"
                        placeholder="5.00"
                        value={defaultFeeUsd}
                        onChange={(e) => setDefaultFeeUsd(e.target.value)}
                        className={`pl-9 ${!validateUsd(defaultFeeUsd) && defaultFeeUsd ? 'border-destructive' : ''}`}
                      />
                    </div>
                    {!validateUsd(defaultFeeUsd) && defaultFeeUsd && (
                      <div className="flex items-center gap-1 text-xs text-destructive">
                        <AlertTriangle className="h-3 w-3" />
                        Must be in 0.5 increments
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Fee (LBP)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground z-10">
                        L.L.
                      </span>
                      <Input
                        type="text"
                        placeholder="150,000"
                        value={formatLbpInput(defaultFeeLbp)}
                        onChange={(e) => setDefaultFeeLbp(e.target.value.replace(/,/g, ''))}
                        className={`pl-12 ${!validateLbp(defaultFeeLbp) && defaultFeeLbp ? 'border-destructive' : ''}`}
                      />
                    </div>
                    {!validateLbp(defaultFeeLbp) && defaultFeeLbp && (
                      <div className="flex items-center gap-1 text-xs text-destructive">
                        <AlertTriangle className="h-3 w-3" />
                        Must be in thousands
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Governorate-Based Pricing */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">3. Governorate-Based Pricing (Optional)</Label>
                    <p className="text-sm text-muted-foreground">
                      Override delivery fees for specific governorates
                    </p>
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={addGovernorateOverride}
                    disabled={availableGovernorates.length === 0}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Governorate
                  </Button>
                </div>

                {governorateOverrides.map((override) => (
                  <Card key={override.id} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                      <div className="space-y-2">
                        <Label>Governorate</Label>
                        <Select 
                          value={override.governorateId} 
                          onValueChange={(value) => updateGovernorateOverride(override.id, 'governorateId', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select governorate" />
                          </SelectTrigger>
                          <SelectContent>
                            {governorates?.map((gov) => (
                              <SelectItem 
                                key={gov.id} 
                                value={gov.id}
                                disabled={governorateOverrides.some(o => o.governorateId === gov.id && o.id !== override.id)}
                              >
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4" />
                                  {gov.name}
                                </div>
                              </SelectItem>
                            ))}
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
                            placeholder="7.00"
                            value={override.feeUsd}
                            onChange={(e) => updateGovernorateOverride(override.id, 'feeUsd', e.target.value)}
                            className="pl-9"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Fee (LBP)</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground z-10">
                            L.L.
                          </span>
                          <Input
                            type="text"
                            placeholder="200,000"
                            value={formatLbpInput(override.feeLbp)}
                            onChange={(e) => updateGovernorateOverride(override.id, 'feeLbp', e.target.value.replace(/,/g, ''))}
                            className="pl-12"
                          />
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeGovernorateOverride(override.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}

                {governorateOverrides.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No governorate overrides added</p>
                    <p className="text-sm">Add overrides to customize pricing by location</p>
                  </div>
                )}
              </div>

              <Separator />

              {/* Package Type Extra Fees */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">4. Package Type Extra Fees (Optional)</Label>
                    <p className="text-sm text-muted-foreground">
                      Add extra charges for specific package types (will be added to base delivery fee)
                    </p>
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={addPackageTypeExtra}
                    disabled={availablePackageTypes.length === 0}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Package Type
                  </Button>
                </div>

                {packageTypeExtras.map((extra) => (
                  <Card key={extra.id} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                      <div className="space-y-2">
                        <Label>Package Type</Label>
                        <Select 
                          value={extra.packageType} 
                          onValueChange={(value) => updatePackageTypeExtra(extra.id, 'packageType', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select package type" />
                          </SelectTrigger>
                          <SelectContent>
                            {['Parcel', 'Document', 'Bulky'].map((type) => (
                              <SelectItem 
                                key={type} 
                                value={type}
                                disabled={packageTypeExtras.some(e => e.packageType === type && e.id !== extra.id)}
                              >
                                <div className="flex items-center gap-2">
                                  <Package className="h-4 w-4" />
                                  {type}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Extra Fee (USD)</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                          <Input
                            type="number"
                            step="0.5"
                            min="0"
                            placeholder="3.00"
                            value={extra.extraUsd}
                            onChange={(e) => updatePackageTypeExtra(extra.id, 'extraUsd', e.target.value)}
                            className="pl-9"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Extra Fee (LBP)</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground z-10">
                            L.L.
                          </span>
                          <Input
                            type="text"
                            placeholder="50,000"
                            value={formatLbpInput(extra.extraLbp)}
                            onChange={(e) => updatePackageTypeExtra(extra.id, 'extraLbp', e.target.value.replace(/,/g, ''))}
                            className="pl-12"
                          />
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removePackageTypeExtra(extra.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}

                {packageTypeExtras.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No package type extras added</p>
                    <p className="text-sm">Add extras to charge more for specific package types</p>
                  </div>
                )}
              </div>

              <Separator />

              {/* Submit Actions */}
              <div className="flex items-center gap-3">
                <Button 
                  onClick={handleSubmit}
                  disabled={!isFormValid || createOverride.isPending}
                  className="min-w-[140px]"
                >
                  {createOverride.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Save Configuration
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