import React, { useState } from 'react';
import { Check, AlertTriangle, X, Edit2, Save, XCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ParsedOrderRow, CSVParseResult } from '@/utils/csvParser';
import { ImprovedAreaSelector } from './ImprovedAreaSelector';
import { isValidLebaneseMobileNumber } from '@/utils/customerSearch';
import { toast } from 'sonner';

interface OrderImportPreviewProps {
  parseResult: CSVParseResult;
  onProceed: () => void;
  onCancel: () => void;
  isCreating: boolean;
  onUpdateOrder?: (rowIndex: number, updatedOrder: ParsedOrderRow) => void;
}

export const OrderImportPreview: React.FC<OrderImportPreviewProps> = ({
  parseResult,
  onProceed,
  onCancel,
  isCreating,
  onUpdateOrder
}) => {
  const { orders, totalRows, validRows, invalidRows, hasErrors } = parseResult;
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editedOrder, setEditedOrder] = useState<ParsedOrderRow | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const handleEditClick = (order: ParsedOrderRow) => {
    setEditingRow(order.row);
    setEditedOrder({ ...order });
  };

  const handleSaveEdit = () => {
    if (!editedOrder || !onUpdateOrder) return;
    
    // Re-validate the edited order
    const errors: string[] = [];
    
    if (!editedOrder.fullName.trim()) errors.push('Full Name is required');
    if (!editedOrder.phone.trim()) errors.push('Phone Number is required');
    else if (!isValidLebaneseMobileNumber(editedOrder.phone)) errors.push('Invalid phone number format');
    if (!editedOrder.governorate.trim()) errors.push('Governorate is required');
    if (!editedOrder.city.trim()) errors.push('City is required');
    if (!editedOrder.address.trim()) errors.push('Address Details is required');
    
    const validOrderTypes = ['Shipment', 'Exchange'];
    if (!validOrderTypes.includes(editedOrder.orderType)) {
      errors.push(`Order Type must be one of: ${validOrderTypes.join(', ')}`);
    }
    
    const validPackageTypes = ['parcel', 'document', 'bulky'];
    if (!validPackageTypes.includes(editedOrder.packageType.toLowerCase())) {
      errors.push(`Package Type must be one of: ${validPackageTypes.join(', ')}`);
    }
    
    const updatedOrder = {
      ...editedOrder,
      errors,
      isValid: errors.length === 0,
      suggestions: [] // Clear suggestions after manual edit
    };
    
    // Find the correct index by matching row number
    const orderIndex = parseResult.orders.findIndex(order => order.row === editedOrder.row);
    if (orderIndex !== -1) {
      onUpdateOrder(orderIndex, updatedOrder);
    }
    
    setEditingRow(null);
    setEditedOrder(null);
    
    if (errors.length === 0) {
      toast.success('Order updated successfully');
    }
  };

  const toggleRowExpansion = (rowNumber: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(rowNumber)) {
      newExpanded.delete(rowNumber);
    } else {
      newExpanded.add(rowNumber);
    }
    setExpandedRows(newExpanded);
  };

  const handleCancelEdit = () => {
    setEditingRow(null);
    setEditedOrder(null);
  };

  const handleAreaSelected = (governorateId: string, cityId: string) => {
    if (editedOrder) {
      // We need to find the actual names from the IDs
      // For now, we'll just update with the IDs and let the parent handle the mapping
      setEditedOrder({
        ...editedOrder,
        governorate: governorateId,
        city: cityId
      });
    }
  };

  const getStatusBadge = (order: ParsedOrderRow) => {
    if (order.isValid) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
          <Check className="w-3 h-3 mr-1" />
          Valid
        </Badge>
      );
    }
    return (
      <Badge variant="destructive">
        <X className="w-3 h-3 mr-1" />
        Error
      </Badge>
    );
  };

  const renderErrorsSection = (order: ParsedOrderRow) => {
    if (order.errors.length === 0) return null;
    
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-2">
        <div className="font-medium text-sm text-red-800 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Issues Found ({order.errors.length})
        </div>
        <ul className="list-disc list-inside text-sm text-red-700 space-y-1 ml-4">
          {order.errors.map((error, index) => (
            <li key={index}>{error}</li>
          ))}
        </ul>
        {order.suggestions && order.suggestions.length > 0 && (
          <div className="border-t border-red-200 pt-2 mt-2">
            <div className="text-sm text-blue-700 font-medium mb-1">Suggestions:</div>
            {order.suggestions.map((suggestion, index) => (
              <div key={index} className="text-sm text-blue-600 ml-4">
                • <span className="font-medium">{suggestion.field}:</span> {suggestion.suggestions.join(', ')}
                {suggestion.corrected && (
                  <span className="text-green-600 ml-2">(Auto-corrected to: {suggestion.corrected})</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-4 bg-background border rounded-lg">
          <div className="text-2xl font-bold text-foreground">{totalRows}</div>
          <div className="text-sm text-muted-foreground">Total Rows</div>
        </div>
        <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{validRows}</div>
          <div className="text-sm text-green-600">Valid Orders</div>
        </div>
        <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{invalidRows}</div>
          <div className="text-sm text-red-600">Needs Review</div>
        </div>
      </div>

      {/* Error Alert */}
      {hasErrors && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {invalidRows} {invalidRows === 1 ? 'order needs' : 'orders need'} attention. Review the issues below and make corrections before importing.
          </AlertDescription>
        </Alert>
      )}

      {/* Orders List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-sm text-foreground">Order Preview</h3>
          <div className="text-xs text-muted-foreground">
            Click on any order to expand and edit details
          </div>
        </div>
        
        <ScrollArea className="h-[450px] rounded-lg border">
          <div className="p-4 space-y-3">
            {orders.map((order) => {
              const isEditing = editingRow === order.row;
              const displayOrder = isEditing && editedOrder ? editedOrder : order;
              const isExpanded = expandedRows.has(order.row);
              const hasErrors = displayOrder.errors.length > 0;
              
              return (
                <div 
                  key={order.row}
                  className={`border rounded-lg transition-all duration-200 ${
                    !displayOrder.isValid 
                      ? 'border-red-200 bg-red-50/30' 
                      : 'border-border bg-card'
                  }`}
                >
                  {/* Main Order Row */}
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      {/* Left: Order Info */}
                      <div className="flex-1 grid grid-cols-12 gap-3 items-center">
                        {/* Row Number & Status */}
                        <div className="col-span-1 flex flex-col items-center gap-1">
                          <span className="font-mono text-xs text-muted-foreground">#{order.row}</span>
                          {getStatusBadge(displayOrder)}
                        </div>
                        
                        {/* Customer */}
                        <div className="col-span-3">
                          {isEditing ? (
                            <Input
                              value={displayOrder.fullName}
                              onChange={(e) => setEditedOrder(prev => prev ? {...prev, fullName: e.target.value} : null)}
                              className="h-8 text-sm"
                              placeholder="Full Name"
                            />
                          ) : (
                            <div>
                              <div className="text-sm font-medium">{displayOrder.fullName}</div>
                              <div className="text-xs text-muted-foreground font-mono">{displayOrder.phone}</div>
                            </div>
                          )}
                        </div>
                        
                        {/* Location */}
                        <div className="col-span-3">
                          {isEditing ? (
                           <ImprovedAreaSelector
                             selectedGovernorateId=""
                             selectedCityId=""
                             onGovernorateChange={(id, name) => setEditedOrder(prev => prev ? {...prev, governorate: name} : null)}
                             onCityChange={(id, name, govName) => setEditedOrder(prev => prev ? {...prev, city: name, governorate: govName} : null)}
                             placeholder="Select location"
                           />
                          ) : (
                            <div>
                              <div className="text-sm font-medium">{displayOrder.city}</div>
                              <div className="text-xs text-muted-foreground">{displayOrder.governorate}</div>
                            </div>
                          )}
                        </div>
                        
                        {/* Order Details */}
                        <div className="col-span-3">
                          {isEditing ? (
                            <Select
                              value={displayOrder.orderType}
                              onValueChange={(value) => setEditedOrder(prev => prev ? {...prev, orderType: value} : null)}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Shipment">Shipment</SelectItem>
                                <SelectItem value="Exchange">Exchange</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <div>
                              <Badge variant="outline" className="text-xs mb-1">
                                {displayOrder.orderType}
                              </Badge>
                              {(displayOrder.usdAmount > 0 || displayOrder.lbpAmount > 0) && (
                                <div className="text-xs text-muted-foreground">
                                  {displayOrder.usdAmount > 0 && `$${displayOrder.usdAmount}`}
                                  {displayOrder.lbpAmount > 0 && ` ${displayOrder.lbpAmount.toLocaleString()} LBP`}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {/* Error Indicator */}
                        <div className="col-span-2 flex items-center justify-end gap-2">
                          {hasErrors && (
                            <Badge variant="destructive" className="text-xs">
                              {displayOrder.errors.length} issue{displayOrder.errors.length > 1 ? 's' : ''}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2 ml-4">
                        {hasErrors && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleRowExpansion(order.row)}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                          >
                            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          </Button>
                        )}
                        
                        {isEditing ? (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleSaveEdit}
                              className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleCancelEdit}
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditClick(order)}
                            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {/* Expanded Editing Fields */}
                    {isEditing && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-medium text-foreground mb-1 block">Phone Number</label>
                            <Input
                              value={displayOrder.phone}
                              onChange={(e) => setEditedOrder(prev => prev ? {...prev, phone: e.target.value} : null)}
                              className="h-8 text-sm"
                              placeholder="Phone"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-foreground mb-1 block">Address Details</label>
                            <Input
                              value={displayOrder.address}
                              onChange={(e) => setEditedOrder(prev => prev ? {...prev, address: e.target.value} : null)}
                              className="h-8 text-sm"
                              placeholder="Address Details"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-foreground mb-1 block">Package Type</label>
                            <Select
                              value={displayOrder.packageType}
                              onValueChange={(value) => setEditedOrder(prev => prev ? {...prev, packageType: value} : null)}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="parcel">Parcel</SelectItem>
                                <SelectItem value="document">Document</SelectItem>
                                <SelectItem value="bulky">Bulky</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-foreground mb-1 block">USD Amount</label>
                            <Input
                              type="number"
                              value={displayOrder.usdAmount || ''}
                              onChange={(e) => setEditedOrder(prev => prev ? {...prev, usdAmount: parseFloat(e.target.value) || 0} : null)}
                              className="h-8 text-sm"
                              placeholder="0"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Collapsible Error Section */}
                  {hasErrors && (
                    <Collapsible open={isExpanded} onOpenChange={() => toggleRowExpansion(order.row)}>
                      <CollapsibleContent className="px-4 pb-4">
                        {renderErrorsSection(displayOrder)}
                      </CollapsibleContent>
                    </Collapsible>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-4 border-t">
        <Button
          variant="outline"
          onClick={onCancel}
        >
          Back to Upload
        </Button>
        
        <div className="flex items-center gap-3">
          {hasErrors && (
            <span className="text-sm text-muted-foreground">
              Review and fix {invalidRows} {invalidRows === 1 ? 'issue' : 'issues'} to proceed
            </span>
          )}
          <Button 
            onClick={onProceed}
            disabled={hasErrors || isCreating || validRows === 0}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isCreating ? 'Creating Orders...' : `Import ${validRows} Valid Orders`}
          </Button>
        </div>
      </div>
    </div>
  );
};