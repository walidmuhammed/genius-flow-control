
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface GovernorateWithCities {
  id: string;
  name: string;
  cities: {
    id: string;
    name: string;
  }[];
}

export function useGovernoratesAndCities() {
  return useQuery({
    queryKey: ['governorates-with-cities'],
    queryFn: async (): Promise<GovernorateWithCities[]> => {
      const { data, error } = await supabase
        .from('governorates')
        .select(`
          id,
          name,
          cities (
            id,
            name
          )
        `)
        .order('name');
      
      if (error) {
        console.error('Error fetching governorates with cities:', error);
        throw error;
      }
      
      return data || [];
    }
  });
}
