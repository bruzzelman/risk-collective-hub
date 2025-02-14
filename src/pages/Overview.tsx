
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RiskAssessment } from "@/types/risk";
import RiskLevelDistribution from "@/components/charts/RiskLevelDistribution";
import RiskCategoryDistribution from "@/components/charts/RiskCategoryDistribution";
import DataClassificationDistribution from "@/components/charts/DataClassificationDistribution";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface OverviewProps {
  assessments: RiskAssessment[];
}

const Overview = ({ assessments }: OverviewProps) => {
  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*');
      if (error) throw error;
      return data;
    }
  });

  const { data: divisions = [] } = useQuery({
    queryKey: ['divisions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('divisions')
        .select('*');
      if (error) throw error;
      return data;
    }
  });

  const totalRisks = assessments.length;
  const criticalRisks = assessments.filter(a => a.riskLevel === 'critical').length;
  const highRisks = assessments.filter(a => a.riskLevel === 'high').length;
  const servicesWithRisks = new Set(assessments.map(a => a.serviceId)).size;
  const divisionsWithRisks = new Set(
    services
      .filter(s => assessments.some(a => a.serviceId === s.id))
      .map(s => s.division_id)
  ).size;

  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-8">Risk Overview Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Risks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRisks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Critical & High Risks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {criticalRisks + highRisks}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Services with Risks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{servicesWithRisks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Divisions with Risks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{divisionsWithRisks}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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
            <CardTitle>Risk Category Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <RiskCategoryDistribution assessments={assessments} />
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Data Classification Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <DataClassificationDistribution assessments={assessments} />
        </CardContent>
      </Card>
    </div>
  );
};

export default Overview;
