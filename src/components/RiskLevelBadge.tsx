import { RiskLevel } from "@/types/risk";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface RiskLevelBadgeProps {
  level: RiskLevel;
}

const RiskLevelBadge = ({ level }: RiskLevelBadgeProps) => {
  const colors = {
    low: "bg-risk-low text-white",
    medium: "bg-risk-medium text-white",
    high: "bg-risk-high text-white",
    critical: "bg-risk-critical text-white",
  };

  return (
    <Badge className={cn("font-semibold", colors[level])}>
      {level.charAt(0).toUpperCase() + level.slice(1)}
    </Badge>
  );
};

export default RiskLevelBadge;