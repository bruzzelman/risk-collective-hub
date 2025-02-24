
import { UseFormReturn, useWatch } from "react-hook-form";
import { RiskAssessment } from "@/types/risk";
import { SelectField } from "./SelectField";
import { TextField } from "./TextField";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface RevenueImpactSectionProps {
  form: UseFormReturn<Omit<RiskAssessment, "id" | "createdAt">>;
}

export const RevenueImpactSection = ({ form }: RevenueImpactSectionProps) => {
  const hasGlobalRevenueImpact = useWatch({
    control: form.control,
    name: "hasGlobalRevenueImpact",
  });

  const hasLocalRevenueImpact = useWatch({
    control: form.control,
    name: "hasLocalRevenueImpact",
  });

  const revenueImpact = useWatch({
    control: form.control,
    name: "revenueImpact",
  });

  const showRevenueImpactOptions = revenueImpact === "yes";

  return (
    <>
      <SelectField
        form={form}
        name="revenueImpact"
        label="Revenue Impact"
        placeholder="Select revenue impact"
        options={[
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" },
          { value: "unclear", label: "Unclear" },
        ]}
      />

      {showRevenueImpactOptions && (
        <div className="space-y-4">
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

          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasLocalRevenueImpact"
              checked={hasLocalRevenueImpact}
              onCheckedChange={(checked) => {
                form.setValue("hasLocalRevenueImpact", checked === true);
                if (!checked) {
                  form.setValue("localRevenueImpactHours", undefined);
                }
              }}
            />
            <Label htmlFor="hasLocalRevenueImpact">Local revenue impact</Label>
          </div>

          {hasLocalRevenueImpact && (
            <TextField
              form={form}
              name="localRevenueImpactHours"
              label="Hours of local revenue impact"
              type="number"
              min={0}
            />
          )}
        </div>
      )}
    </>
  );
};
