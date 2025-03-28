
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { RiskAssessment } from "@/types/risk";
import { useProducts } from "@/hooks/useServices";
import { useRiskAssessmentSubmit } from "@/hooks/useRiskAssessmentSubmit";
import { BasicInfoSection } from "./forms/BasicInfoSection";
import { RiskDetailsSection } from "./forms/RiskDetailsSection";
import { RevenueImpactSection } from "./forms/RevenueImpactSection";
import { useAuth } from "@/components/AuthProvider";
import { useEffect } from "react";

interface RiskAssessmentFormProps {
  onSubmit: (data: Omit<RiskAssessment, "id" | "createdAt">) => void;
  initialValues?: Omit<RiskAssessment, "id" | "createdAt">;
}

const RiskAssessmentForm = ({ onSubmit, initialValues }: RiskAssessmentFormProps) => {
  const { user } = useAuth();
  
  const form = useForm<Omit<RiskAssessment, "id" | "createdAt">>({
    defaultValues: {
      hasGlobalRevenueImpact: false,
      hasLocalRevenueImpact: false,
      riskLevel: "low",
      dataClassification: "Internal",
      revenueImpact: "unclear",
      likelihoodPerYear: 1,
      piDataAtRisk: "no" as const,
      riskOwner: user?.email || '', // Keep this field in the form data but don't display it
      dataInterface: "Not applicable",
      dataLocation: "Not applicable", // Keep this to satisfy the type
      mitigativeControlsImplemented: "" as const,
      postMortemHours: 0, // Default value for the field
      ...(initialValues || {}), // Make sure initialValues override defaults
    },
  });
  
  // Ensure riskOwner is always set to current user's email
  useEffect(() => {
    if (user?.email) {
      form.setValue('riskOwner', user.email);
    }
  }, [user, form]);
  
  const { data: services = [] } = useProducts();
  const handleSubmit = initialValues ? onSubmit : useRiskAssessmentSubmit(form, onSubmit);

  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(handleSubmit)} 
        className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto px-4"
      >
        <BasicInfoSection form={form} services={services} />
        <RiskDetailsSection form={form} />
        <RevenueImpactSection form={form} />
        <div className="sticky bottom-0 py-4 bg-background border-t">
          <Button type="submit">{initialValues ? 'Update' : 'Submit'}</Button>
        </div>
      </form>
    </Form>
  );
};

export default RiskAssessmentForm;
