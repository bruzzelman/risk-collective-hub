
import { UseFormReturn } from "react-hook-form";
import { RiskAssessment } from "@/types/risk";
import { TextField } from "./TextField";

interface RiskDetailsSectionProps {
  form: UseFormReturn<Omit<RiskAssessment, "id" | "createdAt">>;
}

export const RiskDetailsSection = ({ form }: RiskDetailsSectionProps) => {
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

