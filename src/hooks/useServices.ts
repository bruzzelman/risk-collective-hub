import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Service } from "@/types/risk";

// Renamed for UI purposes but still connects to 'services' table
export const useProducts = () => {
  return useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      console.log('Fetching products...');
      const { data, error } = await supabase
        .from('services')
        .select('*');
      
      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }
      
      console.log('Products data:', data);
      
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
    },
    retry: false // Don't retry on failure so we can see errors
  });
};

// Keep the original name for backward compatibility
export const useServices = useProducts;
