import { supabase } from "@/integrations/supabase/client";

export interface CourierPricingDefaults {
  id: string;
  package_type: 'parcel' | 'document' | 'bulky';
  base_fee_usd: number;
  base_fee_lbp: number;
  governorate_id?: string;
  vehicle_type?: 'motorcycle' | 'car' | 'van';
  vehicle_multiplier: number;
  after_hours_multiplier: number;
  remote_area_extra_usd: number;
  remote_area_extra_lbp: number;
  unsuccessful_fee_usd: number;
  unsuccessful_fee_lbp: number;
  return_fee_usd: number;
  return_fee_lbp: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CourierPricingOverride {
  id: string;
  courier_id: string;
  package_type?: 'parcel' | 'document' | 'bulky';
  base_fee_usd?: number;
  base_fee_lbp?: number;
  governorate_id?: string;
  vehicle_multiplier?: number;
  after_hours_multiplier?: number;
  remote_area_extra_usd?: number;
  remote_area_extra_lbp?: number;
  unsuccessful_fee_usd?: number;
  unsuccessful_fee_lbp?: number;
  return_fee_usd?: number;
  return_fee_lbp?: number;
  effective_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export async function getCourierPricingDefaults(): Promise<CourierPricingDefaults[]> {
  const { data, error } = await supabase
    .from('courier_pricing_defaults')
    .select('*')
    .eq('is_active', true)
    .order('package_type');

  if (error) throw error;
  return (data || []) as CourierPricingDefaults[];
}

export async function getCourierPricingOverrides(courierId?: string): Promise<CourierPricingOverride[]> {
  let query = supabase
    .from('courier_pricing_overrides')
    .select('*')
    .eq('is_active', true);

  if (courierId) {
    query = query.eq('courier_id', courierId);
  }

  const { data, error } = await query.order('effective_date', { ascending: false });

  if (error) throw error;
  return (data || []) as CourierPricingOverride[];
}

export async function updateCourierPricingDefaults(
  id: string, 
  updates: Partial<Omit<CourierPricingDefaults, 'id' | 'created_at' | 'updated_at'>>
): Promise<CourierPricingDefaults> {
  const { data, error } = await supabase
    .from('courier_pricing_defaults')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as CourierPricingDefaults;
}

export async function createCourierPricingOverride(
  override: Omit<CourierPricingOverride, 'id' | 'created_at' | 'updated_at'>
): Promise<CourierPricingOverride> {
  const { data, error } = await supabase
    .from('courier_pricing_overrides')
    .insert(override)
    .select()
    .single();

  if (error) throw error;
  return data as CourierPricingOverride;
}

export async function updateCourierPricingOverride(
  id: string,
  updates: Partial<Omit<CourierPricingOverride, 'id' | 'created_at' | 'updated_at'>>
): Promise<CourierPricingOverride> {
  const { data, error } = await supabase
    .from('courier_pricing_overrides')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as CourierPricingOverride;
}

export async function calculateCourierFee(
  courierId: string,
  packageType: string,
  governorateId?: string,
  orderStatus: string = 'Successful'
): Promise<{ fee_usd: number; fee_lbp: number }> {
  const { data, error } = await supabase.rpc('calculate_courier_fee', {
    p_courier_id: courierId,
    p_package_type: packageType,
    p_governorate_id: governorateId,
    p_order_status: orderStatus
  });

  if (error) throw error;
  return data[0] || { fee_usd: 2, fee_lbp: 75000 };
}