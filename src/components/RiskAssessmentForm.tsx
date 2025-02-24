
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { RiskAssessment, RISK_CATEGORIES, DATA_INTERFACES, DATA_LOCATIONS, DATA_CLASSIFICATIONS } from "@/types/risk";
import { SelectField } from "./forms/SelectField";
import { TextField } from "./forms/TextField";
import { useServices } from "@/hooks/useServices";
import { useRiskAssessmentSubmit } from "@/hooks/useRiskAssessmentSubmit";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useWatch } from "react-hook-form";

interface RiskAssessmentFormProps {
  onSubmit: (data: Omit<RiskAssessment, "id" | "createdAt">) => void;
  initialValues?: Omit<RiskAssessment, "id" | "createdAt">;
}

const RiskAssessmentForm = ({ onSubmit, initialValues }: RiskAssessmentFormProps) => {
  const form = useForm<Omit<RiskAssessment, "id" | "createdAt">>({
    defaultValues: {
      hasGlobalRevenueImpact: false,
      riskLevel: "low", // Set a default risk level since we're not showing it in the UI
      ...initialValues,
    },
  });
  const { data: services = [] } = useServices();
  const handleSubmit = initialValues ? onSubmit : useRiskAssessmentSubmit(form, onSubmit);
  
  const hasGlobalRevenueImpact = useWatch({
    control: form.control,
    name: "hasGlobalRevenueImpact",
  });

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

        <TextField
          form={form}
          name="mitigation"
          label="Current compensating control"
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

        <div className="flex items-center space-x-2">
          <Checkbox
            id="hasGlobalRevenueImpact"
            checked={hasGlobalRevenueImpact}
            onCheckedChange={(checked) => {
              form.setValue("hasGlobalRevenueImpact", checked === true);
              if (!checked) {
                form.setValue("globalRevenueImpactHours", undefined);
              }
            }}
          />
          <Label htmlFor="hasGlobalRevenueImpact">Global revenue impact</Label>
        </div>

        {hasGlobalRevenueImpact && (
          <TextField
            form={form}
            name="globalRevenueImpactHours"
            label="Hours of global revenue impact"
            type="number"
            min={0}
          />
        )}

        <Button type="submit">{initialValues ? 'Update' : 'Submit'}</Button>
      </form>
    </Form>
  );
};

export default RiskAssessmentForm;
