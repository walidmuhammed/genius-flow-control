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
import { Users, Plus, Pencil, Trash2, DollarSign, Loader2, AlertTriangle, Check, ChevronsUpDown } from 'lucide-react';
import { useClientPricingOverrides, useCreateClientPricingOverride, useUpdateClientPricingOverride, useDeleteClientPricingOverride } from '@/hooks/use-pricing';
import { useAdminClients } from '@/hooks/use-admin-clients';
import { formatCurrency } from '@/utils/format';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const ClientPricingSection = () => {
  const { data: overrides, isLoading } = useClientPricingOverrides();
  const { data: clients } = useAdminClients();
  const createOverride = useCreateClientPricingOverride();
  const updateOverride = useUpdateClientPricingOverride();
  const deleteOverride = useDeleteClientPricingOverride();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Client selection with search
  const [selectedClientId, setSelectedClientId] = useState('');
  const [clientSearchOpen, setClientSearchOpen] = useState(false);
  const [clientSearchValue, setClientSearchValue] = useState('');
  
  // Fees
  const [feeUsd, setFeeUsd] = useState('');
  const [feeLbp, setFeeLbp] = useState('');

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
    setFeeUsd('');
    setFeeLbp('');
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (override: any) => {
    setSelectedClientId(override.client_id);
    setFeeUsd(override.fee_usd ? override.fee_usd.toString() : '');
    setFeeLbp(override.fee_lbp ? override.fee_lbp.toString() : '');
    setEditingId(override.id);
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!selectedClientId) {
      toast.error("Please select a client");
      return;
    }

    // Check for duplicate client (only if not editing)
    if (!editingId) {
      const existingOverride = overrides?.find(o => o.client_id === selectedClientId);
      if (existingOverride) {
        toast.error("Client already has pricing override. Please edit the existing rule instead.");
        return;
      }
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
    };

    if (editingId) {
      // Update existing override
      updateOverride.mutate(
        { 
          id: editingId, 
          updates: { 
            fee_usd: data.fee_usd, 
            fee_lbp: data.fee_lbp 
          } 
        },
        {
          onSuccess: () => {
            resetForm();
          },
          onError: (error) => {
            console.error('Update error:', error);
            // Error handling is done in the mutation's onError callback
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
          // Error handling is done in the mutation's onError callback
        }
      });
    }
  };

  const isFormValid = selectedClientId && (feeUsd || feeLbp);

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
              Override default fees for specific clients
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
              <p className="text-sm text-muted-foreground">
                Set custom default delivery fees for a specific client
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

              {/* Delivery Fees */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Override Delivery Fees *</Label>
                <p className="text-sm text-muted-foreground">
                  Set custom default delivery fees for this client (at least one currency required)
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
                        onChange={(e) => setFeeUsd(e.target.value)}
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
                        onChange={(e) => setFeeLbp(e.target.value.replace(/,/g, ''))}
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
                  <TableHead>Fee (USD)</TableHead>
                  <TableHead>Fee (LBP)</TableHead>
                  <TableHead>Override Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overrides.map((override) => (
                  <TableRow key={override.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {override.business_name || override.client_name}
                        </div>
                        {override.business_name && override.client_name && (
                          <div className="text-sm text-muted-foreground">
                            {override.client_name}
                          </div>
                        )}
                      </div>
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
                    <TableCell>
                      {override.governorate_id ? (
                        <Badge variant="default" className="text-xs">
                          {override.governorate_name}
                        </Badge>
                      ) : override.package_type ? (
                        <Badge variant="default" className="text-xs">
                          {override.package_type}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          Default
                        </Badge>
                      )}
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
            <p className="text-sm">Add overrides to set custom pricing for specific clients</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClientPricingSection;