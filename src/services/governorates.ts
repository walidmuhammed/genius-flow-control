
import { supabase } from "@/integrations/supabase/client";

export interface Governorate {
  id: string;
  name: string;
  created_at: string;
}

export async function getGovernorates() {
  const { data, error } = await supabase
    .from('governorates')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Error fetching governorates:', error);
    throw error;
  }
  
  return data as Governorate[];
}

export async function getGovernorateById(id: string) {
  const { data, error } = await supabase
    .from('governorates')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error(`Error fetching governorate with id ${id}:`, error);
    throw error;
  }
  
  return data as Governorate;
}
