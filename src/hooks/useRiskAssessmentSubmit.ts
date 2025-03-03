
import { supabase } from "@/integrations/supabase/client";
import { RiskAssessment } from "@/types/risk";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { UseFormReturn } from "react-hook-form";

export const useRiskAssessmentSubmit = (
  form: UseFormReturn<Omit<RiskAssessment, "id" | "createdAt">>,
  onSubmit: (data: Omit<RiskAssessment, "id" | "createdAt">) => void
) => {
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (values: Omit<RiskAssessment, "id" | "createdAt">) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to submit a risk assessment",
        variant: "destructive",
      });
      return;
    }

    // Ensure risk owner is set to the current user's email
    const dataToSubmit = {
      ...values,
      riskOwner: user.email || values.riskOwner
    };

    try {
      const { error } = await supabase
        .from('risk_assessments')
        .insert({
          service_id: dataToSubmit.serviceId,
          risk_category: dataToSubmit.riskCategory,
          risk_description: dataToSubmit.riskDescription,
          data_interface: dataToSubmit.dataInterface,
          data_location: dataToSubmit.dataLocation,
          likelihood_per_year: dataToSubmit.likelihoodPerYear,
          risk_level: dataToSubmit.riskLevel,
          mitigation: dataToSubmit.mitigation || '',
          data_classification: dataToSubmit.dataClassification,
          risk_owner: dataToSubmit.riskOwner,
          revenue_impact: dataToSubmit.revenueImpact,
          has_global_revenue_impact: dataToSubmit.hasGlobalRevenueImpact,
          global_revenue_impact_hours: dataToSubmit.globalRevenueImpactHours,
          has_local_revenue_impact: dataToSubmit.hasLocalRevenueImpact,
          local_revenue_impact_hours: dataToSubmit.localRevenueImpactHours,
          pi_data_at_risk: dataToSubmit.piDataAtRisk,
          pi_data_amount: dataToSubmit.piDataAmount,
          hours_to_remediate: dataToSubmit.hoursToRemediate,
          additional_loss_event_costs: dataToSubmit.additionalLossEventCosts,
          mitigative_controls_implemented: dataToSubmit.mitigativeControlsImplemented,
          created_by: user.id
        });

      if (error) {
        console.error('Error details:', error);
        throw error;
      }

      onSubmit(dataToSubmit);
      form.reset();
      
      toast({
        title: "Success",
        description: "Risk assessment saved successfully",
      });
    } catch (error) {
      console.error('Error saving risk assessment:', error);
      toast({
        title: "Error",
        description: "Failed to save risk assessment",
        variant: "destructive",
      });
    }
  };

  return handleSubmit;
};
