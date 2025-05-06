
import { supabase } from "@/integrations/supabase/client";

export interface City {
  id: string;
  name: string;
  governorate_id: string;
  created_at: string;
}

export async function getCities() {
  const { data, error } = await supabase
    .from('cities')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Error fetching cities:', error);
    throw error;
  }
  
  return data as City[];
}

export async function getCitiesByGovernorate(governorateId: string) {
  const { data, error } = await supabase
    .from('cities')
    .select('*')
    .eq('governorate_id', governorateId)
    .order('name');
  
  if (error) {
    console.error(`Error fetching cities for governorate ${governorateId}:`, error);
    throw error;
  }
  
  return data as City[];
}

export async function getCityById(id: string) {
  const { data, error } = await supabase
    .from('cities')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error(`Error fetching city with id ${id}:`, error);
    throw error;
  }
  
  return data as City;
}
