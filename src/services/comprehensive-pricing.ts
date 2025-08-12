// Enhanced pricing services for the comprehensive pricing system
import { supabase } from '@/integrations/supabase/client';

// Types for the comprehensive pricing system
export interface ZonePricing {
  id: string;
  governorate_id: string;
  fee_usd: number;
  fee_lbp: number;
  created_at: string;
  updated_at: string;
  governorate_name?: string;
}

export interface GlobalPackageExtra {
  id: string;
  package_type: string; // Changed from strict union to allow DB flexibility
  extra_usd: number;
  extra_lbp: number;
  created_at: string;
  updated_at: string;
}

export interface PricingCalculationResult {
  base_fee_usd: number;
  base_fee_lbp: number;
  extra_fee_usd: number;
  extra_fee_lbp: number;
  total_fee_usd: number;
  total_fee_lbp: number;
  pricing_source: string;
  rule_details: any;
}

export interface OrderPriceSnapshot {
  id: string;
  order_id: string;
  client_id: string;
  governorate_id?: string;
  city_id?: string;
  package_type?: string;
  base_fee_usd: number;
  extra_fee_usd: number;
  total_fee_usd: number;
  base_fee_lbp: number;
  extra_fee_lbp: number;
  total_fee_lbp: number;
  pricing_source: string;
  rule_details: any;
  calculated_at: string;
}

// Zone Pricing Services
export const getZonePricing = async (): Promise<ZonePricing[]> => {
  const { data, error } = await supabase
    .from('pricing_zone')
    .select(`
      *,
      governorates!inner(name)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map(item => ({
    ...item,
    governorate_name: item.governorates?.name
  }));
};

export const createZonePricing = async (
  governorateId: string,
  feeUsd: number,
  feeLbp: number
): Promise<ZonePricing> => {
  const { data, error } = await supabase
    .from('pricing_zone')
    .insert({
      governorate_id: governorateId,
      fee_usd: feeUsd,
      fee_lbp: feeLbp
    })
    .select('*')
    .single();

  if (error) throw error;
  return data;
};

export const updateZonePricing = async (
  id: string,
  updates: { fee_usd?: number; fee_lbp?: number }
): Promise<ZonePricing> => {
  const { data, error } = await supabase
    .from('pricing_zone')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return data;
};

export const deleteZonePricing = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('pricing_zone')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Global Package Extras Services
export const getGlobalPackageExtras = async (): Promise<GlobalPackageExtra[]> => {
  const { data, error } = await supabase
    .from('pricing_package_extras_global')
    .select('*')
    .order('package_type');

  if (error) throw error;
  return data || [];
};

export const updateGlobalPackageExtra = async (
  packageType: 'Parcel' | 'Document' | 'Bulky',
  extraUsd: number,
  extraLbp: number
): Promise<GlobalPackageExtra> => {
  const { data, error } = await supabase
    .from('pricing_package_extras_global')
    .upsert({
      package_type: packageType,
      extra_usd: extraUsd,
      extra_lbp: extraLbp
    })
    .select('*')
    .single();

  if (error) throw error;
  return data;
};

// Comprehensive fee calculation using the new database function
export const calculateComprehensiveDeliveryFee = async (
  clientId?: string,
  governorateId?: string,
  cityId?: string,
  packageType?: 'Parcel' | 'Document' | 'Bulky'
): Promise<PricingCalculationResult> => {
  console.log('🚀 calculateComprehensiveDeliveryFee called with:', {
    clientId,
    governorateId,
    cityId,
    packageType
  });

  const { data, error } = await supabase.rpc('calculate_comprehensive_delivery_fee', {
    p_client_id: clientId || null,
    p_governorate_id: governorateId || null,
    p_city_id: cityId || null,
    p_package_type: packageType || null,
  });

  console.log('📞 Comprehensive RPC call result:', { data, error });

  if (error) {
    console.error('❌ Error calculating comprehensive delivery fee:', error);
    throw error;
  }

  if (!data || data.length === 0) {
    throw new Error('No pricing data returned from calculation');
  }

  const result = data[0];
  console.log('✅ Comprehensive calculation result:', result);

  return {
    base_fee_usd: Number(result.base_fee_usd) || 0,
    base_fee_lbp: Number(result.base_fee_lbp) || 0,
    extra_fee_usd: Number(result.extra_fee_usd) || 0,
    extra_fee_lbp: Number(result.extra_fee_lbp) || 0,
    total_fee_usd: Number(result.total_fee_usd) || 0,
    total_fee_lbp: Number(result.total_fee_lbp) || 0,
    pricing_source: result.pricing_source || 'global',
    rule_details: result.rule_details || {}
  };
};

// Order price snapshot services
export const createOrderPriceSnapshot = async (
  orderId: string,
  clientId: string,
  pricingResult: PricingCalculationResult,
  governorateId?: string,
  cityId?: string,
  packageType?: string
): Promise<OrderPriceSnapshot> => {
  const { data, error } = await supabase
    .from('order_price_snapshot')
    .insert({
      order_id: orderId,
      client_id: clientId,
      governorate_id: governorateId,
      city_id: cityId,
      package_type: packageType,
      base_fee_usd: pricingResult.base_fee_usd,
      extra_fee_usd: pricingResult.extra_fee_usd,
      total_fee_usd: pricingResult.total_fee_usd,
      base_fee_lbp: pricingResult.base_fee_lbp,
      extra_fee_lbp: pricingResult.extra_fee_lbp,
      total_fee_lbp: pricingResult.total_fee_lbp,
      pricing_source: pricingResult.pricing_source,
      rule_details: pricingResult.rule_details
    })
    .select('*')
    .single();

  if (error) throw error;
  return data;
};

export const getOrderPriceSnapshot = async (orderId: string): Promise<OrderPriceSnapshot | null> => {
  const { data, error } = await supabase
    .from('order_price_snapshot')
    .select('*')
    .eq('order_id', orderId)
    .maybeSingle();

  if (error) throw error;
  return data;
};

// Batch operations for zone pricing
export const batchUpdateZonePricing = async (
  updates: Array<{
    governorate_id: string;
    fee_usd: number;
    fee_lbp: number;
  }>
): Promise<ZonePricing[]> => {
  const { data, error } = await supabase
    .from('pricing_zone')
    .upsert(updates, { onConflict: 'governorate_id' })
    .select('*');

  if (error) throw error;
  return data || [];
};