import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useBusinessLocations } from '@/hooks/use-business-locations';

export interface MerchantInfo {
  businessName: string;
  fullName: string;
  phone: string;
  businessType: string;
  address: string;
  contactPerson: string;
  contactPhone: string;
}

export function useMerchantInfo(clientId?: string) {
  const { user } = useAuth();
  const { getDefaultLocation } = useBusinessLocations();
  const [merchantInfo, setMerchantInfo] = useState<MerchantInfo | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (clientId || user) {
      fetchMerchantInfo(clientId || user?.id);
    }
  }, [clientId, user]);

  const fetchMerchantInfo = async (id?: string) => {
    if (!id) return;
    
    setLoading(true);
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('full_name, business_name, business_type, phone')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching merchant profile:', error);
        return;
      }

      if (profile) {
        const defaultLocation = getDefaultLocation();
        
        setMerchantInfo({
          businessName: profile.business_name || profile.full_name || 'TopSpeed Client',
          fullName: profile.full_name || 'Unknown',
          phone: profile.phone || '',
          businessType: profile.business_type || 'Business',
          address: defaultLocation?.address || 'Lebanon',
          contactPerson: defaultLocation?.contactPerson || profile.full_name || 'Contact Person',
          contactPhone: defaultLocation?.contactPhone || profile.phone || ''
        });
      }
    } catch (error) {
      console.error('Error fetching merchant info:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    merchantInfo,
    loading,
    refetch: () => fetchMerchantInfo(clientId || user?.id)
  };
}