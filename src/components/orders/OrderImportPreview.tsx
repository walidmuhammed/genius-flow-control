import React, { useState } from 'react';
import { Check, AlertTriangle, X, Edit2, Save, XCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ParsedOrderRow, CSVParseResult } from '@/utils/csvParser';
import { AreaSelector } from './AreaSelector';
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

  const handleAreaSelected = (governorate: string, city: string) => {
    if (editedOrder) {
      setEditedOrder({
        ...editedOrder,
        governorate,
        city
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
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">{totalRows}</div>
          <div className="text-sm text-gray-600">Total Rows</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{validRows}</div>
          <div className="text-sm text-green-600">Valid Orders</div>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{invalidRows}</div>
          <div className="text-sm text-red-600">Invalid Orders</div>
        </div>
      </div>

      {/* Error Alert */}
      {hasErrors && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Found {invalidRows} invalid {invalidRows === 1 ? 'row' : 'rows'}. Please fix the errors below before proceeding with import.
          </AlertDescription>
        </Alert>
      )}

      {/* Orders Table */}
      <div className="border rounded-lg">
        <div className="p-3 bg-gray-50 border-b">
          <h3 className="font-medium text-sm">Import Preview</h3>
        </div>
        
        <ScrollArea className="h-[500px]">
          <div className="space-y-2">
            {orders.map((order) => {
              const isEditing = editingRow === order.row;
              const displayOrder = isEditing && editedOrder ? editedOrder : order;
              const isExpanded = expandedRows.has(order.row);
              const hasErrors = displayOrder.errors.length > 0;
              
              return (
                <div 
                  key={order.row}
                  className={`border rounded-lg ${!displayOrder.isValid ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'}`}
                >
                  {/* Main Order Row */}
                  <div className="p-4">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      {/* Row Number */}
                      <div className="col-span-1">
                        <span className="font-mono text-xs text-gray-500">#{order.row}</span>
                      </div>
                      
                      {/* Status */}
                      <div className="col-span-1">
                        {getStatusBadge(displayOrder)}
                      </div>
                      
                      {/* Customer */}
                      <div className="col-span-2">
                        {isEditing ? (
                          <Input
                            value={displayOrder.fullName}
                            onChange={(e) => setEditedOrder(prev => prev ? {...prev, fullName: e.target.value} : null)}
                            className="h-8 text-sm"
                            placeholder="Full Name"
                          />
                        ) : (
                          <div className="text-sm font-medium">{displayOrder.fullName}</div>
                        )}
                      </div>
                      
                      {/* Phone */}
                      <div className="col-span-2">
                        {isEditing ? (
                          <Input
                            value={displayOrder.phone}
                            onChange={(e) => setEditedOrder(prev => prev ? {...prev, phone: e.target.value} : null)}
                            className="h-8 text-sm"
                            placeholder="Phone"
                          />
                        ) : (
                          <div className="text-sm font-mono">{displayOrder.phone}</div>
                        )}
                      </div>
                      
                      {/* Location */}
                      <div className="col-span-2">
                        {isEditing ? (
                          <AreaSelector
                            selectedArea={displayOrder.city}
                            selectedGovernorate={displayOrder.governorate}
                            onAreaSelected={handleAreaSelected}
                          />
                        ) : (
                          <div className="text-sm">{displayOrder.city}, {displayOrder.governorate}</div>
                        )}
                      </div>
                      
                      {/* Type & Amount */}
                      <div className="col-span-2">
                        {isEditing ? (
                          <div className="space-y-1">
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
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <Badge variant="outline" className="text-xs">
                              {displayOrder.orderType}
                            </Badge>
                            {(displayOrder.usdAmount > 0 || displayOrder.lbpAmount > 0) && (
                              <div className="text-xs text-gray-600">
                                {displayOrder.usdAmount > 0 && `$${displayOrder.usdAmount}`}
                                {displayOrder.lbpAmount > 0 && ` ${displayOrder.lbpAmount.toLocaleString()} LBP`}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Actions */}
                      <div className="col-span-2 flex items-center justify-end gap-2">
                        {hasErrors && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleRowExpansion(order.row)}
                            className="h-7 w-7 p-0 text-red-600"
                          >
                            {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                          </Button>
                        )}
                        
                        {isEditing ? (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleSaveEdit}
                              className="h-7 w-7 p-0 text-green-600"
                            >
                              <Save className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleCancelEdit}
                              className="h-7 w-7 p-0 text-gray-600"
                            >
                              <XCircle className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditClick(order)}
                            className="h-7 w-7 p-0 text-blue-600"
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {/* Expanded Editing Fields */}
                    {isEditing && (
                      <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-medium text-gray-700 mb-1 block">Address</label>
                          <Input
                            value={displayOrder.address}
                            onChange={(e) => setEditedOrder(prev => prev ? {...prev, address: e.target.value} : null)}
                            className="h-8 text-sm"
                            placeholder="Address Details"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-700 mb-1 block">Package Type</label>
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
                          <label className="text-xs font-medium text-gray-700 mb-1 block">USD Amount</label>
                          <Input
                            type="number"
                            value={displayOrder.usdAmount || ''}
                            onChange={(e) => setEditedOrder(prev => prev ? {...prev, usdAmount: parseFloat(e.target.value) || 0} : null)}
                            className="h-8 text-sm"
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-700 mb-1 block">LBP Amount</label>
                          <Input
                            type="number"
                            value={displayOrder.lbpAmount || ''}
                            onChange={(e) => setEditedOrder(prev => prev ? {...prev, lbpAmount: parseFloat(e.target.value) || 0} : null)}
                            className="h-8 text-sm"
                            placeholder="0"
                          />
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
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
        >
          Back to Upload
        </button>
        
        <div className="flex items-center gap-3">
          {hasErrors && (
            <span className="text-sm text-red-600">
              Fix errors to proceed
            </span>
          )}
          <button
            onClick={onProceed}
            disabled={hasErrors || isCreating || validRows === 0}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isCreating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating {validRows} Orders...
              </>
            ) : (
              `Create ${validRows} Orders`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};