
import { UseFormReturn } from "react-hook-form";
import { RiskAssessment, DATA_INTERFACES, DATA_LOCATIONS, RISK_CATEGORIES } from "@/types/risk";
import { SelectField } from "./SelectField";
import { TextField } from "./TextField";
import { Service } from "@/types/risk";
import { useAuth } from "@/components/AuthProvider";

interface BasicInfoSectionProps {
  form: UseFormReturn<Omit<RiskAssessment, "id" | "createdAt">>;
  services: Service[];
}

export const BasicInfoSection = ({ form, services }: BasicInfoSectionProps) => {
  const { user } = useAuth();

  return (
    <>
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
        required
      />

      <TextField
        form={form}
        name="riskOwner"
        label="Risk Owner"
        value={user?.email || ''}
        required
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
    </>
  );
};
