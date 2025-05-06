
import { useQuery } from "@tanstack/react-query";
import { getCities, getCitiesByGovernorate, getCityById } from "@/services/cities";

export function useCities() {
  return useQuery({
    queryKey: ['cities'],
    queryFn: getCities
  });
}

export function useCitiesByGovernorate(governorateId: string | undefined) {
  return useQuery({
    queryKey: ['cities', governorateId],
    queryFn: () => governorateId ? getCitiesByGovernorate(governorateId) : Promise.resolve([]),
    enabled: !!governorateId
  });
}

export function useCity(id: string | undefined) {
  return useQuery({
    queryKey: ['city', id],
    queryFn: () => id ? getCityById(id) : Promise.resolve(null),
    enabled: !!id
  });
}
