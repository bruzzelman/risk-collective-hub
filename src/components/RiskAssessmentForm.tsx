
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { RiskAssessment } from "@/types/risk";
import { useServices } from "@/hooks/useServices";
import { useRiskAssessmentSubmit } from "@/hooks/useRiskAssessmentSubmit";
import { BasicInfoSection } from "./forms/BasicInfoSection";
import { RiskDetailsSection } from "./forms/RiskDetailsSection";
import { RevenueImpactSection } from "./forms/RevenueImpactSection";

interface RiskAssessmentFormProps {
  onSubmit: (data: Omit<RiskAssessment, "id" | "createdAt">) => void;
  initialValues?: Omit<RiskAssessment, "id" | "createdAt">;
}

const RiskAssessmentForm = ({ onSubmit, initialValues }: RiskAssessmentFormProps) => {
  const form = useForm<Omit<RiskAssessment, "id" | "createdAt">>({
    defaultValues: {
      hasGlobalRevenueImpact: false,
      hasLocalRevenueImpact: false,
      riskLevel: "low",
      dataClassification: "Internal",
      revenueImpact: "unclear",
      likelihoodPerYear: 1,
      piDataAtRisk: "no" as const,
      ...initialValues,
    },
  });
  
  const { data: services = [] } = useServices();
  const handleSubmit = initialValues ? onSubmit : useRiskAssessmentSubmit(form, onSubmit);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <BasicInfoSection form={form} services={services} />
        <RiskDetailsSection form={form} />
        <RevenueImpactSection form={form} />
        <Button type="submit">{initialValues ? 'Update' : 'Submit'}</Button>
      </form>
    </Form>
  );
};

export default RiskAssessmentForm;
