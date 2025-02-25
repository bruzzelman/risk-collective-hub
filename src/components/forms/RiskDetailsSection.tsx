
import { UseFormReturn, useWatch } from "react-hook-form";
import { RiskAssessment } from "@/types/risk";
import { TextField } from "./TextField";
import { SelectField } from "./SelectField";

interface RiskDetailsSectionProps {
  form: UseFormReturn<Omit<RiskAssessment, "id" | "createdAt">>;
}

export const RiskDetailsSection = ({ form }: RiskDetailsSectionProps) => {
  const piDataAtRisk = useWatch({
    control: form.control,
    name: "piDataAtRisk",
  });

  return (
    <>
      <TextField
        form={form}
        name="likelihoodPerYear"
        label="Likelihood (%/year)"
        type="number"
        min={0}
        max={100}
        required
      />

      <SelectField
        form={form}
        name="piDataAtRisk"
        label="PI data at risk"
        placeholder="Select if PI data is at risk"
        options={[
          { value: "no", label: "No" },
          { value: "yes", label: "Yes" },
        ]}
      />

      {piDataAtRisk === "yes" && (
        <SelectField
          form={form}
          name="piDataAmount"
          label="Amount of PI data at risk"
          placeholder="Select amount of PI data at risk"
          options={[
            { value: "less_than_1m", label: "Less than 1,000,000 rows" },
            { value: "between_1m_and_99m", label: "Between 1,000,000 and 99,000,000 rows" },
            { value: "more_than_99m", label: "More than 99,000,000,000 rows" },
            { value: "unknown", label: "Unknown" },
          ]}
        />
      )}

      <TextField
        form={form}
        name="hoursToRemediate"
        label="Hours to remediate"
        type="number"
        min={0}
      />

      <TextField
        form={form}
        name="additionalLossEventCosts"
        label="Additional loss event costs (€)"
        type="number"
        min={0}
      />
    </>
  );
};
