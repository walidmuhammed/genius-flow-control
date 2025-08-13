import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Info, CheckCircle, Settings, Globe, MapPin, Package, Bug, Eye, EyeOff } from 'lucide-react';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { usePricingDebug } from '@/hooks/use-pricing-debug';

interface EnhancedDeliveryFeeDisplayProps {
  fees: {
    total_fee_usd: number;
    total_fee_lbp: number;
    pricing_source: string;
    base_fee_usd?: number;
    base_fee_lbp?: number;
    extra_fee_usd?: number;
    extra_fee_lbp?: number;
  } | null;
  isLoading: boolean;
  className?: string;
  // Debug props
  clientId?: string;
  governorateId?: string;
  cityId?: string;
  packageType?: 'Parcel' | 'Document' | 'Bulky';
  showDebug?: boolean;
}

const getRuleTypeInfo = (pricingSource: string) => {
  switch (pricingSource) {
    case 'client_specific':
      return {
        label: 'Client Specific',
        description: 'Custom pricing configured specifically for this client',
        icon: Settings,
        badgeVariant: 'default' as const,
        color: 'text-blue-600'
      };
    case 'client_zone':
      return {
        label: 'Client Zone Rule',
        description: 'Custom zone-specific pricing for this client',
        icon: MapPin,
        badgeVariant: 'default' as const,
        color: 'text-blue-600'
      };
    case 'client_package':
      return {
        label: 'Client Package Extra',
        description: 'Client default pricing plus package type extra fee',
        icon: Package,
        badgeVariant: 'secondary' as const,
        color: 'text-purple-600'
      };
    case 'client_default':
      return {
        label: 'Client Default',
        description: 'Custom default pricing for this client',
        icon: Settings,
        badgeVariant: 'outline' as const,
        color: 'text-green-600'
      };
    case 'client_legacy':
      return {
        label: 'Client Legacy',
        description: 'Legacy client-specific pricing override',
        icon: Settings,
        badgeVariant: 'outline' as const,
        color: 'text-orange-600'
      };
    case 'zone':
      return {
        label: 'Zone Pricing',
        description: 'Zone-based pricing applied for this delivery location',
        icon: MapPin,
        badgeVariant: 'secondary' as const,
        color: 'text-green-600'
      };
    case 'global':
      return {
        label: 'Global Default',
        description: 'Standard global pricing (no client-specific rules)',
        icon: Globe,
        badgeVariant: 'secondary' as const,
        color: 'text-gray-600'
      };
    case 'loading':
      return {
        label: 'Calculating...',
        description: 'Calculating delivery fees...',
        icon: Info,
        badgeVariant: 'outline' as const,
        color: 'text-gray-500'
      };
    default:
      return {
        label: 'Unknown',
        description: 'Unknown pricing rule type',
        icon: Info,
        badgeVariant: 'destructive' as const,
        color: 'text-red-600'
      };
  }
};

