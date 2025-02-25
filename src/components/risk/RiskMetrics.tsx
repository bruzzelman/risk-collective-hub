
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RiskAssessment } from "@/types/risk";
import DataClassificationDistribution from "@/components/charts/DataClassificationDistribution";
import RiskLevelDistribution from "@/components/charts/RiskLevelDistribution";
import RiskCategoryDistribution from "@/components/charts/RiskCategoryDistribution";

interface RiskMetricsProps {
  assessments: RiskAssessment[];
}

const RiskMetrics = ({ assessments }: RiskMetricsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Risk Level Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <RiskLevelDistribution assessments={assessments} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Classification Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <DataClassificationDistribution assessments={assessments} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Risk Category Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <RiskCategoryDistribution assessments={assessments} />
        </CardContent>
      </Card>
    </div>
  );
};

export default RiskMetrics;
