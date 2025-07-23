import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Plus, Pencil, Trash2, DollarSign, Loader2, AlertTriangle, Check, ChevronsUpDown, MapPin, Package } from 'lucide-react';
import { useClientPricingOverrides, useCreateClientPricingOverride, useUpdateClientPricingOverride, useDeleteClientPricingOverride } from '@/hooks/use-pricing';
import { useAdminClients } from '@/hooks/use-admin-clients';
import { useGovernorates } from '@/hooks/use-governorates';
import { formatCurrency } from '@/utils/format';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const ClientPricingSection = () => {
  const { data: overrides, isLoading } = useClientPricingOverrides();
  const { data: clients } = useAdminClients();
  const { data: governorates } = useGovernorates();
  const createOverride = useCreateClientPricingOverride();
  const updateOverride = useUpdateClientPricingOverride();
  const deleteOverride = useDeleteClientPricingOverride();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [ruleType, setRuleType] = useState<'default' | 'zone' | 'package'>('default');
  
  // Client selection with search
  const [selectedClientId, setSelectedClientId] = useState('');
  const [clientSearchOpen, setClientSearchOpen] = useState(false);
  const [clientSearchValue, setClientSearchValue] = useState('');
  
  // Rule-specific fields
  const [governorateId, setGovernorateId] = useState('');
  const [packageType, setPackageType] = useState<'Parcel' | 'Document' | 'Bulky' | ''>('');
  
  // Separate fees for each rule type to prevent cross-contamination
  const [defaultFeeUsd, setDefaultFeeUsd] = useState('');
  const [defaultFeeLbp, setDefaultFeeLbp] = useState('');
  const [zoneFeeUsd, setZoneFeeUsd] = useState('');
  const [zoneFeeLbp, setZoneFeeLbp] = useState('');
  const [packageFeeUsd, setPackageFeeUsd] = useState('');
  const [packageFeeLbp, setPackageFeeLbp] = useState('');

  // Get current fees based on rule type
  const getCurrentFees = () => {
    switch (ruleType) {
      case 'default':
        return { feeUsd: defaultFeeUsd, feeLbp: defaultFeeLbp };
      case 'zone':
        return { feeUsd: zoneFeeUsd, feeLbp: zoneFeeLbp };
      case 'package':
        return { feeUsd: packageFeeUsd, feeLbp: packageFeeLbp };
      default:
        return { feeUsd: '', feeLbp: '' };
    }
  };

  // Set current fees based on rule type
  const setCurrentFees = (feeUsd: string, feeLbp: string) => {
    switch (ruleType) {
      case 'default':
        setDefaultFeeUsd(feeUsd);
        setDefaultFeeLbp(feeLbp);
        break;
      case 'zone':
        setZoneFeeUsd(feeUsd);
        setZoneFeeLbp(feeLbp);
        break;
      case 'package':
        setPackageFeeUsd(feeUsd);
        setPackageFeeLbp(feeLbp);
        break;
    }
  };

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

  // Group overrides by client for better display
  const groupedOverrides = useMemo(() => {
    if (!overrides) return [];
    
    const grouped = overrides.reduce((acc, override) => {
      const clientId = override.client_id;
      if (!acc[clientId]) {
        acc[clientId] = {
          client: {
            id: clientId,
            name: override.business_name || override.client_name,
            businessName: override.business_name,
            fullName: override.client_name
          },
          rules: []
        };
      }
      acc[clientId].rules.push(override);
      return acc;
    }, {} as Record<string, { client: any; rules: any[] }>);

    // Sort rules within each client: default first, then zones, then packages
    Object.values(grouped).forEach(group => {
      group.rules.sort((a, b) => {
        // Default rules first
        if (!a.governorate_id && !a.package_type) return -1;
        if (!b.governorate_id && !b.package_type) return 1;
        // Zone rules before package rules
        if (a.governorate_id && !b.governorate_id) return -1;
        if (!a.governorate_id && b.governorate_id) return 1;
        return 0;
      });
    });

    return Object.values(grouped);
  }, [overrides]);

  const resetForm = () => {
    setSelectedClientId('');
    setClientSearchValue('');
    setRuleType('default');
    setGovernorateId('');
    setPackageType('');
    // Reset all fee states
    setDefaultFeeUsd('');
    setDefaultFeeLbp('');
    setZoneFeeUsd('');
    setZoneFeeLbp('');
    setPackageFeeUsd('');
    setPackageFeeLbp('');
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (override: any) => {
    setSelectedClientId(override.client_id);
    
    // Determine rule type and set appropriate fields
    if (override.governorate_id) {
      setRuleType('zone');
      setGovernorateId(override.governorate_id);
      setZoneFeeUsd(override.fee_usd ? override.fee_usd.toString() : '');
      setZoneFeeLbp(override.fee_lbp ? override.fee_lbp.toString() : '');
    } else if (override.package_type) {
      setRuleType('package');
      setPackageType(override.package_type);
      setPackageFeeUsd(override.fee_usd ? override.fee_usd.toString() : '');
      setPackageFeeLbp(override.fee_lbp ? override.fee_lbp.toString() : '');
    } else {
      setRuleType('default');
      setDefaultFeeUsd(override.fee_usd ? override.fee_usd.toString() : '');
      setDefaultFeeLbp(override.fee_lbp ? override.fee_lbp.toString() : '');
    }
    
    setEditingId(override.id);
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!selectedClientId) {
      toast.error("Please select a client");
      return;
    }

    const { feeUsd, feeLbp } = getCurrentFees();

    // Validate rule-specific fields
    if (ruleType === 'zone' && !governorateId) {
      toast.error("Please select a governorate for zone-specific pricing");
      return;
    }

    if (ruleType === 'package' && !packageType) {
      toast.error("Please select a package type for package-specific pricing");
      return;
    }

    // Validate fees - at least one must be provided
    if (!feeUsd && !feeLbp) {
      toast.error("Please provide at least one fee amount");
      return;
    }

    if (feeUsd && !validateUsd(feeUsd)) {
      toast.error("USD fee must be in 0.5 increments");
      return;
    }

    if (feeLbp && !validateLbp(feeLbp)) {
      toast.error("LBP fee must be in thousands");
      return;
    }

    // Create the override data
    const data = {
      client_id: selectedClientId,
      fee_usd: feeUsd ? parseFloat(feeUsd) : 0,
      fee_lbp: feeLbp ? parseInt(feeLbp.replace(/,/g, '')) : 0,
      governorate_id: ruleType === 'zone' ? governorateId : null,
      city_id: null, // We'll implement city selection later
      package_type: ruleType === 'package' ? packageType : null,
    };

    if (editingId) {
      // Update existing override
      updateOverride.mutate(
        { 
          id: editingId, 
          updates: data
        },
        {
          onSuccess: () => {
            resetForm();
          },
          onError: (error) => {
            console.error('Update error:', error);
          }
        }
      );
    } else {
      // Create new override
      createOverride.mutate(data, {
        onSuccess: () => {
          resetForm();
        },
        onError: (error) => {
          console.error('Create error:', error);
        }
      });
    }
  };

  const { feeUsd, feeLbp } = getCurrentFees();
  const isFormValid = selectedClientId && (feeUsd || feeLbp) && 
    (ruleType === 'default' || 
     (ruleType === 'zone' && governorateId) || 
     (ruleType === 'package' && packageType));

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
              <Users className="h-5 w-5 text-primary" />
              Client-Specific Pricing
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Configure layered pricing rules: Default fees, zone overrides, and package extras for specific clients
            </p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Rule
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showForm && (
          <Card className="mb-6 border-dashed">
            <CardHeader>
              <CardTitle className="text-lg">
                {editingId ? 'Edit Client Pricing Rule' : 'Add Client Pricing Rule'}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Create rules for default pricing, zone-specific overrides, or package-type extras
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Client Selection */}
              <div className="space-y-2">
                <Label className="text-base font-medium">Select Client *</Label>
                <Popover open={clientSearchOpen} onOpenChange={setClientSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={clientSearchOpen}
                      className="w-full justify-between"
                      disabled={!!editingId}
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

              {/* Rule Type Selection */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Pricing Rule Type *</Label>
                <Tabs value={ruleType} onValueChange={(value) => setRuleType(value as 'default' | 'zone' | 'package')}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="default" className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Default Fee
                    </TabsTrigger>
                    <TabsTrigger value="zone" className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Zone Override
                    </TabsTrigger>
                    <TabsTrigger value="package" className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Package Extra
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="default" className="space-y-3">
                    <div className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
                      <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-blue-600" />
                        Client Default Pricing
                      </h4>
                      <p className="text-xs text-muted-foreground mb-3">
                        Sets the base delivery fee for this client. Used when no zone or package-specific rules match.
                      </p>
                      <div className="text-xs space-y-1">
                        <div><strong>Priority:</strong> 5th (lowest)</div>
                        <div><strong>Applies to:</strong> All orders from this client</div>
                        <div><strong>Overrides:</strong> Global default pricing</div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="zone" className="space-y-3">
                    <div className="p-4 border rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
                      <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-green-600" />
                        Zone-Specific Override
                      </h4>
                      <p className="text-xs text-muted-foreground mb-3">
                        Override delivery fees for specific governorates. Takes priority over client default pricing.
                      </p>
                      <div className="text-xs space-y-1 mb-3">
                        <div><strong>Priority:</strong> 3rd (high)</div>
                        <div><strong>Applies to:</strong> Orders to the selected governorate</div>
                        <div><strong>Overrides:</strong> Client default & global pricing</div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Governorate *</Label>
                        <Select value={governorateId} onValueChange={setGovernorateId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select governorate..." />
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
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="package" className="space-y-3">
                    <div className="p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20">
                      <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                        <Package className="h-4 w-4 text-purple-600" />
                        Package-Specific Pricing
                      </h4>
                      <p className="text-xs text-muted-foreground mb-3">
                        Set total delivery fees for specific package types. Overrides default and zone pricing.
                      </p>
                      <div className="text-xs space-y-1 mb-3">
                        <div><strong>Priority:</strong> 4th (medium)</div>
                        <div><strong>Applies to:</strong> Orders with the selected package type</div>
                        <div><strong>Overrides:</strong> Client default & global pricing</div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Package Type *</Label>
                        <Select value={packageType} onValueChange={(value) => setPackageType(value as 'Parcel' | 'Document' | 'Bulky')}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select package type..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Parcel">Parcel</SelectItem>
                            <SelectItem value="Document">Document</SelectItem>
                            <SelectItem value="Bulky">Bulky</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Delivery Fees */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Delivery Fees *</Label>
                <p className="text-sm text-muted-foreground">
                  Set the delivery fees for this rule (at least one currency required)
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
                        value={feeUsd}
                        onChange={(e) => setCurrentFees(e.target.value, feeLbp)}
                        className={`pl-9 ${!validateUsd(feeUsd) && feeUsd ? 'border-destructive' : ''}`}
                      />
                    </div>
                    {!validateUsd(feeUsd) && feeUsd && (
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
                        value={formatLbpInput(feeLbp)}
                        onChange={(e) => setCurrentFees(feeUsd, e.target.value.replace(/,/g, ''))}
                        className={`pl-12 ${!validateLbp(feeLbp) && feeLbp ? 'border-destructive' : ''}`}
                      />
                    </div>
                    {!validateLbp(feeLbp) && feeLbp && (
                      <div className="flex items-center gap-1 text-xs text-destructive">
                        <AlertTriangle className="h-3 w-3" />
                        Must be in thousands
                      </div>
                    )}
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
                  {editingId ? 'Update Rule' : 'Create Rule'}
                </Button>
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {groupedOverrides && groupedOverrides.length > 0 ? (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Rule Type</TableHead>
                  <TableHead>Zone/Package</TableHead>
                  <TableHead>Fee (USD)</TableHead>
                  <TableHead>Fee (LBP)</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groupedOverrides.map((group) => 
                  group.rules.map((override, index) => (
                  <TableRow key={override.id} className={index > 0 ? 'border-t-0' : ''}>
                    <TableCell className={index > 0 ? 'border-t-0 py-2' : ''}>
                      {index === 0 ? (
                        <div>
                          <div className="font-medium">
                            {group.client.businessName || group.client.fullName}
                          </div>
                          {group.client.businessName && group.client.fullName && (
                            <div className="text-sm text-muted-foreground">
                              {group.client.fullName}
                            </div>
                          )}
                          {group.rules.length > 1 && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {group.rules.length} pricing rules
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground pl-4">
                          ↳ Additional rule
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {override.governorate_id ? (
                        <Badge variant="default" className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                          <MapPin className="h-3 w-3 mr-1" />
                          Zone Override
                        </Badge>
                      ) : override.package_type ? (
                        <Badge variant="default" className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                          <Package className="h-3 w-3 mr-1" />
                          Package Extra
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                          <DollarSign className="h-3 w-3 mr-1" />
                          Default Fee
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {override.governorate_id ? (
                        <span className="text-sm font-medium">
                          {override.governorate_name || 'Zone Rule'}
                        </span>
                      ) : override.package_type ? (
                        <span className="text-sm font-medium">
                          {override.package_type}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          All areas & packages
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {formatCurrency(override.fee_usd || 0, 'USD')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {formatCurrency(override.fee_lbp || 0, 'LBP')}
                      </Badge>
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
                              <AlertDialogTitle>Delete Client Pricing Rule</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this pricing rule? This action cannot be undone and may affect delivery fee calculations.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteOverride.mutate(override.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete Rule
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                )))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No client pricing rules configured</p>
            <p className="text-sm">Create rules to set custom pricing for specific clients, zones, or package types</p>
          </div>
        )}

        {/* Pricing Logic Explanation */}
        {groupedOverrides && groupedOverrides.length > 0 && (
          <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              Pricing Logic Priority (Client-Specific System)
            </h4>
            <div className="text-xs text-muted-foreground space-y-1">
              <div className="font-medium text-amber-800 dark:text-amber-300 mb-2">
                If client is in Client-Specific Pricing, ONLY these rules apply:
              </div>
              <div>1. <strong className="text-green-700 dark:text-green-400">Zone + Package rules</strong> - Highest priority (not yet implemented)</div>
              <div>2. <strong className="text-green-700 dark:text-green-400">Zone Override rules</strong> - Override client defaults for specific areas</div>
              <div>3. <strong className="text-purple-700 dark:text-purple-400">Package Extra rules</strong> - Override client defaults for specific package types</div>
              <div>4. <strong className="text-blue-700 dark:text-blue-400">Client Default rules</strong> - Base fallback for this client</div>
              <div>5. <strong className="text-gray-600 dark:text-gray-400">Global Default</strong> - System fallback (if no client rules exist)</div>
              <div className="mt-2 p-2 bg-amber-100 dark:bg-amber-900/30 rounded text-amber-800 dark:text-amber-300 text-xs">
                <strong>Important:</strong> Global Zone & Package pricing does NOT apply to clients with custom rules.
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClientPricingSection;