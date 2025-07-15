import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, Calendar, User, ArrowRightLeft } from 'lucide-react';
import { usePricingChangeLogs } from '@/hooks/use-pricing';
import { formatDistanceToNow } from 'date-fns';

const PricingChangeLogsSection = () => {
  const { data: changeLogs, isLoading } = usePricingChangeLogs(20);

  const formatValue = (value: any) => {
    if (typeof value === 'object' && value !== null) {
      // Format pricing values nicely
      if (value.fee_usd !== undefined || value.fee_lbp !== undefined) {
        const parts = [];
        if (value.fee_usd) parts.push(`$${value.fee_usd}`);
        if (value.fee_lbp) parts.push(`${parseInt(value.fee_lbp).toLocaleString()} LBP`);
        return parts.join(' / ');
      }
      if (value.default_fee_usd !== undefined || value.default_fee_lbp !== undefined) {
        const parts = [];
        if (value.default_fee_usd) parts.push(`$${value.default_fee_usd}`);
        if (value.default_fee_lbp) parts.push(`${parseInt(value.default_fee_lbp).toLocaleString()} LBP`);
        return parts.join(' / ');
      }
      return JSON.stringify(value);
    }
    return String(value);
  };

  const getActionBadgeVariant = (action: string) => {
    switch (action.toLowerCase()) {
      case 'insert':
        return 'default';
      case 'update':
        return 'secondary';
      case 'delete':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getPricingTypeLabel = (type: string) => {
    switch (type) {
      case 'global':
        return 'Global Pricing';
      case 'client':
        return 'Client Override';
      case 'zone':
        return 'Zone Pricing';
      case 'package':
        return 'Package Type';
      default:
        return type;
    }
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          Recent Pricing Changes
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Audit trail of all pricing modifications
        </p>
      </CardHeader>
      <CardContent>
        {changeLogs && changeLogs.length > 0 ? (
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Changes</TableHead>
                  <TableHead>Changed By</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {changeLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <Badge variant={getActionBadgeVariant(log.action)}>
                        {log.action.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {getPricingTypeLabel(log.pricing_type)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        {log.action === 'UPDATE' && log.old_values && log.new_values ? (
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">
                              {formatValue(log.old_values)}
                            </span>
                            <ArrowRightLeft className="h-3 w-3 text-muted-foreground" />
                            <span className="font-medium">
                              {formatValue(log.new_values)}
                            </span>
                          </div>
                        ) : log.action === 'INSERT' && log.new_values ? (
                          <span className="font-medium text-green-600">
                            Created: {formatValue(log.new_values)}
                          </span>
                        ) : log.action === 'DELETE' && log.old_values ? (
                          <span className="font-medium text-red-600">
                            Deleted: {formatValue(log.old_values)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">No details</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">
                          {log.changed_by ? 'Admin' : 'System'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No pricing changes recorded yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PricingChangeLogsSection;