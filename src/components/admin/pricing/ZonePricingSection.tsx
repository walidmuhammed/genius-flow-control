import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { MapPin, Plus, Pencil, Trash2, DollarSign, Loader2, ChevronDown } from 'lucide-react';
import { useZonePricingRules, useCreateZonePricingRule, useUpdateZonePricingRule, useDeleteZonePricingRule } from '@/hooks/use-pricing';
import { useAdminClients } from '@/hooks/use-admin-clients';
import { useGovernorates } from '@/hooks/use-governorates';
import { formatCurrency } from '@/utils/format';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Checkbox } from '@/components/ui/checkbox';

const ZonePricingSection = () => {
  const { data: rules, isLoading } = useZonePricingRules();
  const { data: clients } = useAdminClients();
  const { data: governorates } = useGovernorates();
  const createRule = useCreateZonePricingRule();
  const updateRule = useUpdateZonePricingRule();
  const deleteRule = useDeleteZonePricingRule();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedGovernorateIds, setSelectedGovernorateIds] = useState<string[]>([]);
  const [feeUsd, setFeeUsd] = useState('');
  const [feeLbp, setFeeLbp] = useState('');

  const resetForm = () => {
    setSelectedGovernorateIds([]);
    setFeeUsd('');
    setFeeLbp('');
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (rule: any) => {
    setSelectedGovernorateIds(rule.governorate_id ? [rule.governorate_id] : []);
    setFeeUsd(rule.fee_usd.toString());
    setFeeLbp(rule.fee_lbp.toString());
    setEditingId(rule.id);
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (selectedGovernorateIds.length === 0 || (!feeUsd && !feeLbp)) {
      return;
    }

    const feeUsdValue = feeUsd ? parseFloat(feeUsd) : 0;
    const feeLbpValue = feeLbp ? parseFloat(feeLbp.replace(/,/g, '')) : 0;

    if (editingId) {
      // Update existing rule
      updateRule.mutate(
        { id: editingId, updates: { fee_usd: feeUsdValue, fee_lbp: feeLbpValue } },
        { onSuccess: resetForm }
      );
    } else {
      // Create new rules for each selected governorate
      selectedGovernorateIds.forEach(governorateId => {
        const data = {
          governorate_id: governorateId,
          fee_usd: feeUsdValue,
          fee_lbp: feeLbpValue,
        };
        createRule.mutate(data, { onSuccess: resetForm });
      });
    }
  };

  const isFormValid = selectedGovernorateIds.length > 0 && (feeUsd || feeLbp) && 
    ((feeUsd && parseFloat(feeUsd) > 0) || (feeLbp && parseFloat(feeLbp.replace(/,/g, '')) > 0));

  // Compute governorate IDs already used in rules (except when editing)
  const usedGovernorateIds = rules
    ? rules
        .filter(rule => !editingId || rule.id !== editingId)
        .map(rule => rule.governorate_id)
        .filter(Boolean)
    : [];

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
              <MapPin className="h-5 w-5 text-primary" />
              Zone-Based Pricing
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Set global pricing rules for specific governorates
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
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Governorates *</Label>
                  <p className="text-sm text-muted-foreground">
                    Select one or more governorates to apply the same pricing rule
                  </p>
                  {/* Dropdown checklist for governorates */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={
                          `w-full justify-between ${selectedGovernorateIds.length === 0 ? 'text-muted-foreground' : ''}`
                        }
                      >
                        {selectedGovernorateIds.length === 0
                          ? 'Select governorates...'
                          : governorates
                              ?.filter(gov => selectedGovernorateIds.includes(gov.id))
                              .map(gov => gov.name)
                              .join(', ')
                        }
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72 p-0">
                      <Command>
                        <CommandInput placeholder="Search governorates..." className="h-9" />
                        <CommandList>
                          <CommandEmpty>No governorate found.</CommandEmpty>
                          <CommandGroup>
                            {governorates?.map((gov) => {
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                  <Label>Fee (USD)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      step="0.5"
                      min="0"
                      placeholder="4.00"
                      value={feeUsd}
                      onChange={(e) => setFeeUsd(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Enter either USD or LBP (or both)</p>
                </div>

                <div className="space-y-2">
                  <Label>Fee (LBP)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                      L.L.
                    </span>
                    <Input
                      type="text"
                      placeholder="150,000"
                      value={feeLbp ? parseInt(feeLbp.replace(/,/g, '')).toLocaleString() : ''}
                      onChange={(e) => setFeeLbp(e.target.value.replace(/,/g, ''))}
                      className="pl-12"
                    />
                  </div>
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
                  <TableHead>Governorate</TableHead>
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
                      <div className="font-medium">{rule.governorate_name}</div>
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
            <p className="text-sm">Add rules to set governorate-specific pricing for clients</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ZonePricingSection;