
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

    try {
      const { error } = await supabase
        .from('risk_assessments')
        .insert({
          service_id: values.serviceId,
          risk_category: values.riskCategory,
          risk_description: values.riskDescription,
          data_interface: values.dataInterface,
          data_location: values.dataLocation,
          likelihood_per_year: values.likelihoodPerYear,
          risk_level: values.riskLevel,
          impact: values.impact,
          mitigation: values.mitigation,
          data_classification: values.dataClassification,
          risk_owner: values.riskOwner,
          created_by: user.id
        });

      if (error) throw error;

      onSubmit(values);
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save risk assessment",
        variant: "destructive",
      });
    }
  };

  return handleSubmit;
};
