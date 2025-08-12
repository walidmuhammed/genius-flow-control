import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package, Save, Edit3, X } from 'lucide-react';
import { useGlobalPackageExtras, useUpdateGlobalPackageExtra } from '@/hooks/use-comprehensive-pricing';

export function GlobalPackageExtrasSection() {
  const [editingPackage, setEditingPackage] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ extra_usd: string; extra_lbp: string }>({
    extra_usd: '',
    extra_lbp: ''
  });

  const { data: packageExtras, isLoading } = useGlobalPackageExtras();
  const updateMutation = useUpdateGlobalPackageExtra();

  const handleEdit = (packageType: string, currentValues: { extra_usd: number; extra_lbp: number }) => {
    setEditingPackage(packageType);
    setEditValues({
      extra_usd: currentValues.extra_usd.toString(),
      extra_lbp: currentValues.extra_lbp.toString()
    });
  };

  const handleSave = async (packageType: 'Parcel' | 'Document' | 'Bulky') => {
    try {
      await updateMutation.mutateAsync({
        packageType,
        extraUsd: parseFloat(editValues.extra_usd) || 0,
        extraLbp: parseInt(editValues.extra_lbp) || 0
      });

      setEditingPackage(null);
      setEditValues({ extra_usd: '', extra_lbp: '' });
    } catch (error) {
      console.error('Error saving package extra:', error);
    }
  };

  const handleCancel = () => {
    setEditingPackage(null);
    setEditValues({ extra_usd: '', extra_lbp: '' });
  };

  const getPackageIcon = (packageType: string) => {
    switch (packageType) {
      case 'Document':
        return '📄';
      case 'Bulky':
        return '📦';
      default:
        return '📋';
    }
  };

  const getPackageDescription = (packageType: string) => {
    switch (packageType) {
      case 'Document':
        return 'Letters, contracts, and small documents';
      case 'Bulky':
        return 'Large or heavy items requiring special handling';
      case 'Parcel':
        return 'Standard packages and boxes';
      default:
        return 'Standard delivery items';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Global Package Extras
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-gray-200 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Global Package Extras
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Set additional fees for different package types. These are added to the base delivery fee.
        </p>
      </CardHeader>
      <CardContent>
        {packageExtras && packageExtras.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Package Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>USD Extra</TableHead>
                <TableHead>LBP Extra</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {packageExtras.map((pkg) => {
                const isEditing = editingPackage === pkg.package_type;

                return (
                  <TableRow key={pkg.package_type}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getPackageIcon(pkg.package_type)}</span>
                        {pkg.package_type}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {getPackageDescription(pkg.package_type)}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          type="number"
                          step="0.01"
                          value={editValues.extra_usd}
                          onChange={(e) => setEditValues(prev => ({ ...prev, extra_usd: e.target.value }))}
                          className="w-24"
                        />
                      ) : (
                        `+$${pkg.extra_usd.toFixed(2)}`
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editValues.extra_lbp}
                          onChange={(e) => setEditValues(prev => ({ ...prev, extra_lbp: e.target.value }))}
                          className="w-32"
                        />
                      ) : (
                        `+${pkg.extra_lbp.toLocaleString()} LBP`
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={pkg.extra_usd > 0 || pkg.extra_lbp > 0 ? "default" : "secondary"}>
                        {pkg.extra_usd > 0 || pkg.extra_lbp > 0 ? 'Extra Fee Applied' : 'No Extra Fee'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isEditing ? (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleSave(pkg.package_type as 'Parcel' | 'Document' | 'Bulky')}
                              disabled={updateMutation.isPending}
                              className="h-8 w-8 p-0"
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleCancel}
                              className="h-8 w-8 p-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(pkg.package_type, { extra_usd: pkg.extra_usd, extra_lbp: pkg.extra_lbp })}
                            className="h-8 w-8 p-0"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No package extras configured</p>
            <p className="text-sm">Configure additional fees for different package types</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}