export function EnhancedDeliveryFeeDisplay({ 
  fees, 
  isLoading, 
  className,
  clientId,
  governorateId,
  cityId,
  packageType,
  showDebug = process.env.NODE_ENV === 'development'
}: EnhancedDeliveryFeeDisplayProps) {
  const [debugVisible, setDebugVisible] = useState(false);
  
  // Initialize pricing debug hook
  const { debugLogs, currentDebugInfo, clearLogs } = usePricingDebug(
    clientId,
    governorateId,
    cityId,
    packageType
  );
  if (isLoading) {
    return (
      <div className={cn("space-y-3 p-4 rounded-lg border bg-card", className)}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">Delivery Fee</span>
          <Skeleton className="h-5 w-24" />
        </div>
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  if (!fees) {
    return (
      <div className={cn("space-y-3 p-4 rounded-lg border bg-card border-destructive/20", className)}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-destructive">Delivery Fee</span>
          <Badge variant="destructive">Error</Badge>
        </div>
        <p className="text-sm text-muted-foreground">Unable to calculate delivery fees</p>
      </div>
    );
  }

  const ruleInfo = getRuleTypeInfo(fees.pricing_source);
  const IconComponent = ruleInfo.icon;

  return (
    <div className={cn("space-y-3 p-4 rounded-lg border bg-card shadow-sm", className)}>
      {/* Header with pricing source */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">Delivery Fee</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 cursor-help">
                  <IconComponent className={cn("h-3.5 w-3.5", ruleInfo.color)} />
                  <Badge variant={ruleInfo.badgeVariant} className="text-xs">
                    {ruleInfo.label}
                  </Badge>
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>{ruleInfo.description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex items-center gap-1">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span className="text-xs text-muted-foreground">Applied</span>
        </div>
      </div>

      {/* Fee amounts */}
      <div className="flex items-center justify-between p-3 rounded-md bg-muted/20">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-foreground">
              ${fees.total_fee_usd?.toFixed(2) || '0.00'}
            </span>
            <span className="text-sm text-muted-foreground">USD</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              {fees.total_fee_lbp?.toLocaleString() || '0'}
            </span>
            <span className="text-xs text-muted-foreground">LBP</span>
          </div>
          
          {/* Show breakdown if available */}
          {fees.base_fee_usd !== undefined && fees.extra_fee_usd !== undefined && (
            <div className="text-xs text-muted-foreground mt-1">
              Base: ${fees.base_fee_usd.toFixed(2)} + Extra: ${fees.extra_fee_usd.toFixed(2)}
            </div>
          )}
        </div>
        
        {/* Visual indicator for custom pricing */}
        {(fees.pricing_source.startsWith('client_') || fees.pricing_source === 'client_specific') && (
          <div className="flex flex-col items-end">
            <Badge variant="default" className="text-xs bg-primary/10 text-primary border-primary/20">
              Custom Rate
            </Badge>
            <span className="text-xs text-muted-foreground mt-1">Client-specific</span>
          </div>
        )}
      </div>

      {/* Additional info for pricing source */}
      {(fees.pricing_source.startsWith('client_') || fees.pricing_source === 'client_specific') && (
        <div className="text-xs text-muted-foreground bg-blue-50 p-2 rounded border-l-2 border-blue-200">
          <span className="font-medium">Client-Specific Pricing:</span> This order uses custom pricing configured for this client.
        </div>
      )}
      
      {fees.pricing_source === 'zone' && (
        <div className="text-xs text-muted-foreground bg-green-50 p-2 rounded border-l-2 border-green-200">
          <span className="font-medium">Zone Pricing Applied:</span> Special pricing for this delivery location.
        </div>
      )}

      {/* Debug Panel */}
      {showDebug && (
        <div className="border-t pt-3 mt-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Bug className="h-4 w-4 text-orange-500" />
              <span className="text-xs font-medium text-orange-700">Pricing Debug</span>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDebugVisible(!debugVisible)}
                className="h-6 px-2 text-xs"
              >
                {debugVisible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                {debugVisible ? 'Hide' : 'Show'}
              </Button>
              <Button
                variant="ghost" 
                size="sm"
                onClick={clearLogs}
                className="h-6 px-2 text-xs"
              >
                Clear
              </Button>
            </div>
          </div>
          
          {debugVisible && currentDebugInfo && (
            <div className="bg-gray-50 rounded p-3 text-xs space-y-2 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="font-semibold text-gray-700 mb-1">Input Parameters</div>
                  <div className="space-y-1 text-gray-600">
                    <div><span className="font-medium">Client ID:</span> {clientId || 'null'}</div>
                    <div><span className="font-medium">Governorate:</span> {governorateId || 'null'}</div>
                    <div><span className="font-medium">City:</span> {cityId || 'null'}</div>
                    <div><span className="font-medium">Package:</span> {packageType || 'null'}</div>
                  </div>
                </div>
                
                <div>
                  <div className="font-semibold text-gray-700 mb-1">Current User</div>
                  <div className="space-y-1 text-gray-600">
                    <div><span className="font-medium">ID:</span> {currentDebugInfo.currentUser?.id || 'null'}</div>
                    <div><span className="font-medium">Type:</span> {currentDebugInfo.currentUser?.user_metadata?.user_type || 'null'}</div>
                    <div><span className="font-medium">Email:</span> {currentDebugInfo.currentUser?.email || 'null'}</div>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="font-semibold text-gray-700 mb-1">Query Status</div>
                <div className="space-y-1 text-gray-600">
                  <div><span className="font-medium">Enabled:</span> {currentDebugInfo.queryEnabled ? 'Yes' : 'No'}</div>
                  <div><span className="font-medium">Loading:</span> {currentDebugInfo.isLoading ? 'Yes' : 'No'}</div>
                  <div><span className="font-medium">Error:</span> {currentDebugInfo.error ? JSON.stringify(currentDebugInfo.error) : 'None'}</div>
                </div>
              </div>
              
              {currentDebugInfo.pricingResult && (
                <div>
                  <div className="font-semibold text-gray-700 mb-1">Pricing Result</div>
                  <div className="bg-white rounded p-2 text-xs font-mono">
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(currentDebugInfo.pricingResult, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
              
              <div className="text-xs text-gray-500 pt-2 border-t">
                Last Updated: {new Date(currentDebugInfo.timestamp).toLocaleString()}
              </div>
            </div>
          )}
          
          {debugVisible && debugLogs.length > 1 && (
            <div className="mt-2">
              <div className="font-semibold text-xs text-gray-700 mb-1">
                Debug History ({debugLogs.length} entries)
              </div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {debugLogs.slice(-5).reverse().map((log, index) => (
                  <div key={index} className="text-xs p-2 bg-gray-100 rounded">
                    <div className="flex justify-between items-center">
                      <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        log.pricingResult?.pricing_source?.startsWith('client_') 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {log.pricingResult?.pricing_source || 'No result'}
                      </span>
                    </div>
                    <div className="text-gray-600 mt-1">
                      Client: {log.clientId || 'null'} | 
                      Governorate: {log.governorateId || 'null'} | 
                      Result: ${log.pricingResult?.total_fee_usd || 'N/A'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}