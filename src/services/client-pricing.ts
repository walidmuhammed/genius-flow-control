import { supabase } from '@/integrations/supabase/client';

// New types for the restructured client pricing system
export interface ClientPricingDefault {
  id: string;
  client_id: string;
  default_fee_usd: number;
  default_fee_lbp: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
  // Joined data
  client_name?: string;
  business_name?: string;
}

export interface ClientZoneRule {
  id: string;
  client_id: string;
  governorate_ids: string[];
  fee_usd: number;
  fee_lbp: number;
  rule_name?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  // Joined data
  client_name?: string;
  business_name?: string;
  governorate_names?: string[];
}

export interface ClientPackageExtra {
  id: string;
  client_id: string;
  package_type: 'Parcel' | 'Document' | 'Bulky';
  extra_fee_usd: number;
  extra_fee_lbp: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
  // Joined data
  client_name?: string;
  business_name?: string;
}

export interface ClientPricingConfiguration {
  client_id: string;
  client_name?: string;
  business_name?: string;
  default_pricing?: ClientPricingDefault;
  zone_rules: ClientZoneRule[];
  package_extras: ClientPackageExtra[];
}

// Client Default Pricing Functions
export const getClientDefaults = async (): Promise<ClientPricingDefault[]> => {
  const { data, error } = await supabase
    .from('pricing_client_defaults')
    .select(`
      *,
      profiles!client_id (
        full_name,
        business_name
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching client defaults:', error);
    throw error;
  }

  return data.map(item => ({
    ...item,
    client_name: item.profiles?.full_name,
    business_name: item.profiles?.business_name,
  }));
};

export const getClientDefault = async (clientId: string): Promise<ClientPricingDefault | null> => {
  const { data, error } = await supabase
    .from('pricing_client_defaults')
    .select(`
      *,
      profiles!client_id (
        full_name,
        business_name
      )
    `)
    .eq('client_id', clientId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching client default:', error);
    throw error;
  }

  if (!data) return null;

  return {
    ...data,
    client_name: data.profiles?.full_name,
    business_name: data.profiles?.business_name,
  };
};

export const createOrUpdateClientDefault = async (
  clientId: string,
  pricing: Pick<ClientPricingDefault, 'default_fee_usd' | 'default_fee_lbp'>
): Promise<ClientPricingDefault> => {
  const { data: user } = await supabase.auth.getUser();
  
  // First check if a record exists
  const { data: existing } = await supabase
    .from('pricing_client_defaults')
    .select('id')
    .eq('client_id', clientId)
    .maybeSingle();
  
  if (existing) {
    // Update existing record
    const { data, error } = await supabase
      .from('pricing_client_defaults')
      .update({
        default_fee_usd: pricing.default_fee_usd || 0,
        default_fee_lbp: pricing.default_fee_lbp || 0,
        updated_at: new Date().toISOString(),
      })
      .eq('client_id', clientId)
      .select()
      .single();

    if (error) {
      console.error('Error updating client default:', error);
      throw error;
    }

    return data;
  } else {
    // Create new record
    const { data, error } = await supabase
      .from('pricing_client_defaults')
      .insert({
        client_id: clientId,
        default_fee_usd: pricing.default_fee_usd || 0,
        default_fee_lbp: pricing.default_fee_lbp || 0,
        created_by: user.user?.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating client default:', error);
      throw error;
    }

    return data;
  }
};

export const deleteClientDefault = async (clientId: string): Promise<void> => {
  const { error } = await supabase
    .from('pricing_client_defaults')
    .delete()
    .eq('client_id', clientId);

  if (error) {
    console.error('Error deleting client default:', error);
    throw error;
  }
};

// Client Zone Rules Functions
export const getClientZoneRules = async (clientId?: string): Promise<ClientZoneRule[]> => {
  let query = supabase
    .from('pricing_client_zone_rules')
    .select(`
      *,
      profiles!client_id (
        full_name,
        business_name
      )
    `);

  if (clientId) {
    query = query.eq('client_id', clientId);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching client zone rules:', error);
    throw error;
  }

  // Get governorate names for each rule
  const rulesWithNames = await Promise.all(
    data.map(async (rule) => {
      if (rule.governorate_ids && rule.governorate_ids.length > 0) {
        const { data: governorates } = await supabase
          .from('governorates')
          .select('name')
          .in('id', rule.governorate_ids);
        
        return {
          ...rule,
          client_name: rule.profiles?.full_name,
          business_name: rule.profiles?.business_name,
          governorate_names: governorates?.map(g => g.name) || [],
        };
      }
      return {
        ...rule,
        client_name: rule.profiles?.full_name,
        business_name: rule.profiles?.business_name,
        governorate_names: [],
      };
    })
  );

  return rulesWithNames;
};

export const createClientZoneRule = async (
  rule: Pick<ClientZoneRule, 'client_id' | 'governorate_ids' | 'fee_usd' | 'fee_lbp' | 'rule_name'>
): Promise<ClientZoneRule> => {
  const { data: user } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('pricing_client_zone_rules')
    .insert({
      ...rule,
      fee_usd: rule.fee_usd || 0,
      fee_lbp: rule.fee_lbp || 0,
      created_by: user.user?.id,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating client zone rule:', error);
    throw error;
  }

  return data;
};

export const updateClientZoneRule = async (
  id: string,
  updates: Partial<Pick<ClientZoneRule, 'governorate_ids' | 'fee_usd' | 'fee_lbp' | 'rule_name'>>
): Promise<ClientZoneRule> => {
  const { data, error } = await supabase
    .from('pricing_client_zone_rules')
    .update({
      ...updates,
      fee_usd: updates.fee_usd !== undefined ? (updates.fee_usd || 0) : undefined,
      fee_lbp: updates.fee_lbp !== undefined ? (updates.fee_lbp || 0) : undefined,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating client zone rule:', error);
    throw error;
  }

  return data;
};

export const deleteClientZoneRule = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('pricing_client_zone_rules')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting client zone rule:', error);
    throw error;
  }
};

// Client Package Extras Functions
export const getClientPackageExtras = async (clientId?: string): Promise<ClientPackageExtra[]> => {
  let query = supabase
    .from('pricing_client_package_extras')
    .select(`
      *,
      profiles!client_id (
        full_name,
        business_name
      )
    `);

  if (clientId) {
    query = query.eq('client_id', clientId);
  }

  const { data, error } = await query.order('package_type', { ascending: true });

  if (error) {
    console.error('Error fetching client package extras:', error);
    throw error;
  }

  return data.map(item => ({
    ...item,
    package_type: item.package_type as 'Parcel' | 'Document' | 'Bulky',
    extra_fee_usd: item.extra_fee_usd || 0,
    extra_fee_lbp: item.extra_fee_lbp || 0,
    client_name: item.profiles?.full_name,
    business_name: item.profiles?.business_name,
  }));
};

export const createOrUpdateClientPackageExtra = async (
  clientId: string,
  packageType: 'Parcel' | 'Document' | 'Bulky',
  pricing: Pick<ClientPackageExtra, 'extra_fee_usd' | 'extra_fee_lbp'>
): Promise<ClientPackageExtra> => {
  const { data: user } = await supabase.auth.getUser();
  
  // First check if a record exists
  const { data: existing } = await supabase
    .from('pricing_client_package_extras')
    .select('id')
    .eq('client_id', clientId)
    .eq('package_type', packageType)
    .maybeSingle();
  
  if (existing) {
    // Update existing record
    const { data, error } = await supabase
      .from('pricing_client_package_extras')
      .update({
        extra_fee_usd: pricing.extra_fee_usd || 0,
        extra_fee_lbp: pricing.extra_fee_lbp || 0,
        updated_at: new Date().toISOString(),
      })
      .eq('client_id', clientId)
      .eq('package_type', packageType)
      .select()
      .single();

    if (error) {
      console.error('Error updating client package extra:', error);
      throw error;
    }

    return {
      ...data,
      package_type: data.package_type as 'Parcel' | 'Document' | 'Bulky',
      extra_fee_usd: data.extra_fee_usd || 0,
      extra_fee_lbp: data.extra_fee_lbp || 0,
    };
  } else {
    // Create new record
    const { data, error } = await supabase
      .from('pricing_client_package_extras')
      .insert({
        client_id: clientId,
        package_type: packageType,
        extra_fee_usd: pricing.extra_fee_usd || 0,
        extra_fee_lbp: pricing.extra_fee_lbp || 0,
        created_by: user.user?.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating client package extra:', error);
      throw error;
    }

    return {
      ...data,
      package_type: data.package_type as 'Parcel' | 'Document' | 'Bulky',
      extra_fee_usd: data.extra_fee_usd || 0,
      extra_fee_lbp: data.extra_fee_lbp || 0,
    };
  }
};

export const deleteClientPackageExtra = async (clientId: string, packageType: string): Promise<void> => {
  const { error } = await supabase
    .from('pricing_client_package_extras')
    .delete()
    .eq('client_id', clientId)
    .eq('package_type', packageType);

  if (error) {
    console.error('Error deleting client package extra:', error);
    throw error;
  }
};

// Get complete client pricing configuration
export const getClientPricingConfiguration = async (clientId: string): Promise<ClientPricingConfiguration> => {
  const [defaultPricing, zoneRules, packageExtras] = await Promise.all([
    getClientDefault(clientId),
    getClientZoneRules(clientId),
    getClientPackageExtras(clientId)
  ]);

  // Get client info
  const { data: clientData } = await supabase
    .from('profiles')
    .select('full_name, business_name')
    .eq('id', clientId)
    .single();

  return {
    client_id: clientId,
    client_name: clientData?.full_name,
    business_name: clientData?.business_name,
    default_pricing: defaultPricing || undefined,
    zone_rules: zoneRules,
    package_extras: packageExtras,
  };
};

// Get all clients with pricing configurations
export const getAllClientPricingConfigurations = async (): Promise<ClientPricingConfiguration[]> => {
  // Get all clients that have any pricing configuration
  const [defaults, zoneRules, packageExtras] = await Promise.all([
    getClientDefaults(),
    getClientZoneRules(),
    getClientPackageExtras()
  ]);

  // Combine all client IDs
  const clientIds = new Set([
    ...defaults.map(d => d.client_id),
    ...zoneRules.map(z => z.client_id),
    ...packageExtras.map(p => p.client_id)
  ]);

  // Build configurations for each client
  const configurations = await Promise.all(
    Array.from(clientIds).map(clientId => getClientPricingConfiguration(clientId))
  );

  return configurations.filter(config => 
    config.default_pricing || config.zone_rules.length > 0 || config.package_extras.length > 0
  );
};