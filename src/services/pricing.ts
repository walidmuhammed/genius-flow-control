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
  fee_usd: number;
  fee_lbp: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
  // Joined data
  client_name?: string;
  business_name?: string;
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
      ...pricing,
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
      )
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
  }));
};

export const createClientPricingOverride = async (
  override: Pick<ClientPricingOverride, 'client_id' | 'fee_usd' | 'fee_lbp'>
): Promise<ClientPricingOverride> => {
  const { data, error } = await supabase
    .from('pricing_client_overrides')
    .insert({
      ...override,
      created_by: (await supabase.auth.getUser()).data.user?.id,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating client pricing override:', error);
    throw error;
  }

  return data;
};

export const updateClientPricingOverride = async (
  id: string,
  updates: Pick<ClientPricingOverride, 'fee_usd' | 'fee_lbp'>
): Promise<ClientPricingOverride> => {
  const { data, error } = await supabase
    .from('pricing_client_overrides')
    .update({
      ...updates,
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

// Calculate delivery fee function
export const calculateDeliveryFee = async (
  clientId: string,
  governorateId?: string,
  cityId?: string,
  packageType?: 'Parcel' | 'Document' | 'Bulky'
): Promise<DeliveryFeeResult> => {
  const { data, error } = await supabase.rpc('calculate_delivery_fee', {
    p_client_id: clientId,
    p_governorate_id: governorateId || null,
    p_city_id: cityId || null,
    p_package_type: packageType || null,
  });

  if (error) {
    console.error('Error calculating delivery fee:', error);
    // Fall back to global pricing from database
    const globalPricing = await getGlobalPricing();
    return { 
      fee_usd: globalPricing?.default_fee_usd || 4, 
      fee_lbp: globalPricing?.default_fee_lbp || 150000, 
      rule_type: 'global' 
    };
  }

  if (!data || data.length === 0) {
    // Fall back to global pricing from database
    const globalPricing = await getGlobalPricing();
    return { 
      fee_usd: globalPricing?.default_fee_usd || 4, 
      fee_lbp: globalPricing?.default_fee_lbp || 150000, 
      rule_type: 'global' 
    };
  }

  return data[0];
};