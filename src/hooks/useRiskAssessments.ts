
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RiskAssessment, RevenueImpact, PIDataAtRisk, PIDataAmount, MitigativeControls } from "@/types/risk";

export const useRiskAssessments = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['riskAssessments'],
    queryFn: async () => {
      console.log('Fetching risk assessments for user:', userId);
      if (!userId) return [];

      const { data, error } = await supabase
        .from('risk_assessments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching risk assessments:', error);
        throw error;
      }

      console.log('Risk assessments data:', data);

      return data.map((assessment): RiskAssessment => ({
        id: assessment.id,
        serviceId: assessment.service_id,
        riskCategory: assessment.risk_category,
        riskDescription: assessment.risk_description,
        dataInterface: assessment.data_interface,
        dataLocation: assessment.data_location,
        likelihoodPerYear: Number(assessment.likelihood_per_year),
        riskLevel: assessment.risk_level as RiskAssessment['riskLevel'],
        mitigation: assessment.mitigation,
        dataClassification: assessment.data_classification,
        riskOwner: assessment.risk_owner,
        createdAt: new Date(assessment.created_at),
        divisionId: assessment.division_id,
        revenueImpact: assessment.revenue_impact as RevenueImpact,
        hasGlobalRevenueImpact: assessment.has_global_revenue_impact,
        globalRevenueImpactHours: assessment.global_revenue_impact_hours,
        hasLocalRevenueImpact: assessment.has_local_revenue_impact,
        localRevenueImpactHours: assessment.local_revenue_impact_hours,
        hoursToRemediate: assessment.hours_to_remediate,
        additionalLossEventCosts: assessment.additional_loss_event_costs,
        piDataAtRisk: assessment.pi_data_at_risk as PIDataAtRisk || "no",
        piDataAmount: assessment.pi_data_amount as PIDataAmount,
        mitigativeControlsImplemented: (assessment.mitigative_controls_implemented as MitigativeControls) || "",
      }));
    },
    retry: false // Don't retry on failure so we can see errors
  });
};
