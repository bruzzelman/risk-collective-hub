
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { RiskAssessment, RISK_CATEGORIES, DATA_INTERFACES, DATA_LOCATIONS, DATA_CLASSIFICATIONS } from "@/types/risk";
import { SelectField } from "./forms/SelectField";
import { TextField } from "./forms/TextField";
import { useServices } from "@/hooks/useServices";
import { useRiskAssessmentSubmit } from "@/hooks/useRiskAssessmentSubmit";

interface RiskAssessmentFormProps {
  onSubmit: (data: Omit<RiskAssessment, "id" | "createdAt">) => void;
}

const RiskAssessmentForm = ({ onSubmit }: RiskAssessmentFormProps) => {
  const form = useForm<Omit<RiskAssessment, "id" | "createdAt">>();
  const { data: services = [] } = useServices();
  const handleSubmit = useRiskAssessmentSubmit(form, onSubmit);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <SelectField
          form={form}
          name="serviceId"
          label="Service"
          placeholder="Select a service"
          options={services.map((service) => ({
            value: service.id,
            label: service.name,
          }))}
        />

        <SelectField
          form={form}
          name="riskCategory"
          label="Risk Category"
          placeholder="Select a risk category"
          options={RISK_CATEGORIES.map((category) => ({
            value: category,
            label: category,
          }))}
        />

        <TextField
          form={form}
          name="riskDescription"
          label="Risk Description"
          type="textarea"
        />

        <SelectField
          form={form}
          name="dataInterface"
          label="Data Interface"
          placeholder="Select data interface"
          options={DATA_INTERFACES.map((interface_) => ({
            value: interface_,
            label: interface_,
          }))}
        />

        <SelectField
          form={form}
          name="dataLocation"
          label="Data Location"
          placeholder="Select data location"
          options={DATA_LOCATIONS.map((location) => ({
            value: location,
            label: location,
          }))}
        />

        <TextField
          form={form}
          name="likelihoodPerYear"
          label="Likelihood (%/year)"
          type="number"
          min={0}
          max={100}
        />

        <SelectField
          form={form}
          name="riskLevel"
          label="Risk Level"
          placeholder="Select risk level"
          options={["low", "medium", "high", "critical"].map((level) => ({
            value: level,
            label: level.charAt(0).toUpperCase() + level.slice(1),
          }))}
        />

        <TextField
          form={form}
          name="impact"
          label="Impact"
          type="textarea"
        />

        <TextField
          form={form}
          name="mitigation"
          label="Mitigation"
          type="textarea"
        />

        <SelectField
          form={form}
          name="dataClassification"
          label="Data Classification"
          placeholder="Select data classification"
          options={DATA_CLASSIFICATIONS.map((classification) => ({
            value: classification,
            label: classification,
          }))}
        />

        <TextField
          form={form}
          name="riskOwner"
          label="Risk Owner"
        />

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
};

export default RiskAssessmentForm;
