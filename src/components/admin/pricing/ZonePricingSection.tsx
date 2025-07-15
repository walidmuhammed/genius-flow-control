import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { MapPin, Plus, Pencil, Trash2, DollarSign, Loader2, Package } from 'lucide-react';
import { useZonePricingRules, useCreateZonePricingRule, useUpdateZonePricingRule, useDeleteZonePricingRule } from '@/hooks/use-pricing';
import { useAdminClients } from '@/hooks/use-admin-clients';
import { useGovernorates } from '@/hooks/use-governorates';
import { useCities } from '@/hooks/use-cities';
import { formatCurrency } from '@/utils/format';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

const ZonePricingSection = () => {
  const { data: rules, isLoading } = useZonePricingRules();
  const { data: clients } = useAdminClients();
  const { data: governorates } = useGovernorates();
  const { data: cities } = useCities();
  const createRule = useCreateZonePricingRule();
  const updateRule = useUpdateZonePricingRule();
  const deleteRule = useDeleteZonePricingRule();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedGovernorateId, setSelectedGovernorateId] = useState('');
  const [selectedCityId, setSelectedCityId] = useState('');
  const [zoneName, setZoneName] = useState('');
  const [packageType, setPackageType] = useState('');
  const [feeUsd, setFeeUsd] = useState('');
  const [feeLbp, setFeeLbp] = useState('');
  const [isGlobal, setIsGlobal] = useState(true);

  const resetForm = () => {
    setSelectedClientId('');
    setSelectedGovernorateId('');
    setSelectedCityId('');
    setZoneName('');
    setPackageType('');
    setFeeUsd('');
    setFeeLbp('');
    setIsGlobal(true);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (rule: any) => {
    setSelectedClientId(rule.client_id || '');
    setSelectedGovernorateId(rule.governorate_id || '');
    setSelectedCityId(rule.city_id || '');
    setZoneName(rule.zone_name || '');
    setPackageType(rule.package_type || '');
    setFeeUsd(rule.fee_usd.toString());
    setFeeLbp(rule.fee_lbp.toString());
    setIsGlobal(!rule.client_id);
    setEditingId(rule.id);
    setShowForm(true);
  };

  const handleSubmit = () => {
    const data = {
      governorate_id: selectedGovernorateId || undefined,
      city_id: selectedCityId || undefined,
      zone_name: zoneName || undefined,
      fee_usd: parseFloat(feeUsd),
      fee_lbp: parseFloat(feeLbp),
      client_id: isGlobal ? undefined : selectedClientId || undefined,
      package_type: packageType || undefined,
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

  const isFormValid = (selectedGovernorateId || selectedCityId || zoneName) && 
    feeUsd && feeLbp && parseFloat(feeUsd) > 0 && parseFloat(feeLbp) > 0 &&
    (isGlobal || selectedClientId);

  // Filter cities based on selected governorate
  const filteredCities = cities?.filter(city => 
    !selectedGovernorateId || city.governorate_id === selectedGovernorateId
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
              <MapPin className="h-5 w-5 text-accent" />
              Zone-Based Pricing
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Set custom pricing for specific governorates, cities, or zones
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
              <div className="flex items-center space-x-2">
                <Switch
                  id="global-toggle"
                  checked={isGlobal}
                  onCheckedChange={setIsGlobal}
                  disabled={!!editingId}
                />
                <Label htmlFor="global-toggle">
                  Apply globally (all clients)
                </Label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Governorate</Label>
                  <Select value={selectedGovernorateId} onValueChange={setSelectedGovernorateId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select governorate" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any Governorate</SelectItem>
                      {governorates?.map((gov) => (
                        <SelectItem key={gov.id} value={gov.id}>
                          {gov.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>City</Label>
                  <Select value={selectedCityId} onValueChange={setSelectedCityId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any City</SelectItem>
                      {filteredCities.map((city) => (
                        <SelectItem key={city.id} value={city.id}>
                          {city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Custom Zone Name</Label>
                  <Input
                    placeholder="e.g., Ashrafieh, Downtown"
                    value={zoneName}
                    onChange={(e) => setZoneName(e.target.value)}
                  />
                </div>

                {!isGlobal && (
                  <div className="space-y-2">
                    <Label>Client</Label>
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
                )}

                <div className="space-y-2">
                  <Label>Package Type (Optional)</Label>
                  <Select value={packageType} onValueChange={setPackageType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any package type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any Package Type</SelectItem>
                      <SelectItem value="Parcel">Parcel</SelectItem>
                      <SelectItem value="Document">Document</SelectItem>
                      <SelectItem value="Bulky">Bulky</SelectItem>
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
                  <TableHead>Zone</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Package Type</TableHead>
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
                      <div className="space-y-1">
                        {rule.governorate_name && (
                          <div className="font-medium">{rule.governorate_name}</div>
                        )}
                        {rule.city_name && (
                          <div className="text-sm text-muted-foreground">{rule.city_name}</div>
                        )}
                        {rule.zone_name && (
                          <Badge variant="outline" className="text-xs">
                            {rule.zone_name}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {rule.client_id ? (
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
                      ) : (
                        <Badge variant="secondary">Global</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {rule.package_type ? (
                        <Badge variant="outline">
                          <Package className="h-3 w-3 mr-1" />
                          {rule.package_type}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">Any</span>
                      )}
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
            <p className="text-sm">Add rules to customize pricing for specific zones</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ZonePricingSection;