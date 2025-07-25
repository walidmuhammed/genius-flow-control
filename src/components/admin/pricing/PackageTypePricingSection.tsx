import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Package, Plus, Trash2, Edit2, Loader2, AlertTriangle, DollarSign } from 'lucide-react';
import { usePackageTypePricing, useCreatePackageTypePricing, useUpdatePackageTypePricing, useDeletePackageTypePricing } from '@/hooks/use-pricing';
import { formatCurrency } from '@/utils/format';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const PackageTypePricingSection = () => {
  const { data: packageTypePricing, isLoading } = usePackageTypePricing();
  const createPackageTypePricing = useCreatePackageTypePricing();
  const updatePackageTypePricing = useUpdatePackageTypePricing();
  const deletePackageTypePricing = useDeletePackageTypePricing();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    packageType: '',
    extraFeeUsd: '',
    extraFeeLbp: '',
  });

  // Validation functions
  const validateUsd = (value: string) => {
    const num = parseFloat(value);
    return !isNaN(num) && num >= 0;
  };

  const validateLbp = (value: string) => {
    const num = parseInt(value.replace(/,/g, ''));
    return !isNaN(num) && num >= 0;
  };

  const handleLbpChange = (value: string) => {
    const cleanValue = value.replace(/[^\d,]/g, '');
    setFormData(prev => ({ ...prev, extraFeeLbp: cleanValue }));
  };

  const resetForm = () => {
    setFormData({
      packageType: '',
      extraFeeUsd: '',
      extraFeeLbp: '',
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!formData.packageType || (!formData.extraFeeUsd && !formData.extraFeeLbp)) {
      toast.error("Please select a package type and enter at least one fee amount");
      return;
    }

    if (formData.extraFeeUsd && !validateUsd(formData.extraFeeUsd)) {
      toast.error("USD fee must be a valid number");
      return;
    }

    if (formData.extraFeeLbp && !validateLbp(formData.extraFeeLbp)) {
      toast.error("LBP fee must be a valid number");
      return;
    }

    const usdValue = formData.extraFeeUsd ? parseFloat(formData.extraFeeUsd) : 0;
    const lbpValue = formData.extraFeeLbp ? parseInt(formData.extraFeeLbp.replace(/,/g, '')) : 0;

    const payload = {
      package_type: formData.packageType,
      fee_usd: usdValue,
      fee_lbp: lbpValue,
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
      extraFeeUsd: rule.fee_usd.toString(),
      extraFeeLbp: rule.fee_lbp.toString(),
    });
    setEditingId(rule.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    await deletePackageTypePricing.mutateAsync(id);
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
              <Package className="h-5 w-5 text-primary" />
              Package Type Pricing
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Set extra fees for different package types
            </p>
          </div>
          <Button onClick={() => setIsAdding(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Package Type Rule
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isAdding && (
          <Card className="mb-6 border-dashed">
            <CardHeader>
              <CardTitle className="text-lg">
                {editingId ? 'Edit Package Type Pricing' : 'Add Package Type Extra Fee'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  <Label>Extra Fee (USD)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      step="0.5"
                      min="0"
                      placeholder="3.00"
                      value={formData.extraFeeUsd}
                      onChange={(e) => setFormData(prev => ({ ...prev, extraFeeUsd: e.target.value }))}
                      className="pl-9"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Enter either USD or LBP (or both)</p>
                </div>

                <div className="space-y-2">
                  <Label>Extra Fee (LBP)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                      L.L.
                    </span>
                    <Input
                      type="text"
                      placeholder="50,000"
                      value={formData.extraFeeLbp ? parseInt(formData.extraFeeLbp.replace(/,/g, '')).toLocaleString() : ''}
                      onChange={(e) => handleLbpChange(e.target.value)}
                      className="pl-12"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleSubmit}
                  disabled={createPackageTypePricing.isPending || updatePackageTypePricing.isPending}
                >
                  {(createPackageTypePricing.isPending || updatePackageTypePricing.isPending) ? (
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

        {packageTypePricing && packageTypePricing.length > 0 ? (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Package Type</TableHead>
                  <TableHead>Extra Fee (USD)</TableHead>
                  <TableHead>Extra Fee (LBP)</TableHead>
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
                        {rule.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(rule)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="ghost" className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Package Type Pricing</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this package type pricing rule? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(rule.id)}
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
          !isAdding && (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No package type pricing rules configured</p>
              <p className="text-sm">Add rules to set extra fees for specific package types</p>
            </div>
          )
        )}
      </CardContent>
    </Card>
  );
};

export default PackageTypePricingSection;