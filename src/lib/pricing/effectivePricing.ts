import { supabase } from '@/integrations/supabase/client';

export type EffectivePricingResult = {
  base: number;
  extras: number;
  source: {
    base: 'Global Default' | 'Client Default' | 'Client Zone' | 'Zone Pricing';
    extras: 'Client Extras' | 'Global Extras' | 'None';
  };
  resolvedClientId?: string | null;
};

export async function getEffectivePricingForOrder(order: {
  clientId?: string | null;
  clientPhone?: string | null;
  governorateId?: string | null;
  packageType?: string | null;
  currency?: 'USD' | 'LBP';
}): Promise<EffectivePricingResult> {
  console.debug('[pricing service] Input:', order);

  try {
    // Call the existing comprehensive pricing function
    const { data, error } = await supabase.rpc('calculate_comprehensive_delivery_fee', {
      p_client_id: order.clientId ?? null,
      p_governorate_id: order.governorateId ?? null,
      p_city_id: null, // Not used in this context
      p_package_type: order.packageType ?? null
    });

    if (error) {
      console.error('[pricing service] RPC error:', error);
      return {
        base: 0,
        extras: 0,
        source: { base: 'Global Default', extras: 'None' }
      };
    }

    const row = Array.isArray(data) ? data[0] : data;
    console.debug('[pricing service] RPC result:', row);

    // Map the response to our expected format
    const currency = order.currency ?? 'USD';
    const base = currency === 'USD' ? Number(row?.base_fee_usd ?? 0) : Number(row?.base_fee_lbp ?? 0);
    const extras = currency === 'USD' ? Number(row?.extra_fee_usd ?? 0) : Number(row?.extra_fee_lbp ?? 0);
    const pricingSource = row?.pricing_source ?? 'global';

    // Determine badge text based on pricing source
    let sourceBase: EffectivePricingResult['source']['base'] = 'Global Default';
    if (pricingSource === 'client_specific') {
      sourceBase = 'Client Default';
    } else if (pricingSource === 'zone') {
      sourceBase = 'Zone Pricing';
    }

    // Check if we have client-specific zone or package overrides
    if (order.clientId && order.governorateId) {
      const { data: zoneData } = await supabase
        .from('pricing_client_zone_rules')
        .select('*')
        .eq('client_id', order.clientId)
        .contains('governorate_ids', [order.governorateId])
        .limit(1);
      
      if (zoneData && zoneData.length > 0) {
        sourceBase = 'Client Zone';
      }
    }

    let sourceExtras: EffectivePricingResult['source']['extras'] = 'None';
    if (extras > 0) {
      if (order.clientId && order.packageType) {
        const { data: extraData } = await supabase
          .from('pricing_client_package_extras')
          .select('*')
          .eq('client_id', order.clientId)
          .eq('package_type', order.packageType)
          .limit(1);
        
        if (extraData && extraData.length > 0) {
          sourceExtras = 'Client Extras';
        } else {
          sourceExtras = 'Global Extras';
        }
      } else {
        sourceExtras = 'Global Extras';
      }
    }

    const result = {
      base,
      extras,
      source: {
        base: sourceBase,
        extras: sourceExtras
      },
      resolvedClientId: order.clientId
    };

    console.debug('[pricing service] Final result:', result);
    return result;

  } catch (error) {
    console.error('[pricing service] Error:', error);
    return {
      base: 0,
      extras: 0,
      source: { base: 'Global Default', extras: 'None' }
    };
  }
}