import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Edit3, Save, X, MapPin, Plus } from 'lucide-react';
import { useZonePricing, useBatchUpdateZonePricing, useDeleteZonePricing } from '@/hooks/use-comprehensive-pricing';
import { useGovernorates } from '@/hooks/use-governorates';
import { toast } from 'sonner';

function ZonePricingSection() {
  const [editingRows, setEditingRows] = useState<Set<string>>(new Set());
  const [editValues, setEditValues] = useState<Record<string, { fee_usd: string; fee_lbp: string }>>({});
  const [newZone, setNewZone] = useState({ governorate_id: '', fee_usd: '', fee_lbp: '' });
  const [showAddForm, setShowAddForm] = useState(false);

  const { data: zonePricing, isLoading } = useZonePricing();
  const { data: governorates } = useGovernorates();
  const batchUpdateMutation = useBatchUpdateZonePricing();
  const deleteMutation = useDeleteZonePricing();

  const handleEdit = (zoneId: string, currentValues: { fee_usd: number; fee_lbp: number }) => {
    setEditingRows(prev => new Set([...prev, zoneId]));
    setEditValues(prev => ({
      ...prev,
      [zoneId]: {
        fee_usd: currentValues.fee_usd.toString(),
        fee_lbp: currentValues.fee_lbp.toString()
      }
    }));
  };

  const handleSave = async (zone: any) => {
    const values = editValues[zone.id];
    if (!values) return;

    try {
      await batchUpdateMutation.mutateAsync([{
        governorate_id: zone.governorate_id,
        fee_usd: parseFloat(values.fee_usd) || 0,
        fee_lbp: parseInt(values.fee_lbp) || 0
      }]);

      setEditingRows(prev => {
        const newSet = new Set(prev);
        newSet.delete(zone.id);
        return newSet;
      });
      
      setEditValues(prev => {
        const newValues = { ...prev };
        delete newValues[zone.id];
        return newValues;
      });
    } catch (error) {
      console.error('Error saving zone pricing:', error);
    }
  };

  const handleCancel = (zoneId: string) => {
    setEditingRows(prev => {
      const newSet = new Set(prev);
      newSet.delete(zoneId);
      return newSet;
    });
    
    setEditValues(prev => {
      const newValues = { ...prev };
      delete newValues[zoneId];
      return newValues;
    });
  };

  const handleDelete = async (zoneId: string) => {
    if (confirm('Are you sure you want to delete this zone pricing?')) {
      try {
        await deleteMutation.mutateAsync(zoneId);
      } catch (error) {
        console.error('Error deleting zone pricing:', error);
      }
    }
  };

  const handleAddZone = async () => {
    if (!newZone.governorate_id) {
      toast.error('Please select a governorate');
      return;
    }

    try {
      await batchUpdateMutation.mutateAsync([{
        governorate_id: newZone.governorate_id,
        fee_usd: parseFloat(newZone.fee_usd) || 0,
        fee_lbp: parseInt(newZone.fee_lbp) || 0
      }]);

      setNewZone({ governorate_id: '', fee_usd: '', fee_lbp: '' });
      setShowAddForm(false);
      toast.success('Zone pricing added successfully');
    } catch (error) {
      console.error('Error adding zone pricing:', error);
      toast.error('Failed to add zone pricing');
    }
  };

  const getAvailableGovernorates = () => {
    if (!governorates || !zonePricing) return governorates || [];
    
    const usedGovernorateIds = new Set(zonePricing.map(z => z.governorate_id));
    return governorates.filter(g => !usedGovernorateIds.has(g.id));
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Zone-Based Pricing
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
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Zone-Based Pricing
          </CardTitle>
          <Button
            onClick={() => setShowAddForm(true)}
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Zone
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Set custom delivery fees for specific governorates. These override global pricing.
        </p>
      </CardHeader>
      <CardContent>
        {showAddForm && (
          <Card className="mb-6 border-dashed">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="new-governorate">Governorate</Label>
                  <Select 
                    value={newZone.governorate_id} 
                    onValueChange={(value) => setNewZone(prev => ({ ...prev, governorate_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select governorate" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableGovernorates().map(gov => (
                        <SelectItem key={gov.id} value={gov.id}>
                          {gov.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="new-fee-usd">USD Fee</Label>
                  <Input
                    id="new-fee-usd"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newZone.fee_usd}
                    onChange={(e) => setNewZone(prev => ({ ...prev, fee_usd: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="new-fee-lbp">LBP Fee</Label>
                  <Input
                    id="new-fee-lbp"
                    type="number"
                    placeholder="0"
                    value={newZone.fee_lbp}
                    onChange={(e) => setNewZone(prev => ({ ...prev, fee_lbp: e.target.value }))}
                  />
                </div>
                <div className="flex items-end gap-2">
                  <Button onClick={handleAddZone} size="sm" className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Save
                  </Button>
                  <Button 
                    onClick={() => setShowAddForm(false)} 
                    variant="outline" 
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {zonePricing && zonePricing.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Governorate</TableHead>
                <TableHead>USD Fee</TableHead>
                <TableHead>LBP Fee</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {zonePricing.map((zone) => {
                const isEditing = editingRows.has(zone.id);
                const editValue = editValues[zone.id];

                return (
                  <TableRow key={zone.id}>
                    <TableCell className="font-medium">
                      {zone.governorate_name || 'Unknown'}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          type="number"
                          step="0.01"
                          value={editValue?.fee_usd || '0'}
                          onChange={(e) => setEditValues(prev => ({
                            ...prev,
                            [zone.id]: { ...prev[zone.id], fee_usd: e.target.value }
                          }))}
                          className="w-24"
                        />
                      ) : (
                        `$${zone.fee_usd.toFixed(2)}`
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editValue?.fee_lbp || '0'}
                          onChange={(e) => setEditValues(prev => ({
                            ...prev,
                            [zone.id]: { ...prev[zone.id], fee_lbp: e.target.value }
                          }))}
                          className="w-32"
                        />
                      ) : (
                        `${zone.fee_lbp.toLocaleString()} LBP`
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">Active</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isEditing ? (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleSave(zone)}
                              disabled={batchUpdateMutation.isPending}
                              className="h-8 w-8 p-0"
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancel(zone.id)}
                              className="h-8 w-8 p-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(zone.id, { fee_usd: zone.fee_usd, fee_lbp: zone.fee_lbp })}
                              className="h-8 w-8 p-0"
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(zone.id)}
                              disabled={deleteMutation.isPending}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
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
            <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No zone pricing configured</p>
            <p className="text-sm">Add zone-specific pricing to override global rates</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ZonePricingSection;