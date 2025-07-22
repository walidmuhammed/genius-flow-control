
import { supabase } from '@/integrations/supabase/client';

// Types for pricing system
export interface GlobalPricing {
  id: string;
  default_fee_usd: number;
  default_fee_lbp: number;
  created_at: string;
  updated_at: string;
  updated_by?: string;
}

export interface ClientPricingOverride {
  id: string;
  client_id: string;
  governorate_id?: string | null;
  city_id?: string | null;
  package_type?: string | null;
  fee_usd: number;
  fee_lbp: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
  // Joined data
  client_name?: string;
  business_name?: string;
  governorate_name?: string;
  city_name?: string;
}

export interface ZonePricingRule {
  id: string;
  governorate_id?: string | null;
  city_id?: string | null;
  zone_name?: string | null;
  fee_usd: number;
  fee_lbp: number;
  client_id?: string | null;
  package_type?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  // Joined data
  governorate_name?: string;
  city_name?: string;
  client_name?: string;
  business_name?: string;
}

export interface PackageTypePricing {
  id: string;
  package_type: string;
  fee_usd: number;
  fee_lbp: number;
  client_id?: string | null;
  governorate_id?: string | null;
  city_id?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  // Joined data
  client_name?: string;
  business_name?: string;
  governorate_name?: string;
  city_name?: string;
}

export interface PricingChangeLog {
  id: string;
  action: string;
  pricing_type: string;
  entity_id?: string;
  old_values?: any;
  new_values?: any;
  changed_by?: string;
  created_at: string;
  // Joined data
  changed_by_name?: string;
}

export interface PricingKPIs {
  global_default_fee_usd: number;
  global_default_fee_lbp: number;
  zone_rules_count: number;
  client_overrides_count: number;
  last_updated: string;
}

export interface DeliveryFeeResult {
  fee_usd: number;
  fee_lbp: number;
  rule_type: string;
}

// Global pricing functions
export const getGlobalPricing = async (): Promise<GlobalPricing | null> => {
  const { data, error } = await supabase
    .from('pricing_global')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching global pricing:', error);
    throw error;
  }

  return data;
};

export const updateGlobalPricing = async (
  pricing: Pick<GlobalPricing, 'default_fee_usd' | 'default_fee_lbp'>
): Promise<GlobalPricing> => {
  // First, get the current user
  const { data: { user } } = await supabase.auth.getUser();
  
  // Get the existing global pricing record separately to avoid circular dependency
  const { data: existingPricing, error: fetchError } = await supabase
    .from('pricing_global')
    .select('id')
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();

  if (fetchError) {
    console.error('Error fetching existing global pricing ID:', fetchError);
    throw fetchError;
  }

  if (!existingPricing?.id) {
    throw new Error('No global pricing record found to update');
  }

  // Now update the record using the fetched ID
  const { data, error } = await supabase
    .from('pricing_global')
    .update({
      // Allow 0 values for either currency
      default_fee_usd: pricing.default_fee_usd || 0,
      default_fee_lbp: pricing.default_fee_lbp || 0,
      updated_at: new Date().toISOString(),
      updated_by: user?.id,
    })
    .eq('id', existingPricing.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating global pricing:', error);
    throw error;
  }

  return data;
};

