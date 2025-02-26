
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useServiceDetails = () => {
  const { data: services = [], error: servicesError } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      console.log('Fetching services for details...');
      const { data, error } = await supabase
        .from('services')
        .select('*');
      if (error) {
        console.error('Error fetching services:', error);
        throw error;
      }
      console.log('Services data:', data);
      return data;
    },
    retry: false
  });

  const { data: divisions = [], error: divisionsError } = useQuery({
    queryKey: ['divisions'],
    queryFn: async () => {
      console.log('Fetching divisions...');
      const { data, error } = await supabase
        .from('divisions')
        .select('*');
      if (error) {
        console.error('Error fetching divisions:', error);
        throw error;
      }
      console.log('Divisions data:', data);
      return data;
    },
    retry: false
  });

  const { data: teams = [], error: teamsError } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      console.log('Fetching teams...');
      const { data, error } = await supabase
        .from('teams')
        .select('*');
      if (error) {
        console.error('Error fetching teams:', error);
        throw error;
      }
      console.log('Teams data:', data);
      return data;
    },
    retry: false
  });

  if (servicesError) console.error('Services error:', servicesError);
  if (divisionsError) console.error('Divisions error:', divisionsError);
  if (teamsError) console.error('Teams error:', teamsError);

  const getServiceDetails = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (!service) {
      console.log('Service not found:', serviceId);
      return { name: "Unknown Service", division: "Unknown Division", team: "Unknown Team" };
    }

    const division = divisions.find(d => d.id === service.division_id);
    const team = teams.find(t => t.id === service.team_id);

    console.log('Service details:', {
      name: service.name,
      division: division?.name || "Unknown Division",
      team: team?.name || "Unknown Team"
    });

    return {
      name: service.name,
      division: division?.name || "Unknown Division",
      team: team?.name || "Unknown Team"
    };
  };

  return { getServiceDetails };
};
