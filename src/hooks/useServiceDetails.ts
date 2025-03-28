
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useProductDetails = () => {
  const { data: services = [], error: servicesError } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      console.log('Fetching products for details...');
      const { data, error } = await supabase
        .from('services')
        .select('*');
      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }
      console.log('Products data:', data);
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

  if (servicesError) console.error('Products error:', servicesError);
  if (divisionsError) console.error('Divisions error:', divisionsError);
  if (teamsError) console.error('Teams error:', teamsError);

  const getProductDetails = (productId: string) => {
    const product = services.find(s => s.id === productId);
    if (!product) {
      console.log('Product not found:', productId);
      return { name: "Unknown Product", division: "Unknown Division", team: "Unknown Team" };
    }

    const division = divisions.find(d => d.id === product.division_id);
    const team = teams.find(t => t.id === product.team_id);

    console.log('Product details:', {
      name: product.name,
      division: division?.name || "Unknown Division",
      team: team?.name || "Unknown Team"
    });

    return {
      name: product.name,
      division: division?.name || "Unknown Division",
      team: team?.name || "Unknown Team"
    };
  };

  // New function to find a product by name
  const findProductByName = (productName: string) => {
    const product = services.find(s => s.name.toLowerCase() === productName.toLowerCase());
    if (!product) {
      console.log(`Product "${productName}" not found`);
      return null;
    }

    const division = divisions.find(d => d.id === product.division_id);
    const team = teams.find(t => t.id === product.team_id);

    return {
      id: product.id,
      name: product.name,
      description: product.description || "",
      division: division?.name || "Unknown Division",
      divisionId: product.division_id,
      team: team?.name || "Unknown Team",
      teamId: product.team_id,
      createdAt: product.created_at,
      createdBy: product.created_by
    };
  };

  // Function to get risk assessments for a specific product
  const getProductRiskAssessments = async (productId: string) => {
    const { data, error } = await supabase
      .from('risk_assessments')
      .select('*')
      .eq('service_id', productId);
    
    if (error) {
      console.error('Error fetching risk assessments:', error);
      throw error;
    }
    
    return data;
  };

  return { getProductDetails, findProductByName, getProductRiskAssessments };
};

// For backward compatibility
export const useServiceDetails = useProductDetails;