// Client pricing override functions
export const getClientPricingOverrides = async (): Promise<ClientPricingOverride[]> => {
  const { data, error } = await supabase
    .from('pricing_client_overrides')
    .select(`
      *,
      profiles!client_id (
        full_name,
        business_name
      ),
      governorates (name),
      cities (name)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching client pricing overrides:', error);
    throw error;
  }

  return data.map(item => ({
    ...item,
    client_name: item.profiles?.full_name,
    business_name: item.profiles?.business_name,
    governorate_name: item.governorates?.name,
    city_name: item.cities?.name,
  }));
};

export const createClientPricingOverride = async (
  override: Pick<ClientPricingOverride, 'client_id' | 'fee_usd' | 'fee_lbp' | 'governorate_id' | 'city_id' | 'package_type'>
): Promise<ClientPricingOverride> => {
  // Check for existing override with same combination
  const { data: existing } = await supabase
    .from('pricing_client_overrides')
    .select('id')
    .eq('client_id', override.client_id)
    .eq('governorate_id', override.governorate_id || null)
    .eq('city_id', override.city_id || null)
    .eq('package_type', override.package_type || null)
    .maybeSingle();

  if (existing) {
    throw new Error('A pricing override with this combination already exists. Please edit the existing rule instead.');
  }

  const { data, error } = await supabase
    .from('pricing_client_overrides')
    .insert({
      ...override,
      // Allow 0 values for either currency
      fee_usd: override.fee_usd || 0,
      fee_lbp: override.fee_lbp || 0,
      created_by: (await supabase.auth.getUser()).data.user?.id,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating client pricing override:', error);
    if (error.code === '23505') {
      throw new Error('A pricing override with this combination already exists. Please edit the existing rule instead.');
    }
    throw new Error(`Failed to create client pricing override: ${error.message}`);
  }

  return data;
};

export const updateClientPricingOverride = async (
  id: string,
  updates: Partial<Pick<ClientPricingOverride, 'fee_usd' | 'fee_lbp' | 'governorate_id' | 'city_id' | 'package_type'>>
): Promise<ClientPricingOverride> => {
  const { data, error } = await supabase
    .from('pricing_client_overrides')
    .update({
      ...updates,
      // Allow 0 values for either currency
      fee_usd: updates.fee_usd !== undefined ? (updates.fee_usd || 0) : undefined,
      fee_lbp: updates.fee_lbp !== undefined ? (updates.fee_lbp || 0) : undefined,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating client pricing override:', error);
    throw error;
  }

  return data;
};

export const deleteClientPricingOverride = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('pricing_client_overrides')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting client pricing override:', error);
    throw error;
  }
};

// Zone pricing rule functions
export const getZonePricingRules = async (): Promise<ZonePricingRule[]> => {
  const { data, error } = await supabase
    .from('pricing_zone_rules')
    .select(`
      *,
      governorates (name),
      cities (name),
      profiles!client_id (
        full_name,
        business_name
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching zone pricing rules:', error);
    throw error;
  }

  return data.map(item => ({
    ...item,
    governorate_name: item.governorates?.name,
    city_name: item.cities?.name,
    client_name: item.profiles?.full_name,
    business_name: item.profiles?.business_name,
  }));
};

export const createZonePricingRule = async (
  rule: Pick<ZonePricingRule, 'governorate_id' | 'city_id' | 'zone_name' | 'fee_usd' | 'fee_lbp' | 'client_id' | 'package_type'>
): Promise<ZonePricingRule> => {
  const { data, error } = await supabase
    .from('pricing_zone_rules')
    .insert({
      ...rule,
      created_by: (await supabase.auth.getUser()).data.user?.id,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating zone pricing rule:', error);
    throw error;
  }

  return data;
};

export const updateZonePricingRule = async (
  id: string,
  updates: Partial<Pick<ZonePricingRule, 'fee_usd' | 'fee_lbp' | 'is_active' | 'package_type'>>
): Promise<ZonePricingRule> => {
  const { data, error } = await supabase
    .from('pricing_zone_rules')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating zone pricing rule:', error);
    throw error;
  }

  return data;
};

export const deleteZonePricingRule = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('pricing_zone_rules')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting zone pricing rule:', error);
    throw error;
  }
};

// Package type pricing functions
export const getPackageTypePricing = async (): Promise<PackageTypePricing[]> => {
  const { data, error } = await supabase
    .from('pricing_package_types')
    .select(`
      *,
      governorates (name),
      cities (name),
      profiles!client_id (
        full_name,
        business_name
      )
    `)
    .order('package_type', { ascending: true });

  if (error) {
    console.error('Error fetching package type pricing:', error);
    throw error;
  }

  return data.map(item => ({
    ...item,
    governorate_name: item.governorates?.name,
    city_name: item.cities?.name,
    client_name: item.profiles?.full_name,
    business_name: item.profiles?.business_name,
  }));
};

