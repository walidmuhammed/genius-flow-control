import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Package, Plus, Trash2, Edit2, Loader2, AlertTriangle } from 'lucide-react';
import { usePackageTypePricing, useCreatePackageTypePricing, useUpdatePackageTypePricing, useDeletePackageTypePricing } from '@/hooks/use-pricing';
import { useAdminClients } from '@/hooks/use-admin-clients';
import { useGovernorates } from '@/hooks/use-governorates';
import { useCities } from '@/hooks/use-cities';
import { formatCurrency } from '@/utils/format';
import { toast } from 'sonner';

const PackageTypePricingSection = () => {
  const { data: packageTypePricing, isLoading } = usePackageTypePricing();
  const { data: clients } = useAdminClients();
  const { data: governorates } = useGovernorates();
  const { data: cities } = useCities();
  const createPackageTypePricing = useCreatePackageTypePricing();
  const updatePackageTypePricing = useUpdatePackageTypePricing();
  const deletePackageTypePricing = useDeletePackageTypePricing();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    packageType: '',
    feeUsd: '',
    feeLbp: '',
    clientId: '',
    governorateId: '',
    cityId: '',
  });

  // Validation functions
  const validateUsd = (value: string) => {
    const num = parseFloat(value);
    return !isNaN(num) && num >= 0 && (num * 2) % 1 === 0; // Check if it's a 0.5 increment
  };

  const validateLbp = (value: string) => {
    const num = parseInt(value.replace(/,/g, ''));
    return !isNaN(num) && num >= 0 && num % 1000 === 0; // Check if it's a thousand
  };

  const handleLbpChange = (value: string) => {
    const cleanValue = value.replace(/[^\d,]/g, '');
    setFormData(prev => ({ ...prev, feeLbp: cleanValue }));
  };

  const resetForm = () => {
    setFormData({
      packageType: '',
      feeUsd: '',
      feeLbp: '',
      clientId: '',
      governorateId: '',
      cityId: '',
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!formData.packageType || !formData.feeUsd || !formData.feeLbp) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!validateUsd(formData.feeUsd)) {
      toast.error("USD fee must be in 0.5 increments (e.g., 2.0, 2.5, 3.0, 4.5)");
      return;
    }

    if (!validateLbp(formData.feeLbp)) {
      toast.error("LBP fee must be in thousands (e.g., 1,000, 150,000, 200,000)");
      return;
    }

    const usdValue = parseFloat(formData.feeUsd);
    const lbpValue = parseInt(formData.feeLbp.replace(/,/g, ''));

    const payload = {
      package_type: formData.packageType,
      fee_usd: usdValue,
      fee_lbp: lbpValue,
      client_id: formData.clientId || null,
      governorate_id: formData.governorateId || null,
      city_id: formData.cityId || null,
    };

    try {
      if (editingId) {
        await updatePackageTypePricing.mutateAsync({
          id: editingId,
          updates: { fee_usd: usdValue, fee_lbp: lbpValue, is_active: true }
        });
      } else {
        await createPackageTypePricing.mutateAsync(payload);
      }
      resetForm();
    } catch (error) {
      console.error('Error saving package type pricing:', error);
    }
  };

  const handleEdit = (rule: any) => {
    setFormData({
      packageType: rule.package_type,
      feeUsd: rule.fee_usd.toString(),
      feeLbp: rule.fee_lbp.toString(),
      clientId: rule.client_id || '',
      governorateId: rule.governorate_id || '',
      cityId: rule.city_id || '',
    });
    setEditingId(rule.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this package type pricing rule?')) {
      await deletePackageTypePricing.mutateAsync(id);
    }
  };

  const getClientName = (clientId: string) => {
    const client = clients?.find(c => c.id === clientId);
    return client ? client.business_name || client.full_name : 'Unknown Client';
  };

  const getLocationName = (governorateId: string, cityId: string) => {
    const governorate = governorates?.find(g => g.id === governorateId);
    const city = cities?.find(c => c.id === cityId);
    
    if (city && governorate) {
      return `${governorate.name} - ${city.name}`;
    } else if (governorate) {
      return governorate.name;
    }
    return 'Any Location';
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
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          Package Type Pricing
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Set specific prices for different package types
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isAdding ? (
          <Button onClick={() => setIsAdding(true)} className="w-full md:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Package Type Rule
          </Button>
        ) : (
          <div className="space-y-4 p-4 border rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Package Type *</Label>
                <Select 
                  value={formData.packageType} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, packageType: value }))}
                  disabled={!!editingId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select package type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Parcel">Parcel</SelectItem>
                    <SelectItem value="Document">Document</SelectItem>
                    <SelectItem value="Bulky">Bulky</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Fee (USD) *</Label>
                <Input
                  type="number"
                  step="0.5"
                  min="0"
                  placeholder="4.50"
                  value={formData.feeUsd}
                  onChange={(e) => setFormData(prev => ({ ...prev, feeUsd: e.target.value }))}
                  className={!validateUsd(formData.feeUsd) && formData.feeUsd ? 'border-destructive' : ''}
                />
                {!validateUsd(formData.feeUsd) && formData.feeUsd && (
                  <div className="flex items-center gap-1 text-xs text-destructive">
                    <AlertTriangle className="h-3 w-3" />
                    Must be in 0.5 increments
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Fee (LBP) *</Label>
                <Input
                  type="text"
                  placeholder="150,000"
                  value={formData.feeLbp ? parseInt(formData.feeLbp.replace(/,/g, '')).toLocaleString() : ''}
                  onChange={(e) => handleLbpChange(e.target.value)}
                  className={!validateLbp(formData.feeLbp) && formData.feeLbp ? 'border-destructive' : ''}
                />
                {!validateLbp(formData.feeLbp) && formData.feeLbp && (
                  <div className="flex items-center gap-1 text-xs text-destructive">
                    <AlertTriangle className="h-3 w-3" />
                    Must be in thousands
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Client (Optional)</Label>
                <Select 
                  value={formData.clientId} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, clientId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any client" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any Client</SelectItem>
                    {clients?.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.business_name || client.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Governorate (Optional)</Label>
                <Select 
                  value={formData.governorateId} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, governorateId: value, cityId: '' }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any governorate" />
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
                <Label>City (Optional)</Label>
                <Select 
                  value={formData.cityId} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, cityId: value }))}
                  disabled={!formData.governorateId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any city" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any City</SelectItem>
                    {cities?.filter(city => city.governorate_id === formData.governorateId).map((city) => (
                      <SelectItem key={city.id} value={city.id}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleSubmit}
                disabled={createPackageTypePricing.isPending || updatePackageTypePricing.isPending}
              >
                {(createPackageTypePricing.isPending || updatePackageTypePricing.isPending) ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {editingId ? 'Update Rule' : 'Create Rule'}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {packageTypePricing && packageTypePricing.length > 0 && (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Package Type</TableHead>
                  <TableHead>Fee</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {packageTypePricing.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell>
                      <Badge variant="outline">{rule.package_type}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{formatCurrency(rule.fee_usd, 'USD')}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(rule.fee_lbp, 'LBP')}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {rule.client_id ? getClientName(rule.client_id) : (
                        <span className="text-muted-foreground">All Clients</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {getLocationName(rule.governorate_id, rule.city_id)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={rule.is_active ? "default" : "secondary"}>
                        {rule.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(rule)}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(rule.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {packageTypePricing && packageTypePricing.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No package type pricing rules defined yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PackageTypePricingSection;