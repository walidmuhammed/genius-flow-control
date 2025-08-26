import React, { useState } from 'react';
import { Check, AlertTriangle, X, Edit2, Save, XCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
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
      isValid: errors.length === 0
    };
    
    onUpdateOrder(editedOrder.row - 1, updatedOrder);
    setEditingRow(null);
    setEditedOrder(null);
    
    if (errors.length === 0) {
      toast.success('Order updated successfully');
    }
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

  const getErrorsList = (errors: string[], suggestions?: any[]) => {
    if (errors.length === 0) return null;
    return (
      <div className="space-y-1">
        <ul className="list-disc list-inside text-xs text-red-600 space-y-1">
          {errors.map((error, index) => (
            <li key={index}>{error}</li>
          ))}
        </ul>
        {suggestions && suggestions.length > 0 && (
          <div className="text-xs text-blue-600 mt-1">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="italic">
                Suggested {suggestion.field}: {suggestion.suggestions.join(', ')}
                {suggestion.corrected && ` (Auto-corrected to: ${suggestion.corrected})`}
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
        
        <ScrollArea className="h-[400px]">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-12">#</TableHead>
                <TableHead className="w-20">Status</TableHead>
                <TableHead className="min-w-[120px]">Customer</TableHead>
                <TableHead className="min-w-[120px]">Phone</TableHead>
                <TableHead className="min-w-[100px]">Location</TableHead>
                <TableHead className="min-w-[150px]">Address</TableHead>
                <TableHead className="min-w-[80px]">Type</TableHead>
                <TableHead className="min-w-[100px]">Amount</TableHead>
                <TableHead className="min-w-[200px]">Issues</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const isEditing = editingRow === order.row;
                const displayOrder = isEditing && editedOrder ? editedOrder : order;
                
                return (
                  <TableRow 
                    key={order.row}
                    className={!displayOrder.isValid ? 'bg-red-50' : 'hover:bg-gray-50'}
                  >
                    <TableCell className="font-mono text-xs">{order.row}</TableCell>
                    <TableCell>{getStatusBadge(displayOrder)}</TableCell>
                    
                    {/* Customer Name */}
                    <TableCell className="font-medium">
                      {isEditing ? (
                        <Input
                          value={displayOrder.fullName}
                          onChange={(e) => setEditedOrder(prev => prev ? {...prev, fullName: e.target.value} : null)}
                          className="h-8 text-sm"
                        />
                      ) : displayOrder.fullName}
                    </TableCell>
                    
                    {/* Phone */}
                    <TableCell className="font-mono text-xs">
                      {isEditing ? (
                        <Input
                          value={displayOrder.phone}
                          onChange={(e) => setEditedOrder(prev => prev ? {...prev, phone: e.target.value} : null)}
                          className="h-8 text-sm"
                        />
                      ) : displayOrder.phone}
                    </TableCell>
                    
                    {/* Location */}
                    <TableCell className="text-sm">
                      {isEditing ? (
                        <div className="min-w-[200px]">
                          <AreaSelector
                            selectedArea={displayOrder.city}
                            selectedGovernorate={displayOrder.governorate}
                            onAreaSelected={handleAreaSelected}
                          />
                        </div>
                      ) : `${displayOrder.city}, ${displayOrder.governorate}`}
                    </TableCell>
                    
                    {/* Address */}
                    <TableCell className="text-sm">
                      {isEditing ? (
                        <Input
                          value={displayOrder.address}
                          onChange={(e) => setEditedOrder(prev => prev ? {...prev, address: e.target.value} : null)}
                          className="h-8 text-sm min-w-[150px]"
                        />
                      ) : (
                        <div className="max-w-[150px] truncate" title={displayOrder.address}>
                          {displayOrder.address}
                        </div>
                      )}
                    </TableCell>
                    
                    {/* Type */}
                    <TableCell>
                      {isEditing ? (
                        <div className="space-y-2">
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
                      ) : (
                        <div className="space-y-1">
                          <Badge variant="outline" className="text-xs">
                            {displayOrder.orderType}
                          </Badge>
                          <div className="text-xs text-gray-500 capitalize">
                            {displayOrder.packageType}
                          </div>
                        </div>
                      )}
                    </TableCell>
                    
                    {/* Amount */}
                    <TableCell>
                      {isEditing ? (
                        <div className="space-y-1">
                          <Input
                            type="number"
                            placeholder="USD"
                            value={displayOrder.usdAmount || ''}
                            onChange={(e) => setEditedOrder(prev => prev ? {...prev, usdAmount: parseFloat(e.target.value) || 0} : null)}
                            className="h-7 text-xs"
                          />
                          <Input
                            type="number"
                            placeholder="LBP"
                            value={displayOrder.lbpAmount || ''}
                            onChange={(e) => setEditedOrder(prev => prev ? {...prev, lbpAmount: parseFloat(e.target.value) || 0} : null)}
                            className="h-7 text-xs"
                          />
                        </div>
                      ) : (
                        displayOrder.usdAmount > 0 || displayOrder.lbpAmount > 0 ? (
                          <div className="text-xs">
                            {displayOrder.usdAmount > 0 && <div>${displayOrder.usdAmount}</div>}
                            {displayOrder.lbpAmount > 0 && <div>{displayOrder.lbpAmount.toLocaleString()} LBP</div>}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">No collection</span>
                        )
                      )}
                    </TableCell>
                    
                    {/* Issues */}
                    <TableCell>
                      {displayOrder.errors.length > 0 ? (
                        getErrorsList(displayOrder.errors, displayOrder.suggestions)
                      ) : (
                        <span className="text-green-600 text-xs">✓ All good</span>
                      )}
                    </TableCell>
                    
                    {/* Actions */}
                    <TableCell>
                      {isEditing ? (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleSaveEdit}
                            className="h-7 w-7 p-0"
                          >
                            <Save className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleCancelEdit}
                            className="h-7 w-7 p-0"
                          >
                            <XCircle className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditClick(order)}
                          className="h-7 w-7 p-0"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
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