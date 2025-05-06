
import { useQuery } from "@tanstack/react-query";
import { getGovernorates, getGovernorateById } from "@/services/governorates";

export function useGovernorates() {
  return useQuery({
    queryKey: ['governorates'],
    queryFn: getGovernorates
  });
}

export function useGovernorate(id: string | undefined) {
  return useQuery({
    queryKey: ['governorate', id],
    queryFn: () => id ? getGovernorateById(id) : Promise.resolve(null),
    enabled: !!id
  });
}
