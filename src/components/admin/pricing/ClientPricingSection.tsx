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
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Users, Plus, Pencil, Trash2, DollarSign, Loader2, Check, ChevronsUpDown, MapPin, Package, X, Settings } from 'lucide-react';
import { 
  useAllClientPricingConfigurations,
  useClientPricingConfiguration,
  useCreateOrUpdateClientDefault,
  useDeleteClientDefault,
  useCreateClientZoneRule,
  useUpdateClientZoneRule,
  useDeleteClientZoneRule,
  useCreateOrUpdateClientPackageExtra,
  useDeleteClientPackageExtra
} from '@/hooks/use-client-pricing';
import { useAdminClients } from '@/hooks/use-admin-clients';
import { useGovernorates } from '@/hooks/use-governorates';
import { formatCurrency } from '@/utils/format';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { deleteAllClientPricingOverrides, deleteAllClientZoneRules, deleteAllClientPackageTypePricing, deleteAllClientPackageExtras } from '@/services/pricing';
import { deleteClientDefault } from '@/services/client-pricing';
import { useQueryClient } from '@tanstack/react-query';

const ClientPricingSection = () => {
  const { data: allConfigurations, isLoading } = useAllClientPricingConfigurations();
  const { data: clients } = useAdminClients();
  const { data: governorates } = useGovernorates();
  
  // Mutations
  const createOrUpdateDefault = useCreateOrUpdateClientDefault();
  const deleteDefault = useDeleteClientDefault();
  const createZoneRule = useCreateClientZoneRule();
  const updateZoneRule = useUpdateClientZoneRule();
  const deleteZoneRule = useDeleteClientZoneRule();
  const createOrUpdatePackageExtra = useCreateOrUpdateClientPackageExtra();
  const deletePackageExtra = useDeleteClientPackageExtra();

  const queryClient = useQueryClient();

  // Client selection state
  const [selectedClientId, setSelectedClientId] = useState('');
  const [clientSearchOpen, setClientSearchOpen] = useState(false);
  const [clientSearchValue, setClientSearchValue] = useState('');
  
  // Default pricing state
  const [defaultFeeUsd, setDefaultFeeUsd] = useState('');
  const [defaultFeeLbp, setDefaultFeeLbp] = useState('');
  
  // Zone rule state
  const [showZoneForm, setShowZoneForm] = useState(false);
  const [editingZoneId, setEditingZoneId] = useState<string | null>(null);
  const [selectedGovernorateIds, setSelectedGovernorateIds] = useState<string[]>([]);
  const [zoneRuleName, setZoneRuleName] = useState('');
  const [zoneFeeUsd, setZoneFeeUsd] = useState('');
  const [zoneFeeLbp, setZoneFeeLbp] = useState('');
  
  // Package extras state
  const [packageParcelUsd, setPackageParcelUsd] = useState('');
  const [packageParcelLbp, setPackageParcelLbp] = useState('');
  const [packageDocumentUsd, setPackageDocumentUsd] = useState('');
  const [packageDocumentLbp, setPackageDocumentLbp] = useState('');
  const [packageBulkyUsd, setPackageBulkyUsd] = useState('');
  const [packageBulkyLbp, setPackageBulkyLbp] = useState('');

  // Get current client configuration
  const selectedClientConfig = allConfigurations?.find(config => config.client_id === selectedClientId);
  
  // Load existing data when client is selected
  React.useEffect(() => {
    if (selectedClientConfig) {
      // Load default pricing
      setDefaultFeeUsd(selectedClientConfig.default_pricing?.default_fee_usd?.toString() || '');
      setDefaultFeeLbp(selectedClientConfig.default_pricing?.default_fee_lbp?.toString() || '');
      
      // Load package extras
      const parcelExtra = selectedClientConfig.package_extras?.find(e => e.package_type === 'Parcel');
      const documentExtra = selectedClientConfig.package_extras?.find(e => e.package_type === 'Document');
      const bulkyExtra = selectedClientConfig.package_extras?.find(e => e.package_type === 'Bulky');
      
      setPackageParcelUsd(parcelExtra?.extra_fee_usd?.toString() || '');
      setPackageParcelLbp(parcelExtra?.extra_fee_lbp?.toString() || '');
      setPackageDocumentUsd(documentExtra?.extra_fee_usd?.toString() || '');
      setPackageDocumentLbp(documentExtra?.extra_fee_lbp?.toString() || '');
      setPackageBulkyUsd(bulkyExtra?.extra_fee_usd?.toString() || '');
      setPackageBulkyLbp(bulkyExtra?.extra_fee_lbp?.toString() || '');
    } else {
      // Reset form when no client selected
      setDefaultFeeUsd('');
      setDefaultFeeLbp('');
      setPackageParcelUsd('');
      setPackageParcelLbp('');
      setPackageDocumentUsd('');
      setPackageDocumentLbp('');
      setPackageBulkyUsd('');
      setPackageBulkyLbp('');
    }
  }, [selectedClientConfig]);

  // Validation functions
  const validateUsd = (value: string) => {
    if (!value || value === '') return true;
    const num = parseFloat(value);
    return !isNaN(num) && num >= 0;
  };

  const validateLbp = (value: string) => {
    if (!value || value === '') return true;
    const cleanValue = value.replace(/,/g, '');
    const num = parseInt(cleanValue);
    return !isNaN(num) && num >= 0;
  };

  const formatLbpInput = (value: string) => {
    const cleanValue = value.replace(/[^\d]/g, '');
    if (cleanValue) {
      return parseInt(cleanValue).toLocaleString();
    }
    return '';
  };

  // Get configured client IDs
  const configuredClientIds = useMemo(() => {
    return allConfigurations?.map(config => config.client_id) || [];
  }, [allConfigurations]);

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

  const resetZoneForm = () => {
    setShowZoneForm(false);
    setEditingZoneId(null);
    setSelectedGovernorateIds([]);
    setZoneRuleName('');
    setZoneFeeUsd('');
    setZoneFeeLbp('');
  };

  const resetClientSelection = () => {
    setSelectedClientId('');
    setClientSearchValue('');
    setDefaultFeeUsd('');
    setDefaultFeeLbp('');
    setPackageParcelUsd('');
    setPackageParcelLbp('');
    setPackageDocumentUsd('');
    setPackageDocumentLbp('');
    setPackageBulkyUsd('');
    setPackageBulkyLbp('');
    resetZoneForm();
  };

  // Unified save configuration handler
  const [isSaving, setIsSaving] = useState(false);

  const validateAllInputs = () => {
    // Validate default pricing
    if (defaultFeeUsd && !validateUsd(defaultFeeUsd)) {
      toast.error("Invalid default USD amount");
      return false;
    }
    if (defaultFeeLbp && !validateLbp(defaultFeeLbp)) {
      toast.error("Invalid default LBP amount");
      return false;
    }

    // Validate zone rules
    if (zoneFeeUsd && !validateUsd(zoneFeeUsd)) {
      toast.error("Invalid zone USD amount");
      return false;
    }
    if (zoneFeeLbp && !validateLbp(zoneFeeLbp)) {
      toast.error("Invalid zone LBP amount");
      return false;
    }

    // Validate package extras
    if (packageParcelUsd && !validateUsd(packageParcelUsd)) {
      toast.error("Invalid parcel USD amount");
      return false;
    }
    if (packageParcelLbp && !validateLbp(packageParcelLbp)) {
      toast.error("Invalid parcel LBP amount");
      return false;
    }
    if (packageDocumentUsd && !validateUsd(packageDocumentUsd)) {
      toast.error("Invalid document USD amount");
      return false;
    }
    if (packageDocumentLbp && !validateLbp(packageDocumentLbp)) {
      toast.error("Invalid document LBP amount");
      return false;
    }
    if (packageBulkyUsd && !validateUsd(packageBulkyUsd)) {
      toast.error("Invalid bulky USD amount");
      return false;
    }
    if (packageBulkyLbp && !validateLbp(packageBulkyLbp)) {
      toast.error("Invalid bulky LBP amount");
      return false;
    }

    return true;
  };

  const handleSaveConfiguration = async () => {
    if (!selectedClientId) {
      toast.error("Please select a client first");
      return;
    }

    if (!validateAllInputs()) {
      return;
    }

    setIsSaving(true);
    let hasAnyData = false;

    try {
      // 1. Save default pricing if provided
      if (defaultFeeUsd || defaultFeeLbp) {
        await new Promise((resolve, reject) => {
          createOrUpdateDefault.mutate({
            clientId: selectedClientId,
            pricing: {
              default_fee_usd: defaultFeeUsd ? parseFloat(defaultFeeUsd) : 0,
              default_fee_lbp: defaultFeeLbp ? parseInt(defaultFeeLbp.replace(/,/g, '')) : 0,
            }
          }, {
            onSuccess: () => {
              hasAnyData = true;
              resolve(void 0);
            },
            onError: reject
          });
        });
      }

      // 2. Save package extras if provided
      const packageTypes = [
        { type: 'Parcel' as const, usd: packageParcelUsd, lbp: packageParcelLbp },
        { type: 'Document' as const, usd: packageDocumentUsd, lbp: packageDocumentLbp },
        { type: 'Bulky' as const, usd: packageBulkyUsd, lbp: packageBulkyLbp }
      ];

      for (const pkg of packageTypes) {
        if (pkg.usd || pkg.lbp) {
          await new Promise((resolve, reject) => {
            createOrUpdatePackageExtra.mutate({
              clientId: selectedClientId,
              packageType: pkg.type,
              pricing: {
                extra_fee_usd: pkg.usd ? parseFloat(pkg.usd) : 0,
                extra_fee_lbp: pkg.lbp ? parseInt(pkg.lbp.replace(/,/g, '')) : 0,
              }
            }, {
              onSuccess: () => {
                hasAnyData = true;
                resolve(void 0);
              },
              onError: reject
            });
          });
        }
      }

      if (hasAnyData) {
        toast.success("Pricing configuration saved successfully!");
        resetClientSelection(); // Clear form after successful save
      } else {
        toast.warning("No pricing data provided. Please enter at least one fee amount.");
      }

    } catch (error: any) {
      console.error('Error saving pricing configuration:', error);
      toast.error(`Failed to save configuration: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle edit configuration
  const handleEditConfiguration = (clientId: string) => {
    setSelectedClientId(clientId);
    setClientSearchValue('');
    setClientSearchOpen(false);
  };

  // Handle delete configuration
  const handleDeleteConfiguration = async (clientId: string) => {
    try {
      // Delete all pricing overrides for this client
      await Promise.all([
        deleteAllClientPricingOverrides(clientId),
        deleteAllClientZoneRules(clientId),
        deleteAllClientPackageTypePricing(clientId),
        deleteAllClientPackageExtras(clientId),
        deleteClientDefault(clientId),
      ]);
      toast.success("Client pricing configuration deleted successfully!");
      resetClientSelection();
      queryClient.invalidateQueries({ queryKey: ['pricing', 'client-configurations'] });
    } catch (error: any) {
      console.error('Error deleting pricing configuration:', error);
      toast.error(`Failed to delete configuration: ${error.message}`);
    }
  };

  // Handle zone rule save (separate from main config since it's add/edit based)
  const handleSaveZoneRule = () => {
    if (!selectedClientId) {
      toast.error("Please select a client first");
      return;
    }

    if (selectedGovernorateIds.length === 0) {
      toast.error("Please select at least one governorate");
      return;
    }

    if (!zoneFeeUsd && !zoneFeeLbp) {
      toast.error("Please provide at least one fee amount");
      return;
    }

    if (zoneFeeUsd && !validateUsd(zoneFeeUsd)) {
      toast.error("Invalid USD amount");
      return;
    }

    if (zoneFeeLbp && !validateLbp(zoneFeeLbp)) {
      toast.error("Invalid LBP amount");
      return;
    }

    const ruleData = {
      client_id: selectedClientId,
      governorate_ids: selectedGovernorateIds,
      fee_usd: zoneFeeUsd ? parseFloat(zoneFeeUsd) : 0,
      fee_lbp: zoneFeeLbp ? parseInt(zoneFeeLbp.replace(/,/g, '')) : 0,
      rule_name: zoneRuleName || null,
    };

    if (editingZoneId) {
      updateZoneRule.mutate({
        id: editingZoneId,
        updates: ruleData,
      }, {
        onSuccess: () => resetZoneForm()
      });
    } else {
      createZoneRule.mutate(ruleData, {
        onSuccess: () => resetZoneForm()
      });
    }
  };

  // Handle edit zone rule
  const handleEditZoneRule = (rule: any) => {
    setEditingZoneId(rule.id);
    setSelectedGovernorateIds(rule.governorate_ids || []);
    setZoneRuleName(rule.rule_name || '');
    setZoneFeeUsd(rule.fee_usd?.toString() || '');
    setZoneFeeLbp(rule.fee_lbp?.toString() || '');
    setShowZoneForm(true);
  };

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
              Client-Specific Pricing Configuration
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Configure complete pricing rules per client: default fees, zone-specific overrides, and package-type extras
            </p>
          </div>
          {selectedClientId && (
            <Button variant="outline" onClick={resetClientSelection}>
              <X className="h-4 w-4 mr-2" />
              Clear Selection
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Client Selection */}
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Select Client to Configure
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Choose a client to set up their complete pricing configuration
            </p>
          </CardHeader>
          <CardContent>
            <Popover open={clientSearchOpen} onOpenChange={setClientSearchOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={clientSearchOpen}
                  className="w-full justify-between h-auto p-4"
                >
                  {selectedClient ? (
                    <div className="flex flex-col items-start text-left">
                      <span className="font-medium text-base">
                        {selectedClient.business_name || selectedClient.full_name}
                      </span>
                      {selectedClient.phone && (
                        <span className="text-sm text-muted-foreground">
                          (+961-{selectedClient.phone})
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Search and select a client to configure...</span>
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
                      {filteredClients.map((client) => {
                        const isConfigured = configuredClientIds.includes(client.id);
                        return (
                          <CommandItem
                            key={client.id}
                            value={client.id}
                            onSelect={() => {
                              if (!isConfigured) {
                                setSelectedClientId(client.id);
                                setClientSearchOpen(false);
                              }
                            }}
                            className={cn(
                              isConfigured && "opacity-50 cursor-not-allowed"
                            )}
                            disabled={isConfigured}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedClientId === client.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div className="flex flex-col flex-1">
                              <span className="font-medium">
                                {client.business_name || client.full_name}
                              </span>
                              {client.phone && (
                                <span className="text-sm text-muted-foreground">
                                  (+961-{client.phone})
                                </span>
                              )}
                              {isConfigured && (
                                <span className="text-xs text-amber-600">
                                  Already configured — edit from list below
                                </span>
                              )}
                            </div>
                          </CommandItem>
                        );
                      })}
                    </CommandList>
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </CardContent>
        </Card>

        {/* Client Configuration Sections */}
        {selectedClientId && (
          <div className="space-y-6">
            {/* Default Pricing Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                  Default Pricing
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Base delivery fee for this client. Used when no zone or package-specific rules match.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="default-usd">USD Fee</Label>
                    <Input
                      id="default-usd"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={defaultFeeUsd}
                      onChange={(e) => setDefaultFeeUsd(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="default-lbp">LBP Fee</Label>
                    <Input
                      id="default-lbp"
                      placeholder="0"
                      value={defaultFeeLbp}
                      onChange={(e) => setDefaultFeeLbp(formatLbpInput(e.target.value))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Zone Rules Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-green-600" />
                      Zone-Specific Rules
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Override fees for specific combinations of governorates
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowZoneForm(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Zone Rule
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Zone Form */}
                {showZoneForm && (
                  <Card className="border-dashed">
                    <CardHeader>
                      <CardTitle className="text-base">
                        {editingZoneId ? 'Edit Zone Rule' : 'Add Zone Rule'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Rule Name (Optional)</Label>
                        <Input
                          placeholder="e.g., Major Cities, Remote Areas"
                          value={zoneRuleName}
                          onChange={(e) => setZoneRuleName(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Select Governorates</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={`w-full justify-between ${selectedGovernorateIds.length === 0 ? 'text-muted-foreground' : ''}`}
                            >
                              {selectedGovernorateIds.length === 0
                                ? 'Select governorates...'
                                : governorates
                                    ?.filter(gov => selectedGovernorateIds.includes(gov.id))
                                    .map(gov => gov.name)
                                    .join(', ')
                              }
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-72 p-0">
                            <Command>
                              <CommandInput placeholder="Search governorates..." className="h-9" />
                              <CommandList>
                                <CommandEmpty>No governorate found.</CommandEmpty>
                                <CommandGroup>
                                  {governorates?.map((gov) => {
                                    // Compute used governorate IDs (except when editing)
                                    const usedGovernorateIds = selectedClientConfig?.zone_rules
                                      ? selectedClientConfig.zone_rules
                                          .filter(rule => !editingZoneId || rule.id !== editingZoneId)
                                          .flatMap(rule => rule.governorate_ids)
                                      : [];
                                    const isUsed = usedGovernorateIds.includes(gov.id);
                                    return (
                                      <CommandItem
                                        key={gov.id}
                                        onSelect={() => {
                                          if (isUsed) return;
                                          if (selectedGovernorateIds.includes(gov.id)) {
                                            setSelectedGovernorateIds(selectedGovernorateIds.filter(id => id !== gov.id));
                                          } else {
                                            setSelectedGovernorateIds([...selectedGovernorateIds, gov.id]);
                                          }
                                        }}
                                        className={`cursor-pointer ${isUsed ? 'opacity-50 pointer-events-none' : ''}`}
                                        disabled={isUsed}
                                      >
                                        <Checkbox
                                          checked={selectedGovernorateIds.includes(gov.id)}
                                          onCheckedChange={() => {
                                            if (isUsed) return;
                                            if (selectedGovernorateIds.includes(gov.id)) {
                                              setSelectedGovernorateIds(selectedGovernorateIds.filter(id => id !== gov.id));
                                            } else {
                                              setSelectedGovernorateIds([...selectedGovernorateIds, gov.id]);
                                            }
                                          }}
                                          className="mr-2"
                                          disabled={isUsed}
                                        />
                                        <span>{gov.name}</span>
                                      </CommandItem>
                                    );
                                  })}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>USD Fee</Label>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={zoneFeeUsd}
                            onChange={(e) => setZoneFeeUsd(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>LBP Fee</Label>
                          <Input
                            placeholder="0"
                            value={zoneFeeLbp}
                            onChange={(e) => setZoneFeeLbp(formatLbpInput(e.target.value))}
                          />
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          onClick={handleSaveZoneRule}
                          disabled={createZoneRule.isPending || updateZoneRule.isPending}
                          className="flex-1"
                        >
                          {(createZoneRule.isPending || updateZoneRule.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          {editingZoneId ? 'Update Rule' : 'Add Rule'}
                        </Button>
                        <Button variant="outline" onClick={resetZoneForm}>
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Existing Zone Rules */}
                {selectedClientConfig?.zone_rules && selectedClientConfig.zone_rules.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Current Zone Rules</Label>
                    {selectedClientConfig.zone_rules.map((rule) => (
                      <Card key={rule.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="font-medium">
                              {rule.rule_name || 'Unnamed Rule'}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Governorates: {rule.governorate_ids?.map(id => 
                                governorates?.find(g => g.id === id)?.name
                              ).filter(Boolean).join(', ')}
                            </div>
                            <div className="text-sm">
                              {rule.fee_usd > 0 && `$${rule.fee_usd}`}
                              {rule.fee_usd > 0 && rule.fee_lbp > 0 && ' / '}
                              {rule.fee_lbp > 0 && `${rule.fee_lbp.toLocaleString()} LBP`}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditZoneRule(rule)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Zone Rule</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this zone rule? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteZoneRule.mutate(rule.id)}
                                    className="bg-destructive hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Package Type Extras Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="h-5 w-5 text-purple-600" />
                  Package Type Extras
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Additional fees to add based on package type (added to base delivery fee)
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Parcel Extra */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    <Label className="text-base font-medium">Parcel Extra Fee</Label>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Extra USD</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={packageParcelUsd}
                        onChange={(e) => setPackageParcelUsd(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Extra LBP</Label>
                      <Input
                        placeholder="0"
                        value={packageParcelLbp}
                        onChange={(e) => setPackageParcelLbp(formatLbpInput(e.target.value))}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Document Extra */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    <Label className="text-base font-medium">Document Extra Fee</Label>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Extra USD</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={packageDocumentUsd}
                        onChange={(e) => setPackageDocumentUsd(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Extra LBP</Label>
                      <Input
                        placeholder="0"
                        value={packageDocumentLbp}
                        onChange={(e) => setPackageDocumentLbp(formatLbpInput(e.target.value))}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Bulky Extra */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    <Label className="text-base font-medium">Bulky Extra Fee</Label>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Extra USD</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={packageBulkyUsd}
                        onChange={(e) => setPackageBulkyUsd(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Extra LBP</Label>
                      <Input
                        placeholder="0"
                        value={packageBulkyLbp}
                        onChange={(e) => setPackageBulkyLbp(formatLbpInput(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Unified Save Configuration Button */}
            <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-center sm:text-left">
                    <h3 className="text-lg font-semibold">Save Pricing Configuration</h3>
                    <p className="text-sm text-muted-foreground">
                      Apply all pricing rules for {selectedClient?.business_name || selectedClient?.full_name}
                    </p>
                  </div>
                  <Button 
                    onClick={handleSaveConfiguration}
                    disabled={isSaving}
                    size="lg"
                    className="min-w-48"
                  >
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    💾 Save Pricing Configuration
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Pricing Summary */}
            {selectedClientConfig && (
              <Card className="bg-muted/30">
                <CardHeader>
                  <CardTitle className="text-lg">Current Configuration</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Active pricing rules for {selectedClient?.business_name || selectedClient?.full_name}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-3 bg-background rounded border">
                      <div className="text-sm font-medium text-blue-600">Default Pricing</div>
                      <div className="text-sm text-muted-foreground">
                        {selectedClientConfig.default_pricing?.default_fee_usd > 0 && `$${selectedClientConfig.default_pricing.default_fee_usd}`}
                        {selectedClientConfig.default_pricing?.default_fee_usd > 0 && selectedClientConfig.default_pricing?.default_fee_lbp > 0 && ' / '}
                        {selectedClientConfig.default_pricing?.default_fee_lbp > 0 && `${selectedClientConfig.default_pricing.default_fee_lbp.toLocaleString()} LBP`}
                        {!selectedClientConfig.default_pricing?.default_fee_usd && !selectedClientConfig.default_pricing?.default_fee_lbp && 'Not set'}
                      </div>
                    </div>
                    <div className="p-3 bg-background rounded border">
                      <div className="text-sm font-medium text-green-600">Zone Rules</div>
                      <div className="text-sm text-muted-foreground">
                        {selectedClientConfig.zone_rules?.length || 0} rule(s)
                      </div>
                    </div>
                    <div className="p-3 bg-background rounded border">
                      <div className="text-sm font-medium text-purple-600">Package Extras</div>
                      <div className="text-sm text-muted-foreground">
                        {selectedClientConfig.package_extras?.length || 0} extra(s)
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Configured Clients List */}
        {allConfigurations && allConfigurations.length > 0 && (
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                Configured Clients ({allConfigurations.length})
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Clients with active pricing configurations. Click edit to modify or delete to remove.
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {allConfigurations.map((config) => {
                  const client = clients?.find(c => c.id === config.client_id);
                  if (!client) return null;

                  return (
                    <Card key={config.client_id} className="p-4 bg-white">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="font-medium text-base">
                            {client.business_name || client.full_name}
                          </div>
                          {client.phone && (
                            <div className="text-sm text-muted-foreground">
                              (+961-{client.phone})
                            </div>
                          )}
                          <div className="flex gap-4 text-xs text-muted-foreground">
                            {config.default_pricing && (
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                Default: {config.default_pricing.default_fee_usd > 0 && `$${config.default_pricing.default_fee_usd}`}
                                {config.default_pricing.default_fee_usd > 0 && config.default_pricing.default_fee_lbp > 0 && ' / '}
                                {config.default_pricing.default_fee_lbp > 0 && `${config.default_pricing.default_fee_lbp.toLocaleString()} LBP`}
                              </span>
                            )}
                            {config.zone_rules && config.zone_rules.length > 0 && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {config.zone_rules.length} Zone rule(s)
                              </span>
                            )}
                            {config.package_extras && config.package_extras.length > 0 && (
                              <span className="flex items-center gap-1">
                                <Package className="h-3 w-3" />
                                {config.package_extras.length} Package extra(s)
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditConfiguration(config.client_id)}
                          >
                            <Pencil className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground">
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Pricing Configuration</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to remove all pricing rules for {client.business_name || client.full_name}? 
                                  This will delete their default pricing, zone overrides, and package extras. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteConfiguration(config.client_id)}
                                  className="bg-destructive hover:bg-destructive/90"
                                >
                                  Delete Configuration
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions when no client selected */}
        {!selectedClientId && (
          <Card className="bg-muted/30">
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Select a Client to Configure</h3>
              <p className="text-muted-foreground mb-4">
                Choose a client above to set up their complete pricing configuration including default fees, zone overrides, and package extras.
              </p>
              <div className="text-sm text-muted-foreground space-y-2">
                <div><strong>Default Pricing:</strong> Base delivery fee for the client</div>
                <div><strong>Zone Rules:</strong> Override fees for specific governorate combinations</div>
                <div><strong>Package Extras:</strong> Additional fees based on package type</div>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};

export default ClientPricingSection;
