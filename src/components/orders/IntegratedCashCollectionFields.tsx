import React, { useState } from 'react';
import { Check, Info, X, ChevronDown, ChevronUp, CheckCircle, Settings, Globe, MapPin, Package, Bug, Eye, EyeOff } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import CurrencyDisplay from '@/components/dashboard/CurrencyDisplay';

import { cn } from '@/lib/utils';
import { usePricingDebug } from '@/hooks/use-pricing-debug';

interface IntegratedCashCollectionFieldsProps {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  usdAmount: string;
  lbpAmount: string;
  onUsdAmountChange: (amount: string) => void;
  onLbpAmountChange: (amount: string) => void;
  deliveryFees: {
    total_fee_usd: number;
    total_fee_lbp: number;
    pricing_source: string;
    base_fee_usd?: number;
    base_fee_lbp?: number;
    extra_fee_usd?: number;
    extra_fee_lbp?: number;
  } | null;
  isFeesLoading: boolean;
  errors?: {
    usdAmount?: string;
    lbpAmount?: string;
  };
  // Debug props for delivery fee display
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

const IntegratedCashCollectionFields: React.FC<IntegratedCashCollectionFieldsProps> = ({
  enabled,
  onEnabledChange,
  usdAmount,
  lbpAmount,
  onUsdAmountChange,
  onLbpAmountChange,
  deliveryFees,
  isFeesLoading,
  errors,
  clientId,
  governorateId,
  cityId,
  packageType,
  showDebug = process.env.NODE_ENV === 'development'
}) => {
  const [deliveryFeeExpanded, setDeliveryFeeExpanded] = useState(false);
  const [debugVisible, setDebugVisible] = useState(false);

  // Initialize pricing debug hook
  const { debugLogs, currentDebugInfo, clearLogs } = usePricingDebug(
    clientId,
    governorateId,
    cityId,
    packageType
  );

  // Format USD input to handle decimals properly
  const handleUsdInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only numbers and decimal point
    const value = e.target.value.replace(/[^0-9.]/g, '');
    // Ensure only one decimal point
    const decimalParts = value.split('.');
    if (decimalParts.length > 1) {
      const wholeNumber = decimalParts[0];
      const decimal = decimalParts.slice(1).join('').slice(0, 2);
      onUsdAmountChange(`${wholeNumber}.${decimal}`);
    } else {
      onUsdAmountChange(value);
    }
  };