export const createPackageTypePricing = async (
  pricing: Pick<PackageTypePricing, 'package_type' | 'fee_usd' | 'fee_lbp' | 'client_id' | 'governorate_id' | 'city_id'>
): Promise<PackageTypePricing> => {
  const { data, error } = await supabase
    .from('pricing_package_types')
    .insert({
      ...pricing,
      created_by: (await supabase.auth.getUser()).data.user?.id,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating package type pricing:', error);
    throw error;
  }

  return data;
};

export const updatePackageTypePricing = async (
  id: string,
  updates: Partial<Pick<PackageTypePricing, 'fee_usd' | 'fee_lbp' | 'is_active'>>
): Promise<PackageTypePricing> => {
  const { data, error } = await supabase
    .from('pricing_package_types')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating package type pricing:', error);
    throw error;
  }

  return data;
};

export const deletePackageTypePricing = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('pricing_package_types')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting package type pricing:', error);
    throw error;
  }
};

// Change logs function
export const getPricingChangeLogs = async (limit: number = 50): Promise<PricingChangeLog[]> => {
  const { data, error } = await supabase
    .from('pricing_change_logs')
    .select(`
      *,
      profiles!changed_by (
        full_name
      )
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching pricing change logs:', error);
    throw error;
  }

  return data.map(item => ({
    ...item,
    changed_by_name: item.profiles?.full_name,
  }));
};

// KPIs function
export const getPricingKPIs = async (): Promise<PricingKPIs> => {
  const [globalPricing, zoneRulesCount, clientOverridesCount, lastChangelog] = await Promise.all([
    getGlobalPricing(),
    supabase.from('pricing_zone_rules').select('id', { count: 'exact', head: true }),
    supabase.from('pricing_client_overrides').select('id', { count: 'exact', head: true }),
    supabase
      .from('pricing_change_logs')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
  ]);

  return {
    global_default_fee_usd: globalPricing?.default_fee_usd || 0,
    global_default_fee_lbp: globalPricing?.default_fee_lbp || 0,
    zone_rules_count: zoneRulesCount.count || 0,
    client_overrides_count: clientOverridesCount.count || 0,
    last_updated: lastChangelog.data?.created_at || globalPricing?.updated_at || new Date().toISOString(),
  };
};

// Calculate delivery fee function with enhanced debugging
export const calculateDeliveryFee = async (
  clientId: string,
  governorateId?: string,
  cityId?: string,
  packageType?: 'Parcel' | 'Document' | 'Bulky'
): Promise<DeliveryFeeResult> => {
  console.log('🚀 calculateDeliveryFee called with:', {
    clientId,
    governorateId,
    cityId,
    packageType
  });

  // First, let's get the global pricing to see what we should expect
  const globalPricing = await getGlobalPricing();
  console.log('🌍 Global pricing from DB:', globalPricing);

  // Try the RPC call
  const { data, error } = await supabase.rpc('calculate_delivery_fee', {
    p_client_id: clientId,
    p_governorate_id: governorateId || null,
    p_city_id: cityId || null,
    p_package_type: packageType || null,
  });

  console.log('📞 RPC call result:', { data, error });

  if (error) {
    console.error('❌ Error calculating delivery fee with RPC:', error);
    console.log('🔄 Falling back to global pricing:', globalPricing);
    return { 
      fee_usd: globalPricing?.default_fee_usd || 0, 
      fee_lbp: globalPricing?.default_fee_lbp || 0, 
      rule_type: 'global_fallback' 
    };
  }

  if (!data || data.length === 0) {
    console.log('⚠️ RPC returned no data, falling back to global pricing:', globalPricing);
    return { 
      fee_usd: globalPricing?.default_fee_usd || 0, 
      fee_lbp: globalPricing?.default_fee_lbp || 0, 
      rule_type: 'global_fallback' 
    };
  }

  const result = data[0];
  console.log('✅ RPC returned result:', result);

  // If RPC returns zero values but says it's global, that's wrong - use actual global pricing
  if (result.rule_type === 'global' && (result.fee_usd === 0 || result.fee_lbp === 0)) {
    console.log('🔧 RPC returned zero for global rule, using actual global pricing:', globalPricing);
    return {
      fee_usd: globalPricing?.default_fee_usd || 0,
      fee_lbp: globalPricing?.default_fee_lbp || 0,
      rule_type: 'global_corrected'
    };
  }

  return result;
};
