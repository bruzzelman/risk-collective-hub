
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Service } from "@/types/risk";

export const useServices = () => {
  return useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*');
      if (error) throw error;
      
      // Transform the data to match the Service type
      return data.map((service): Service => ({
        id: service.id,
        name: service.name,
        description: service.description || undefined,
        divisionId: service.division_id || undefined,
        teamId: service.team_id || undefined,
        createdAt: new Date(service.created_at),
        createdBy: service.created_by,
      }));
    }
  });
};