  // Format LBP input to only allow whole numbers
  const handleLbpInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only numbers
    const value = e.target.value.replace(/\D/g, '');
    onLbpAmountChange(value);
  };

  const isClientOverride = deliveryFees?.pricing_source === 'client_specific' || 
                          deliveryFees?.pricing_source?.includes('client');

  const ruleInfo = getRuleTypeInfo(deliveryFees?.pricing_source || 'global');
  const IconComponent = ruleInfo.icon;

  return (
    <div className="rounded-lg border border-border/20 p-5 bg-white shadow-sm transition-all duration-300 hover:border-topspeed-200/30">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h3 className="font-semibold text-foreground">Cash Collection</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="bg-white border-border/20 shadow-lg rounded-xl">
                <p>Enable if you need to collect cash upon delivery</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Switch 
          checked={enabled} 
          onCheckedChange={onEnabledChange} 
          className="data-[state=checked]:bg-topspeed-600 data-[state=checked]:text-white"
        />
      </div>
      
      {enabled && (
        <div className="space-y-4 pt-2 animate-slide-up">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="mb-2">
                <span className="text-sm font-medium text-foreground/90">USD Amount</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">$</div>
                <input 
                  type="text" 
                  value={usdAmount} 
                  onChange={handleUsdInputChange}
                  className={`w-full pl-8 pr-12 py-2.5 border ${errors?.usdAmount ? 'border-topspeed-600 ring-1 ring-topspeed-600/20' : 'border-input'} rounded-lg bg-background shadow-sm focus:ring-2 focus:ring-topspeed-600/10 focus:border-topspeed-300 focus:outline-none transition-all`} 
                  placeholder="0.00" 
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button 
                    type="button" 
                    onClick={() => onUsdAmountChange('')} 
                    className="text-muted-foreground hover:text-topspeed-600 rounded-full h-5 w-5 flex items-center justify-center transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              {errors?.usdAmount && <p className="text-topspeed-600 text-xs mt-1.5">{errors.usdAmount}</p>}
            </div>
            
            <div>
              <div className="mb-2">
                <span className="text-sm font-medium text-foreground/90">LBP Amount</span>
              </div>
              <div className="relative">
                <input 
                  type="text" 
                  value={lbpAmount} 
                  onChange={handleLbpInputChange}
                  className={`w-full pl-3.5 pr-12 py-2.5 border ${errors?.lbpAmount ? 'border-topspeed-600 ring-1 ring-topspeed-600/20' : 'border-input'} rounded-lg bg-background shadow-sm focus:ring-2 focus:ring-topspeed-600/10 focus:border-topspeed-300 focus:outline-none transition-all`} 
                  placeholder="0" 
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button 
                    type="button" 
                    onClick={() => onLbpAmountChange('')} 
                    className="text-muted-foreground hover:text-topspeed-600 rounded-full h-5 w-5 flex items-center justify-center transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              {errors?.lbpAmount && <p className="text-topspeed-600 text-xs mt-1.5">{errors.lbpAmount}</p>}
            </div>
          </div>
          
          {/* Delivery Fee Section */}
          <div className="space-y-3 pt-1">
            <Collapsible open={deliveryFeeExpanded} onOpenChange={setDeliveryFeeExpanded}>
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg cursor-pointer hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Delivery Fee:</span>
                    {isFeesLoading ? (
                      <Skeleton className="h-4 w-20" />
                    ) : deliveryFees ? (
                      <span className="text-sm font-medium">
                        ${deliveryFees.total_fee_usd?.toFixed(2) || '0.00'} | {deliveryFees.total_fee_lbp?.toLocaleString() || '0'} LBP
                      </span>
                    ) : (
                      <span className="text-sm text-destructive">Unable to calculate</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {deliveryFeeExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="space-y-3 pt-3">
                {isFeesLoading ? (
                  <div className="space-y-3 p-4 rounded-lg border bg-card">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Delivery Fee</span>
                      <Skeleton className="h-5 w-24" />
                    </div>
                    <Skeleton className="h-8 w-full" />
                  </div>
                ) : !deliveryFees ? (
                  <div className="space-y-3 p-4 rounded-lg border bg-card border-destructive/20">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-destructive">Delivery Fee</span>
                      <Badge variant="destructive">Error</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Unable to calculate delivery fees</p>
                  </div>
                ) : (
                  <>
                    {/* Header with pricing source */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-1 cursor-help">
                                <IconComponent className={cn("h-3.5 w-3.5", ruleInfo.color)} />
                                <Badge variant={isClientOverride ? "default" : ruleInfo.badgeVariant} className="text-xs">
                                  {isClientOverride ? "Client Override" : ruleInfo.label}
                                </Badge>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p>{isClientOverride ? "Custom pricing configured specifically for this client" : ruleInfo.description}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-xs text-muted-foreground">Applied</span>
                      </div>
                    </div>

                    {/* Fee amounts breakdown */}
                    <div className="flex items-center justify-between p-3 rounded-md bg-muted/20">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-semibold text-foreground">
                            ${(deliveryFees.total_fee_usd || 0).toFixed(2)}
                          </span>
                          <span className="text-sm text-muted-foreground">USD</span>
                        </div>
                        
                        {/* Show breakdown if available */}
                        {deliveryFees.base_fee_usd !== undefined && deliveryFees.extra_fee_usd !== undefined && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Base: ${deliveryFees.base_fee_usd.toFixed(2)} + Extra: ${deliveryFees.extra_fee_usd.toFixed(2)}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">
                            {(deliveryFees.total_fee_lbp || 0).toLocaleString()}
                          </span>
                          <span className="text-xs text-muted-foreground">LBP</span>
                        </div>
                      </div>
                      
                      {/* Visual indicator for custom pricing */}
                      {isClientOverride && (
                        <div className="flex flex-col items-end">
                          <Badge variant="default" className="text-xs bg-primary/10 text-primary border-primary/20">
                            Custom Rate
                          </Badge>
                          <span className="text-xs text-muted-foreground mt-1">Client-specific</span>
                        </div>
                      )}
                    </div>

                    {/* Additional info for pricing source */}
                    {isClientOverride && (
                      <div className="text-xs text-muted-foreground bg-blue-50 p-2 rounded border-l-2 border-blue-200">
                        <span className="font-medium">Client-Specific Pricing:</span> This order uses custom pricing configured for this client.
                      </div>
                    )}
                    
                    {deliveryFees.pricing_source === 'zone' && (
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
                      </div>
                    )}
                  </>
                )}
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntegratedCashCollectionFields;