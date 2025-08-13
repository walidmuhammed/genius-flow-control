import { useEffect, useState } from 'react';
import { useComprehensiveDeliveryFee } from '@/hooks/use-comprehensive-pricing';
import { useAuth } from '@/hooks/useAuth';

interface PricingDebugInfo {
  currentUser: any;
  clientId: string | undefined;
  governorateId: string | undefined;
  cityId: string | undefined;
  packageType: 'Parcel' | 'Document' | 'Bulky' | undefined;
  pricingResult: any;
  timestamp: string;
  queryEnabled: boolean;
  isLoading: boolean;
  error: any;
}

export function usePricingDebug(
  clientId?: string,
  governorateId?: string,
  cityId?: string,
  packageType?: 'Parcel' | 'Document' | 'Bulky'
) {
  const { user } = useAuth();
  const [debugLogs, setDebugLogs] = useState<PricingDebugInfo[]>([]);
  
  const pricingQuery = useComprehensiveDeliveryFee(
    clientId,
    governorateId,
    cityId,
    packageType
  );

  useEffect(() => {
    const debugInfo: PricingDebugInfo = {
      currentUser: user ? {
        id: user.id,
        user_metadata: user.user_metadata,
        email: user.email
      } : null,
      clientId,
      governorateId,
      cityId,
      packageType,
      pricingResult: pricingQuery.data,
      timestamp: new Date().toISOString(),
      queryEnabled: !!(clientId || governorateId),
      isLoading: pricingQuery.isLoading,
      error: pricingQuery.error
    };

    setDebugLogs(prev => [...prev.slice(-9), debugInfo]); // Keep last 10 logs

    // Console logging for development
    if (process.env.NODE_ENV === 'development') {
      console.group('🔍 Pricing Debug');
      console.log('Parameters:', {
        clientId,
        governorateId,
        cityId,
        packageType
      });
      console.log('Current User:', user?.id, user?.user_metadata?.user_type);
      console.log('Query Enabled:', !!(clientId || governorateId));
      console.log('Loading:', pricingQuery.isLoading);
      console.log('Error:', pricingQuery.error);
      console.log('Result:', pricingQuery.data);
      console.groupEnd();
    }
  }, [
    user,
    clientId,
    governorateId,
    cityId,
    packageType,
    pricingQuery.data,
    pricingQuery.isLoading,
    pricingQuery.error
  ]);

  return {
    debugLogs,
    currentDebugInfo: debugLogs[debugLogs.length - 1],
    clearLogs: () => setDebugLogs([])
  };
}