import React from 'react';
import { Check, AlertTriangle, X } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ParsedOrderRow, CSVParseResult } from '@/utils/csvParser';

interface OrderImportPreviewProps {
  parseResult: CSVParseResult;
  onProceed: () => void;
  onCancel: () => void;
  isCreating: boolean;
}

export const OrderImportPreview: React.FC<OrderImportPreviewProps> = ({
  parseResult,
  onProceed,
  onCancel,
  isCreating
}) => {
  const { orders, totalRows, validRows, invalidRows, hasErrors } = parseResult;

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

  const getErrorsList = (errors: string[]) => {
    if (errors.length === 0) return null;
    return (
      <ul className="list-disc list-inside text-xs text-red-600 mt-1 space-y-1">
        {errors.map((error, index) => (
          <li key={index}>{error}</li>
        ))}
      </ul>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow 
                  key={order.row}
                  className={!order.isValid ? 'bg-red-50' : 'hover:bg-gray-50'}
                >
                  <TableCell className="font-mono text-xs">{order.row}</TableCell>
                  <TableCell>{getStatusBadge(order)}</TableCell>
                  <TableCell className="font-medium">{order.fullName}</TableCell>
                  <TableCell className="font-mono text-xs">{order.phone}</TableCell>
                  <TableCell className="text-sm">
                    {order.city}, {order.governorate}
                  </TableCell>
                  <TableCell className="text-sm max-w-[150px] truncate" title={order.address}>
                    {order.address}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Badge variant="outline" className="text-xs">
                        {order.orderType}
                      </Badge>
                      <div className="text-xs text-gray-500 capitalize">
                        {order.packageType}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {order.usdAmount > 0 || order.lbpAmount > 0 ? (
                      <div className="text-xs">
                        {order.usdAmount > 0 && <div>${order.usdAmount}</div>}
                        {order.lbpAmount > 0 && <div>{order.lbpAmount.toLocaleString()} LBP</div>}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">No collection</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {order.errors.length > 0 ? (
                      getErrorsList(order.errors)
                    ) : (
                      <span className="text-green-600 text-xs">✓ All good</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
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